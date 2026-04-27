package com.iot.noisedetector.sensor

import android.annotation.SuppressLint
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlin.math.log10
import kotlin.math.sqrt

/**
 * Captures microphone audio and emits noise level readings.
 * Uses AudioRecord to read PCM 16-bit mono at 44100 Hz.
 * Computes RMS amplitude → approximate dB → discrete level (1-5).
 */
class NoiseSensor {

    companion object {
        private const val SAMPLE_RATE = 44100
        private const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
        private const val REFERENCE_AMPLITUDE = 1.0 // reference for dB calculation

        // dB thresholds for 1-5 level mapping
        private val LEVEL_THRESHOLDS = listOf(
            0.0 to 1,    // < 40 dB → Level 1 (Very Quiet)
            40.0 to 2,   // 40-55 dB → Level 2 (Quiet)
            55.0 to 3,   // 55-70 dB → Level 3 (Moderate)
            70.0 to 4,   // 70-85 dB → Level 4 (Loud)
            85.0 to 5    // > 85 dB → Level 5 (Very Loud)
        )
    }

    data class Reading(
        val decibelValue: Double,
        val noiseLevel: Int
    )

    /**
     * Start continuous noise monitoring.
     * Emits a Reading every [intervalMs] milliseconds.
     * Flow runs on IO dispatcher.
     */
    @SuppressLint("MissingPermission")
    fun startMonitoring(intervalMs: Long = 2000): Flow<Reading> = flow {
        val bufferSize = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT)

        val audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            SAMPLE_RATE,
            CHANNEL_CONFIG,
            AUDIO_FORMAT,
            bufferSize
        )

        if (audioRecord.state != AudioRecord.STATE_INITIALIZED) {
            audioRecord.release()
            throw IllegalStateException("AudioRecord failed to initialize")
        }

        try {
            audioRecord.startRecording()
            val buffer = ShortArray(bufferSize)

            while (true) {
                val readCount = audioRecord.read(buffer, 0, bufferSize)

                if (readCount > 0) {
                    val rms = computeRms(buffer, readCount)
                    val db = rmsToDecibels(rms)
                    val level = decibelToLevel(db)

                    emit(Reading(decibelValue = db, noiseLevel = level))
                }

                kotlinx.coroutines.delay(intervalMs)
            }
        } finally {
            audioRecord.stop()
            audioRecord.release()
        }
    }.flowOn(Dispatchers.IO)

    /**
     * Compute RMS (Root Mean Square) of the audio buffer.
     */
    private fun computeRms(buffer: ShortArray, readCount: Int): Double {
        var sum = 0.0
        for (i in 0 until readCount) {
            val sample = buffer[i].toDouble()
            sum += sample * sample
        }
        return sqrt(sum / readCount)
    }

    /**
     * Convert RMS amplitude to approximate decibels.
     * dB = 20 * log10(rms / reference)
     */
    private fun rmsToDecibels(rms: Double): Double {
        if (rms <= 0) return 0.0
        val db = 20 * log10(rms / REFERENCE_AMPLITUDE)
        return db.coerceIn(0.0, 120.0)
    }

    /**
     * Map decibel value to discrete level 1-5.
     */
    private fun decibelToLevel(db: Double): Int {
        return when {
            db < 40.0 -> 1
            db < 55.0 -> 2
            db < 70.0 -> 3
            db < 85.0 -> 4
            else -> 5
        }
    }
}
