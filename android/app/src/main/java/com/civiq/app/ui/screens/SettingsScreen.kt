package com.civiq.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import com.civiq.app.data.models.UserModel
import com.civiq.app.ui.theme.*

@Composable
fun SettingsScreen(
    user: UserModel?,
    isDarkMode: Boolean,
    onDarkModeToggle: (Boolean) -> Unit,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()
    var notifyWards by remember { mutableStateOf(true) }
    var notifySla by remember { mutableStateOf(true) }

    val gradientBrush = Brush.verticalGradient(
        colors = listOf(LightPrimary, LightSecondary)
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(if (isDark) DarkBackground else LightBackground)
    ) {
        // Custom Header Banner
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(gradientBrush)
                .padding(horizontal = 24.dp, vertical = 24.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // User initials Avatar
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(Color.White),
                    contentAlignment = Alignment.Center
                ) {
                    val initials = user?.name?.split(" ")?.mapNotNull { it.firstOrNull() }?.joinToString("")?.take(2) ?: "CH"
                    Text(
                        text = initials,
                        style = AppTypography.displayLarge.copy(fontSize = 18.sp),
                        color = LightPrimary,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column {
                    Text(
                        text = user?.name ?: "Citizen Hero",
                        style = AppTypography.headlineMedium.copy(fontSize = 18.sp),
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = user?.email ?: "citizen@bengaluru.org",
                        style = AppTypography.bodySmall,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                }
            }
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "APP CONFIGURATION",
                style = AppTypography.labelSmall,
                color = if (isDark) DarkSubtleText else LightSubtleText,
                fontWeight = FontWeight.Bold
            )

            // Settings options block
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    // Dark theme toggle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.DarkMode, contentDescription = null, tint = if (isDark) DarkPrimary else LightPrimary)
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text("Premium Dark Canvas", style = AppTypography.titleMedium.copy(fontSize = 13.sp), fontWeight = FontWeight.Bold)
                                Text("Aesthetic eyesafe dark theme", style = AppTypography.bodySmall, color = if (isDark) DarkSubtleText else LightSubtleText)
                            }
                        }

                        Switch(
                            checked = isDarkMode,
                            onCheckedChange = onDarkModeToggle,
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = if (isDark) DarkPrimary else LightPrimary
                            )
                        )
                    }

                    Divider(color = if (isDark) DarkSurfaceVariant else LightDivider)

                    // Ward announcements notification switch
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.NotificationsActive, contentDescription = null, tint = LightSecondary)
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text("Ward Alerts", style = AppTypography.titleMedium.copy(fontSize = 13.sp), fontWeight = FontWeight.Bold)
                                Text("Potholes reported inside your active ward", style = AppTypography.bodySmall, color = if (isDark) DarkSubtleText else LightSubtleText)
                            }
                        }

                        Switch(
                            checked = notifyWards,
                            onCheckedChange = { notifyWards = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = LightSecondary
                            )
                        )
                    }

                    Divider(color = if (isDark) DarkSurfaceVariant else LightDivider)

                    // SLA Deadline Breach tracking
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.AccessAlarm, contentDescription = null, tint = SeverityHigh)
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text("SLA Deadline Alarms", style = AppTypography.titleMedium.copy(fontSize = 13.sp), fontWeight = FontWeight.Bold)
                                Text("Notify when local agency is breaching timeline", style = AppTypography.bodySmall, color = if (isDark) DarkSubtleText else LightSubtleText)
                            }
                        }

                        Switch(
                            checked = notifySla,
                            onCheckedChange = { notifySla = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = SeverityHigh
                            )
                        )
                    }
                }
            }

            // Legal & Info blocks
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { /* Terms of service */ },
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = if (isDark) DarkSubtleText else LightSubtleText)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text("Government API & Privacy Terms", style = AppTypography.titleMedium.copy(fontSize = 13.sp), fontWeight = FontWeight.Bold)
                    }

                    Divider(color = if (isDark) DarkSurfaceVariant else LightDivider)

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { /* Reset data */ },
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.DeleteSweep, contentDescription = null, tint = SeverityCritical)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text("Reset Simulation Database", style = AppTypography.titleMedium.copy(fontSize = 13.sp), fontWeight = FontWeight.Bold, color = SeverityCritical)
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Logout Button
            Button(
                onClick = onLogout,
                colors = ButtonDefaults.buttonColors(containerColor = if (isDark) DarkSurfaceVariant else LightSurfaceVariant),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Default.Logout, contentDescription = "Logout", tint = SeverityCritical)
                    Text("Sign Out from CIVIQ", style = AppTypography.titleMedium, color = SeverityCritical, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
