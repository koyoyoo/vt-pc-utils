<template>
  <div class="loading-overlay" v-if="visible">
    <div class="loading-content">
      <div class="loading-spinner" :class="spinnerType">
        <div v-if="spinnerType === 'dots'" class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <div v-else-if="spinnerType === 'circle'" class="circle"></div>
        <div v-else-if="spinnerType === 'pulse'" class="pulse"></div>
        <div v-else class="default-spinner"></div>
      </div>
      <p v-if="message" class="loading-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件属性
interface Props {
  visible?: boolean
  message?: string
  spinnerType?: 'default' | 'dots' | 'circle' | 'pulse'
  overlay?: boolean
}

withDefaults(defineProps<Props>(), {
  visible: false,
  message: '加载中...',
  spinnerType: 'default',
  overlay: true
})
</script>

<style lang="scss" scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-heavy);
  max-width: 300px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  
  // 默认旋转动画
  &.default .default-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--bg-border);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  // 点状加载动画
  &.dots .dots {
    display: flex;
    gap: 8px;
    
    .dot {
      width: 12px;
      height: 12px;
      background: var(--primary-color);
      border-radius: 50%;
      animation: dotPulse 1.4s ease-in-out infinite both;
      
      &:nth-child(1) { animation-delay: -0.32s; }
      &:nth-child(2) { animation-delay: -0.16s; }
      &:nth-child(3) { animation-delay: 0s; }
    }
  }
  
  // 圆形加载动画
  &.circle .circle {
    width: 40px;
    height: 40px;
    border: 4px solid transparent;
    border-radius: 50%;
    background: conic-gradient(from 0deg, var(--primary-color), transparent);
    animation: circleRotate 1s linear infinite;
  }
  
  // 脉冲加载动画
  &.pulse .pulse {
    width: 40px;
    height: 40px;
    background: var(--primary-color);
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
  }
}

.loading-message {
  color: var(--text-secondary);
  font-size: var(--font-size-md);
  font-weight: 500;
  text-align: center;
  margin: 0;
}

// 动画定义
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes circleRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .loading-content {
    max-width: 250px;
    padding: var(--spacing-lg);
  }
  
  .loading-message {
    font-size: var(--font-size-sm);
  }
}
</style>