package com.feshshopapp.gallery

import android.app.Activity
import android.content.Intent
import android.media.MediaMetadataRetriever
import android.media.MediaPlayer
import android.net.Uri
import android.provider.OpenableColumns
import com.facebook.react.bridge.*
import java.io.File
import java.io.FileOutputStream

class AudioPickerModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), ActivityEventListener, LifecycleEventListener {

    private var pickerPromise: Promise? = null
    private var mediaPlayer: MediaPlayer? = null

    init {
        reactContext.addActivityEventListener(this)
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String = "AudioPicker"

    @ReactMethod
    fun pickAudio(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity doesn't exist")
            return
        }

        pickerPromise = promise

        try {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "audio/*"
                addCategory(Intent.CATEGORY_OPENABLE)
            }
            activity.startActivityForResult(intent, REQUEST_CODE)
        } catch (e: Exception) {
            pickerPromise?.reject("PICK_ERROR", e.message)
            pickerPromise = null
        }
    }

    @ReactMethod
    fun playAudio(uri: String) {
        try {
            stopAudio()

            mediaPlayer = MediaPlayer().apply {
                setDataSource(reactContext, Uri.parse(uri))
                prepare()
                isLooping = true
                start()
            }
        } catch (e: Exception) {
            // Ignore play errors
        }
    }

    @ReactMethod
    fun pauseAudio() {
        try {
            mediaPlayer?.let {
                if (it.isPlaying) {
                    it.pause()
                }
            }
        } catch (e: Exception) {
            // Ignore pause errors
        }
    }

    @ReactMethod
    fun resumeAudio() {
        try {
            mediaPlayer?.let {
                if (!it.isPlaying) {
                    it.start()
                }
            }
        } catch (e: Exception) {
            // Ignore resume errors
        }
    }

    @ReactMethod
    fun stopAudio() {
        try {
            mediaPlayer?.let {
                if (it.isPlaying) {
                    it.stop()
                }
                it.release()
            }
            mediaPlayer = null
        } catch (e: Exception) {
            // Ignore stop errors
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode != REQUEST_CODE) return

        val promise = pickerPromise ?: return
        pickerPromise = null

        if (resultCode == Activity.RESULT_CANCELED) {
            promise.reject("CANCELLED", "User cancelled audio picker")
            return
        }

        if (resultCode != Activity.RESULT_OK || data == null) {
            promise.reject("ERROR", "Failed to pick audio")
            return
        }

        val uri: Uri = data.data ?: run {
            promise.reject("NO_DATA", "No audio data received")
            return
        }

        try {
            val context = reactContext
            var filename = "audio"
            context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (nameIndex != -1 && cursor.moveToFirst()) {
                    filename = cursor.getString(nameIndex)
                }
            }

            // Copy to internal cache to persist access permission across restarts/sessions
            val extension = if (filename.contains(".")) filename.substring(filename.lastIndexOf(".")) else ".mp3"
            val cacheFile = File(context.cacheDir, "story_audio_${System.currentTimeMillis()}$extension")
            context.contentResolver.openInputStream(uri)?.use { inputStream ->
                FileOutputStream(cacheFile).use { outputStream ->
                    inputStream.copyTo(outputStream)
                }
            }
            val persistableUri = Uri.fromFile(cacheFile)

            var duration = 15000L
            val retriever = MediaMetadataRetriever()
            try {
                retriever.setDataSource(context, persistableUri)
                val durationStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
                if (durationStr != null) {
                    duration = durationStr.toLong()
                }
            } catch (e: Exception) {
                // Ignore metadata errors, fallback to default duration
            } finally {
                retriever.release()
            }

            val result = Arguments.createMap().apply {
                putString("uri", persistableUri.toString())
                putString("filename", filename)
                putDouble("duration", duration.toDouble())
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("PROCESS_ERROR", e.message)
        }
    }

    override fun onNewIntent(intent: Intent) {}

    override fun onHostResume() {}

    override fun onHostPause() {
        stopAudio()
    }

    override fun onHostDestroy() {
        stopAudio()
    }

    companion object {
        private const val REQUEST_CODE = 4224
    }
}
