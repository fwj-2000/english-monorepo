import { ref } from 'vue'
export interface Options {
  lang?: string //语言
  continuous?: boolean //是否连续识别 默认是false 机制 也就是说完一句话或者没有声音了就会自动停止 如果设置为true就需要手动调用stop函数停止
  interimResults?: boolean //是否显示临时结果 默认是false 类似于SSE
  maxAlternatives?: number //最大候选数 默认是1 举个例子设置为3 说了apple 可能会识别出apple、apples、apple 等
}

let instance: SpeechRecognition | null = null

const getInstance = (options: Options): SpeechRecognition => {
  const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition //兼容苹果
  if (!speechRecognition) {
    throw new Error('SpeechRecognition is not supported in this browser') //浏览器不支持语音识别
  }
  //第一次会创建
  if (!instance) {
    const {
      lang = 'zh-CN',
      continuous = false,
      interimResults = false,
      maxAlternatives = 1,
    } = options
    instance = new speechRecognition()
    instance.lang = lang
    instance.continuous = continuous
    instance.interimResults = interimResults
    instance.maxAlternatives = maxAlternatives
  }
  //其他次数就直接返回了
  return instance
}

export const useVoiceToText = (options: Options) => {
  const recognition = getInstance(options)
  const isRecording = ref(false) //是否正在录音
  const errorMessage = ref<string>('') //错误信息

  recognition.onend = () => {
    isRecording.value = false
  }
  recognition.onerror = event => {
    console.error('语音识别错误:', event.error)
    isRecording.value = false
    switch (event.error) {
      case 'not-allowed':
        errorMessage.value = '麦克风权限被拒绝，请在浏览器设置中允许访问麦克风'
        break
      case 'no-speech':
        errorMessage.value = '未检测到语音，请重试'
        break
      case 'audio-capture':
        errorMessage.value = '未找到麦克风设备，请检查麦克风连接'
        break
      case 'aborted':
        errorMessage.value = ''
        break
      case 'network':
        errorMessage.value = '网络错误，请检查网络连接后重试'
        break
      case 'service-not-allowed':
        errorMessage.value = '当前浏览器不支持语音识别服务'
        break
      case 'language-not-supported':
        errorMessage.value = '不支持的语言设置'
        break
      default:
        errorMessage.value = `语音识别失败: ${event.error}`
    }
  }
  //开启语音转文字
  const start = (callback?: (result: string) => void) => {
    errorMessage.value = '' //每次开始时清空错误信息
    isRecording.value = true
    recognition.start()
    //输出的结果
    recognition.onresult = event => {
      let fullText = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]?.[0]
        if (result) {
          fullText += result.transcript
        }
      }
      callback?.(fullText)
    }
  }
  //停止语音转文字
  const stop = () => {
    isRecording.value = false
    recognition.stop()
  }
  return {
    isRecording,
    errorMessage,
    start,
    stop,
  }
}
