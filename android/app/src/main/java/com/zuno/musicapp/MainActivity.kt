package com.zuno.musicapp

import android.os.Build
import android.os.Bundle
import android.view.WindowManager

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(null)
    
    // Enable 120 FPS support for high refresh rate displays
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      window.attributes.preferredDisplayModeId = getHighestRefreshRateMode()
    }
  }
  
  /**
   * Get the display mode with the highest refresh rate
   */
  private fun getHighestRefreshRateMode(): Int {
    val display = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      display
    } else {
      @Suppress("DEPRECATION")
      windowManager.defaultDisplay
    }
    
    if (display == null) return 0
    
    val modes = display.supportedModes
    var maxRefreshRate = 60f
    var modeId = 0
    
    for (mode in modes) {
      if (mode.refreshRate > maxRefreshRate) {
        maxRefreshRate = mode.refreshRate
        modeId = mode.modeId
      }
    }
    
    return modeId
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
