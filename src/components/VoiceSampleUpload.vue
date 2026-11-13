<template>
  <div>
    <div class="field-label">
      {{ t('form.cloneAudio') }} <span class="required-mark">*</span>
    </div>

    <div
      v-if="!state.sample"
      class="upload-zone"
      :class="{ 'upload-zone--active': dragging, 'upload-zone--busy': reading }"
      role="button"
      :tabindex="reading ? -1 : 0"
      @click="openPicker"
      @dragenter.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @dragover.prevent="dragging = true"
      @drop.prevent="onDrop"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
    >
      <v-progress-linear v-if="reading" class="upload-progress" color="voice-clone" indeterminate />

      <v-avatar color="voice-clone" rounded="lg" size="44" variant="tonal">
        <v-icon icon="mdi-music-box-plus-outline" size="24" />
      </v-avatar>

      <div class="text-sm font-medium">{{ t('form.uploadAudio') }}</div>
      <p class="upload-hint text-xs opacity-60">{{ t('form.uploadHint') }}</p>

      <input
        ref="fileInput"
        accept=".mp3,.wav,audio/mpeg,audio/wav,audio/x-wav"
        class="hidden"
        type="file"
        @change="onPick"
      >
    </div>

    <div v-else class="sample-card">
      <div class="flex items-center gap-3">
        <v-avatar color="voice-clone" rounded="lg" size="40" variant="tonal">
          <v-icon icon="mdi-file-music-outline" size="22" />
        </v-avatar>

        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium">{{ state.sample.name }}</div>
          <div class="font-mono text-xs opacity-60">{{ formattedSize }}</div>
        </div>

        <v-btn
          :aria-label="t('form.removeAudio')"
          icon="mdi-delete-outline"
          size="small"
          variant="text"
          @click="removeSample"
        >
          <v-tooltip activator="parent" location="bottom">{{ t('form.removeAudio') }}</v-tooltip>
        </v-btn>
      </div>

      <div class="mt-3">
        <div class="field-label">{{ t('form.samplePreview') }}</div>
        <audio class="sample-audio" controls :src="state.sample.dataUrl" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { MAX_VOICE_SAMPLE_BYTES } from '@/constants/audio'
  import { useAppStore } from '@/stores/app'
  import { useStudioStore } from '@/stores/studio'

  const SUPPORTED_TYPES = new Set(['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave'])

  const { t } = useI18n()
  const app = useAppStore()
  const studio = useStudioStore()

  const state = computed(() => studio.modes['voice-clone'])
  const fileInput = ref<HTMLInputElement | null>(null)
  const dragging = ref(false)
  const reading = ref(false)

  const formattedSize = computed(() => {
    const sample = state.value.sample
    if (!sample) {
      return ''
    }
    return sample.size >= 1024 * 1024
      ? `${(sample.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.max(1, Math.round(sample.size / 1024))} KB`
  })

  function isSupported (file: File): boolean {
    return SUPPORTED_TYPES.has(file.type) || /\.(?:mp3|wav)$/i.test(file.name)
  }

  function readAsDataUrl (file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error(t('errors.readFileFailed')))
        }
      })
      reader.addEventListener('error', () => reject(new Error(t('errors.readFileFailed'))))
      reader.readAsDataURL(file)
    })
  }

  async function handleFile (file: File | undefined) {
    if (!file || reading.value) {
      return
    }
    if (!isSupported(file)) {
      app.notify(t('errors.onlyMp3Wav'))
      return
    }
    if (file.size > MAX_VOICE_SAMPLE_BYTES) {
      app.notify(t('errors.sampleTooLarge'))
      return
    }

    reading.value = true
    try {
      const dataUrl = await readAsDataUrl(file)
      if (dataUrl.length > MAX_VOICE_SAMPLE_BYTES) {
        app.notify(t('errors.base64TooLarge'))
        return
      }
      state.value.sample = { name: file.name, dataUrl, size: file.size }
    } catch (error) {
      app.notify(error instanceof Error && error.message ? error.message : t('errors.readFileFailed'))
    } finally {
      reading.value = false
    }
  }

  function openPicker () {
    if (!reading.value) {
      fileInput.value?.click()
    }
  }

  function onPick () {
    const input = fileInput.value
    if (!input) {
      return
    }
    void handleFile(input.files?.[0])
    input.value = ''
  }

  function onDrop (event: DragEvent) {
    dragging.value = false
    void handleFile(event.dataTransfer?.files?.[0])
  }

  function removeSample () {
    state.value.sample = null
  }
</script>

<style scoped>
  .upload-zone {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 28px 20px;
    border: 1.5px dashed rgba(var(--v-theme-voice-clone), 0.45);
    border-radius: 16px;
    background: rgba(var(--v-theme-voice-clone), 0.05);
    cursor: pointer;
    overflow: hidden;
    text-align: center;
    transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
  }

  .upload-zone:hover,
  .upload-zone:focus-visible,
  .upload-zone--active {
    border-color: rgba(var(--v-theme-voice-clone), 0.9);
    background: rgba(var(--v-theme-voice-clone), 0.1);
  }

  .upload-zone--active {
    transform: scale(1.01);
  }

  .upload-zone--busy {
    cursor: progress;
  }

  .upload-progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .upload-hint {
    max-width: 360px;
    line-height: 1.6;
  }

  .sample-card {
    padding: 16px;
    border: 1px solid rgba(var(--v-theme-voice-clone), 0.3);
    border-radius: 16px;
    background: rgba(var(--v-theme-voice-clone), 0.05);
  }

  .sample-audio {
    width: 100%;
    height: 40px;
  }
</style>
