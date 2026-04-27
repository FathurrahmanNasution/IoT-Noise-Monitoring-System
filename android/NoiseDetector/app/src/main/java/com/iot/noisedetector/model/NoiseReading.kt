package com.iot.noisedetector.model

/**
 * Represents a single noise reading from the sensor.
 *
 * @param deviceId  Unique identifier for this Android device
 * @param noiseLevel  Discrete noise level (1-5)
 * @param decibelValue  Approximate dB value computed from RMS
 * @param recordedAt  ISO 8601 timestamp of the reading
 */
data class NoiseReading(
    val deviceId: String,
    val noiseLevel: Int,
    val decibelValue: Double,
    val recordedAt: String
) {
    fun toJson(): String {
        return """
            {
                "device_id": "$deviceId",
                "noise_level": $noiseLevel,
                "decibel_value": $decibelValue,
                "recorded_at": "$recordedAt"
            }
        """.trimIndent()
    }
}
