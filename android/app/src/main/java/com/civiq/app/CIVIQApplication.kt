package com.civiq.app

import android.app.Application
import com.google.firebase.FirebaseApp

class CIVIQApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        try {
            // Bootstrap Firebase App context
            FirebaseApp.initializeApp(this)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
