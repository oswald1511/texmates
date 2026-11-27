import { Repo, type Doc } from '@automerge/automerge-repo'
import { NodeFSStorageAdapter } from '@automerge/automerge-repo-storage-nodefs'
import { NodeWSServerAdapter } from '@automerge/automerge-repo-network-websocket'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'

// Crear el almacenamiento en disco
const storageAdapter = new NodeFSStorageAdapter()

// Crear el repositorio de Automerge
const repo = new Repo({
  // Configuración del almacén local
  storage: storageAdapter,
  // Habilitar el historial de cambios
  // (Automerge guarda el historial por defecto)
})

// Servidor WebSocket para la red de Automerge
const wss = new NodeWSServerAdapter({ repo })

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
  // Pasar la solicitud al adaptador WebSocket de Automerge
  wss.handleUpgrade(request, socket, head, (client) => {
    wss.emit('connection', client, request)
  })
})

// Puerto en el que escuchará el servidor
const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Servidor Automerge escuchando en el puerto ${PORT}`)
})

// Exportar para testing
export { repo, wss }