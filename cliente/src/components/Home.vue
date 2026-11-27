<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const docId = ref('')

// Crear un ID aleatorio para el documento
function generarDocId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Navegar al editor
function irAlEditor() {
  if (docId.value.trim()) {
    router.push(`/doc/${docId.value.trim()}`)
  }
}

// Crear nuevo documento
function crearNuevoDocumento() {
  const id = generarDocId()
  docId.value = id
  router.push(`/doc/${id}`)
}
</script>

<template>
  <div class="home-container">
    <h1>Texmates - Editor LaTeX Colaborativo</h1>
    
    <div class="card">
      <h3>Crear nuevo documento</h3>
      <button @click="crearNuevoDocumento">Crear documento</button>
      
      <div class="or-divider">o</div>
      
      <h4>Unirse a documento existente</h4>
      <input 
        v-model="docId" 
        type="text" 
        placeholder="ID del documento"
        @keyup.enter="irAlEditor"
      />
      <button @click="irAlEditor">Unirse</button>
    </div>
    
    <p class="note">Compartí el link para que otros colaboren</p>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 600px;
  margin: 100px auto;
  padding: 20px;
  text-align: center;
}

.card {
  background: #282c34;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1, h3, h4 {
  color: #ffffff;
  margin-bottom: 16px;
}

button {
  background: #61dafb;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  margin: 5px;
}

button:hover {
  background: #2181c9;
}

input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  border: 1px solid #444;
  background: #1a1a1a;
  color: #ffffff;
}

.or-divider {
  color: #888;
  margin: 20px 0;
  font-weight: bold;
}

.note {
  color: #888;
  margin-top: 30px;
  font-size: 14px;
}
</style>