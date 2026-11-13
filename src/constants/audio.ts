export type AudioMode = 'speech' | 'voice-design' | 'voice-clone'

export const AUDIO_MODES: AudioMode[] = ['speech', 'voice-design', 'voice-clone']

export const MODE_ICONS: Record<AudioMode, string> = {
  'speech': 'mdi-waveform',
  'voice-design': 'mdi-auto-fix',
  'voice-clone': 'mdi-content-copy',
}

export const DEFAULT_BASE_URL = 'https://api.xiaomimimo.com/v1'

export const DEFAULT_MODELS: Record<AudioMode, string> = {
  'speech': 'mimo-v2.5-tts',
  'voice-design': 'mimo-v2.5-tts-voicedesign',
  'voice-clone': 'mimo-v2.5-tts-voiceclone',
}

export const PRESET_VOICES = [
  { id: 'mimo_default', name: 'MiMo-默认' },
  { id: '冰糖', name: '冰糖' },
  { id: '茉莉', name: '茉莉' },
  { id: '苏打', name: '苏打' },
  { id: '白桦', name: '白桦' },
  { id: 'Mia', name: 'Mia' },
  { id: 'Chloe', name: 'Chloe' },
  { id: 'Milo', name: 'Milo' },
  { id: 'Dean', name: 'Dean' },
]

export const MAX_TEXT_LENGTH = 1024
export const MAX_VOICE_SAMPLE_BYTES = 10 * 1024 * 1024
