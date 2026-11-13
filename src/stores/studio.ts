import type { AudioMode } from '@/constants/audio'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { type AudioChatMessage, createAudioUrl, generateAudio } from '@/api/mimo'
import i18n from '@/plugins/i18n'
import { useAppStore } from './app'
import { useSettingsStore } from './settings'

export interface VoiceSample {
  name: string
  dataUrl: string
  size: number
}

export interface GeneratedAudio {
  url: string
  text: string
  model: string
  voice: string
  createdAt: number
}

export interface ModeState {
  text: string
  instruction: string
  description: string
  voice: string
  sample: VoiceSample | null
  result: GeneratedAudio | null
  loading: boolean
}

function createModeState (): ModeState {
  return {
    text: '',
    instruction: '',
    description: '',
    voice: 'mimo_default',
    sample: null,
    result: null,
    loading: false,
  }
}

export const useStudioStore = defineStore('studio', () => {
  const modes = reactive<Record<AudioMode, ModeState>>({
    'speech': createModeState(),
    'voice-design': createModeState(),
    'voice-clone': createModeState(),
  })
  const controllers = new Map<AudioMode, AbortController>()

  function clearResult (mode: AudioMode) {
    const state = modes[mode]
    if (state.result) {
      URL.revokeObjectURL(state.result.url)
      state.result = null
    }
  }

  function canGenerate (mode: AudioMode): boolean {
    const state = modes[mode]
    const settings = useSettingsStore()
    return settings.isConfigured
      && !!settings.models[mode]
      && state.text.trim() !== ''
      && (mode !== 'voice-design' || state.description.trim() !== '')
      && (mode !== 'voice-clone' || state.sample !== null)
  }

  function validate (mode: AudioMode): string | null {
    const settings = useSettingsStore()
    const state = modes[mode]
    if (!settings.isConfigured) {
      return 'errors.missingKey'
    }
    if (!settings.models[mode]) {
      return 'errors.selectModel'
    }
    if (mode === 'voice-design' && !state.description.trim()) {
      return 'errors.describeVoice'
    }
    if (mode === 'voice-clone' && !state.sample) {
      return 'errors.uploadSample'
    }
    if (!state.text.trim()) {
      return 'errors.enterText'
    }
    return null
  }

  async function generate (mode: AudioMode) {
    const t = i18n.global.t
    const settings = useSettingsStore()
    const app = useAppStore()
    const state = modes[mode]

    if (state.loading) {
      return
    }

    const errorKey = validate(mode)
    if (errorKey) {
      app.notify(t(errorKey))
      if (errorKey === 'errors.missingKey') {
        app.openSettings()
      }
      return
    }

    const messages: AudioChatMessage[] = []
    const instruction = mode === 'voice-design' ? state.description.trim() : state.instruction.trim()
    if (instruction) {
      messages.push({ role: 'user', content: instruction })
    }
    messages.push({ role: 'assistant', content: state.text.trim() })

    const audio: { format: 'wav', voice?: string } = { format: 'wav' }
    if (mode === 'speech') {
      audio.voice = state.voice
    }
    if (mode === 'voice-clone' && state.sample) {
      audio.voice = state.sample.dataUrl
    }

    const voiceLabel = mode === 'speech'
      ? state.voice
      : (mode === 'voice-clone' ? (state.sample?.name ?? '') : state.description.trim())

    const controller = new AbortController()
    controllers.set(mode, controller)
    state.loading = true

    try {
      const response = await generateAudio({
        baseUrl: settings.apiBaseUrl,
        apiKey: settings.apiKey,
        model: settings.models[mode],
        messages,
        audio,
        signal: controller.signal,
      })

      const audioData = response.choices?.[0]?.message?.audio?.data
      if (!audioData) {
        throw new Error(t('errors.noAudioData'))
      }

      clearResult(mode)
      state.result = {
        url: createAudioUrl(audioData),
        text: response.choices?.[0]?.message?.final_text_preview
          ?? response.choices?.[0]?.final_text_preview
          ?? state.text.trim(),
        model: settings.models[mode],
        voice: voiceLabel,
        createdAt: Date.now(),
      }
    } catch (error) {
      if (controller.signal.aborted) {
        app.notify(t('errors.cancelled'), 'info')
      } else {
        console.error('Audio generation error:', error)
        app.notify(error instanceof Error && error.message ? error.message : t('errors.generateFailed'))
      }
    } finally {
      state.loading = false
      controllers.delete(mode)
    }
  }

  function cancel (mode: AudioMode) {
    controllers.get(mode)?.abort()
  }

  function applyExample (mode: AudioMode) {
    const t = i18n.global.t
    const state = modes[mode]
    state.text = t(`examples.${mode}.text`)
    if (mode === 'voice-design') {
      state.description = t('examples.voice-design.description')
    }
  }

  return { modes, canGenerate, generate, cancel, clearResult, applyExample }
})
