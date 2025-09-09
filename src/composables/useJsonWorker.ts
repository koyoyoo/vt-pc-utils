import { ref, onUnmounted, readonly } from 'vue'
import {
  createJsonWorker,
  processJsonSmart,
  calculateJsonStats,
  cleanupWorker,
  type JsonOperation,
  type JsonProcessResult,
  type JsonStats
} from '@/utils/jsCompressor'

/**
 * JSON Worker Hooks
 * 封装 Web Worker 相关逻辑，提供 JSON 处理功能
 */
export function useJsonWorker() {
  // Worker 实例
  const worker = ref<Worker | null>(null)
  
  // 处理状态
  const isProcessing = ref(false)
  
  // Worker 是否已准备就绪
  const isReady = ref(false)

  /**
   * 初始化 Worker
   */
  const initWorker = (): void => {
    if (!worker.value) {
      try {
        worker.value = createJsonWorker()
        isReady.value = true
      } catch (error) {
        console.error('Worker 初始化失败:', error)
        isReady.value = false
      }
    }
  }

  /**
   * 处理 JSON 数据
   * @param inputJson 输入的 JSON 字符串
   * @param operation 操作类型
   * @returns 处理结果
   */
  const processJson = async (
    inputJson: string,
    operation: JsonOperation
  ): Promise<JsonProcessResult> => {
    if (!inputJson.trim()) {
      return {
        success: false,
        error: '请输入JSON数据',
        processingTime: 0
      }
    }

    // 设置处理状态
    isProcessing.value = true

    try {
      // 确保 Worker 已初始化
      initWorker()

      // 使用智能处理函数
      const result = await processJsonSmart(
        inputJson,
        operation,
        worker.value || undefined
      )

      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '处理失败',
        processingTime: 0
      }
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 计算 JSON 统计信息
   * @param originalJson 原始 JSON 字符串
   * @param processedJson 处理后的 JSON 字符串
   * @param processingTime 处理时间
   * @returns 统计信息
   */
  const getJsonStats = (
    originalJson: string,
    processedJson: string,
    processingTime: number
  ): JsonStats => {
    return calculateJsonStats(originalJson, processedJson, processingTime)
  }

  /**
   * 清理 Worker 资源
   */
  const cleanup = (): void => {
    if (worker.value) {
      cleanupWorker(worker.value)
      worker.value = null
      isReady.value = false
    }
  }

  /**
   * 重置 Worker
   */
  const resetWorker = (): void => {
    cleanup()
    initWorker()
  }

  // 组件卸载时自动清理
  onUnmounted(() => {
    cleanup()
  })

  return {
    // 只读状态
    worker: readonly(worker),
    isProcessing: readonly(isProcessing),
    isReady: readonly(isReady),
    
    // 方法
    initWorker,
    processJson,
    getJsonStats,
    cleanup,
    resetWorker
  }
}

// 导出类型
export type { JsonOperation, JsonProcessResult, JsonStats }