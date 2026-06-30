package com.civiq.app.data.models

import com.google.firebase.firestore.DocumentId
import java.io.Serializable

data class SavedLocationModel(
    @DocumentId val id: String = "",
    val userId: String = "",
    val label: String = "Home", // Home, Work, Other
    val address: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val iconEmoji: String = "🏠"
) : Serializable
