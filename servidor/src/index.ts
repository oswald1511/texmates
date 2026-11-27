import { Repo, type Doc } from '@automerge/automerge-repo'
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

// Crear el repositorio de Automerge
const repo = new Repo({
  // Configuración del almacén local
  storage: storageAdapter,
  // Habilitar el historial de cambios
  // (Automerge guarda el historial por defecto)
})

// Servidor WebSocket para la red de Automerge
const wss = new NodeWSServerAdapter({ repo })

// Log cuando se conecta un cliente
wss.on('client-message', (message) => {
  console.log('Mensaje del cliente:', message.type)
})

// Servidor HTTP para manejar conexiones WebSocket
const httpServer = createServer()

// Manejar las solicitudes HTTP para servir archivos estáticos del cliente
httpServer.on('request', (req, res) => {
  // Permitir CORS para todas las rutas
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }
  
  // Servir archivos estáticos desde la carpeta cliente/dist
  const url = req.url || '/'
  let filePath = './cliente/dist' + url
  
  // Si es la raíz, servir index.html
  if (url === '/' || url === '/index.html') {
    filePath = './cliente/dist/index.html'
  }
  
  // TODO: servir el archivo si existe
  // Por ahora, solo manejamos WebSocket
})

// Upgrade de HTTP a WebSocket
httpServer.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`)
  console.log('Conexión WebSocket desde:', request.socket.remoteAddress)
  console.log('Path:', url.pathname)
  
  // Pasar la solicitud al adaptador WebSocket de Automerge
  wss.handleUpgrade(request, socket, head, (client) => {
    console.log('Cliente conectado')
    wss.emit('connection', client, request)
    
    client.on('close', () => {
      console.log('Cliente desconectado')
    })
  })
})

// Puerto en el que escuchará el servidor
const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Servidor Automerge escuchando en el puerto ${PORT}`)
})

// Exportar para testing
export { repo, wss }