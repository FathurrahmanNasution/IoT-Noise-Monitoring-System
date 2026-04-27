package com.iot.noisedetector.ui

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.iot.noisedetector.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    currentDb: Double,
    currentLevel: Int,
    isMonitoring: Boolean,
    isConnected: Boolean,
    serverUrl: String,
    apiKey: String,
    sentCount: Int,
    onToggleMonitoring: () -> Unit,
    onServerUrlChange: (String) -> Unit,
    onApiKeyChange: (String) -> Unit
) {
    val levelColor by animateColorAsState(
        targetValue = levelColor(currentLevel),
        animationSpec = tween(400),
        label = "levelColor"
    )

    val levelProgress by animateFloatAsState(
        targetValue = currentLevel / 5f,
        animationSpec = tween(600),
        label = "levelProgress"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Title
        Text(
            text = "Noise Detector",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Connection status
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(if (isConnected) AccentEmerald else AccentRose)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = if (isConnected) "Server Connected" else "Server Unreachable",
                fontSize = 13.sp,
                color = if (isConnected) AccentEmerald else AccentRose
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Big dB display
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = if (isMonitoring) "%.1f".format(currentDb) else "—",
                    fontSize = 64.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = levelColor,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = "dB",
                    fontSize = 20.sp,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Level bar
                LinearProgressIndicator(
                    progress = levelProgress,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = levelColor,
                    trackColor = DarkCard,
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Level ${currentLevel}/5 — ${levelLabel(currentLevel)}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = levelColor
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Stats
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            StatChip(label = "Status", value = if (isMonitoring) "Active" else "Stopped")
            StatChip(label = "Sent", value = "$sentCount")
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Server URL input
        OutlinedTextField(
            value = serverUrl,
            onValueChange = onServerUrlChange,
            label = { Text("Server URL") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = AccentIndigo,
                unfocusedBorderColor = DarkCard,
                focusedLabelColor = AccentIndigo,
                unfocusedLabelColor = TextMuted,
                cursorColor = AccentIndigo,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextSecondary
            ),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(8.dp))

        // API Key input
        OutlinedTextField(
            value = apiKey,
            onValueChange = onApiKeyChange,
            label = { Text("API Key") },
            singleLine = true,
            visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(),
            keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                keyboardType = androidx.compose.ui.text.input.KeyboardType.Password
            ),
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = AccentIndigo,
                unfocusedBorderColor = DarkCard,
                focusedLabelColor = AccentIndigo,
                unfocusedLabelColor = TextMuted,
                cursorColor = AccentIndigo,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextSecondary
            ),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.weight(1f))

        // Start/Stop button
        Button(
            onClick = onToggleMonitoring,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isMonitoring) AccentRose else AccentIndigo
            ),
            shape = RoundedCornerShape(16.dp)
        ) {
            Text(
                text = if (isMonitoring) "Stop Monitoring" else "Start Monitoring",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun StatChip(label: String, value: String) {
    Card(
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = value, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
            Text(text = label, fontSize = 12.sp, color = TextMuted)
        }
    }
}
