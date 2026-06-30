package com.civiq.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.civiq.app.data.models.CommentModel
import com.civiq.app.data.models.IssueModel
import com.civiq.app.data.models.SavedLocationModel
import com.civiq.app.data.models.UserModel
import com.civiq.app.ui.components.IssueCard
import com.civiq.app.ui.theme.*
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedScreen(
    user: UserModel?,
    issues: List<IssueModel>,
    currentLocation: SavedLocationModel?,
    onIssueUpvote: (String) -> Unit,
    onIssueSave: (String) -> Unit,
    onCommentAdd: (String, String) -> Unit,
    onLikeComment: (String, String) -> Unit,
    commentsMap: Map<String, List<CommentModel>>,
    onLocationClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()
    var selectedTab by remember { mutableStateOf(0) } // 0: My Location, 1: Nearby, 2: For You, 3: Trending, 4: Saved
    var searchQuery by remember { mutableStateOf("") }
    var isRefreshing by remember { mutableStateOf(false) }
    var isLoadingSimulated by remember { mutableStateOf(false) }

    val tabs = listOf("My Location", "Nearby", "For You", "Trending", "Saved")

    // Handle pull-to-refresh simulation
    LaunchedEffect(isRefreshing) {
        if (isRefreshing) {
            isLoadingSimulated = true
            delay(1000)
            isRefreshing = false
            isLoadingSimulated = false
        }
    }

    // Filter logic
    val filteredIssues = remember(selectedTab, searchQuery, issues, currentLocation) {
        var baseList = when (selectedTab) {
            0 -> { // My Location - Ward matches
                issues.filter { issue ->
                    currentLocation?.let { loc ->
                        issue.address.contains(loc.label, ignoreCase = true) || issue.address.contains(loc.address.take(12), ignoreCase = true)
                    } ?: true
                }
            }
            1 -> { // Nearby - Simulating < 2km check by having custom distance
                issues.filter { (it.distanceKm ?: 3.0) <= 2.0 }
            }
            2 -> { // For You - AI Recommended
                issues.filter { it.publicAngerIndex > 40 && it.status.lowercase() != "resolved" }
                    .sortedByDescending { it.isSafetyRisk }
            }
            3 -> { // Trending - High upvotes
                issues.sortedByDescending { it.upvotesCount }
            }
            4 -> { // Saved
                issues.filter { it.savedByUserIds.contains(user?.uid ?: "me") }
            }
            else -> issues
        }

        if (searchQuery.isNotEmpty()) {
            baseList = baseList.filter {
                it.title.contains(searchQuery, ignoreCase = true) ||
                it.description.contains(searchQuery, ignoreCase = true) ||
                it.category.contains(searchQuery, ignoreCase = true) ||
                it.address.contains(searchQuery, ignoreCase = true)
            }
        }
        baseList
    }

    val gradientBrush = Brush.verticalGradient(
        colors = listOf(LightPrimary, LightSecondary)
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(if (isDark) DarkBackground else LightBackground)
    ) {
        // Immersive Top Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(gradientBrush)
                .padding(top = 16.dp, bottom = 12.dp, start = 20.dp, end = 20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "COMMUNITY FEED",
                        style = AppTypography.labelSmall,
                        color = Color.White.copy(alpha = 0.8f),
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = currentLocation?.label ?: "All Bengaluru Wards",
                        style = AppTypography.headlineMedium.copy(fontSize = 18.sp),
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color.White.copy(alpha = 0.15f))
                        .clickable { onLocationClick() }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Icon(Icons.Default.FilterList, contentDescription = "Wards", tint = Color.White, modifier = Modifier.size(16.dp))
                        Text("Ward", style = AppTypography.bodySmall, color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Search Bar Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search potholes, garbage, streetlights...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                shape = RoundedCornerShape(14.dp),
                textStyle = AppTypography.bodyLarge,
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = if (isDark) DarkPrimary else LightPrimary,
                    unfocusedContainerColor = if (isDark) DarkSurface else LightSurface,
                    focusedContainerColor = if (isDark) DarkSurface else LightSurface
                ),
                modifier = Modifier.weight(1f)
            )

            if (searchQuery.isNotEmpty()) {
                IconButton(onClick = { searchQuery = "" }) {
                    Icon(Icons.Default.Clear, contentDescription = "Clear search")
                }
            }
        }

        // Horizontal navigation tabs
        ScrollableTabRow(
            selectedTabIndex = selectedTab,
            containerColor = Color.Transparent,
            contentColor = if (isDark) DarkPrimary else LightPrimary,
            edgePadding = 16.dp,
            divider = {},
            indicator = { tabPositions ->
                TabRowDefaults.SecondaryIndicator(
                    modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                    color = if (isDark) DarkPrimary else LightPrimary,
                    height = 3.dp
                )
            }
        ) {
            tabs.forEachIndexed { index, tabName ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = {
                        Text(
                            text = tabName,
                            style = AppTypography.titleMedium.copy(fontSize = 13.sp),
                            fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Medium,
                            color = if (selectedTab == index) {
                                if (isDark) DarkOnBackground else LightOnBackground
                            } else {
                                if (isDark) DarkSubtleText else LightSubtleText
                            }
                        )
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Feed content with Shimmer Skeleton & Entry Animation simulation
        if (isLoadingSimulated) {
            LazyColumn(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(bottom = 96.dp)
            ) {
                items(3) {
                    ShimmerSkeletonCard()
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentPadding = PaddingValues(bottom = 96.dp)
            ) {
                if (filteredIssues.isEmpty()) {
                    item {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 72.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.FilterAltOff,
                                contentDescription = null,
                                tint = (if (isDark) DarkSubtleText else LightSubtleText).copy(alpha = 0.5f),
                                modifier = Modifier.size(64.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "No issues found",
                                style = AppTypography.titleLarge.copy(fontSize = 16.sp),
                                color = if (isDark) DarkSubtleText else LightSubtleText
                            )
                            Text(
                                text = "Try clearing search keywords or selecting another tab.",
                                style = AppTypography.bodySmall,
                                color = (if (isDark) DarkSubtleText else LightSubtleText).copy(alpha = 0.8f)
                            )
                        }
                    }
                } else {
                    itemsIndexed(filteredIssues) { index, issue ->
                        val isUpvoted = user?.upvotedIssueIds?.contains(issue.id) ?: false
                        val isSaved = issue.savedByUserIds.contains(user?.uid ?: "me")
                        val commentsList = commentsMap[issue.id] ?: emptyList()

                        // Smooth slide-in staggering animation
                        var visible by remember { mutableStateOf(false) }
                        LaunchedEffect(key1 = true) {
                            delay(index * 60L) // stagger delay
                            visible = true
                        }

                        AnimatedVisibility(
                            visible = visible,
                            enter = slideInVertically(
                                initialOffsetY = { 120 },
                                animationSpec = spring(stiffness = Spring.StiffnessLow, dampingRatio = Spring.DampingRatioLowBouncy)
                            ) + fadeIn(animationSpec = tween(durationMillis = 300)),
                            exit = fadeOut()
                        ) {
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
        }
    }
}

// Shimmer Skeleton mockup for high-end look
@Composable
fun ShimmerSkeletonCard() {
    val isDark = isSystemInDarkTheme()

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Badges row
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    modifier = Modifier
                        .size(80.dp, 16.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(if (isDark) DarkSurfaceVariant else LightDivider)
                )
                Box(
                    modifier = Modifier
                        .size(60.dp, 16.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(if (isDark) DarkSurfaceVariant else LightDivider)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Title block
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.85f)
                    .height(20.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(if (isDark) DarkSurfaceVariant else LightDivider)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Description block
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(14.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(if (isDark) DarkSurfaceVariant else LightDivider)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Progress Bar
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(CircleShape)
                    .background(if (isDark) DarkSurfaceVariant else LightDivider)
            )
        }
    }
}
