package com.civiq.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.civiq.app.ui.theme.*

@Composable
fun AuthScreen(
    onAuthSuccess: (name: String, email: String, isFixer: Boolean, specialty: String?, license: String?) -> Unit,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()
    var isSignUp by remember { mutableStateOf(false) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var isLocalFixer by remember { mutableStateOf(false) }
    var specialty by remember { mutableStateOf("") }
    var licenseNumber by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }

    val scrollState = rememberScrollState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(if (isDark) DarkBackground else LightBackground)
            .verticalScroll(scrollState)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Spacer(modifier = Modifier.height(40.dp))

        // App Logo Icon
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(if (isDark) DarkSurfaceVariant else LightPrimaryContainer),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Campaign,
                contentDescription = null,
                tint = if (isDark) DarkPrimary else LightPrimary,
                modifier = Modifier.size(36.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = if (isSignUp) "Create Account" else "Welcome to CIVIQ",
            style = AppTypography.displayLarge.copy(fontSize = 24.sp),
            color = if (isDark) DarkOnBackground else LightOnBackground,
            fontWeight = FontWeight.Bold
        )

        Text(
            text = if (isSignUp) "Join Bengaluru's civic hero community" else "Sign in to report and track neighborhood issues",
            style = AppTypography.bodySmall,
            color = if (isDark) DarkSubtleText else LightSubtleText,
            modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
        )

        // Inputs Card
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = if (isDark) DarkSurface else LightSurface),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                if (isSignUp) {
                    // Name Field
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Full Name") },
                        leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                        textStyle = AppTypography.bodyLarge,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Email Field
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email Address") },
                    leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true,
                    textStyle = AppTypography.bodyLarge,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth()
                )

                // Password Field
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password") },
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = null
                            )
                        }
                    },
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true,
                    textStyle = AppTypography.bodyLarge,
                    modifier = Modifier.fillMaxWidth()
                )

                // Dynamic Sign Up Role selection
                if (isSignUp) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = isLocalFixer,
                            onCheckedChange = { isLocalFixer = it },
                            colors = CheckboxDefaults.colors(checkedColor = if (isDark) DarkPrimary else LightPrimary)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Column {
                            Text(
                                text = "Register as a Local Fixer",
                                style = AppTypography.titleMedium.copy(fontSize = 13.sp),
                                fontWeight = FontWeight.Bold,
                                color = if (isDark) DarkOnBackground else LightOnBackground
                            )
                            Text(
                                text = "Apply to do paid neighborhood repair jobs",
                                style = AppTypography.bodySmall,
                                color = if (isDark) DarkSubtleText else LightSubtleText
                            )
                        }
                    }

                    AnimatedVisibility(
                        visible = isLocalFixer,
                        enter = expandVertically() + fadeIn(),
                        exit = shrinkVertically() + fadeOut()
                    ) {
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Specialty selection
                            OutlinedTextField(
                                value = specialty,
                                onValueChange = { specialty = it },
                                label = { Text("Specialty (e.g. Electrical, Plumbing)") },
                                leadingIcon = { Icon(Icons.Default.Build, contentDescription = null) },
                                shape = RoundedCornerShape(12.dp),
                                singleLine = true,
                                textStyle = AppTypography.bodyLarge,
                                modifier = Modifier.fillMaxWidth()
                            )

                            // Govt License / ID Field
                            OutlinedTextField(
                                value = licenseNumber,
                                onValueChange = { licenseNumber = it },
                                label = { Text("Government / BESCOM License No.") },
                                leadingIcon = { Icon(Icons.Default.AssignmentInd, contentDescription = null) },
                                shape = RoundedCornerShape(12.dp),
                                singleLine = true,
                                textStyle = AppTypography.bodyLarge,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Action Button
                Button(
                    onClick = {
                        isLoading = true
                        // Mimic auth network delay
                        onAuthSuccess(
                            if (isSignUp) name else email.substringBefore("@"),
                            email,
                            isLocalFixer,
                            if (isLocalFixer) specialty else null,
                            if (isLocalFixer) licenseNumber else null
                        )
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = if (isDark) DarkPrimary else LightPrimary),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    enabled = !isLoading
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                    } else {
                        Text(
                            text = if (isSignUp) "Register" else "Sign In",
                            style = AppTypography.titleMedium,
                            color = Color.White
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Switch Mode Link
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = if (isSignUp) "Already have an account? " else "Don't have an account? ",
                style = AppTypography.bodySmall,
                color = if (isDark) DarkSubtleText else LightSubtleText
            )
            Text(
                text = if (isSignUp) "Sign In" else "Sign Up",
                style = AppTypography.bodySmall.copy(fontWeight = FontWeight.Bold),
                color = if (isDark) DarkPrimary else LightPrimary,
                modifier = Modifier.clickable { isSignUp = !isSignUp }
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}
