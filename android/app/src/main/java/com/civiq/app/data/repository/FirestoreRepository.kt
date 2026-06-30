package com.civiq.app.data.repository

import com.civiq.app.data.models.CommentModel
import com.civiq.app.data.models.IssueModel
import com.civiq.app.data.models.SavedLocationModel
import com.civiq.app.data.models.UserModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FirestoreRepository @Inject constructor(
    private val firestore: FirebaseFirestore,
    private val auth: FirebaseAuth
) {
    // ==========================================
    // USER PROFILE METHODS
    // ==========================================

    fun getUserProfile(): Flow<UserModel?> = callbackFlow {
        val uid = auth.currentUser?.uid ?: run {
            trySend(null)
            close()
            return@callbackFlow
        }
        val listener = firestore.collection("users").document(uid)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val user = snapshot?.toObject(UserModel::class.java)
                trySend(user)
            }
        awaitClose { listener.remove() }
    }

    suspend fun getUserOnce(uid: String): UserModel? {
        return try {
            val snapshot = firestore.collection("users").document(uid).get().await()
            snapshot.toObject(UserModel::class.java)
        } catch (e: Exception) {
            null
        }
    }

    suspend fun updateUserProfile(user: UserModel): Boolean {
        return try {
            firestore.collection("users").document(user.uid).set(user).await()
            true
        } catch (e: Exception) {
            false
        }
    }

    // ==========================================
    // CIVIC ISSUES METHODS
    // ==========================================

    fun observeAllIssues(): Flow<List<IssueModel>> = callbackFlow {
        val listener = firestore.collection("issues")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val issues = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(IssueModel::class.java)
                } ?: emptyList()
                trySend(issues)
            }
        awaitClose { listener.remove() }
    }

    suspend fun reportIssue(issue: IssueModel): String {
        return try {
            val docRef = firestore.collection("issues").document()
            val finalIssue = issue.copy(id = docRef.id)
            docRef.set(finalIssue).await()
            docRef.id
        } catch (e: Exception) {
            ""
        }
    }

    suspend fun upvoteIssue(issueId: String): Boolean {
        val uid = auth.currentUser?.uid ?: return false
        return try {
            val issueRef = firestore.collection("issues").document(issueId)
            firestore.runTransaction { transaction ->
                val snapshot = transaction.get(issueRef)
                val issue = snapshot.toObject(IssueModel::class.java) ?: return@runTransaction
                if (!issue.voterIds.contains(uid)) {
                    val updatedVoters = issue.voterIds + uid
                    transaction.update(issueRef, "voterIds", updatedVoters)
                    transaction.update(issueRef, "upvotesCount", issue.upvotesCount + 1)
                } else {
                    val updatedVoters = issue.voterIds - uid
                    transaction.update(issueRef, "voterIds", updatedVoters)
                    transaction.update(issueRef, "upvotesCount", (issue.upvotesCount - 1).coerceAtLeast(0))
                }
            }.await()

            val userRef = firestore.collection("users").document(uid)
            firestore.runTransaction { transaction ->
                val snapshot = transaction.get(userRef)
                val user = snapshot.toObject(UserModel::class.java) ?: return@runTransaction
                if (!user.upvotedIssueIds.contains(issueId)) {
                    transaction.update(userRef, "upvotedIssueIds", user.upvotedIssueIds + issueId)
                } else {
                    transaction.update(userRef, "upvotedIssueIds", user.upvotedIssueIds - issueId)
                }
            }.await()
            true
        } catch (e: Exception) {
            false
        }
    }

    // ==========================================
    // SAVE / BOOKMARK SYSTEM
    // ==========================================

    suspend fun toggleSaveIssue(issueId: String): Boolean {
        val uid = auth.currentUser?.uid ?: return false
        return try {
            val issueRef = firestore.collection("issues").document(issueId)
            firestore.runTransaction { transaction ->
                val snapshot = transaction.get(issueRef)
                val issue = snapshot.toObject(IssueModel::class.java) ?: return@runTransaction
                if (!issue.savedByUserIds.contains(uid)) {
                    transaction.update(issueRef, "savedByUserIds", issue.savedByUserIds + uid)
                } else {
                    transaction.update(issueRef, "savedByUserIds", issue.savedByUserIds - uid)
                }
            }.await()
            true
        } catch (e: Exception) {
            false
        }
    }

    fun observeSavedIssues(): Flow<List<IssueModel>> = callbackFlow {
        val uid = auth.currentUser?.uid ?: run {
            trySend(emptyList())
            close()
            return@callbackFlow
        }
        val listener = firestore.collection("issues")
            .whereArrayContains("savedByUserIds", uid)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val saved = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(IssueModel::class.java)
                } ?: emptyList()
                trySend(saved)
            }
        awaitClose { listener.remove() }
    }

    // ==========================================
    // COMMENTS SYSTEM
    // ==========================================

    fun observeComments(issueId: String): Flow<List<CommentModel>> = callbackFlow {
        val listener = firestore.collection("issues").document(issueId)
            .collection("comments")
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val comments = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(CommentModel::class.java)
                } ?: emptyList()
                trySend(comments)
            }
        awaitClose { listener.remove() }
    }

    suspend fun addComment(issueId: String, comment: CommentModel): Boolean {
        return try {
            val docRef = firestore.collection("issues").document(issueId)
                .collection("comments").document()
            val finalComment = comment.copy(id = docRef.id, issueId = issueId)
            docRef.set(finalComment).await()
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun toggleLikeComment(issueId: String, commentId: String): Boolean {
        val uid = auth.currentUser?.uid ?: return false
        return try {
            val commentRef = firestore.collection("issues").document(issueId)
                .collection("comments").document(commentId)
            firestore.runTransaction { transaction ->
                val snapshot = transaction.get(commentRef)
                val comment = snapshot.toObject(CommentModel::class.java) ?: return@runTransaction
                if (!comment.likedBy.contains(uid)) {
                    transaction.update(commentRef, "likedBy", comment.likedBy + uid)
                    transaction.update(commentRef, "likes", comment.likes + 1)
                } else {
                    transaction.update(commentRef, "likedBy", comment.likedBy - uid)
                    transaction.update(commentRef, "likes", (comment.likes - 1).coerceAtLeast(0))
                }
            }.await()
            true
        } catch (e: Exception) {
            false
        }
    }

    // ==========================================
    // SAVED LOCATIONS SYSTEM
    // ==========================================

    fun observeSavedLocations(): Flow<List<SavedLocationModel>> = callbackFlow {
        val uid = auth.currentUser?.uid ?: run {
            trySend(emptyList())
            close()
            return@callbackFlow
        }
        val listener = firestore.collection("users").document(uid)
            .collection("saved_locations")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val locations = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(SavedLocationModel::class.java)
                } ?: emptyList()
                trySend(locations)
            }
        awaitClose { listener.remove() }
    }

    suspend fun saveLocation(location: SavedLocationModel): Boolean {
        val uid = auth.currentUser?.uid ?: return false
        return try {
            val docRef = firestore.collection("users").document(uid)
                .collection("saved_locations").document()
            val finalLoc = location.copy(id = docRef.id, userId = uid)
            docRef.set(finalLoc).await()
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun deleteLocation(locationId: String): Boolean {
        val uid = auth.currentUser?.uid ?: return false
        return try {
            firestore.collection("users").document(uid)
                .collection("saved_locations").document(locationId).delete().await()
            true
        } catch (e: Exception) {
            false
        }
    }

    // ==========================================
    // ESCALATION, VOLUNTEER, WORKFORCE WORKFLOWS
    // ==========================================

    suspend fun claimMission(issueId: String): Boolean {
        val uid = auth.currentUser?.uid ?: return false
        return try {
            firestore.collection("issues").document(issueId)
                .update(
                    mapOf(
                        "claimedByUserId" to uid,
                        "status" to "In Progress"
                    )
                ).await()
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun resolveVolunteerMission(issueId: String, afterPhotoUrl: String): Boolean {
        val uid = auth.currentUser?.uid ?: return false
        return try {
            firestore.collection("issues").document(issueId)
                .update(
                    mapOf(
                        "afterPhotoUrl" to afterPhotoUrl,
                        "status" to "Resolved"
                    )
                ).await()

            val userRef = firestore.collection("users").document(uid)
            firestore.runTransaction { transaction ->
                val snapshot = transaction.get(userRef)
                val user = snapshot.toObject(UserModel::class.java) ?: return@runTransaction
                transaction.update(userRef, "civicPoints", user.civicPoints + 100)
                transaction.update(userRef, "missionsCompleted", user.missionsCompleted + 1)
            }.await()
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun claimFixerJob(issueId: String): Boolean {
        val uid = auth.currentUser?.uid ?: return false
        return try {
            firestore.collection("issues").document(issueId)
                .update(
                    mapOf(
                        "claimedByUserId" to uid,
                        "status" to "In Progress"
                    )
                ).await()
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun submitJobForReview(
        issueId: String,
        beforePhotoUrl: String,
        afterPhotoUrl: String
    ): Boolean {
        return try {
            firestore.collection("issues").document(issueId)
                .update(
                    mapOf(
                        "beforePhotoUrl" to beforePhotoUrl,
                        "afterPhotoUrl" to afterPhotoUrl
                    )
                ).await()
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun releaseFixerPayment(issueId: String, fixerUid: String, amount: Double, score: Double): Boolean {
        return try {
            firestore.collection("issues").document(issueId)
                .update(
                    mapOf(
                        "status" to "Resolved",
                        "qualityScore" to score
                    )
                ).await()

            val userRef = firestore.collection("users").document(fixerUid)
            firestore.runTransaction { transaction ->
                val snapshot = transaction.get(userRef)
                val user = snapshot.toObject(UserModel::class.java) ?: return@runTransaction
                transaction.update(userRef, "fixerEarnings", user.fixerEarnings + amount)
                transaction.update(userRef, "fixerJobsDone", user.fixerJobsDone + 1)
                
                val totalJobs = user.fixerJobsDone + 1
                val newRating = ((user.fixerRating * user.fixerJobsDone) + score) / totalJobs
                transaction.update(userRef, "fixerRating", newRating)
            }.await()
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun resolveIssueAdmin(issueId: String): Boolean {
        return try {
            firestore.collection("issues").document(issueId).update("status", "Resolved").await()
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun deleteIssueAdmin(issueId: String): Boolean {
        return try {
            firestore.collection("issues").document(issueId).delete().await()
            true
        } catch (e: Exception) {
            false
        }
    }
}
