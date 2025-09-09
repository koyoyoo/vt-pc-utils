<template>
  <button
    :class="['btn', `btn-${type}`, { 'btn-loading': loading }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- 加载动画 -->
    <span v-if="loading" class="spinner"></span>
    <!-- 图标 -->
    <span v-if="icon && !loading" class="btn-icon">{{ icon }}</span>
    <!-- 按钮文本 -->
    <span class="btn-text">{{ text }}</span>
  </button>
</template>

<script setup lang="ts">
// 定义按钮类型
type ButtonType = 'compress' | 'format' | 'validate' | 'clear' | 'load' | 'download' | 'primary' | 'default'

// 定义组件属性
interface Props {
  type?: ButtonType // 按钮类型
  text: string // 按钮文本
  icon?: string // 按钮图标
  disabled?: boolean // 是否禁用
  loading?: boolean // 是否加载中
}

// 定义事件
interface Emits {
  click: [event: MouseEvent] // 点击事件
}

// 接收属性
const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  disabled: false,
  loading: false
})

// 定义事件
const emit = defineEmits<Emits>()

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  justify-content: center;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  // 压缩按钮样式
  &.btn-compress {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
  }

  // 格式化按钮样式
  &.btn-format {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(17, 153, 142, 0.3);
    }
  }

  // 验证按钮样式
  &.btn-validate {
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    color: #333;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(252, 182, 159, 0.3);
    }
  }

  // 清空按钮样式
  &.btn-clear {
    background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
    }
  }

  // 加载按钮样式
  &.btn-load {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    color: #333;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(168, 237, 234, 0.3);
    }
  }

  // 下载按钮样式
  &.btn-download {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
  }

  // 主要按钮样式
  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
  }

  // 默认按钮样式
  &.btn-default {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    color: #333;
    border: 1px solid #dee2e6;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
  }
}

// 加载动画
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

// 旋转动画
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 按钮图标
.btn-icon {
  font-size: 1.1em;
}

// 按钮文本
.btn-text {
  white-space: nowrap;
}
</style>