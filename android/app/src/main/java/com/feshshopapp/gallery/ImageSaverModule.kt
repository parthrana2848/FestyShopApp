package com.feshshopapp.gallery

import android.content.ContentValues
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import com.facebook.react.bridge.*
import java.io.File
import java.io.FileInputStream
import java.io.OutputStream

class ImageSaverModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ImageSaver"

    @ReactMethod
    fun saveImage(filePath: String, promise: Promise) {
        try {

            val cleanPath = filePath.replaceFirst(Regex("^file://?"), "")
            val file = File(cleanPath)

            val resolver = reactContext.contentResolver

            val contentValues = ContentValues().apply {

                put(
                    MediaStore.MediaColumns.DISPLAY_NAME,
                    "story_${System.currentTimeMillis()}.jpg"
                )

                put(
                    MediaStore.MediaColumns.MIME_TYPE,
                    "image/jpeg"
                )

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {

                    put(
                        MediaStore.MediaColumns.RELATIVE_PATH,
                        Environment.DIRECTORY_PICTURES + "/FeshShop"
                    )
                }
            }

            val uri = resolver.insert(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                contentValues
            ) ?: throw Exception("Failed to create media file")

            val outputStream: OutputStream =
                resolver.openOutputStream(uri)
                    ?: throw Exception("Failed to open output stream")

            val inputStream = FileInputStream(file)

            inputStream.copyTo(outputStream)

            inputStream.close()
            outputStream.close()

            promise.resolve(true)

        } catch (e: Exception) {

            promise.reject(
                "SAVE_ERROR",
                e.message
            )
        }
    }
}
