import { createApp } from 'vue'
import './style.css'
import './styles/global.scss'
import App from './App.vue'
import router from './router'

// 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 创建Vue应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 使用 Element Plus
app.use(ElementPlus)

// 挂载应用
app.mount('#app')
