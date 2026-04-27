package com.iot.noisedetector.network

import com.iot.noisedetector.model.NoiseReading
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * HTTP client for sending noise readings to the backend API.
 * Supports configurable server URL and API key.
 * Includes retry logic with exponential backoff.
 */
class ApiService(
    private var serverUrl: String = "http://10.0.2.2:3001",
    private var apiKey: String = ""
) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    fun updateConfig(serverUrl: String, apiKey: String) {
        this.serverUrl = serverUrl.trimEnd('/')
        this.apiKey = apiKey
    }

    /**
     * Send a noise reading to the backend.
     * Retries up to [maxRetries] times with exponential backoff.
     * Returns true if successful, false otherwise.
     */
    suspend fun sendReading(reading: NoiseReading, maxRetries: Int = 3): Boolean {
        return withContext(Dispatchers.IO) {
            var attempt = 0
            var lastException: Exception? = null

            while (attempt < maxRetries) {
                try {
                    val body = reading.toJson().toRequestBody(jsonMediaType)

                    val requestBuilder = Request.Builder()
                        .url("$serverUrl/api/noise")
                        .post(body)

                    if (apiKey.isNotBlank()) {
                        requestBuilder.addHeader("x-api-key", apiKey)
                    }

                    val response = client.newCall(requestBuilder.build()).execute()

                    if (response.isSuccessful) {
                        response.close()
                        return@withContext true
                    }

                    response.close()

                    // Don't retry on client errors (4xx)
                    if (response.code in 400..499) {
                        return@withContext false
                    }
                } catch (e: IOException) {
                    lastException = e
                }

                attempt++
                if (attempt < maxRetries) {
                    // Exponential backoff: 1s, 2s, 4s
                    kotlinx.coroutines.delay(1000L * (1 shl (attempt - 1)))
                }
            }

            false
        }
    }

    /**
     * Check if the backend is reachable.
     */
    suspend fun checkHealth(): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url("$serverUrl/api/health")
                    .get()
                    .build()

                val response = client.newCall(request).execute()
                val success = response.isSuccessful
                response.close()
                success
            } catch (e: Exception) {
                false
            }
        }
    }
}
