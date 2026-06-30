package com.civiq.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.civiq.app.data.models.IssueModel
import com.civiq.app.data.models.SavedLocationModel
import com.civiq.app.ui.theme.*
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen(
    issues: List<IssueModel>,
    currentLocation: SavedLocationModel?,
    onIssueClick: (IssueModel) -> Unit,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()
    var selectedIssue by remember { mutableStateOf<IssueModel?>(null) }
    var selectedCategoryFilter by remember { mutableStateOf("All") }

    val categories = listOf("All", "Roads 🛣️", "Water 💧", "Lighting 💡", "Sanitation ♻️", "Parks 🌳", "Public Safety 🚨")

    val filteredIssues = remember(selectedCategoryFilter, issues) {
        if (selectedCategoryFilter == "All") {
            issues
        } else {
            issues.filter { it.category == selectedCategoryFilter }
        }
    }

    // Set initial position centered around Bengaluru or current location
    val startLatLng = remember(currentLocation) {
        LatLng(currentLocation?.latitude ?: 12.9716, currentLocation?.longitude ?: 77.5946)
    }

    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(startLatLng, 12.5f)
    }

    Box(modifier = modifier.fillMaxSize()) {
        // 1. Google Map integration
        GoogleMap(
            modifier = Modifier.fillMaxSize(),
            cameraPositionState = cameraPositionState,
            uiSettings = MapUiSettings(zoomControlsEnabled = false, myLocationButtonEnabled = true)
        ) {
            filteredIssues.forEach { issue ->
                val latLng = LatLng(issue.latitude, issue.longitude)
                Marker(
                    state = MarkerState(position = latLng),
                    title = issue.title,
                    snippet = "${issue.category} | ${issue.severity}",
                    onClick = {
                        selectedIssue = issue
                        true // Consume tap
                    }
                )
            }
        }

        // 2. Top floating Category filter chips
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(categories) { category ->
                    val isSelected = selectedCategoryFilter == category
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                if (isSelected) {
                                    if (isDark) DarkPrimary else LightPrimary
                                } else {
                                    if (isDark) DarkSurface else LightSurface
                                }
                            )
                            .clickable { selectedCategoryFilter = category }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                            .border(
                                1.dp,
                                if (isSelected) Color.Transparent else (if (isDark) DarkSubtleText else LightDivider).copy(alpha = 0.5f),
                                RoundedCornerShape(12.dp)
                            )
                    ) {
                        Text(
                            text = category,
                            style = AppTypography.titleMedium.copy(fontSize = 12.sp),
                            color = if (isSelected) Color.White else (if (isDark) DarkOnBackground else LightOnBackground),
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // 3. Bottom sliding preview card overlay when marker clicked
        AnimatedVisibility(
            visible = selectedIssue != null,
            enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
            exit = slideOutVertically(targetOffsetY = { it }) + fadeOut(),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 96.dp, start = 16.dp, end = 16.dp)
        ) {
            selectedIssue?.let { issue ->
                val severityColor = when (issue.severity.lowercase()) {
                    "critical" -> SeverityCritical
                    "high" -> SeverityHigh
                    "medium" -> SeverityMedium
                    else -> SeverityLow
                }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onIssueClick(issue) },
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
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

                            IconButton(onClick = { selectedIssue = null }) {
                                Icon(Icons.Default.Close, contentDescription = "Close preview", modifier = Modifier.size(18.dp))
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = issue.title,
                            style = AppTypography.titleLarge.copy(fontSize = 16.sp),
                            color = if (isDark) DarkOnBackground else LightOnBackground,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = issue.address,
                            style = AppTypography.bodySmall,
                            color = if (isDark) DarkSubtleText else LightSubtleText,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(severityColor.copy(alpha = 0.15f))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = issue.severity.uppercase(),
                                        style = AppTypography.labelSmall.copy(fontSize = 8.sp, fontWeight = FontWeight.Bold),
                                        color = severityColor
                                    )
                                }

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background((if (isDark) DarkSubtleText else LightSubtleText).copy(alpha = 0.15f))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = issue.status.uppercase(),
                                        style = AppTypography.labelSmall.copy(fontSize = 8.sp, fontWeight = FontWeight.Bold),
                                        color = if (isDark) DarkOnBackground else LightOnBackground
                                    )
                                }
                            }

                            Text(
                                text = "View details →",
                                style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                color = if (isDark) DarkPrimary else LightPrimary
                            )
                        }
                    }
                }
            }
        }
    }
}
