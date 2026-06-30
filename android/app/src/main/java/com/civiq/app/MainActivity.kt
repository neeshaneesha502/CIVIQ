package com.civiq.app

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.civiq.app.data.mock.MockData
import com.civiq.app.data.models.CommentModel
import com.civiq.app.data.models.IssueModel
import com.civiq.app.data.models.SavedLocationModel
import com.civiq.app.data.models.UserModel
import com.civiq.app.ui.components.CommentSection
import com.civiq.app.ui.components.LocationPicker
import com.civiq.app.ui.screens.*
import com.civiq.app.ui.theme.*
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(bundle: Bundle?) {
        super.onCreate(bundle)
        setContent {
            var isDarkMode by remember { mutableStateOf(false) }

            CIVIQTheme(darkTheme = isDarkMode) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainAppController(
                        isDarkMode = isDarkMode,
                        onDarkModeToggle = { isDarkMode = it }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppController(
    isDarkMode: Boolean,
    onDarkModeToggle: (Boolean) -> Unit
) {
    val haptic = LocalHapticFeedback.current
    val scope = rememberCoroutineScope()

    // 1. Core State Managers
    var currentScreen by remember { mutableStateOf("splash") } // splash, auth, dashboard
    var activeTab by remember { mutableStateOf("home") } // home, feed, map, volunteer, fixer, admin, settings

    // Current logged-in user profile
    var currentUser by remember {
        mutableStateOf<UserModel?>(
            UserModel(
                uid = "me",
                name = "Harish Gowda",
                email = "harish.gowda@rwa.bengaluru.org",
                badge = "Elite Citizen",
                civicPoints = 380,
                missionsCompleted = 5,
                upvotedIssueIds = mutableListOf("CIVIQ-001"),
                savedIssueIds = mutableListOf("CIVIQ-003"),
                isLicensedLocalFixer = false
            )
        )
    }

    // List of active issues (initialized with sample database)
    var issuesList by remember { mutableStateOf(MockData.sampleUserIssues) }

    // Saved Locations
    var savedLocationsList by remember {
        mutableStateOf(
            listOf(
                SavedLocationModel("loc-1", "Home WFH", "80 Feet Road, 5th Block, Koramangala, Bengaluru, Karnataka 560095", 12.9352, 77.6245, "🏠"),
                SavedLocationModel("loc-2", "Office Tech Park", "ITPL Main Road, Pattandur Agrahara, Whitefield, Bengaluru 560066", 12.9816, 77.7303, "💼"),
                SavedLocationModel("loc-3", "Gym Sector 4", "HSR Sector 4, Sector 6 Junction, Bengaluru 560102", 12.9141, 77.6358, "🏋️")
            )
        )
    }

    // Active selected ward / location
    var activeLocation by remember { mutableStateOf<SavedLocationModel?>(savedLocationsList[0]) }

    // Issue-level Comments thread database
    var commentsDb by remember {
        mutableStateOf(
            mapOf(
                "CIVIQ-001" to listOf(
                    CommentModel("c-1", "Ananya Rao", "c-avatar-1", "AR", "#10B981", "This is an absolute death trap! Glad to see it triaged.", "2h ago", 14, mutableListOf("me")),
                    CommentModel("c-2", "Ramesh Kumar", "c-avatar-2", "RK", "#F59E0B", "Reported to BBMP ward engineers but no physical tape was put. Highly dangerous during evening rains.", "1h ago", 6, mutableListOf())
                ),
                "CIVIQ-002" to listOf(
                    CommentModel("c-3", "Priya Sharma", "c-avatar-3", "PS", "#3B82F6", "Sewage smells unbearable, the commercial walk path is impassable.", "3h ago", 9, mutableListOf())
                )
            )
        )
    }

    // Sheet states
    var showLocationSheet by remember { mutableStateOf(false) }
    var activeCommentsIssueId by remember { mutableStateOf<String?>(null) } // Non-null triggers full comment sheet

    // Helpers to execute actions
    val triggerHaptic = {
        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
    }

    // Navigation controller routing
    Box(modifier = Modifier.fillMaxSize()) {
        when (currentScreen) {
            "splash" -> {
                SplashScreen(onNavigateNext = {
                    currentScreen = "auth"
                })
            }
            "auth" -> {
                AuthScreen(onAuthSuccess = { name, email, isFixer, specialty, license ->
                    triggerHaptic()
                    currentUser = UserModel(
                        uid = "me",
                        name = name,
                        email = email,
                        badge = if (isFixer) "Licensed Fixer" else "Novice Hero",
                        civicPoints = if (isFixer) 0 else 100,
                        missionsCompleted = 0,
                        isLicensedLocalFixer = isFixer,
                        fixerSpecialty = specialty,
                        fixerLicenseNumber = license,
                        fixerEarnings = 0.0,
                        fixerJobsDone = 0,
                        fixerRating = 5.0
                    )
                    currentScreen = "dashboard"
                })
            }
            "dashboard" -> {
                Scaffold(
                    bottomBar = {
                        // Premium Rounded Custom Bottom Navigation Bar
                        val isDark = isSystemInDarkTheme()
                        Surface(
                            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
                            tonalElevation = 8.dp,
                            shadowElevation = 16.dp,
                            color = if (isDark) DarkSurface.copy(alpha = 0.92f) else LightSurface.copy(alpha = 0.92f),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(72.dp)
                                .align(Alignment.BottomCenter)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(horizontal = 12.dp),
                                horizontalArrangement = Arrangement.SpaceAround,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Tab items list
                                val tabs = mutableListOf(
                                    Triple("home", "Home", Icons.Default.Home),
                                    Triple("feed", "Feed", Icons.Default.Campaign),
                                    Triple("map", "Ward Map", Icons.Default.Map)
                                )

                                if (currentUser?.isLicensedLocalFixer == true) {
                                    tabs.add(Triple("localfixer", "Jobs", Icons.Default.Handyman))
                                } else {
                                    tabs.add(Triple("volunteer", "Missions", Icons.Default.VolunteerActivism))
                                }

                                tabs.add(Triple("settings", "Settings", Icons.Default.Settings))

                                tabs.forEach { (tag, label, icon) ->
                                    val isActive = activeTab == tag
                                    val activeColor = if (isDark) DarkPrimary else LightPrimary
                                    val inactiveColor = if (isDark) DarkSubtleText else LightSubtleText

                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.Center,
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(12.dp))
                                            .clickable {
                                                triggerHaptic()
                                                activeTab = tag
                                            }
                                            .padding(horizontal = 12.dp, vertical = 6.dp)
                                    ) {
                                        Icon(
                                            imageVector = icon,
                                            contentDescription = label,
                                            tint = if (isActive) activeColor else inactiveColor,
                                            modifier = Modifier.size(if (isActive) 24.dp else 22.dp)
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = label,
                                            style = AppTypography.labelSmall.copy(fontSize = 9.sp),
                                            color = if (isActive) (if (isDark) DarkOnBackground else LightOnBackground) else inactiveColor,
                                            fontWeight = if (isActive) FontWeight.Bold else FontWeight.Medium
                                        )
                                    }
                                }
                            }
                        }
                    }
                ) { innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding)) {
                        when (activeTab) {
                            "home" -> {
                                HomeScreen(
                                    user = currentUser,
                                    issues = issuesList,
                                    savedLocations = savedLocationsList,
                                    currentLocation = activeLocation,
                                    onIssueUpvote = { issueId ->
                                        triggerHaptic()
                                        issuesList = issuesList.map {
                                            if (it.id == issueId) {
                                                val isAlreadyUpvoted = currentUser?.upvotedIssueIds?.contains(issueId) ?: false
                                                val countChange = if (isAlreadyUpvoted) -1 else 1
                                                if (isAlreadyUpvoted) {
                                                    currentUser?.upvotedIssueIds?.remove(issueId)
                                                } else {
                                                    currentUser?.upvotedIssueIds?.add(issueId)
                                                }
                                                it.copy(upvotesCount = it.upvotesCount + countChange)
                                            } else it
                                        }
                                    },
                                    onIssueSave = { issueId ->
                                        triggerHaptic()
                                        val isAlreadySaved = currentUser?.savedIssueIds?.contains(issueId) ?: false
                                        if (isAlreadySaved) {
                                            currentUser?.savedIssueIds?.remove(issueId)
                                        } else {
                                            currentUser?.savedIssueIds?.add(issueId)
                                        }
                                        issuesList = issuesList.map {
                                            if (it.id == issueId) {
                                                val newList = it.savedByUserIds.toMutableList()
                                                if (isAlreadySaved) newList.remove(currentUser?.uid ?: "me")
                                                else newList.add(currentUser?.uid ?: "me")
                                                it.copy(savedByUserIds = newList)
                                            } else it
                                        }
                                    },
                                    onCommentAdd = { issueId, text ->
                                        val list = commentsDb[issueId]?.toMutableList() ?: mutableListOf()
                                        list.add(CommentModel("c-${System.currentTimeMillis()}", currentUser?.name ?: "Citizen Hero", "avatar", "CH", "#4F46E5", text, "Just now", 0, mutableListOf()))
                                        commentsDb = commentsDb + (issueId to list)
                                    },
                                    onLikeComment = { issueId, commentId ->
                                        commentsDb = commentsDb.mapValues { (key, list) ->
                                            if (key == issueId) {
                                                list.map { comment ->
                                                    if (comment.id == commentId) {
                                                        val likesList = comment.likedBy.toMutableList()
                                                        val likedByMe = likesList.contains(currentUser?.uid ?: "me")
                                                        if (likedByMe) likesList.remove(currentUser?.uid ?: "me")
                                                        else likesList.add(currentUser?.uid ?: "me")
                                                        comment.copy(
                                                            likes = comment.likes + (if (likedByMe) -1 else 1),
                                                            likedBy = likesList
                                                        )
                                                    } else comment
                                                }
                                            } else list
                                        }
                                    },
                                    commentsMap = commentsDb,
                                    onLocationClick = { showLocationSheet = true },
                                    onReportClick = { activeTab = "report" },
                                    onNavigateToTab = { activeTab = it }
                                )
                            }
                            "feed" -> {
                                FeedScreen(
                                    user = currentUser,
                                    issues = issuesList,
                                    currentLocation = activeLocation,
                                    onIssueUpvote = { issueId ->
                                        triggerHaptic()
                                        issuesList = issuesList.map {
                                            if (it.id == issueId) {
                                                val isAlreadyUpvoted = currentUser?.upvotedIssueIds?.contains(issueId) ?: false
                                                val countChange = if (isAlreadyUpvoted) -1 else 1
                                                if (isAlreadyUpvoted) {
                                                    currentUser?.upvotedIssueIds?.remove(issueId)
                                                } else {
                                                    currentUser?.upvotedIssueIds?.add(issueId)
                                                }
                                                it.copy(upvotesCount = it.upvotesCount + countChange)
                                            } else it
                                        }
                                    },
                                    onIssueSave = { issueId ->
                                        triggerHaptic()
                                        val isAlreadySaved = currentUser?.savedIssueIds?.contains(issueId) ?: false
                                        if (isAlreadySaved) {
                                            currentUser?.savedIssueIds?.remove(issueId)
                                        } else {
                                            currentUser?.savedIssueIds?.add(issueId)
                                        }
                                        issuesList = issuesList.map {
                                            if (it.id == issueId) {
                                                val newList = it.savedByUserIds.toMutableList()
                                                if (isAlreadySaved) newList.remove(currentUser?.uid ?: "me")
                                                else newList.add(currentUser?.uid ?: "me")
                                                it.copy(savedByUserIds = newList)
                                            } else it
                                        }
                                    },
                                    onCommentAdd = { issueId, text ->
                                        val list = commentsDb[issueId]?.toMutableList() ?: mutableListOf()
                                        list.add(CommentModel("c-${System.currentTimeMillis()}", currentUser?.name ?: "Citizen Hero", "avatar", "CH", "#4F46E5", text, "Just now", 0, mutableListOf()))
                                        commentsDb = commentsDb + (issueId to list)
                                    },
                                    onLikeComment = { issueId, commentId ->
                                        commentsDb = commentsDb.mapValues { (key, list) ->
                                            if (key == issueId) {
                                                list.map { comment ->
                                                    if (comment.id == commentId) {
                                                        val likesList = comment.likedBy.toMutableList()
                                                        val likedByMe = likesList.contains(currentUser?.uid ?: "me")
                                                        if (likedByMe) likesList.remove(currentUser?.uid ?: "me")
                                                        else likesList.add(currentUser?.uid ?: "me")
                                                        comment.copy(
                                                            likes = comment.likes + (if (likedByMe) -1 else 1),
                                                            likedBy = likesList
                                                        )
                                                    } else comment
                                                }
                                            } else list
                                        }
                                    },
                                    commentsMap = commentsDb,
                                    onLocationClick = { showLocationSheet = true }
                                )
                            }
                            "map" -> {
                                MapScreen(
                                    issues = issuesList,
                                    currentLocation = activeLocation,
                                    onIssueClick = { clickedIssue ->
                                        activeTab = "feed"
                                        // Simple highlight jump to clicked
                                    }
                                )
                            }
                            "volunteer" -> {
                                VolunteerScreen(
                                    user = currentUser,
                                    issues = issuesList,
                                    onClaimMission = { issueId ->
                                        triggerHaptic()
                                        issuesList = issuesList.map {
                                            if (it.id == issueId) {
                                                it.copy(claimedByUserId = currentUser?.uid, status = "In Progress")
                                            } else it
                                        }
                                        Toast.makeText(this@MainActivity, "Mission claimed! +100 Points pending proof submission.", Toast.LENGTH_LONG).show()
                                    },
                                    onResolveMission = { issueId, photo ->
                                        triggerHaptic()
                                        issuesList = issuesList.map {
                                            if (it.id == issueId) {
                                                it.copy(status = "Resolved", hoursPassed = 0)
                                            } else it
                                        }
                                        currentUser = currentUser?.copy(
                                            civicPoints = (currentUser?.civicPoints ?: 0) + 100,
                                            missionsCompleted = (currentUser?.missionsCompleted ?: 0) + 1
                                        )
                                        Toast.makeText(this@MainActivity, "Proof verified! +100 Civic Points added instantly.", Toast.LENGTH_LONG).show()
                                    }
                                )
                            }
                            "localfixer" -> {
                                LocalFixerScreen(
                                    user = currentUser,
                                    issues = issuesList,
                                    onClaimJob = { issueId ->
                                        triggerHaptic()
                                        issuesList = issuesList.map {
                                            if (it.id == issueId) {
                                                it.copy(claimedByUserId = currentUser?.uid, status = "In Progress")
                                            } else it
                                        }
                                        Toast.makeText(this@MainActivity, "Professional tender claimed!", Toast.LENGTH_LONG).show()
                                    },
                                    onSubmitJobReview = { issueId, beforePhoto, afterPhoto ->
                                        triggerHaptic()
                                        issuesList = issuesList.map {
                                            if (it.id == issueId) {
                                                it.copy(status = "Resolved", qualityScore = 8.8)
                                            } else it
                                        }
                                        currentUser = currentUser?.copy(
                                            fixerEarnings = (currentUser?.fixerEarnings ?: 0.0) + 800.0,
                                            fixerJobsDone = (currentUser?.fixerJobsDone ?: 0) + 1
                                        )
                                        Toast.makeText(this@MainActivity, "Gemini Quality verified (8.8/10)! ₹800 Escrow released to your UPI wallet.", Toast.LENGTH_LONG).show()
                                    }
                                )
                            }
                            "report" -> {
                                ReportScreen(
                                    currentLocation = activeLocation,
                                    onNavigateBack = { activeTab = "home" },
                                    onReportSubmit = { title, desc, category, addressInput, photoBase64 ->
                                        triggerHaptic()
                                        // Create and append issue
                                        val newIssue = IssueModel(
                                            id = "CIVIQ-${System.currentTimeMillis().toString().takeLast(4)}",
                                            title = title,
                                            description = desc,
                                            category = category,
                                            severity = "High",
                                            status = "Pending",
                                            latitude = activeLocation?.latitude ?: 12.9716,
                                            longitude = activeLocation?.longitude ?: 77.5946,
                                            address = addressInput,
                                            assignedTo = "BBMP Engineering Ward",
                                            assigneeType = "bbmp",
                                            paymentDetails = "Govt funded, Ward emergency cash pool, SLA 72h",
                                            slaHours = 72,
                                            hoursPassed = 0,
                                            upvotesCount = 1,
                                            isSafetyRisk = false,
                                            datePosted = "2026-06-25T15:00:00Z",
                                            publicAngerIndex = 45,
                                            department = "Ward Public Utilities Board",
                                            estimatedFixTime = "3 days",
                                            urgencyReason = "Citizen reported hazard needing quick tarmac patch.",
                                            actionItems = listOf("Clear base surrounding pothole", "Pour bitumen and quick-settling aggregate", "Level pavement")
                                        )
                                        issuesList = listOf(newIssue) + issuesList
                                        activeTab = "feed"
                                        Toast.makeText(this@MainActivity, "Report triaged by Gemini Flash AI and routed successfully!", Toast.LENGTH_LONG).show()
                                    }
                                )
                            }
                            "settings" -> {
                                SettingsScreen(
                                    user = currentUser,
                                    isDarkMode = isDarkMode,
                                    onDarkModeToggle = onDarkModeToggle,
                                    onLogout = {
                                        currentScreen = "auth"
                                        activeTab = "home"
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }

        // 4. Modal location picker sheet
        if (showLocationSheet) {
            ModalBottomSheet(
                onDismissRequest = { showLocationSheet = false },
                sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
                shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
                containerColor = if (isSystemInDarkTheme()) DarkSurface else LightSurface
            ) {
                LocationPicker(
                    savedLocations = savedLocationsList,
                    onLocationSelect = { loc ->
                        triggerHaptic()
                        activeLocation = loc
                        showLocationSheet = false
                        Toast.makeText(this@MainActivity, "Switched to ${loc.label} active ward feed", Toast.LENGTH_SHORT).show()
                    },
                    onCurrentLocationSelect = {
                        triggerHaptic()
                        activeLocation = SavedLocationModel("gps", "Live GPS Location", "80 Feet Road, Koramangala, Bengaluru", 12.9352, 77.6245, "📍")
                        showLocationSheet = false
                        Toast.makeText(this@MainActivity, "Switched to High-accuracy GPS feed", Toast.LENGTH_SHORT).show()
                    },
                    onAddSavedLocation = { label, addr, lat, lng, emoji ->
                        triggerHaptic()
                        val newLoc = SavedLocationModel("loc-${System.currentTimeMillis()}", label, addr, lat, lng, emoji)
                        savedLocationsList = savedLocationsList + newLoc
                    },
                    onDismiss = { showLocationSheet = false }
                )
            }
        }
    }
}
