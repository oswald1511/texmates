<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { EditorView, basicSetup } from '@codemirror/view'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { oneDark } from '@codemirror/theme-one-dark'
import { Repo, type DocHandle } from '@automerge/automerge-repo'

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

// Inicializar el editor
async function initEditor() {
  const docId = getDocIdFromUrl()
  if (!docId) {
    console.error('No docId found in URL')
    return
  }

  console.log('Inicializando editor para:', docId)

  // Crear el repositorio (sin WebSocket por ahora - solo local)
  repo = new Repo()

  // Obtener o crear el documento
  docHandle = await repo.getOrCreate(docId, () => ({
    text: 'Hello World!'
  }))

  // Obtener el texto del documento
  const doc = docHandle.doc()
  console.log('Documento cargado:', doc.text)

  // Crear el editor de CodeMirror
  const newView = new EditorView({
    state: EditorState.create({
      doc: doc.text,
      extensions: [
        basicSetup,
        oneDark,
        keymap.of([indentWithTab]),
      ]
    }),
    parent: editor.value!
  })

  view.value = newView

  // Log cuando el documento cambia
  docHandle.on('changes', () => {
    console.log('Documento actualizado')
    console.log('Nuevo texto:', docHandle.doc().text)
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