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
import com.civiq.app.data.models.CommentModel
import com.civiq.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CommentSection(
    comments: List<CommentModel>,
    onCommentAdd: (String) -> Unit,
    onLikeComment: (String) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier,
    currentUserInitials: String = "CH",
    currentUserColor: String = "#4F46E5",
    currentUserId: String = "me"
) {
    val isDark = isSystemInDarkTheme()
    var newCommentText by remember { mutableStateOf("") }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(if (isDark) DarkSurface else LightSurface)
    ) {
        // Comment Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.ChatBubble,
                    contentDescription = null,
                    tint = if (isDark) DarkPrimary else LightPrimary,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Discussion Thread (${comments.size})",
                    style = AppTypography.headlineMedium.copy(fontSize = 18.sp),
                    color = if (isDark) DarkOnBackground else LightOnBackground
                )
            }

            IconButton(onClick = onClose) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Close",
                    tint = if (isDark) DarkSubtleText else LightSubtleText
                )
            }
        }

        Divider(color = if (isDark) DarkSurfaceVariant else LightDivider, thickness = 1.dp)

        // Comments List
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            if (comments.isEmpty()) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 48.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Forum,
                            contentDescription = null,
                            tint = (if (isDark) DarkSubtleText else LightSubtleText).copy(alpha = 0.4f),
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "No comments yet",
                            style = AppTypography.titleLarge.copy(fontSize = 16.sp),
                            color = if (isDark) DarkSubtleText else LightSubtleText
                        )
                        Text(
                            text = "Be the first to speak up and guide Bengaluru authorities!",
                            style = AppTypography.bodySmall,
                            color = (if (isDark) DarkSubtleText else LightSubtleText).copy(alpha = 0.8f),
                            modifier = Modifier.padding(horizontal = 24.dp)
                        )
                    }
                }
            } else {
                items(comments) { comment ->
                    CommentItemRow(
                        comment = comment,
                        onLikeClick = { onLikeComment(comment.id) },
                        isLiked = comment.likedBy.contains(currentUserId)
                    )
                }
            }
        }

        // Bottom Comment Input area
        Surface(
            tonalElevation = 8.dp,
            shadowElevation = 8.dp,
            color = if (isDark) DarkSurface else LightSurface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(if (isDark) DarkSurfaceVariant else LightSurfaceVariant)
                        .border(1.dp, (if (isDark) DarkSubtleText else LightDivider).copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // User avatar representation
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(Color(android.graphics.Color.parseColor(currentUserColor))),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = currentUserInitials,
                            style = AppTypography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
                            color = Color.White
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    TextField(
                        value = newCommentText,
                        onValueChange = { newCommentText = it },
                        placeholder = { Text("Comment as Citizen Hero...", style = AppTypography.bodyLarge.copy(fontSize = 13.sp)) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            disabledContainerColor = Color.Transparent,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        textStyle = AppTypography.bodyLarge.copy(fontSize = 13.sp),
                        singleLine = false,
                        maxLines = 4,
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                        keyboardActions = KeyboardActions(onSend = {
                            if (newCommentText.trim().isNotEmpty()) {
                                onCommentAdd(newCommentText.trim())
                                newCommentText = ""
                            }
                        }),
                        modifier = Modifier.weight(1f)
                    )

                    IconButton(
                        onClick = {
                            if (newCommentText.trim().isNotEmpty()) {
                                onCommentAdd(newCommentText.trim())
                                newCommentText = ""
                            }
                        },
                        enabled = newCommentText.trim().isNotEmpty()
                    ) {
                        Icon(
                            imageVector = Icons.Default.Send,
                            contentDescription = "Post",
                            tint = if (newCommentText.trim().isNotEmpty()) (if (isDark) DarkPrimary else LightPrimary) else (if (isDark) DarkSubtleText else LightSubtleText)
                        )
                    }
                }
            }
        }
    }
}
