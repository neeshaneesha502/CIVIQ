package com.civiq.app.data.models

import java.io.Serializable

data class UserModel(
    val uid: String = "",
    val name: String = "",
    val email: String = "",
    val civicPoints: Int = 0,
    val missionsCompleted: Int = 0,
    val badge: String = "Novice Citizen",
    val isLocalFixer: Boolean = false,
    val fixerSpecialty: String? = null,
    val fixerLicenseNumber: String? = null,
    val fixerRating: Double = 5.0,
    val fixerEarnings: Double = 0.0,
    val fixerJobsDone: Int = 0,
    val upvotedIssueIds: List<String> = emptyList(),
    val registeredDate: String = "",
    val isAdmin: Boolean = false
) : Serializable
