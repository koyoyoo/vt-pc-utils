<template>
  <Teleport to="body">
    <Transition name="toast" appear>
      <div 
        v-if="visible" 
        class="toast" 
        :class="`toast-${type}`"
        @click="close"
      >
        <div class="toast-content">
          <span class="toast-icon">{{ getIcon() }}</span>
          <span class="toast-message">{{ message }}</span>
          <button class="toast-close" @click.stop="close">×</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 定义组件属性
interface Props {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 3000,
  closable: true
})

// 定义事件
const emit = defineEmits<{
  close: []
}>()

// 响应式数据
const visible = ref(true)
let timer: NodeJS.Timeout | null = null

// 获取图标
const getIcon = (): string => {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  }
  return icons[props.type]
}

// 关闭提示
const close = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  emit('close')
}

// 组件挂载时设置自动关闭
onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style lang="scss" scoped>
.toast {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  min-width: 300px;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-heavy);
  cursor: pointer;
  
  &.toast-success {
    background: var(--success-gradient);
    color: var(--text-white);
  }
  
  &.toast-error {
    background: var(--error-gradient);
    color: var(--text-white);
  }
  
  &.toast-info {
    background: var(--primary-gradient);
    color: var(--text-white);
  }
  
  &.toast-warning {
    background: var(--warning-gradient);
    color: var(--text-primary);
  }
}

.toast-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
}

.toast-icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-weight: 500;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: var(--font-size-xl);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

// 动画效果
.toast-enter-active,
.toast-leave-active {
  transition: all var(--transition-normal);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

// 响应式设计
@media (max-width: 768px) {
  .toast {
    right: var(--spacing-md);
    left: var(--spacing-md);
    min-width: auto;
    max-width: none;
  }
}
</style>