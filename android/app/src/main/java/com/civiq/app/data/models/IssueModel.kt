package com.civiq.app.data.models

import com.google.firebase.firestore.DocumentId
import java.io.Serializable

data class IssueModel(
    @DocumentId val id: String = "",
    val title: String = "",
    val description: String = "",
    val category: String = "",
    val severity: String = "Low", // Critical, High, Medium, Low
    val status: String = "Pending", // Pending, In Progress, Resolved
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val address: String = "",
    val assignedTo: String = "",
    val assigneeType: String = "volunteer", // emergency, bbmp, localfixer, volunteer
    val paymentDetails: String = "",
    val slaHours: Int = 48,
    val hoursPassed: Int = 0,
    val upvotesCount: Int = 0,
    val isSafetyRisk: Boolean = false,
    val datePosted: String = "",
    val publicAngerIndex: Int = 10,
    val department: String = "",
    val estimatedFixTime: String = "",
    val actionItems: List<String> = emptyList(),
    val urgencyReason: String = "",
    val qualityScore: Double? = null,
    val beforePhotoUrl: String? = null,
    val afterPhotoUrl: String? = null,
    val claimedByUserId: String? = null,
    val fundingSource: String? = null,
    val voterIds: List<String> = emptyList(),
    val savedByUserIds: List<String> = emptyList(),
    val distanceKm: Double? = null
) : Serializable {

    fun isSlaBreached(): Boolean = hoursPassed > slaHours

    fun getSeverityColor(): String {
        return when (severity.lowercase()) {
            "critical" -> "#EF4444"
            "high" -> "#F97316"
            "medium" -> "#EAB308"
            else -> "#22C55E"
        }
    }

    fun getAssigneeTypeColor(): String {
        return when (assigneeType.lowercase()) {
            "emergency" -> "#EF4444"
            "bbmp" -> "#F97316"
            "localfixer" -> "#3B82F6"
            else -> "#22C55E"
        }
    }
}
