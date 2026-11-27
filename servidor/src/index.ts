import { Repo } from '@automerge/automerge-repo'
import { NodeFSStorageAdapter } from '@automerge/automerge-repo-storage-nodefs'
import { NodeWSServerAdapter } from '@automerge/automerge-repo-network-websocket'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Obtener el directorio del archivo actual
const __dirname = dirname(fileURLToPath(import.meta.url))

// Crear el almacenamiento en disco
// Los archivos se guardarán en automerge-repo-data/ dentro del directorio del servidor
const dataDir = join(__dirname, '..', 'automerge-repo-data')
console.log('Almacenamiento en:', dataDir)

const storageAdapter = new NodeFSStorageAdapter(dataDir)

// Puerto en el que escuchará el servidor
const PORT = process.env.PORT || 3001

// Crear el repositorio de Automerge
const repo = new Repo({
  // Configuración del almacén local
  storage: storageAdapter,
  // Adaptador de red WebSocket
  network: [],
})

// Servidor WebSocket para la red de Automerge
const wss = new NodeWSServerAdapter(new WebSocketServer({ port: PORT }))

// Agregar el adaptador de red al repo
repo.networkSubsystem.addNetworkAdapter(wss)

// Log cuando se conecta un cliente
wss.on('client-message', (message) => {
  console.log('Mensaje del cliente:', message.type)
})

console.log(`Servidor Automerge escuchando en el puerto ${PORT}`)

// Exportar para testing
export { repo, wss }