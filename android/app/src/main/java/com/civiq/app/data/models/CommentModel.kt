package com.civiq.app.data.models

import com.google.firebase.firestore.DocumentId
import java.io.Serializable

data class CommentModel(
    @DocumentId val id: String = "",
    val issueId: String = "",
    val userId: String = "",
    val userName: String = "",
    val userInitials: String = "",
    val userColor: String = "#4F46E5", // Default Indigo
    val text: String = "",
    val timestamp: String = "",
    val likes: Int = 0,
    val likedBy: List<String> = emptyList(),
    val replyTo: String? = null, // ID of parent comment if nested
    val replies: List<CommentModel> = emptyList()
) : Serializable
