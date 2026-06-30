package com.civiq.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.civiq.app.data.models.CommentModel
import com.civiq.app.data.models.IssueModel
import com.civiq.app.data.models.SavedLocationModel
import com.civiq.app.data.models.UserModel
import com.civiq.app.ui.components.IssueCard
import com.civiq.app.ui.theme.*

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun HomeScreen(
    user: UserModel?,
    issues: List<IssueModel>,
    savedLocations: List<SavedLocationModel>,
    currentLocation: SavedLocationModel?,
    onIssueUpvote: (String) -> Unit,
    onIssueSave: (String) -> Unit,
    onCommentAdd: (String, String) -> Unit,
    onLikeComment: (String, String) -> Unit,
    commentsMap: Map<String, List<CommentModel>>,
    onLocationClick: () -> Unit,
    onReportClick: () -> Unit,
    onNavigateToTab: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()

    // Calculate dynamic stats
    val nearMeCount = issues.filter { issue ->
        currentLocation?.let { loc ->
            // Simulating a quick distance check
            issue.address.contains(loc.label, ignoreCase = true) || issue.address.contains(loc.address.take(10), ignoreCase = true)
        } ?: true
    }.size

    val resolvedCount = issues.filter { it.status.lowercase() == "resolved" }.size
    val totalUpvotes = user?.upvotedIssueIds?.size ?: 0

    val gradientBrush = Brush.verticalGradient(
        colors = listOf(LightPrimary, LightSecondary)
    )

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(if (isDark) DarkBackground else LightBackground),
        contentPadding = PaddingValues(bottom = 96.dp)
    ) {
        // 1. Premium Gradient Header with Ward Selector & User Info
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(bottomStart = 32.dp, bottomEnd = 32.dp))
                    .background(gradientBrush)
                    .padding(horizontal = 24.dp, vertical = 28.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Greeting and Name
                        Column {
                            Text(
                                text = "Namaskara 🌿",
                                style = AppTypography.bodySmall,
                                color = Color.White.copy(alpha = 0.85f),
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = user?.name ?: "Citizen Hero",
                                style = AppTypography.headlineMedium.copy(fontSize = 22.sp),
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Notification & Avatar
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(42.dp)
                                    .clip(CircleShape)
                                    .background(Color.White.copy(alpha = 0.15f))
                                    .clickable { /* Notifications click */ },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Notifications, contentDescription = "Alerts", tint = Color.White)
                            }

                            // Dynamic Initials Avatar
                            Box(
                                modifier = Modifier
                                    .size(42.dp)
                                    .clip(CircleShape)
                                    .background(Color.White),
                                contentAlignment = Alignment.Center
                            ) {
                                val initials = user?.name?.split(" ")?.mapNotNull { it.firstOrNull() }?.joinToString("")?.take(2) ?: "CH"
                                Text(
                                    text = initials,
                                    style = AppTypography.labelSmall.copy(fontSize = 12.sp, fontWeight = FontWeight.Bold),
                                    color = LightPrimary
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Ward Selector Chip
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color.White.copy(alpha = 0.18f))
                            .clickable { onLocationClick() }
                            .padding(horizontal = 16.dp, vertical = 12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = currentLocation?.iconEmoji ?: "📍",
                                    fontSize = 18.sp
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(
                                        text = "ACTIVE WARD",
                                        style = AppTypography.labelSmall.copy(fontSize = 8.sp, fontWeight = FontWeight.Bold),
                                        color = Color.White.copy(alpha = 0.75f)
                                    )
                                    Text(
                                        text = currentLocation?.label ?: "All Bengaluru",
                                        style = AppTypography.titleMedium.copy(fontSize = 14.sp),
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "Change",
                                    style = AppTypography.bodySmall,
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = Color.White)
                            }
                        }
                    }
                }
            }
        }

        // 2. Bento Stats Grid
        item {
            Column(modifier = Modifier.padding(24.dp)) {
                Text(
                    text = "CIVIC IMPACT SCORE",
                    style = AppTypography.labelSmall,
                    color = if (isDark) DarkSubtleText else LightSubtleText,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Points Card
                    Card(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(LightSecondary.copy(alpha = 0.1f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = LightSecondary)
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "${user?.civicPoints ?: 250}",
                                style = AppTypography.headlineMedium.copy(fontSize = 24.sp),
                                color = if (isDark) DarkOnBackground else LightOnBackground
                            )
                            Text(
                                text = "Civic Points",
                                style = AppTypography.bodySmall,
                                color = if (isDark) DarkSubtleText else LightSubtleText
                            )
                        }
                    }

                    // Missions Completed
                    Card(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(SeverityLow.copy(alpha = 0.1f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Verified, contentDescription = null, tint = SeverityLow)
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "${user?.missionsCompleted ?: 3}",
                                style = AppTypography.headlineMedium.copy(fontSize = 24.sp),
                                color = if (isDark) DarkOnBackground else LightOnBackground
                            )
                            Text(
                                text = "Missions Finished",
                                style = AppTypography.bodySmall,
                                color = if (isDark) DarkSubtleText else LightSubtleText
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Near Me
                    Card(
                        modifier = Modifier.weight(1.2f),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface)
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(SeverityHigh.copy(alpha = 0.1f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.FmdGood, contentDescription = null, tint = SeverityHigh)
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "$nearMeCount Active",
                                    style = AppTypography.titleLarge.copy(fontSize = 16.sp),
                                    fontWeight = FontWeight.Bold,
                                    color = if (isDark) DarkOnBackground else LightOnBackground
                                )
                                Text(
                                    text = "Near your ward",
                                    style = AppTypography.bodySmall,
                                    color = if (isDark) DarkSubtleText else LightSubtleText
                                )
                            }
                        }
                    }

                    // Report Action Button
                    Card(
                        onClick = onReportClick,
                        modifier = Modifier.weight(0.8f),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = if (isDark) DarkPrimary else LightPrimary)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxHeight()
                                .padding(16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Report",
                                    style = AppTypography.titleMedium,
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }

        // 3. Recommended / Trending issues section
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "URGENT ACTIONS FOR YOU",
                    style = AppTypography.labelSmall,
                    color = if (isDark) DarkSubtleText else LightSubtleText,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = "See Feed",
                    style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold),
                    color = if (isDark) DarkPrimary else LightPrimary,
                    modifier = Modifier.clickable { onNavigateToTab("feed") }
                )
            }
        }

        // Recommend top critical issues
        val recommendedIssues = issues.filter { it.status.lowercase() != "resolved" }
            .sortedByDescending { it.severity.lowercase() == "critical" || it.isSafetyRisk }

        if (recommendedIssues.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(48.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Clean slate! No urgent issues reported in Bengaluru.", style = AppTypography.bodySmall, color = if (isDark) DarkSubtleText else LightSubtleText)
                }
            }
        } else {
            items(recommendedIssues.take(3)) { issue ->
                val isUpvoted = user?.upvotedIssueIds?.contains(issue.id) ?: false
                val isSaved = issue.savedByUserIds.contains(user?.uid ?: "me")
                val commentsList = commentsMap[issue.id] ?: emptyList()

                IssueCard(
                    issue = issue,
                    isUpvoted = isUpvoted,
                    isSaved = isSaved,
                    onUpvoteClick = { onIssueUpvote(issue.id) },
                    onSaveClick = { onIssueSave(issue.id) },
                    onCommentAdd = { commentText -> onCommentAdd(issue.id, commentText) },
                    onLikeComment = { commentId -> onLikeComment(issue.id, commentId) },
                    comments = commentsList,
                    currentUserId = user?.uid ?: "me",
                    currentUserInitials = if (user?.name?.isNotEmpty() == true) user.name.split(" ").mapNotNull { it.firstOrNull() }.joinToString("").take(2) else "CH",
                    currentUserColor = "#4F46E5"
                )
            }
        }
    }
}
