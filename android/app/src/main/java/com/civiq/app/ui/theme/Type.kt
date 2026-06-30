package com.civiq.app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.googlefonts.Font
import androidx.compose.ui.text.googlefonts.GoogleFont
import androidx.compose.ui.unit.sp
import com.civiq.app.R

// Google Fonts Provider Setup
val provider = GoogleFont.Provider(
    providerAuthority = "com.google.android.gms.fonts",
    providerPackage = "com.google.android.gms",
    certificates = R.array.com_google_android_gms_fonts_certs
)

val DmSansFont = GoogleFont("DM Sans")
val DmMonoFont = GoogleFont("DM Mono")

val DmSansFamily = FontFamily(
    Font(googleFont = DmSansFont, fontProvider = provider, weight = FontWeight.Normal),
    Font(googleFont = DmSansFont, fontProvider = provider, weight = FontWeight.Medium),
    Font(googleFont = DmSansFont, fontProvider = provider, weight = FontWeight.SemiBold),
    Font(googleFont = DmSansFont, fontProvider = provider, weight = FontWeight.Bold)
)

val DmMonoFamily = FontFamily(
    Font(googleFont = DmMonoFont, fontProvider = provider, weight = FontWeight.Normal)
)

// Material 3 Typography custom-mapped to the requested premium specifications:
val AppTypography = Typography(
    // Display: DM Sans Bold 28sp — screen titles
    displayLarge = TextStyle(
        fontFamily = DmSansFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 36.sp,
        letterSpacing = (-0.5).sp
    ),
    // Headline: DM Sans Bold 22sp — section headers
    headlineMedium = TextStyle(
        fontFamily = DmSansFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = (-0.3).sp
    ),
    // Title: DM Sans SemiBold 17sp — card titles
    titleLarge = TextStyle(
        fontFamily = DmSansFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 17.sp,
        lineHeight = 22.sp,
        letterSpacing = (-0.3).sp
    ),
    // Subtitle: DM Sans Medium 14sp — labels, chips
    titleMedium = TextStyle(
        fontFamily = DmSansFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 18.sp
    ),
    // Body: DM Sans Regular 14sp — descriptions
    bodyLarge = TextStyle(
        fontFamily = DmSansFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 21.sp
    ),
    // Caption: DM Sans Regular 12sp — timestamps, meta
    bodySmall = TextStyle(
        fontFamily = DmSansFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 16.sp
    ),
    // Overline: DM Sans Medium 10sp — category labels (uppercase, letter-spacing 1.5)
    labelSmall = TextStyle(
        fontFamily = DmSansFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 10.sp,
        letterSpacing = 1.5.sp
    ),
    // Numbers: DM Mono Regular — all numeric data (stats, counts)
    labelMedium = TextStyle(
        fontFamily = DmMonoFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 13.sp,
        lineHeight = 16.sp
    )
)
