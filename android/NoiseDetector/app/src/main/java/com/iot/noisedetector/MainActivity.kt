package com.iot.noisedetector

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import androidx.core.content.ContextCompat
import com.iot.noisedetector.model.NoiseReading
import com.iot.noisedetector.network.ApiService
import com.iot.noisedetector.sensor.NoiseSensor
import com.iot.noisedetector.ui.MainScreen
import com.iot.noisedetector.ui.theme.NoiseDetectorTheme
import kotlinx.coroutines.*
import java.time.Instant
import java.time.format.DateTimeFormatter

class MainActivity : ComponentActivity() {

    private val noiseSensor = NoiseSensor()
    private val apiService = ApiService()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val deviceId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)

        // Permission launcher
        val permissionLauncher = registerForActivityResult(
            ActivityResultContracts.RequestPermission()
        ) { granted ->
            // Permission result handled via recomposition
        }

        setContent {
            NoiseDetectorTheme {
                var currentDb by remember { mutableDoubleStateOf(0.0) }
                var currentLevel by remember { mutableIntStateOf(1) }
                var isMonitoring by remember { mutableStateOf(false) }
                var isConnected by remember { mutableStateOf(false) }
                var serverUrl by remember { mutableStateOf("https://reinny.alwaysdata.net") }
                var apiKey by remember { mutableStateOf("kucing-ayam-goreng-2024") }
                var sentCount by remember { mutableIntStateOf(0) }
                var monitoringJob by remember { mutableStateOf<Job?>(null) }
                var healthJob by remember { mutableStateOf<Job?>(null) }

                val scope = rememberCoroutineScope()

                // Health check loop
                LaunchedEffect(serverUrl, apiKey) {
                    apiService.updateConfig(serverUrl, apiKey)
                    healthJob?.cancel()
                    healthJob = scope.launch {
                        while (isActive) {
                            isConnected = apiService.checkHealth()
                            delay(10_000)
                        }
                    }
                }

                // Cleanup on dispose
                DisposableEffect(Unit) {
                    onDispose {
                        monitoringJob?.cancel()
                        healthJob?.cancel()
                    }
                }

                MainScreen(
                    currentDb = currentDb,
                    currentLevel = currentLevel,
                    isMonitoring = isMonitoring,
                    isConnected = isConnected,
                    serverUrl = serverUrl,
                    apiKey = apiKey,
                    sentCount = sentCount,
                    onToggleMonitoring = {
                        if (isMonitoring) {
                            // Stop
                            monitoringJob?.cancel()
                            monitoringJob = null
                            isMonitoring = false
                        } else {
                            // Check permission first
                            val hasPermission = ContextCompat.checkSelfPermission(
                                this@MainActivity,
                                Manifest.permission.RECORD_AUDIO
                            ) == PackageManager.PERMISSION_GRANTED

                            if (!hasPermission) {
                                permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                                return@MainScreen
                            }

                            // Start monitoring
                            isMonitoring = true
                            apiService.updateConfig(serverUrl, apiKey)

                            monitoringJob = scope.launch {
                                noiseSensor.startMonitoring(intervalMs = 2000).collect { reading ->
                                    currentDb = reading.decibelValue
                                    currentLevel = reading.noiseLevel

                                    // Send to backend
                                    val noiseReading = NoiseReading(
                                        deviceId = deviceId,
                                        noiseLevel = reading.noiseLevel,
                                        decibelValue = reading.decibelValue,
                                        recordedAt = DateTimeFormatter.ISO_INSTANT
                                            .format(Instant.now())
                                    )

                                    val success = apiService.sendReading(noiseReading)
                                    if (success) {
                                        sentCount++
                                    }
                                }
                            }
                        }
                    },
                    onServerUrlChange = { serverUrl = it },
                    onApiKeyChange = { apiKey = it }
                )
            }
        }
    }
}
