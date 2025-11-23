package com.jingbao.chongxiaojing.activities.usageSelection

import android.content.Context
import android.content.Intent
import androidx.lifecycle.ViewModel
import com.jingbao.chongxiaojing.activities.audio.AudioUsageActivity
import com.jingbao.chongxiaojing.activities.customProtocol.CustomProtocolActivity
import com.jingbao.chongxiaojing.activities.customView.CustomViewActivity
import com.jingbao.chongxiaojing.activities.deviceInformation.DeviceInformationActivity
import com.jingbao.chongxiaojing.activities.mediaFile.MediaFileActivity
import com.jingbao.chongxiaojing.activities.picture.PictureActivity
import com.jingbao.chongxiaojing.activities.useAIScene.AISceneActivity
import com.jingbao.chongxiaojing.activities.useTeleprompter.TeleprompterSceneActivity
import com.jingbao.chongxiaojing.activities.useTranslation.TranslationSceneActivity
import com.jingbao.chongxiaojing.activities.video.VideoActivity
import com.jingbao.chongxiaojing.dataBeans.UsageType

class UsageSelectionViewModel: ViewModel() {
    fun toUsage(context: Context, type: UsageType) {
        when(type){
            UsageType.USAGE_TYPE_AUDIO -> {
                context.startActivity(Intent(context, AudioUsageActivity::class.java))
            }
            UsageType.USAGE_TYPE_VIDEO -> {
                context.startActivity(Intent(context, VideoActivity::class.java))
            }
            UsageType.USAGE_TYPE_PHOTO -> {
                context.startActivity(Intent(context, PictureActivity::class.java))
            }
            UsageType.USAGE_TYPE_FILE -> {
                context.startActivity(Intent(context, MediaFileActivity::class.java))
            }
            UsageType.USAGE_TYPE_AI -> {
                context.startActivity(Intent(context, AISceneActivity::class.java))
            }
            UsageType.USAGE_CUSTOM_VIEW -> {
                context.startActivity(Intent(context, CustomViewActivity::class.java))
            }
            UsageType.USAGE_TYPE_CUSTOM_PROTOCOL -> {
                context.startActivity(Intent(context, CustomProtocolActivity::class.java))
            }
            UsageType.USAGE_TYPE_TELEPROMPTER -> {
                context.startActivity(Intent(context, TeleprompterSceneActivity::class.java))
            }
            UsageType.USAGE_TYPE_TRANSLATION -> {
                context.startActivity(Intent(context, TranslationSceneActivity::class.java))
            }
            UsageType.USAGE_TYPE_DEVICE_INFORMATION -> {
                context.startActivity(Intent(context, DeviceInformationActivity::class.java))
            }
        }
    }

}