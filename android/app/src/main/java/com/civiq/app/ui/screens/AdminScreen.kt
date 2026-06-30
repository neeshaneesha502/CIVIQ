package com.civiq.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.civiq.app.ui.theme.*

@Composable
fun AdminScreen(
    issues: List<IssueModel>,
    onUpdateStatus: (issueId: String, newStatus: String) -> Unit,
    onUpdateAssignee: (issueId: String, agencyName: String, type: String) -> Unit,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()
    var selectedIssueForEdit by remember { mutableStateOf<IssueModel?>(null) }

    val gradientBrush = Brush.verticalGradient(
        colors = listOf(LightPrimary, LightSecondary)
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(if (isDark) DarkBackground else LightBackground)
    ) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(gradientBrush)
                .padding(horizontal = 24.dp, vertical = 24.dp)
        ) {
            Column {
                Text(
                    text = "CIVIQ ADMIN CONTROL",
                    style = AppTypography.labelSmall,
                    color = Color.White.copy(alpha = 0.85f),
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Municipal Override Panel",
                    style = AppTypography.headlineMedium.copy(fontSize = 18.sp),
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            contentPadding = PaddingValues(bottom = 96.dp, start = 16.dp, end = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "ACTIVE INCIDENTS FOR REVIEW",
                    style = AppTypography.labelSmall,
                    color = if (isDark) DarkSubtleText else LightSubtleText,
                    fontWeight = FontWeight.Bold
                )
            }

            val activeIssues = issues.filter { it.status.lowercase() != "resolved" }

            if (activeIssues.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(48.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("No active reports to manage. Good job!", style = AppTypography.bodySmall, color = if (isDark) DarkSubtleText else LightSubtleText)
                    }
                }
            } else {
                items(activeIssues) { issue ->
                    val isBeingEdited = selectedIssueForEdit?.id == issue.id

                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = issue.category,
                                    style = AppTypography.labelSmall,
                                    color = if (isDark) DarkPrimary else LightPrimary,
                                    fontWeight = FontWeight.Bold
                                )

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(SeverityHigh.copy(alpha = 0.15f))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = issue.status.uppercase(),
                                        style = AppTypography.labelSmall.copy(fontSize = 9.sp),
                                        color = SeverityHigh,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = issue.title,
                                style = AppTypography.titleLarge.copy(fontSize = 15.sp),
                                color = if (isDark) DarkOnBackground else LightOnBackground
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = "Routing: ${issue.assignedTo} (${issue.assigneeType.uppercase()})",
                                style = AppTypography.bodySmall,
                                color = if (isDark) DarkSubtleText else LightSubtleText
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            if (isBeingEdited) {
                                // EDIT CONTROLS
                                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Divider(color = if (isDark) DarkSurfaceVariant else LightDivider)
                                    Text(
                                        "Override Assignment agency:",
                                        style = AppTypography.titleMedium.copy(fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    )

                                    // Agency quick-select rows
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Button(
                                            onClick = {
                                                onUpdateAssignee(issue.id, "BBMP Office", "bbmp")
                                                selectedIssueForEdit = null
                                            },
                                            shape = RoundedCornerShape(8.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = AssigneeBBMP),
                                            modifier = Modifier.weight(1f),
                                            contentPadding = PaddingValues(0.dp)
                                        ) {
                                            Text("BBMP Govt", style = AppTypography.labelSmall.copy(fontSize = 9.sp, fontWeight = FontWeight.Bold), color = Color.White)
                                        }

                                        Button(
                                            onClick = {
                                                onUpdateAssignee(issue.id, "Nikhil (Certified Wireman)", "localfixer")
                                                selectedIssueForEdit = null
                                            },
                                            shape = RoundedCornerShape(8.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = AssigneeLocalFixer),
                                            modifier = Modifier.weight(1f),
                                            contentPadding = PaddingValues(0.dp)
                                        ) {
                                            Text("Local Fixer", style = AppTypography.labelSmall.copy(fontSize = 9.sp, fontWeight = FontWeight.Bold), color = Color.White)
                                        }

                                        Button(
                                            onClick = {
                                                onUpdateAssignee(issue.id, "Indiranagar RWA Campaign", "volunteer")
                                                selectedIssueForEdit = null
                                            },
                                            shape = RoundedCornerShape(8.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = AssigneeVolunteer),
                                            modifier = Modifier.weight(1f),
                                            contentPadding = PaddingValues(0.dp)
                                        ) {
                                            Text("Volunteer", style = AppTypography.labelSmall.copy(fontSize = 9.sp, fontWeight = FontWeight.Bold), color = Color.White)
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(4.dp))

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                                    ) {
                                        // Mark resolved button
                                        Button(
                                            onClick = {
                                                onUpdateStatus(issue.id, "Resolved")
                                                selectedIssueForEdit = null
                                            },
                                            shape = RoundedCornerShape(10.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = SeverityLow),
                                            modifier = Modifier.weight(1.2f)
                                        ) {
                                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                                Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                                                Text("Mark Resolved", style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold), color = Color.White)
                                            }
                                        }

                                        OutlinedButton(
                                            onClick = { selectedIssueForEdit = null },
                                            shape = RoundedCornerShape(10.dp),
                                            modifier = Modifier.weight(0.8f)
                                        ) {
                                            Text("Cancel", style = AppTypography.bodySmall)
                                        }
                                    }
                                }
                            } else {
                                Button(
                                    onClick = { selectedIssueForEdit = issue },
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = if (isDark) DarkPrimary else LightPrimary),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("Manage Incident Details", color = Color.White, style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
