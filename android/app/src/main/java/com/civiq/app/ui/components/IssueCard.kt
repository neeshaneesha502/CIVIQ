package com.civiq.app.ui.components

import android.content.Intent
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.civiq.app.data.models.CommentModel
import com.civiq.app.data.models.IssueModel
import com.civiq.app.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun IssueCard(
    issue: IssueModel,
    isUpvoted: Boolean,
    isSaved: Boolean,
    onUpvoteClick: () -> Unit,
    onSaveClick: () -> Unit,
    onCommentAdd: (String) -> Unit,
    onLikeComment: (String) -> Unit,
    comments: List<CommentModel>,
    modifier: Modifier = Modifier,
    currentUserId: String = "me",
    currentUserInitials: String = "CH",
    currentUserColor: String = "#4F46E5",
    onOpenCommentsBottomSheet: () -> Unit = {}
) {
    var isExpanded by remember { mutableStateOf(false) }
    var isCommentsExpanded by remember { mutableStateOf(false) }
    var commentText by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // Determine colors based on severity
    val isDark = isSystemInDarkTheme()
    val (baseColor, bgGradientColor) = when (issue.severity.lowercase()) {
        "critical" -> Pair(SeverityCritical, if (isDark) SeverityCriticalDarkBg else SeverityCriticalLightBg)
        "high" -> Pair(SeverityHigh, if (isDark) SeverityHighDarkBg else SeverityHighLightBg)
        "medium" -> Pair(SeverityMedium, if (isDark) SeverityMediumDarkBg else SeverityMediumLightBg)
        else -> Pair(SeverityLow, if (isDark) SeverityLowDarkBg else SeverityLowLightBg)
    }

    val surfaceColor = if (isDark) DarkSurface else LightSurface
    val brush = Brush.verticalGradient(
        colors = listOf(bgGradientColor.copy(alpha = 0.5f), surfaceColor)
    )

    // Interactive button scale animation
    val upvoteScale by animateFloatAsState(
        targetValue = if (isUpvoted) 1.15f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow),
        label = "upvoteScale"
    )

    val saveScale by animateFloatAsState(
        targetValue = if (isSaved) 1.2f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow),
        label = "saveScale"
    )

    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = surfaceColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Box(
            modifier = Modifier
                .background(brush)
                .fillMaxWidth()
        ) {
            Row(modifier = Modifier.fillMaxWidth().height(IntrinsicSize.Min)) {
                // Left border strip representing severity
                Box(
                    modifier = Modifier
                        .width(6.dp)
                        .fillMaxHeight()
                        .background(baseColor)
                )

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(16.dp)
                ) {
                    // Top Row: Category Badge (left) & Severity/Status (right)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Category Badge
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isDark) DarkSurfaceVariant else LightPrimaryContainer)
                                .padding(horizontal = 10.dp, vertical = 5.dp)
                        ) {
                            Text(
                                text = issue.category,
                                style = AppTypography.labelSmall,
                                color = if (isDark) DarkOnBackground else LightPrimary,
                                fontWeight = FontWeight.SemiBold
                            )
                        }

                        // Severity & Status Badges
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(baseColor.copy(alpha = 0.15f))
                                    .border(1.dp, baseColor.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = issue.severity.uppercase(),
                                    style = AppTypography.labelSmall.copy(fontSize = 9.sp),
                                    color = baseColor,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(
                                        when (issue.status.lowercase()) {
                                            "resolved" -> SeverityLow.copy(alpha = 0.15f)
                                            "in progress" -> SeverityHigh.copy(alpha = 0.15f)
                                            else -> LightSubtleText.copy(alpha = 0.15f)
                                        }
                                    )
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = issue.status.uppercase(),
                                    style = AppTypography.labelSmall.copy(fontSize = 9.sp),
                                    color = when (issue.status.lowercase()) {
                                        "resolved" -> SeverityLow
                                        "in progress" -> SeverityHigh
                                        else -> if (isDark) DarkSubtleText else LightSubtleText
                                    },
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Title
                    Text(
                        text = issue.title,
                        style = AppTypography.titleLarge,
                        color = if (isDark) DarkOnBackground else LightOnBackground,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    // Description (Expandable on click)
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(
                                indication = null,
                                interactionSource = remember { MutableInteractionSource() }
                            ) { isExpanded = !isExpanded }
                    ) {
                        Text(
                            text = issue.description,
                            style = AppTypography.bodyLarge,
                            color = (if (isDark) DarkOnBackground else LightOnBackground).copy(alpha = 0.85f),
                            maxLines = if (isExpanded) Int.MAX_VALUE else 2,
                            overflow = TextOverflow.Ellipsis
                        )
                        if (!isExpanded) {
                            Text(
                                text = "Show more",
                                style = AppTypography.bodySmall,
                                color = if (isDark) DarkPrimary else LightPrimary,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(top = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Assignee Capsule
                    val assigneeColor = when (issue.assigneeType.lowercase()) {
                        "emergency" -> AssigneeEmergency
                        "bbmp" -> AssigneeBBMP
                        "localfixer" -> AssigneeLocalFixer
                        else -> AssigneeVolunteer
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(assigneeColor.copy(alpha = 0.08f))
                            .border(1.dp, assigneeColor.copy(alpha = 0.25f), RoundedCornerShape(14.dp))
                            .padding(horizontal = 12.dp, vertical = 10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = when (issue.assigneeType.lowercase()) {
                                        "emergency" -> Icons.Default.Campaign
                                        "bbmp" -> Icons.Default.AccountBalance
                                        "localfixer" -> Icons.Default.Build
                                        else -> Icons.Default.VolunteerActivism
                                    },
                                    contentDescription = null,
                                    tint = assigneeColor,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(
                                        text = "ASSIGNED AGENCY",
                                        style = AppTypography.labelSmall.copy(fontSize = 9.sp),
                                        color = assigneeColor,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = issue.assignedTo,
                                        style = AppTypography.titleMedium.copy(fontSize = 13.sp),
                                        color = if (isDark) DarkOnBackground else LightOnBackground,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            // Payment or Points badge
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(assigneeColor)
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                val rewardLabel = when (issue.assigneeType.lowercase()) {
                                    "emergency" -> "Priority"
                                    "bbmp" -> "Govt Budget"
                                    "localfixer" -> "₹${if (issue.id == "CIVIQ-006") "650" else "800"} Escrow"
                                    else -> "+100 Pts"
                                }
                                Text(
                                    text = rewardLabel,
                                    style = AppTypography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                                    color = Color.White
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Meta Row: Location & Timestamp & Public Anger
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.weight(0.6f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = if (isDark) DarkSubtleText else LightSubtleText,
                                modifier = Modifier.size(14.dp)
                                    .clickable {
                                        // Open external map
                                        val gmmIntentUri = android.net.Uri.parse("geo:${issue.latitude},${issue.longitude}?q=${issue.address}")
                                        val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
                                        mapIntent.setPackage("com.google.android.apps.maps")
                                        if (mapIntent.resolveActivity(context.packageManager) != null) {
                                            context.startActivity(mapIntent)
                                        }
                                    }
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${issue.distanceKm?.let { "${String.format("%.1f", it)} km • " } ?: ""}${issue.address}",
                                style = AppTypography.bodySmall,
                                color = if (isDark) DarkSubtleText else LightSubtleText,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }

                        Text(
                            text = "⏱ ${issue.hoursPassed}h ago",
                            style = AppTypography.bodySmall,
                            color = if (isDark) DarkSubtleText else LightSubtleText,
                            modifier = Modifier.padding(start = 8.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Public Anger Index Meter
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "😡 ${issue.publicAngerIndex}% Anger",
                            style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold),
                            color = if (issue.publicAngerIndex > 75) SeverityCritical else if (issue.publicAngerIndex > 45) SeverityHigh else SeverityLow
                        )
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(5.dp)
                                .clip(CircleShape)
                                .background(if (isDark) DarkSurfaceVariant else LightDivider)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxHeight()
                                    .fillMaxWidth(issue.publicAngerIndex.toFloat() / 100f)
                                    .background(
                                        if (issue.publicAngerIndex > 75) SeverityCritical else if (issue.publicAngerIndex > 45) SeverityHigh else SeverityLow
                                    )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // SLA Progress Bar
                    val slaFraction = (issue.hoursPassed.toFloat() / issue.slaHours.toFloat()).coerceIn(0f, 1f)
                    val slaColor = when {
                        issue.isSlaBreached() -> SeverityCritical
                        slaFraction > 0.6f -> SeverityHigh
                        slaFraction > 0.3f -> SeverityMedium
                        else -> SeverityLow
                    }

                    Column(modifier = Modifier.fillMaxWidth()) {
                        LinearProgressIndicator(
                            progress = slaFraction,
                            color = slaColor,
                            trackColor = if (isDark) DarkSurfaceVariant else LightDivider,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(CircleShape)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = if (issue.isSlaBreached()) "⚠️ SLA BREACHED" else "Deadline: ${issue.slaHours - issue.hoursPassed}h left",
                                style = AppTypography.labelSmall.copy(fontSize = 10.sp),
                                fontWeight = FontWeight.Bold,
                                color = if (issue.isSlaBreached()) SeverityCritical else if (isDark) DarkSubtleText else LightSubtleText
                            )
                            Text(
                                text = "SLA: ${issue.slaHours}h",
                                style = AppTypography.labelSmall.copy(fontSize = 10.sp),
                                color = if (isDark) DarkSubtleText else LightSubtleText
                            )
                        }
                    }

                    // Safety Risk Alarm banner
                    if (issue.isSafetyRisk && issue.status != "Resolved") {
                        Spacer(modifier = Modifier.height(10.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(SeverityCritical.copy(alpha = 0.08f))
                                .border(1.dp, SeverityCritical.copy(alpha = 0.25f), RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Warning,
                                    contentDescription = null,
                                    tint = SeverityCritical,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "SAFETY RISK - Priority dispatch deployed",
                                    style = AppTypography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                                    color = SeverityCritical
                                )
                            }
                        }
                    }

                    // AI Analysis expansion details (if card is expanded)
                    AnimatedVisibility(
                        visible = isExpanded,
                        enter = expandVertically() + fadeIn(),
                        exit = shrinkVertically() + fadeOut()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 12.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isDark) DarkSurfaceVariant else LightSurfaceVariant)
                                .border(1.dp, (if (isDark) DarkSubtleText else LightDivider).copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                                .padding(12.dp)
                        ) {
                            Text(
                                "🤖 CIVIQ AI - Gemini Triage",
                                style = AppTypography.titleMedium,
                                color = if (isDark) DarkPrimary else LightPrimary,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(6.dp))

                            Text("Department: ${issue.department}", style = AppTypography.bodySmall, fontWeight = FontWeight.Bold)
                            Text("Estimated Fix Time: ${issue.estimatedFixTime}", style = AppTypography.bodySmall)
                            Text("Funding Details: ${issue.paymentDetails}", style = AppTypography.bodySmall)

                            Spacer(modifier = Modifier.height(10.dp))

                            Text("Recommended Action Items:", style = AppTypography.titleMedium.copy(fontSize = 12.sp, fontWeight = FontWeight.Bold))
                            issue.actionItems.forEachIndexed { i, item ->
                                Text("${i + 1}. $item", style = AppTypography.bodySmall, color = if (isDark) DarkOnBackground.copy(alpha = 0.8f) else LightOnBackground.copy(alpha = 0.8f))
                            }

                            if (issue.urgencyReason.isNotEmpty()) {
                                Spacer(modifier = Modifier.height(10.dp))
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(baseColor.copy(alpha = 0.08f))
                                        .padding(8.dp)
                                ) {
                                    Text(
                                        text = "Urgency reasoning: ${issue.urgencyReason}",
                                        style = AppTypography.bodySmall.copy(fontStyle = FontStyle.Italic),
                                        color = if (isDark) DarkOnBackground else LightOnBackground
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Divider(color = if (isDark) DarkSurfaceVariant else LightDivider, thickness = 1.dp)
                    Spacer(modifier = Modifier.height(8.dp))

                    // Action Row: Upvote, Comments toggle, Save, Share
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Upvote Button
                        Button(
                            onClick = onUpvoteClick,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isUpvoted) baseColor else (if (isDark) DarkSurfaceVariant else LightPrimaryContainer),
                                contentColor = if (isUpvoted) Color.White else baseColor
                            ),
                            shape = RoundedCornerShape(12.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                            modifier = Modifier
                                .height(38.dp)
                                .scale(upvoteScale)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    imageVector = if (isUpvoted) Icons.Default.ThumbUp else Icons.Outlined.ThumbUp,
                                    contentDescription = "Upvote",
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = issue.upvotesCount.toString(),
                                    style = AppTypography.labelMedium.copy(fontWeight = FontWeight.Bold)
                                )
                            }
                        }

                        // Comments Button
                        IconButton(
                            onClick = { isCommentsExpanded = !isCommentsExpanded }
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                Icon(
                                    imageVector = if (isCommentsExpanded) Icons.Filled.Comment else Icons.Outlined.ModeComment,
                                    contentDescription = "Comments",
                                    tint = if (isCommentsExpanded) (if (isDark) DarkPrimary else LightPrimary) else (if (isDark) DarkSubtleText else LightSubtleText)
                                )
                                Text(
                                    text = comments.size.toString(),
                                    style = AppTypography.labelMedium,
                                    color = if (isDark) DarkSubtleText else LightSubtleText
                                )
                            }
                        }

                        // Save Button
                        IconButton(
                            onClick = onSaveClick,
                            modifier = Modifier.scale(saveScale)
                        ) {
                            Icon(
                                imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Outlined.BookmarkBorder,
                                contentDescription = "Save",
                                tint = if (isSaved) LightSecondary else (if (isDark) DarkSubtleText else LightSubtleText)
                            )
                        }

                        // Share Button
                        IconButton(
                            onClick = {
                                val sendIntent: Intent = Intent().apply {
                                    action = Intent.ACTION_SEND
                                    putExtra(Intent.EXTRA_TEXT, "CIVIQ Alert 🚨: ${issue.title} at ${issue.address}. Authority assigned: ${issue.assignedTo}. Resolve status: ${issue.status}. Help Bengaluru fix this issue by upvoting on CIVIQ!")
                                    type = "text/plain"
                                }
                                val shareIntent = Intent.createChooser(sendIntent, "Share Issue")
                                context.startActivity(shareIntent)
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Share,
                                contentDescription = "Share",
                                tint = if (isDark) DarkSubtleText else LightSubtleText
                            )
                        }
                    }

                    // Comments Expandable Area (RWA discussions & replies)
                    AnimatedVisibility(
                        visible = isCommentsExpanded,
                        enter = expandVertically() + fadeIn(),
                        exit = shrinkVertically() + fadeOut()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 12.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "RWA & Citizen Discussion",
                                    style = AppTypography.titleMedium.copy(fontSize = 13.sp),
                                    fontWeight = FontWeight.Bold,
                                    color = if (isDark) DarkOnBackground else LightOnBackground
                                )
                                Text(
                                    text = "View all in sheet",
                                    style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                    color = if (isDark) DarkPrimary else LightPrimary,
                                    modifier = Modifier.clickable { onOpenCommentsBottomSheet() }
                                )
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            // List of limited Comments (e.g. up to 2-3 most recent)
                            comments.take(3).forEach { comment ->
                                CommentItemRow(
                                    comment = comment,
                                    onLikeClick = { onLikeComment(comment.id) },
                                    isLiked = comment.likedBy.contains(currentUserId)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                            }

                            if (comments.isEmpty()) {
                                Text(
                                    text = "No comments yet. Start the conversation!",
                                    style = AppTypography.bodySmall,
                                    color = if (isDark) DarkSubtleText else LightSubtleText,
                                    modifier = Modifier.padding(vertical = 12.dp)
                                )
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            // Comment input row
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (isDark) DarkSurfaceVariant else LightSurfaceVariant)
                                    .border(1.dp, (if (isDark) DarkSubtleText else LightDivider).copy(alpha = 0.2f), RoundedCornerShape(12.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // User avatar representation
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .clip(CircleShape)
                                        .background(Color(android.graphics.Color.parseColor(currentUserColor))),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = currentUserInitials,
                                        style = AppTypography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                                        color = Color.White
                                    )
                                }

                                Spacer(modifier = Modifier.width(8.dp))

                                TextField(
                                    value = commentText,
                                    onValueChange = { commentText = it },
                                    placeholder = { Text("Write a comment...", style = AppTypography.bodySmall) },
                                    colors = TextFieldDefaults.colors(
                                        focusedContainerColor = Color.Transparent,
                                        unfocusedContainerColor = Color.Transparent,
                                        disabledContainerColor = Color.Transparent,
                                        focusedIndicatorColor = Color.Transparent,
                                        unfocusedIndicatorColor = Color.Transparent
                                    ),
                                    textStyle = AppTypography.bodySmall,
                                    singleLine = true,
                                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                                    keyboardActions = KeyboardActions(onSend = {
                                        if (commentText.trim().isNotEmpty()) {
                                            onCommentAdd(commentText.trim())
                                            commentText = ""
                                        }
                                    }),
                                    modifier = Modifier.weight(1f)
                                )

                                IconButton(
                                    onClick = {
                                        if (commentText.trim().isNotEmpty()) {
                                            onCommentAdd(commentText.trim())
                                            commentText = ""
                                        }
                                    },
                                    enabled = commentText.trim().isNotEmpty()
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Send,
                                        contentDescription = "Post Comment",
                                        tint = if (commentText.trim().isNotEmpty()) (if (isDark) DarkPrimary else LightPrimary) else (if (isDark) DarkSubtleText else LightSubtleText),
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CommentItemRow(
    comment: CommentModel,
    onLikeClick: () -> Unit,
    isLiked: Boolean
) {
    val isDark = isSystemInDarkTheme()

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.Top
    ) {
        // User initials Avatar
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(Color(android.graphics.Color.parseColor(comment.userColor))),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = comment.userInitials,
                style = AppTypography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.width(10.dp))

        Column(modifier = Modifier.weight(1f)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = comment.userName,
                    style = AppTypography.titleMedium.copy(fontSize = 12.sp),
                    fontWeight = FontWeight.Bold,
                    color = if (isDark) DarkOnBackground else LightOnBackground
                )
                Text(
                    text = comment.timestamp,
                    style = AppTypography.bodySmall.copy(fontSize = 10.sp),
                    color = if (isDark) DarkSubtleText else LightSubtleText
                )
            }

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = comment.text,
                style = AppTypography.bodySmall.copy(fontSize = 12.sp),
                color = (if (isDark) DarkOnBackground else LightOnBackground).copy(alpha = 0.9f)
            )

            Spacer(modifier = Modifier.height(4.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = if (isLiked) Icons.Default.Favorite else Icons.Outlined.FavoriteBorder,
                    contentDescription = "Like Comment",
                    tint = if (isLiked) SeverityCritical else (if (isDark) DarkSubtleText else LightSubtleText),
                    modifier = Modifier
                        .size(12.dp)
                        .clickable { onLikeClick() }
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = comment.likes.toString(),
                    style = AppTypography.bodySmall.copy(fontSize = 11.sp),
                    color = if (isDark) DarkSubtleText else LightSubtleText
                )
            }
        }
    }
}
