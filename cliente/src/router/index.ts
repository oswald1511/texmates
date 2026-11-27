import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import LatexEditor from '../components/LatexEditor.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/doc/:id', name: 'Editor', component: LatexEditor, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router