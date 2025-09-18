import { createApp, type App } from 'vue'
import CpnToast from '../components/CpnToast.vue'

// Toast消息类型
export type ToastType = 'success' | 'error' | 'info' | 'warning'

// Toast配置接口
export interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number
  closable?: boolean
}

// Toast实例接口
interface ToastInstance {
  id: string
  app: App
  container: HTMLElement
  close: () => void
}

// 全局Toast管理器
class ToastManager {
  private toasts: Map<string, ToastInstance> = new Map()
  private idCounter = 0

  // 显示Toast
  show(options: ToastOptions): string {
    const id = `toast-${++this.idCounter}`
    
    // 创建容器元素
    const container = document.createElement('div')
    document.body.appendChild(container)
    
    // 创建Vue应用实例
    const app = createApp(CpnToast, {
      ...options,
      onClose: () => this.remove(id)
    })
    
    // 挂载应用
    app.mount(container)
    
    // 存储Toast实例
    const toastInstance: ToastInstance = {
      id,
      app,
      container,
      close: () => this.remove(id)
    }
    
    this.toasts.set(id, toastInstance)
    
    return id
  }
  
  // 移除Toast
  remove(id: string): void {
    const toast = this.toasts.get(id)
    if (toast) {
      // 卸载Vue应用
      toast.app.unmount()
      
      // 移除DOM元素
      if (toast.container.parentNode) {
        toast.container.parentNode.removeChild(toast.container)
      }
      
      // 从Map中删除
      this.toasts.delete(id)
    }
  }
  
  // 清除所有Toast
  clear(): void {
    this.toasts.forEach((toast) => {
      this.remove(toast.id)
    })
  }
  
  // 成功提示
  success(message: string, duration = 3000): string {
    return this.show({
      message,
      type: 'success',
      duration
    })
  }
  
  // 错误提示
  error(message: string, duration = 5000): string {
    return this.show({
      message,
      type: 'error',
      duration
    })
  }
  
  // 信息提示
  info(message: string, duration = 3000): string {
    return this.show({
      message,
      type: 'info',
      duration
    })
  }
  
  // 警告提示
  warning(message: string, duration = 4000): string {
    return this.show({
      message,
      type: 'warning',
      duration
    })
  }
}

// 创建全局Toast管理器实例
const toastManager = new ToastManager()

// 导出useToast Composable
export function useToast() {
  return {
    // 显示Toast
    show: (options: ToastOptions) => toastManager.show(options),
    
    // 移除Toast
    remove: (id: string) => toastManager.remove(id),
    
    // 清除所有Toast
    clear: () => toastManager.clear(),
    
    // 快捷方法
    success: (message: string, duration?: number) => toastManager.success(message, duration),
    error: (message: string, duration?: number) => toastManager.error(message, duration),
    info: (message: string, duration?: number) => toastManager.info(message, duration),
    warning: (message: string, duration?: number) => toastManager.warning(message, duration)
  }
}

// 导出全局Toast实例（用于在非组件中使用）
export const toast = {
  show: (options: ToastOptions) => toastManager.show(options),
  remove: (id: string) => toastManager.remove(id),
  clear: () => toastManager.clear(),
  success: (message: string, duration?: number) => toastManager.success(message, duration),
  error: (message: string, duration?: number) => toastManager.error(message, duration),
  info: (message: string, duration?: number) => toastManager.info(message, duration),
  warning: (message: string, duration?: number) => toastManager.warning(message, duration)
}

// 默认导出
export default useToast