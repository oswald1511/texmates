<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { indentWithTab } from '@codemirror/commands'
import { EditorState } from '@codemirror/state'
import { Repo, type DocHandle as RepoDocHandle } from '@automerge/automerge-repo'
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'
import { automergeSyncPlugin } from '@automerge/automerge-codemirror'
import type { DocHandle } from '@automerge/automerge-codemirror'

// Tipo para el documento
type DocData = {
  text: string
}

// Estado del componente
const editor = ref<HTMLDivElement>(null)
const view = ref<EditorView | null>(null)
const docId = ref<string>('')

let repo: Repo | null = null
let docHandle: RepoDocHandle<DocData> | null = null

// Función para convertir un DocHandle de automerge-repo 1.0 al formato que espera el plugin
function makeHandle<T>(h: RepoDocHandle<T>): DocHandle<T> {
  return Object.assign({}, h, {
    doc: () => h.docSync(),
  }) as DocHandle<T>
}

// Obtener el docId de la URL
function getDocIdFromUrl(): string {
  const path = window.location.pathname
  const match = path.match(/\/doc\/(.+)/)
  return match ? match[1] : ''
}

// Crear un estado inicial del editor
function createInitialState(text: string): EditorState {
  return EditorState.create({
    doc: text,
    extensions: [
      basicSetup,
      oneDark,
      indentWithTab,
    ]
  })
}

// Inicializar el editor
async function initEditor() {
  const id = getDocIdFromUrl()
  console.log('docId:', id)
  
  if (!id) {
    console.error('No docId found in URL')
    return
  }
  
  docId.value = id

  // Crear el repositorio con WebSocket network adapter
  console.log('Creando Repo con WebSocket...')
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}:3001`
  console.log('WebSocket URL:', wsUrl)
  
  repo = new Repo({
    network: [
      new BrowserWebSocketClientAdapter(wsUrl)
    ]
  })

  // Buscar el documento existente
  try {
    docHandle = await repo.find<DocData>(id)
    console.log('Documento encontrado:', docHandle.docSync()?.text)
  } catch (e) {
    // Si no existe, creamos uno nuevo con un ID generado
    docHandle = repo.create<DocData>({ text: '# ' + id + '\n\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}' })
    console.log('Documento creado con nuevo ID:', docHandle.url)
  }

  // Convertir el handle al formato que espera el plugin
  const codemirrorHandle = makeHandle(docHandle)

  // Crear el estado inicial del editor
  const state = createInitialState(docHandle.docSync().text)

  const newView = new EditorView({
    state,
    parent: editor.value!,
    extensions: [
      automergeSyncPlugin({
        handle: codemirrorHandle,
        path: [],
      }),
    ],
  })

  view.value = newView

  // Sincronizar el documento con el editor (cuando cambia el documento, actualizar el editor)
  docHandle!.on('change', (payload) => {
    console.log('Documento actualizado')
    const newText = payload.doc.text
    // Actualizar el editor
    if (view.value) {
      view.value.dispatch({
        changes: { from: 0, to: view.value.state.doc.length, insert: newText }
      })
    }
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
  <div ref="editor" class="editor-container">
    <div style="position: absolute; top: 10px; left: 10px; color: yellow; z-index: 100;">
      Documento: {{ docId }}
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  width: 100%;
  height: 100vh;
  font-family: monospace;
}
</style>