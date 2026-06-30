import React, { useState } from "react";
import { BookOpen, X, Code, Copy, Check, FileCode, Smartphone } from "lucide-react";

interface KotlinExplorerProps {
  onClose: () => void;
}

export const KotlinExplorer: React.FC<KotlinExplorerProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>("IssueModel.kt");
  const [copied, setCopied] = useState(false);

  const files: { [key: string]: { path: string; language: string; content: string } } = {
    "IssueModel.kt": {
      path: "/android/app/src/main/java/com/civiq/app/data/models/IssueModel.kt",
      language: "kotlin",
      content: `package com.civiq.app.data.models

import com.google.firebase.firestore.Exclude
import java.io.Serializable
import java.util.Date

data class IssueModel(
    val id: String = "",
    val title: String = "",
    val description: String = "",
    val category: String = "",
    val severity: String = "", // Low, Medium, High, Critical
    val status: String = "Pending", // Pending, In Progress, Resolved
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val address: String = "",
    
    // SLA Management
    val slaHours: Int = 48,
    val hoursPassed: Int = 0,
    
    // AI Triage Parameters
    val department: String = "",
    val estimatedFixTime: String = "",
    val paymentDetails: String = "",
    val urgencyReason: String = "",
    val angerIndex: Int = 0,
    val isSafetyRisk: Boolean = false,
    val actionItems: List<String> = emptyList(),
    
    // Escalation & Responder Assignee details
    val assigneeType: String = "volunteer", // volunteer, localfixer, bbmp, emergency
    val assignedTo: String = "",
    val claimedByUserId: String? = null,
    
    // Upvotes / Community Priority System
    val voterIds: List<String> = emptyList(),
    val upvotesCount: Int = 0,
    
    // Quality Audit Photos
    val beforePhotoUrl: String? = null,
    val afterPhotoUrl: String? = null,
    val qualityScore: Double = 0.0,
    
    val createdAt: Date = Date()
) : Serializable {

    @Exclude
    fun isSlaBreached(): Boolean = hoursPassed > slaHours

    @Exclude
    fun getSeverityColor(): String = when (severity.lowercase()) {
        "critical" -> "#EF4444"
        "high" -> "#F97316"
        "medium" -> "#EAB308"
        else -> "#22C55E"
    }

    @Exclude
    fun getAssigneeTypeColor(): String = when (assigneeType.lowercase()) {
        "emergency" -> "#EF4444"
        "bbmp" -> "#F97316"
        "localfixer" -> "#3B82F6"
        else -> "#22C55E"
    }
}`
    },
    "UserModel.kt": {
      path: "/android/app/src/main/java/com/civiq/app/data/models/UserModel.kt",
      language: "kotlin",
      content: `package com.civiq.app.data.models

import java.io.Serializable

data class UserModel(
    val uid: String = "",
    val name: String = "",
    val email: String = "",
    
    // Gamerized Civic points system
    val civicPoints: Int = 0,
    val missionsCompleted: Int = 0,
    val upvotedIssueIds: List<String> = emptyList(),
    
    // Local Fixer Workforce properties
    val isLocalFixer: Boolean = false,
    val fixerRating: Double = 5.0,
    val fixerJobsDone: Int = 0,
    val fixerEarnings: Double = 0.0,
    
    // Admin features
    val isAdmin: Boolean = false
) : Serializable`
    },
    "FirestoreRepository.kt": {
      path: "/android/app/src/main/java/com/civiq/app/data/repository/FirestoreRepository.kt",
      language: "kotlin",
      content: `package com.civiq.app.data.repository

import com.civiq.app.data.models.IssueModel
import com.civiq.app.data.models.UserModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FirestoreRepository @Inject constructor(
    private val firestore: FirebaseFirestore,
    private val auth: FirebaseAuth
) {
    // Get real-time user profile
    fun getUserProfile(): Flow<UserModel?> = callbackFlow {
        val uid = auth.currentUser?.uid ?: run {
            trySend(null)
            close()
            return@callbackFlow
        }
        val listener = firestore.collection("users").document(uid)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                trySend(snapshot?.toObject(UserModel::class.java))
            }
        awaitClose { listener.remove() }
    }

    // Submit a new civic issue report
    suspend fun reportIssue(issue: IssueModel): String {
        return try {
            val docRef = firestore.collection("issues").document()
            val finalIssue = issue.copy(id = docRef.id)
            docRef.set(finalIssue).await()
            docRef.id
        } catch (e: Exception) { "" }
    }

    // Upvote an issue via transaction
    suspend fun upvoteIssue(issueId: String): Boolean {
        val uid = auth.currentUser?.uid ?: return false
        return try {
            val issueRef = firestore.collection("issues").document(issueId)
            firestore.runTransaction { transaction ->
                val snapshot = transaction.get(issueRef)
                val issue = snapshot.toObject(IssueModel::class.java) ?: return@runTransaction
                if (!issue.voterIds.contains(uid)) {
                    transaction.update(issueRef, "voterIds", issue.voterIds + uid)
                    transaction.update(issueRef, "upvotesCount", issue.upvotesCount + 1)
                }
            }.await()
            true
        } catch (e: Exception) { false }
    }
}`
    },
    "GeminiService.kt": {
      path: "/android/app/src/main/java/com/civiq/app/data/api/GeminiService.kt",
      language: "kotlin",
      content: `package com.civiq.app.data.api

import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path

interface GeminiService {

    @POST("v1beta/models/{model}:generateContent")
    suspend fun generateContent(
        @Path("model") model: String = "gemini-2.0-flash",
        @Header("x-goog-api-key") apiKey: String,
        @Body request: GeminiRequest
    ): GeminiResponse
}`
    },
    "build.gradle": {
      path: "/android/app/build.gradle",
      language: "groovy",
      content: `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    id 'kotlin-kapt'
    id 'dagger.hilt.android.plugin'
    id 'com.google.gms.google-services'
}

android {
    namespace 'com.civiq.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.civiq.app"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
}`
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[selectedFile].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col text-slate-100 select-text font-sans">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-xs font-black tracking-wider uppercase">Android Kotlin Source Hub</h2>
            <span className="text-[9px] text-slate-400 font-mono">CIVIQ Native Codebase Layout</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* BODY COLUMN GRID */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR FILE SELECTOR */}
        <div className="w-[110px] bg-slate-900/40 border-r border-slate-800 flex flex-col p-2 space-y-1 overflow-y-auto shrink-0 select-none">
          {Object.keys(files).map((fName) => (
            <button
              key={fName}
              onClick={() => setSelectedFile(fName)}
              className={`p-2 rounded-lg text-left text-[9px] font-bold truncate transition-colors flex items-center gap-1 ${
                selectedFile === fName
                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
              {fName}
            </button>
          ))}
        </div>

        {/* FILE CODE VIEWER */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          
          {/* File path line bar */}
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-900 flex justify-between items-center text-[9px] font-mono text-slate-400 select-none shrink-0">
            <span className="truncate max-w-[200px]">{files[selectedFile].path}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 text-[8px] font-bold"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "COPIED" : "COPY"}
            </button>
          </div>

          {/* CODE BLOCK PREVIEW */}
          <pre className="flex-1 p-4 overflow-auto font-mono text-[9px] leading-relaxed text-indigo-200 bg-slate-950 whitespace-pre">
            {files[selectedFile].content}
          </pre>
        </div>

      </div>
    </div>
  );
};
