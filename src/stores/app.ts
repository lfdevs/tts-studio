import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SnackbarColor = 'success' | 'error' | 'info' | 'warning'

export const useAppStore = defineStore('app', () => {
  const settingsOpen = ref(false)
  const snackbar = ref({ show: false, text: '', color: 'error' as SnackbarColor })

  function notify (text: string, color: SnackbarColor = 'error') {
    snackbar.value = { show: true, text, color }
  }

  function openSettings () {
    settingsOpen.value = true
  }

  return { settingsOpen, snackbar, notify, openSettings }
})
