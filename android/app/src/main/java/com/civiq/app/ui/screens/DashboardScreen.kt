package com.civiq.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
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
import com.civiq.app.ui.theme.*

@Composable
fun DashboardScreen(
    issues: List<IssueModel>,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()

    // Aggregate statistics
    val totalIssues = issues.size
    val resolvedIssues = issues.filter { it.status.lowercase() == "resolved" }.size
    val activeIssues = totalIssues - resolvedIssues
    val resolutionRate = if (totalIssues > 0) (resolvedIssues.toFloat() / totalIssues.toFloat() * 100).toInt() else 0

    // Grouping count by categories
    val categoryCounts = remember(issues) {
        issues.groupBy { it.category }.mapValues { it.value.size }
    }
    val maxCategoryCount = categoryCounts.values.maxOrNull() ?: 1

    // Mock Bengaluru leaderboard
    val leaderboard = listOf(
        LeaderboardEntry("Ananya Rao", 1850, "Indiranagar", "👑 Ward Warden"),
        LeaderboardEntry("Ramesh Kumar", 1450, "HSR Layout", "🌟 Lane Legend"),
        LeaderboardEntry("Priya Sharma", 1200, "Whitefield", "🛡️ Pothole Patrol"),
        LeaderboardEntry("Karthik S.", 950, "Koramangala", "🌿 Green Hero"),
        LeaderboardEntry("Deepa M.", 800, "Electronic City", "⚡ Grid Guardian")
    )

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(if (isDark) DarkBackground else LightBackground),
        contentPadding = PaddingValues(bottom = 96.dp, start = 16.dp, end = 16.dp)
    ) {
        // Dashboard title
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp)
            ) {
                Column {
                    Text(
                        text = "CIVIC METRICS",
                        style = AppTypography.labelSmall,
                        color = if (isDark) DarkPrimary else LightPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Bengaluru Diagnostics",
                        style = AppTypography.headlineMedium.copy(fontSize = 22.sp),
                        color = if (isDark) DarkOnBackground else LightOnBackground,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Summary counters row
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Resolved Card
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("Resolved", style = AppTypography.bodySmall, color = if (isDark) DarkSubtleText else LightSubtleText)
                        Text("$resolvedIssues", style = AppTypography.headlineMedium.copy(fontSize = 22.sp), color = SeverityLow, fontWeight = FontWeight.Bold)
                        Text("$resolutionRate% Fix Rate", style = AppTypography.labelSmall.copy(fontSize = 9.sp), color = if (isDark) DarkSubtleText else LightSubtleText)
                    }
                }

                // Active Card
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("Active Incidents", style = AppTypography.bodySmall, color = if (isDark) DarkSubtleText else LightSubtleText)
                        Text("$activeIssues", style = AppTypography.headlineMedium.copy(fontSize = 22.sp), color = SeverityCritical, fontWeight = FontWeight.Bold)
                        Text("SLA monitored", style = AppTypography.labelSmall.copy(fontSize = 9.sp), color = if (isDark) DarkSubtleText else LightSubtleText)
                    }
                }
            }
        }

        // Category breakdown bar chart
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Incident Type Distribution",
                        style = AppTypography.titleMedium.copy(fontSize = 14.sp),
                        fontWeight = FontWeight.Bold,
                        color = if (isDark) DarkOnBackground else LightOnBackground
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    categoryCounts.forEach { (category, count) ->
                        val fraction = count.toFloat() / maxCategoryCount.toFloat()
                        Column(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = category, style = AppTypography.bodySmall, color = if (isDark) DarkOnBackground else LightOnBackground)
                                Text(text = "$count reports", style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold))
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(8.dp)
                                    .clip(CircleShape)
                                    .background(if (isDark) DarkSurfaceVariant else LightDivider)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxHeight()
                                        .fillMaxWidth(fraction)
                                        .background(if (isDark) DarkPrimary else LightPrimary)
                                )
                            }
                        }
                    }
                }
            }
        }

        // Leaderboard header
        item {
            Text(
                text = "BENGALURU HERO LEADERBOARD",
                style = AppTypography.labelSmall,
                color = if (isDark) DarkSubtleText else LightSubtleText,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }

        // Leaderboard items
        itemsIndexed(leaderboard) { index, entry ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (isDark) DarkSurface else LightSurface)
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Rank circle
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(
                            when (index) {
                                0 -> Color(0xFFFFD700) // Gold
                                1 -> Color(0xFFC0C0C0) // Silver
                                2 -> Color(0xFFCD7F32) // Bronze
                                else -> (if (isDark) DarkSurfaceVariant else LightDivider)
                            }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "${index + 1}",
                        style = AppTypography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = if (index < 3) Color.Black else (if (isDark) DarkOnBackground else LightOnBackground)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = entry.name,
                            style = AppTypography.titleMedium.copy(fontSize = 13.sp),
                            fontWeight = FontWeight.Bold,
                            color = if (isDark) DarkOnBackground else LightOnBackground
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = entry.title,
                            style = AppTypography.bodySmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                            color = if (isDark) DarkPrimary else LightPrimary
                        )
                    }
                    Text(text = "${entry.ward} Ward", style = AppTypography.bodySmall, color = if (isDark) DarkSubtleText else LightSubtleText)
                }

                Text(
                    text = "${entry.points} pts",
                    style = AppTypography.titleMedium.copy(fontSize = 13.sp),
                    fontWeight = FontWeight.Bold,
                    color = if (isDark) DarkOnBackground else LightOnBackground
                )
            }
        }
    }
}
