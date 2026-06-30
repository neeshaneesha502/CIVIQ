package com.civiq.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.verticalScroll
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
import com.civiq.app.data.models.SavedLocationModel
import com.civiq.app.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalLayoutApi::class, ExperimentalMaterial3Api::class)
@Composable
fun ReportScreen(
    currentLocation: SavedLocationModel?,
    onReportSubmit: (title: String, desc: String, category: String, address: String, base64Photo: String?) -> Unit,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()
    val scope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    // Form inputs
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("") }
    var address by remember { mutableStateOf(currentLocation?.address ?: "") }
    var mockPhotoCaptured by remember { mutableStateOf(false) }

    // Stepper states
    var currentStep by remember { mutableStateOf(1) } // 1: Photo & Category, 2: Details & Submit
    var isAnalyzingWithGemini by remember { mutableStateOf(false) }

    // Category options
    val categories = listOf(
        Pair("Roads 🛣️", "Potholes, broken tar"),
        Pair("Water 💧", "Leakage, burst lines"),
        Pair("Lighting 💡", "Dark streets, broken lamps"),
        Pair("Sanitation ♻️", "Garbage blackspots, raw sewage"),
        Pair("Parks 🌳", "Vandalized benches, dead shrubs"),
        Pair("Public Safety 🚨", "Clogged drains, open wires")
    )

    val progressAnim by animateFloatAsState(
        targetValue = if (currentStep == 1) 0.5f else 1.0f,
        animationSpec = tween(500),
        label = "progressAnim"
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(if (isDark) DarkBackground else LightBackground)
    ) {
        // Top app bar
        CenterAlignedTopAppBar(
            title = {
                Text(
                    "Report New Issue",
                    style = AppTypography.headlineMedium.copy(fontSize = 18.sp),
                    fontWeight = FontWeight.Bold,
                    color = if (isDark) DarkOnBackground else LightOnBackground
                )
            },
            navigationIcon = {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
            },
            colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = Color.Transparent)
        )

        // Custom Step progress bar
        LinearProgressIndicator(
            progress = progressAnim,
            color = if (isDark) DarkPrimary else LightPrimary,
            trackColor = (if (isDark) DarkSurfaceVariant else LightDivider).copy(alpha = 0.5f),
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp)
        )

        if (isAnalyzingWithGemini) {
            // GEMINI TRIAGING INTERMEDIATE ANIMATION
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .background((if (isDark) DarkPrimary else LightPrimary).copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        color = if (isDark) DarkPrimary else LightPrimary,
                        modifier = Modifier.size(64.dp)
                    )
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = if (isDark) DarkPrimary else LightPrimary,
                        modifier = Modifier.size(32.dp)
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "CIVIQ Triage Core Active",
                    style = AppTypography.headlineMedium.copy(fontSize = 20.sp),
                    color = if (isDark) DarkOnBackground else LightOnBackground,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Gemini Flash AI is assessing severity, estimating fix times, routing departments, and structuring your local citizen action items...",
                    style = AppTypography.bodyLarge,
                    color = if (isDark) DarkSubtleText else LightSubtleText,
                    modifier = Modifier.padding(horizontal = 24.dp)
                )
            }
        } else {
            // CORE MULTI-STEP REPORT SCREEN
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(scrollState)
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                if (currentStep == 1) {
                    // STEP 1: CAMERAX AND CATEGORIES SELECTOR
                    Text(
                        text = "1. Capture Hazard & Select Category",
                        style = AppTypography.titleLarge.copy(fontSize = 15.sp),
                        fontWeight = FontWeight.Bold,
                        color = if (isDark) DarkOnBackground else LightOnBackground
                    )

                    // Photo preview slot
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp)
                            .clip(RoundedCornerShape(20.dp))
                            .background(if (isDark) DarkSurface else LightSurface)
                            .border(1.dp, (if (isDark) DarkSubtleText else LightDivider).copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                            .clickable { mockPhotoCaptured = !mockPhotoCaptured },
                        contentAlignment = Alignment.Center
                    ) {
                        if (mockPhotoCaptured) {
                            // Captured simulation
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(Color.Black.copy(alpha = 0.3f)),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = SeverityLow, modifier = Modifier.size(48.dp))
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("Pothole_Captured.jpg", style = AppTypography.titleMedium, color = Color.White)
                                Text("Click to clear photo", style = AppTypography.bodySmall, color = Color.White.copy(alpha = 0.7f))
                            }
                        } else {
                            // Camera launch simulation slot
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.PhotoCamera,
                                    contentDescription = "Capture",
                                    tint = if (isDark) DarkPrimary else LightPrimary,
                                    modifier = Modifier.size(48.dp)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("Click to take photo of the issue", style = AppTypography.titleMedium, fontWeight = FontWeight.Bold)
                                Text("Crashes & dark streets are routed automatically", style = AppTypography.bodySmall, color = if (isDark) DarkSubtleText else LightSubtleText)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Category Type",
                        style = AppTypography.titleLarge.copy(fontSize = 14.sp),
                        fontWeight = FontWeight.Bold,
                        color = if (isDark) DarkOnBackground else LightOnBackground
                    )

                    // Bento grid categories list
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.height(280.dp)
                    ) {
                        items(categories) { (cat, desc) ->
                            val isSelected = selectedCategory == cat
                            Card(
                                onClick = { selectedCategory = cat },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (isSelected) {
                                        if (isDark) DarkPrimary.copy(alpha = 0.2f) else LightPrimaryContainer
                                    } else {
                                        if (isDark) DarkSurface else LightSurface
                                    }
                                ),
                                border = if (isSelected) {
                                    border(1.dp, if (isDark) DarkPrimary else LightPrimary, RoundedCornerShape(14.dp)).border
                                } else null
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Text(
                                        text = cat,
                                        style = AppTypography.titleMedium.copy(fontSize = 13.sp),
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) (if (isDark) DarkPrimary else LightPrimary) else (if (isDark) DarkOnBackground else LightOnBackground)
                                    )
                                    Text(
                                        text = desc,
                                        style = AppTypography.bodySmall,
                                        color = if (isDark) DarkSubtleText else LightSubtleText
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = { currentStep = 2 },
                        shape = RoundedCornerShape(14.dp),
                        enabled = selectedCategory.isNotEmpty() && mockPhotoCaptured,
                        colors = ButtonDefaults.buttonColors(containerColor = if (isDark) DarkPrimary else LightPrimary),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                    ) {
                        Text("Next Step: Issue Details", style = AppTypography.titleMedium, color = Color.White)
                    }
                } else {
                    // STEP 2: WRITE DETAILS & SUMBIT WITH GEMINI
                    Text(
                        text = "2. Describe & Localize Issue",
                        style = AppTypography.titleLarge.copy(fontSize = 15.sp),
                        fontWeight = FontWeight.Bold,
                        color = if (isDark) DarkOnBackground else LightOnBackground
                    )

                    // Title Field
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Short Summary (e.g. Broken pipe flooding path)") },
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                        textStyle = AppTypography.bodyLarge,
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Description Field
                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("What did you see? Describe full context...") },
                        shape = RoundedCornerShape(12.dp),
                        singleLine = false,
                        textStyle = AppTypography.bodyLarge,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(120.dp)
                    )

                    // Address Field
                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("Detected Ward / Address") },
                        leadingIcon = { Icon(Icons.Default.PinDrop, contentDescription = null) },
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                        textStyle = AppTypography.bodyLarge,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedButton(
                            onClick = { currentStep = 1 },
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Back", style = AppTypography.titleMedium)
                        }

                        Button(
                            onClick = {
                                scope.launch {
                                    isAnalyzingWithGemini = true
                                    delay(2000) // Simulated Gemini triage delay
                                    onReportSubmit(title, description, selectedCategory, address, "pothole_photo_base64_data")
                                }
                            },
                            shape = RoundedCornerShape(14.dp),
                            enabled = title.isNotEmpty() && description.isNotEmpty() && address.isNotEmpty(),
                            colors = ButtonDefaults.buttonColors(containerColor = if (isDark) DarkPrimary else LightPrimary),
                            modifier = Modifier.weight(1.5f)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                                Text("Triage & Submit", style = AppTypography.titleMedium, color = Color.White)
                            }
                        }
                    }
                }
            }
        }
    }
}
