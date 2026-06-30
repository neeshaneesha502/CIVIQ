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
fun LocalFixerScreen(
    user: UserModel?,
    issues: List<IssueModel>,
    onClaimJob: (String) -> Unit,
    onSubmitJobReview: (String, String, String) -> Unit,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()
    var selectedSubTab by remember { mutableStateOf(0) } // 0: Available Jobs, 1: Active Assignments

    // Filter local fixer tasks
    val fixerIssues = issues.filter { it.assigneeType.lowercase() == "localfixer" }

    val availableJobs = fixerIssues.filter { it.claimedByUserId.isNullOrEmpty() && it.status.lowercase() != "resolved" }
    val claimedJobs = fixerIssues.filter { it.claimedByUserId == user?.uid && it.status.lowercase() != "resolved" }

    val gradientBrush = Brush.verticalGradient(
        colors = listOf(LightPrimary, LightSecondary)
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(if (isDark) DarkBackground else LightBackground)
    ) {
        // Top Professional Stats Dashboard
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
                            text = "LOCAL FIXER PORTAL",
                            style = AppTypography.labelSmall,
                            color = Color.White.copy(alpha = 0.85f),
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = user?.fixerSpecialty?.uppercase() ?: "CERTIFIED PROFESSIONAL",
                            style = AppTypography.headlineMedium.copy(fontSize = 18.sp),
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Rating Badge
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.White.copy(alpha = 0.2f))
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Icon(Icons.Default.Star, contentDescription = null, tint = Color.Yellow, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = String.format("%.1f", user?.fixerRating ?: 5.0),
                            style = AppTypography.labelSmall,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Bento-style Stats
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Earnings Card
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color.White.copy(alpha = 0.15f))
                            .padding(12.dp)
                    ) {
                        Column {
                            Text("Total Earnings", style = AppTypography.labelSmall.copy(fontSize = 9.sp), color = Color.White.copy(alpha = 0.75f))
                            Text("₹${user?.fixerEarnings?.toInt() ?: 2400}", style = AppTypography.headlineMedium.copy(fontSize = 20.sp), color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }

                    // Jobs Finished Card
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color.White.copy(alpha = 0.15f))
                            .padding(12.dp)
                    ) {
                        Column {
                            Text("Jobs Done", style = AppTypography.labelSmall.copy(fontSize = 9.sp), color = Color.White.copy(alpha = 0.75f))
                            Text("${user?.fixerJobsDone ?: 3}", style = AppTypography.headlineMedium.copy(fontSize = 20.sp), color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
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
                    text = "Available Jobs (${availableJobs.size})",
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
                    text = "My Assignments (${claimedJobs.size})",
                    style = AppTypography.titleMedium.copy(fontSize = 13.sp),
                    fontWeight = FontWeight.Bold,
                    color = if (selectedSubTab == 1) Color.White else (if (isDark) DarkSubtleText else LightSubtleText)
                )
            }
        }

        // Jobs List
        val selectedJobs = if (selectedSubTab == 0) availableJobs else claimedJobs

        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            contentPadding = PaddingValues(bottom = 96.dp, start = 16.dp, end = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            if (selectedJobs.isEmpty()) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 64.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = if (selectedSubTab == 0) Icons.Default.Inventory else Icons.Default.AssignmentTurnedIn,
                            contentDescription = null,
                            tint = (if (isDark) DarkSubtleText else LightSubtleText).copy(alpha = 0.5f),
                            modifier = Modifier.size(56.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = if (selectedSubTab == 0) "All local jobs completed!" else "No active jobs assigned",
                            style = AppTypography.titleLarge.copy(fontSize = 15.sp),
                            color = if (isDark) DarkSubtleText else LightSubtleText
                        )
                        Text(
                            text = if (selectedSubTab == 0) "Check back later for new ward tenders." else "Claim available tenders to begin earning payouts via UPI escrow!",
                            style = AppTypography.bodySmall,
                            color = (if (isDark) DarkSubtleText else LightSubtleText).copy(alpha = 0.8f)
                        )
                    }
                }
            } else {
                items(selectedJobs) { job ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = job.category,
                                    style = AppTypography.labelSmall,
                                    color = if (isDark) DarkPrimary else LightPrimary,
                                    fontWeight = FontWeight.Bold
                                )

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(AssigneeLocalFixer.copy(alpha = 0.15f))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    val payout = if (job.id == "CIVIQ-006") "₹650" else "₹800"
                                    Text(
                                        "💰 $payout Escrow",
                                        style = AppTypography.labelSmall.copy(fontSize = 10.sp),
                                        color = AssigneeLocalFixer,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = job.title,
                                style = AppTypography.titleLarge,
                                color = if (isDark) DarkOnBackground else LightOnBackground
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = job.description,
                                style = AppTypography.bodyLarge,
                                color = (if (isDark) DarkOnBackground else LightOnBackground).copy(alpha = 0.8f)
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            // Action Items box
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (isDark) DarkSurfaceVariant else LightSurfaceVariant)
                                    .padding(12.dp)
                            ) {
                                Text(
                                    "Professional Tender Requirements:",
                                    style = AppTypography.titleMedium.copy(fontSize = 12.sp, fontWeight = FontWeight.Bold),
                                    color = if (isDark) DarkOnBackground else LightOnBackground
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                job.actionItems.forEachIndexed { i, item ->
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
                                    text = "📍 ${job.address}",
                                    style = AppTypography.bodySmall,
                                    color = if (isDark) DarkSubtleText else LightSubtleText,
                                    modifier = Modifier.weight(0.6f)
                                )

                                if (selectedSubTab == 0) {
                                    Button(
                                        onClick = { onClaimJob(job.id) },
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = if (isDark) DarkPrimary else LightPrimary)
                                    ) {
                                        Text("Claim Tender", color = Color.White, style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold))
                                    }
                                } else {
                                    // Submit completed resolution
                                    Button(
                                        onClick = {
                                            onSubmitJobReview(
                                                job.id,
                                                "before_photo_url_placeholder",
                                                "after_photo_url_placeholder"
                                            )
                                        },
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = SeverityLow)
                                    ) {
                                        Text("Trigger AI Quality Review", color = Color.White, style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold))
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
