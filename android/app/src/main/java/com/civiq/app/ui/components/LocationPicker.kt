package com.civiq.app.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.civiq.app.data.models.SavedLocationModel
import com.civiq.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LocationPicker(
    savedLocations: List<SavedLocationModel>,
    onLocationSelect: (SavedLocationModel) -> Unit,
    onCurrentLocationSelect: () -> Unit,
    onAddSavedLocation: (String, String, Double, Double, String) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()
    var searchQuery by remember { mutableStateOf("") }
    var showAddForm by remember { mutableStateOf(false) }

    // Form states
    var labelInput by remember { mutableStateOf("") }
    var addressInput by remember { mutableStateOf("") }
    var emojiInput by remember { mutableStateOf("🏠") }

    // Standard pre-defined search hubs in Bengaluru for easy selection
    val preDefinedHubs = listOf(
        SavedLocationModel(id = "hub-1", label = "Silk Board", address = "Silk Board Junction, Hosur Road, Sector 6, HSR Layout, Bengaluru 560068", latitude = 12.9176, longitude = 77.6228, iconEmoji = "🚦"),
        SavedLocationModel(id = "hub-2", label = "Koramangala 80ft Rd", address = "Koramangala 80 Feet Road, 4th Block, Bengaluru 560034", latitude = 12.9352, longitude = 77.6245, iconEmoji = "☕"),
        SavedLocationModel(id = "hub-3", label = "Indiranagar 100ft Rd", address = "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038", latitude = 12.9784, longitude = 77.6408, iconEmoji = "🛍️"),
        SavedLocationModel(id = "hub-4", label = "Electronic City", address = "Hosur Road, Electronic City Phase 1, Bengaluru 560100", latitude = 12.8491, longitude = 77.6639, iconEmoji = "🏢"),
        SavedLocationModel(id = "hub-5", label = "Whitefield ITPL", address = "ITPL Main Road, Pattandur Agrahara, Whitefield, Bengaluru 560066", latitude = 12.9816, longitude = 77.7303, iconEmoji = "💼"),
        SavedLocationModel(id = "hub-6", label = "Cubbon Park", address = "Cubbon Park, Kasturba Road, Bengaluru 560001", latitude = 12.9763, longitude = 77.5929, iconEmoji = "🌳")
    )

    val filteredHubs = preDefinedHubs.filter {
        it.label.contains(searchQuery, ignoreCase = true) || it.address.contains(searchQuery, ignoreCase = true)
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
            .background(if (isDark) DarkSurface else LightSurface)
            .padding(bottom = 24.dp)
    ) {
        // Handle bar
        Box(
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .padding(vertical = 10.dp)
                .size(40.dp, 4.dp)
                .clip(CircleShape)
                .background((if (isDark) DarkSubtleText else LightSubtleText).copy(alpha = 0.3f))
        )

        // Header Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Select Ward / Location",
                style = AppTypography.headlineMedium.copy(fontSize = 18.sp),
                color = if (isDark) DarkOnBackground else LightOnBackground
            )

            IconButton(onClick = onDismiss) {
                Icon(Icons.Default.Close, contentDescription = "Close", tint = if (isDark) DarkSubtleText else LightSubtleText)
            }
        }

        Divider(color = if (isDark) DarkSurfaceVariant else LightDivider, thickness = 1.dp)

        AnimatedContent(
            targetState = showAddForm,
            transitionSpec = {
                slideInHorizontally { width -> if (targetState) width else -width } + fadeIn() togetherWith
                slideOutHorizontally { width -> if (targetState) -width else width } + fadeOut()
            },
            label = "LocationPickerContentTransition"
        ) { isFormActive ->
            if (isFormActive) {
                // ADD SAVED LOCATION FORM
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text(
                        text = "Register Saved Location",
                        style = AppTypography.titleLarge.copy(fontSize = 15.sp),
                        fontWeight = FontWeight.Bold,
                        color = if (isDark) DarkOnBackground else LightOnBackground
                    )

                    // Label field
                    OutlinedTextField(
                        value = labelInput,
                        onValueChange = { labelInput = it },
                        label = { Text("Label (e.g. Home, Work, Gym)") },
                        textStyle = AppTypography.bodyLarge,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Address field
                    OutlinedTextField(
                        value = addressInput,
                        onValueChange = { addressInput = it },
                        label = { Text("Address in Bengaluru") },
                        textStyle = AppTypography.bodyLarge,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Emoji indicator selection
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Choose Emoji Icon:",
                            style = AppTypography.bodySmall,
                            color = if (isDark) DarkSubtleText else LightSubtleText
                        )

                        val emojis = listOf("🏠", "💼", "🏋️", "🏫", "☕", "🌳", "🏬")
                        emojis.forEach { emoji ->
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .background(if (emojiInput == emoji) (if (isDark) DarkPrimary.copy(alpha = 0.2f) else LightPrimaryContainer) else Color.Transparent)
                                    .border(1.dp, if (emojiInput == emoji) (if (isDark) DarkPrimary else LightPrimary) else Color.Transparent, CircleShape)
                                    .clickable { emojiInput = emoji },
                                contentAlignment = Alignment.Center
                              ) {
                                Text(text = emoji, fontSize = 16.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedButton(
                            onClick = { showAddForm = false },
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Cancel", style = AppTypography.titleMedium)
                        }

                        Button(
                            onClick = {
                                if (labelInput.isNotEmpty() && addressInput.isNotEmpty()) {
                                    onAddSavedLocation(labelInput, addressInput, 12.9716, 77.5946, emojiInput)
                                    showAddForm = false
                                    // Reset inputs
                                    labelInput = ""
                                    addressInput = ""
                                    emojiInput = "🏠"
                                }
                            },
                            shape = RoundedCornerShape(14.dp),
                            enabled = labelInput.isNotEmpty() && addressInput.isNotEmpty(),
                            colors = ButtonDefaults.buttonColors(containerColor = if (isDark) DarkPrimary else LightPrimary),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Save Location", style = AppTypography.titleMedium, color = Color.White)
                        }
                    }
                }
            } else {
                // SELECT LOCATION VIEW
                LazyColumn(
                    modifier = Modifier.fillMaxWidth(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Current GPS Location trigger
                    item {
                        Card(
                            onClick = onCurrentLocationSelect,
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurfaceVariant else LightPrimaryContainer),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .clip(CircleShape)
                                        .background(if (isDark) DarkPrimary else LightPrimary),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.MyLocation, contentDescription = null, tint = Color.White)
                                }

                                Spacer(modifier = Modifier.width(12.dp))

                                Column {
                                    Text(
                                        text = "Current GPS Location",
                                        style = AppTypography.titleLarge.copy(fontSize = 15.sp),
                                        fontWeight = FontWeight.Bold,
                                        color = if (isDark) DarkOnBackground else LightPrimary
                                    )
                                    Text(
                                        text = "High-accuracy ward auto-detect",
                                        style = AppTypography.bodySmall,
                                        color = if (isDark) DarkSubtleText else LightSubtleText
                                    )
                                }
                            }
                        }
                    }

                    // Search Input
                    item {
                        OutlinedTextField(
                            value = searchQuery,
                            onValueChange = { searchQuery = it },
                            placeholder = { Text("Search other wards or streets...") },
                            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                            shape = RoundedCornerShape(14.dp),
                            textStyle = AppTypography.bodyLarge,
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        )
                    }

                    // SAVED LOCATIONS ROW HEADER
                    if (savedLocations.isNotEmpty() && searchQuery.isEmpty()) {
                        item {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Your Saved Wards",
                                    style = AppTypography.titleLarge.copy(fontSize = 14.sp),
                                    fontWeight = FontWeight.Bold,
                                    color = if (isDark) DarkOnBackground else LightOnBackground
                                )

                                Text(
                                    text = "+ Add Custom",
                                    style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                    color = if (isDark) DarkPrimary else LightPrimary,
                                    modifier = Modifier.clickable { showAddForm = true }
                                )
                            }
                        }

                        items(savedLocations) { location ->
                            SavedLocationItemRow(
                                location = location,
                                onClick = { onLocationSelect(location) }
                            )
                        }
                    } else if (searchQuery.isEmpty()) {
                        item {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "No saved locations",
                                    style = AppTypography.bodySmall,
                                    color = if (isDark) DarkSubtleText else LightSubtleText
                                )

                                Text(
                                    text = "+ Add New",
                                    style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                    color = if (isDark) DarkPrimary else LightPrimary,
                                    modifier = Modifier.clickable { showAddForm = true }
                                )
                            }
                        }
                    }

                    // BENGALURU SECTOR CODES HEADER
                    item {
                        Text(
                            text = "Bengaluru Hotspots",
                            style = AppTypography.titleLarge.copy(fontSize = 14.sp),
                            fontWeight = FontWeight.Bold,
                            color = if (isDark) DarkOnBackground else LightOnBackground,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }

                    // Filtered Bengalur hotspots list
                    items(filteredHubs) { hub ->
                        SavedLocationItemRow(
                            location = hub,
                            onClick = { onLocationSelect(hub) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SavedLocationItemRow(
    location: SavedLocationModel,
    onClick: () -> Unit
) {
    val isDark = isSystemInDarkTheme()

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(if (isDark) DarkSurfaceVariant.copy(alpha = 0.5f) else LightSurfaceVariant)
            .clickable { onClick() }
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(if (isDark) DarkSurface else Color.White),
            contentAlignment = Alignment.Center
        ) {
            Text(text = location.iconEmoji, fontSize = 16.sp)
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = location.label,
                style = AppTypography.titleMedium.copy(fontSize = 13.sp),
                fontWeight = FontWeight.Bold,
                color = if (isDark) DarkOnBackground else LightOnBackground
            )
            Text(
                text = location.address,
                style = AppTypography.bodySmall,
                color = if (isDark) DarkSubtleText else LightSubtleText,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }

        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = null,
            tint = if (isDark) DarkSubtleText else LightSubtleText,
            modifier = Modifier.size(18.dp)
        )
    }
}
