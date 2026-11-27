<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { keymap } from '@codemirror/view'
import { defaultTabBinding } from '@codemirror/commands'
import { oneDark } from '@codemirror/theme-one-dark'
import { automergeSyncPlugin } from '@automerge/automerge-codemirror'
import { Repo, type DocHandle } from '@automerge/automerge-repo'
import { WebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'

// Estado del componente
const editor = ref<HTMLDivElement>(null)
const view = ref<EditorView | null>(null)
let repo: Repo | null = null
let docHandle: DocHandle<{ text: string }> | null = null

// Obtener el docId de la URL
function getDocIdFromUrl(): string {
  const path = window.location.pathname
  // Ejemplo: /doc/abc123
  const match = path.match(/\/doc\/(.+)/)
  return match ? match[1] : ''
}

// Construir la URL del servidor WebSocket
// Usa wss:// si la página está en https, sino ws://
function getServerUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  return `${protocol}//${host}:3001`
}

// Inicializar el editor
async function initEditor() {
  const docId = getDocIdFromUrl()
  if (!docId) {
    console.error('No docId found in URL')
    return
  }

  // Construir la URL del servidor WebSocket
  const wsUrl = getServerUrl()
  console.log('Conectando a:', wsUrl)

  // Crear el repositorio con el WebSocket como network
  // El Repo manejará la sincronización automáticamente
  repo = new Repo({
    // Conectarnos al servidor WebSocket
    network: [
      new WebSocketClientAdapter(wsUrl)
    ]
  })

  // Obtener o crear el documento
  docHandle = await repo.getOrCreate(docId, () => ({
    text: ''
  }))

  // Crear el editor de CodeMirror
  const newView = new EditorView({
    doc: docHandle.doc().text,
    extensions: [
      basicSetup,
      oneDark,
      keymap.of([defaultTabBinding]),
      // Plugin de sincronización Automerge
      automergeSyncPlugin({
        handle: docHandle,
        path: ['text'],
      }),
    ],
    parent: editor.value!
  })

  view.value = newView

  // Log cuando el documento cambia
  docHandle.on('changes', () => {
    console.log('Documento actualizado')
  })
}

// Limpiar al desmontar
onUnmounted(() => {
  view.value?.destroy()
})

onMounted(() => {
  initEditor()
})
</script>

<template>
  <div ref="editor" class="editor-container"></div>
</template>

<style scoped>
.editor-container {
  width: 100%;
  height: 100vh;
  font-family: monospace;
}
</style>