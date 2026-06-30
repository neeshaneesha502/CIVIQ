package com.civiq.app.data.api

import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import java.io.Serializable

interface GeminiService {
    @POST("v1beta/models/{model}:generateContent")
    suspend fun generateContent(
        @Path("model") model: String = "gemini-2.0-flash",
        @Header("x-goog-api-key") apiKey: String,
        @Body request: GeminiRequest
    ): GeminiResponse
}

// Request Models for Gemini API
data class GeminiRequest(
    val contents: List<ContentPart>,
    val generationConfig: GenerationConfig? = null,
    val systemInstruction: SystemInstruction? = null
) : Serializable

data class ContentPart(
    val role: String = "user",
    val parts: List<Part>
) : Serializable

sealed class Part : Serializable {
    data class TextPart(val text: String) : Part(), Serializable
    data class InlineDataPart(val inlineData: InlineData) : Part(), Serializable
}

data class InlineData(
    val mimeType: String,
    val data: String // Base64 encoded string
) : Serializable

data class GenerationConfig(
    val responseMimeType: String = "application/json",
    val responseSchema: ResponseSchema? = null,
    val temperature: Double = 0.2
) : Serializable

data class ResponseSchema(
    val type: String, // OBJECT, ARRAY, STRING, INTEGER, etc.
    val properties: Map<String, SchemaProperty>? = null,
    val required: List<String>? = null,
    val items: ResponseSchema? = null
) : Serializable

data class SchemaProperty(
    val type: String,
    val description: String? = null
) : Serializable

data class SystemInstruction(
    val parts: List<Part.TextPart>
) : Serializable

// Response Models for Gemini API
data class GeminiResponse(
    val candidates: List<Candidate>?
) : Serializable

data class Candidate(
    val content: ResponseContent?,
    val finishReason: String?
) : Serializable

data class ResponseContent(
    val parts: List<ResponsePart>?
) : Serializable

data class ResponsePart(
    val text: String?
) : Serializable

// Helper model representing parsed analysis result
data class IssueAnalysisResult(
    val category: String,
    val severity: String,
    val department: String,
    val assignedTo: String,
    val assigneeType: String,
    val slaHours: Int,
    val urgencyReason: String,
    val publicAngerIndex: Int,
    val actionItems: List<String>,
    val paymentDetails: String = ""
) : Serializable
