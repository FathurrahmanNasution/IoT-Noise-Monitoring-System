package com.iot.noisedetector.ui.theme

import androidx.compose.ui.graphics.Color

// Dark theme palette
val DarkBackground = Color(0xFF0A0E1A)
val DarkSurface = Color(0xFF111827)
val DarkCard = Color(0xFF1E293B)

val AccentIndigo = Color(0xFF6366F1)
val AccentCyan = Color(0xFF22D3EE)
val AccentEmerald = Color(0xFF34D399)
val AccentAmber = Color(0xFFFBBF24)
val AccentRose = Color(0xFFFB7185)

val TextPrimary = Color(0xFFF1F5F9)
val TextSecondary = Color(0xFF94A3B8)
val TextMuted = Color(0xFF64748B)

// Noise level colors
val Level1 = Color(0xFF34D399)
val Level2 = Color(0xFF6EE7B7)
val Level3 = Color(0xFFFBBF24)
val Level4 = Color(0xFFF97316)
val Level5 = Color(0xFFEF4444)

fun levelColor(level: Int): Color = when (level) {
    1 -> Level1
    2 -> Level2
    3 -> Level3
    4 -> Level4
    5 -> Level5
    else -> TextMuted
}

fun levelLabel(level: Int): String = when (level) {
    1 -> "Very Quiet"
    2 -> "Quiet"
    3 -> "Moderate"
    4 -> "Loud"
    5 -> "Very Loud"
    else -> "Unknown"
}
