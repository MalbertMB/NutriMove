import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import '@/assets/css/base.css'
import '@/assets/css/animations.css'
import '@/assets/css/a11y.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
