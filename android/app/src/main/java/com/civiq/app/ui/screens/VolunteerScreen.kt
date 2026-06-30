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
import com.civiq.app.data.models.IssueModel
import com.civiq.app.data.models.UserModel
import com.civiq.app.ui.theme.*

@Composable
fun VolunteerScreen(
    user: UserModel?,
    issues: List<IssueModel>,
    onClaimMission: (String) -> Unit,
    onResolveMission: (String, String) -> Unit,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()
    var selectedSubTab by remember { mutableStateOf(0) } // 0: Available, 1: Active Claims

    // Filter volunteer tasks
    val volunteerIssues = issues.filter { it.assigneeType.lowercase() == "volunteer" }

    val availableMissions = volunteerIssues.filter { it.claimedByUserId.isNullOrEmpty() && it.status.lowercase() != "resolved" }
    val claimedMissions = volunteerIssues.filter { it.claimedByUserId == user?.uid && it.status.lowercase() != "resolved" }

    val gradientBrush = Brush.verticalGradient(
        colors = listOf(LightPrimary, LightSecondary)
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(if (isDark) DarkBackground else LightBackground)
    ) {
        // Top gamified banner
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(gradientBrush)
                .padding(horizontal = 24.dp, vertical = 24.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "CITIZEN MISSIONS",
                            style = AppTypography.labelSmall,
                            color = Color.White.copy(alpha = 0.85f),
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Co-Restore Wards",
                            style = AppTypography.headlineMedium.copy(fontSize = 20.sp),
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Level Badge
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.White.copy(alpha = 0.2f))
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = user?.badge ?: "Novice Citizen",
                            style = AppTypography.labelSmall,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Points earned info line
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = Color.Yellow, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Earn +100 Civic Points and digital badges for each resolved task!",
                        style = AppTypography.bodySmall,
                        color = Color.White.copy(alpha = 0.9f)
                    )
                }
            }
        }

        // Sub Tab selector
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(if (isDark) DarkSurface else LightSurface)
                .padding(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(10.dp))
                    .background(if (selectedSubTab == 0) (if (isDark) DarkPrimary else LightPrimary) else Color.Transparent)
                    .clickable { selectedSubTab = 0 }
                    .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Available (${availableMissions.size})",
                    style = AppTypography.titleMedium.copy(fontSize = 13.sp),
                    fontWeight = FontWeight.Bold,
                    color = if (selectedSubTab == 0) Color.White else (if (isDark) DarkSubtleText else LightSubtleText)
                )
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(10.dp))
                    .background(if (selectedSubTab == 1) (if (isDark) DarkPrimary else LightPrimary) else Color.Transparent)
                    .clickable { selectedSubTab = 1 }
                    .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Active Claims (${claimedMissions.size})",
                    style = AppTypography.titleMedium.copy(fontSize = 13.sp),
                    fontWeight = FontWeight.Bold,
                    color = if (selectedSubTab == 1) Color.White else (if (isDark) DarkSubtleText else LightSubtleText)
                )
            }
        }

        // Active missions list
        val selectedList = if (selectedSubTab == 0) availableMissions else claimedMissions

        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            contentPadding = PaddingValues(bottom = 96.dp, start = 16.dp, end = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            if (selectedList.isEmpty()) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 64.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = if (selectedSubTab == 0) Icons.Default.AllInbox else Icons.Default.DoneAll,
                            contentDescription = null,
                            tint = (if (isDark) DarkSubtleText else LightSubtleText).copy(alpha = 0.5f),
                            modifier = Modifier.size(56.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = if (selectedSubTab == 0) "All campaigns completed!" else "No active mission claims",
                            style = AppTypography.titleLarge.copy(fontSize = 15.sp),
                            color = if (isDark) DarkSubtleText else LightSubtleText
                        )
                        Text(
                            text = if (selectedSubTab == 0) "Check back later for new ward cleanups." else "Claim nearby campaigns to start co-fixing Bengaluru!",
                            style = AppTypography.bodySmall,
                            color = (if (isDark) DarkSubtleText else LightSubtleText).copy(alpha = 0.8f)
                        )
                    }
                }
            } else {
                items(selectedList) { mission ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            // Category & Reward Header
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = mission.category,
                                    style = AppTypography.labelSmall,
                                    color = if (isDark) DarkPrimary else LightPrimary,
                                    fontWeight = FontWeight.Bold
                                )

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(SeverityLow.copy(alpha = 0.15f))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        "🏅 +100 Pts",
                                        style = AppTypography.labelSmall.copy(fontSize = 10.sp),
                                        color = SeverityLow,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = mission.title,
                                style = AppTypography.titleLarge,
                                color = if (isDark) DarkOnBackground else LightOnBackground
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = mission.description,
                                style = AppTypography.bodyLarge,
                                color = (if (isDark) DarkOnBackground else LightOnBackground).copy(alpha = 0.8f)
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            // Action items box
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (isDark) DarkSurfaceVariant else LightSurfaceVariant)
                                    .padding(12.dp)
                            ) {
                                Text(
                                    "Campaign Action Items:",
                                    style = AppTypography.titleMedium.copy(fontSize = 12.sp, fontWeight = FontWeight.Bold),
                                    color = if (isDark) DarkOnBackground else LightOnBackground
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                mission.actionItems.forEachIndexed { i, item ->
                                    Text(
                                        text = "${i + 1}. $item",
                                        style = AppTypography.bodySmall,
                                        color = (if (isDark) DarkOnBackground else LightOnBackground).copy(alpha = 0.8f)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "📍 ${mission.address}",
                                    style = AppTypography.bodySmall,
                                    color = if (isDark) DarkSubtleText else LightSubtleText,
                                    modifier = Modifier.weight(0.6f)
                                )

                                if (selectedSubTab == 0) {
                                    Button(
                                        onClick = { onClaimMission(mission.id) },
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = if (isDark) DarkPrimary else LightPrimary)
                                    ) {
                                        Text("Claim Mission", color = Color.White, style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold))
                                    }
                                } else {
                                    // Submit completed resolution
                                    Button(
                                        onClick = { onResolveMission(mission.id, "resolved_photo_url_placeholder") },
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = SeverityLow)
                                    ) {
                                        Text("Upload Resolution", color = Color.White, style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
