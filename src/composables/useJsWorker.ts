import { ref, onUnmounted, readonly } from "vue";
import {
  createJsWorker,
  processJsSmart,
  calculateJsStats,
  cleanupJsWorker,
  type JsOperation,
  type JsProcessResult,
  type JsStats,
} from "@/utils/jsCompressor/jsWorker";

/**
 * JavaScript Worker Hooks
 * 封装 JavaScript Web Worker 相关逻辑，提供 JavaScript 代码处理功能
 */
export function useJsWorker() {
  // Worker 实例
  const worker = ref<Worker | null>(null);

  // 处理状态
  const isProcessing = ref(false);

  // Worker 是否已准备就绪
  const isReady = ref(false);

  /**
   * 初始化 Worker
   */
  const initWorker = (): void => {
    if (!worker.value) {
      try {
        worker.value = createJsWorker();
        isReady.value = true;
      } catch (error) {
        console.error("JavaScript Worker 初始化失败:", error);
        isReady.value = false;
      }
    }
  };

  /**
   * 处理 JavaScript 代码
   * @param inputJs 输入的 JavaScript 代码字符串
   * @param operation 操作类型
   * @returns 处理结果
   */
  const processJs = async (
    inputJs: string,
    operation: JsOperation
  ): Promise<JsProcessResult> => {
    if (!inputJs.trim()) {
      return {
        success: false,
        error: "请输入JavaScript代码",
        processingTime: 0,
      };
    }

    // 设置处理状态
    isProcessing.value = true;

    try {
      // 确保 Worker 已初始化
      initWorker();

      // 使用智能处理函数
      const result = await processJsSmart(
        inputJs,
        operation,
        worker.value || undefined
      );

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "处理失败",
        processingTime: 0,
      };
    } finally {
      isProcessing.value = false;
    }
  };

  /**
   * 计算 JavaScript 代码统计信息
   * @param originalJs 原始 JavaScript 代码字符串
   * @param processedJs 处理后的 JavaScript 代码字符串
   * @param processingTime 处理时间
   * @returns 统计信息
   */
  const getJsStats = (
    originalJs: string,
    processedJs: string,
    processingTime: number
  ): JsStats => {
    return calculateJsStats(originalJs, processedJs, processingTime);
  };

  /**
   * 清理 Worker 资源
   */
  const cleanup = (): void => {
    if (worker.value) {
      cleanupJsWorker(worker.value);
      worker.value = null;
      isReady.value = false;
    }
  };

  /**
   * 重置 Worker
   */
  const resetWorker = (): void => {
    cleanup();
    initWorker();
  };

  // 组件卸载时自动清理
  onUnmounted(() => {
    cleanup();
  });

  return {
    // 只读状态
    worker: readonly(worker),
    isProcessing: readonly(isProcessing),
    isReady: readonly(isReady),

    // 方法
    initWorker,
    processJs,
    getJsStats,
    cleanup,
    resetWorker,
  };
}

// 导出类型
export type { JsOperation, JsProcessResult, JsStats };