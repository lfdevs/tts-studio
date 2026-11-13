import i18n from '@/plugins/i18n'

export interface AudioChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface GenerateAudioParams {
  baseUrl: string
  apiKey: string
  model: string
  messages: AudioChatMessage[]
  audio: { format: 'wav', voice?: string }
  signal?: AbortSignal
}

export interface AudioChatResponse {
  choices?: {
    message?: {
      audio?: { data?: string }
      final_text_preview?: string
    }
    final_text_preview?: string
  }[]
}

interface ApiErrorBody {
  error?: { message?: string }
  message?: string
  detail?: string | { msg?: string }[]
}

export async function generateAudio (params: GenerateAudioParams): Promise<AudioChatResponse> {
  const endpoint = `${params.baseUrl.replace(/\/+$/, '')}/chat/completions`

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        audio: params.audio,
        stream: false,
      }),
      signal: params.signal,
    })
  } catch (error) {
    if (params.signal?.aborted) {
      throw error
    }
    throw new Error(i18n.global.t('errors.network'), { cause: error })
  }

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`
    try {
      const data = await response.json() as ApiErrorBody
      const detail = typeof data.detail === 'string' ? data.detail : data.detail?.[0]?.msg
      message = data.error?.message ?? detail ?? data.message ?? message
    } catch {
      // Keep the HTTP status message when the body is not JSON.
    }
    throw new Error(message)
  }

  return await response.json() as AudioChatResponse
}

export function createAudioUrl (base64: string): string {
  let data = base64
  if (data.startsWith('data:')) {
    data = data.slice(data.indexOf(',') + 1)
  }

  const binary = atob(data.replace(/\s/g, ''))
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.codePointAt(index) ?? 0
  }

  return URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }))
}
