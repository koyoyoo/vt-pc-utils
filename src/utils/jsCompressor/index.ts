/**
 * JSON压缩处理工具模块
 */

/**
 * JSON处理操作类型
 */
export type JsonOperation = 'compress' | 'format' | 'validate';

/**
 * JSON处理结果接口
 */
export interface JsonProcessResult {
  success: boolean;
  result?: string;
  error?: string;
  processingTime: number;
}

/**
 * 统计信息接口
 */
export interface JsonStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  processingTime: number;
}

/**
 * 创建Web Worker用于处理大型JSON文件
 * @returns Worker实例
 */
export const createJsonWorker = (): Worker => {
  const workerCode = `
    self.onmessage = function(e) {
      const { type, data } = e.data;
      const startTime = performance.now();
      
      try {
        let result;
        
        switch(type) {
          case 'compress':
            result = JSON.stringify(JSON.parse(data));
            break;
          case 'format':
            result = JSON.stringify(JSON.parse(data), null, 2);
            break;
          case 'validate':
            JSON.parse(data); // 验证JSON格式
            result = 'JSON格式验证通过！';
            break;
          default:
            throw new Error('未知操作类型');
        }
        
        const endTime = performance.now();
        self.postMessage({
          success: true,
          result,
          processingTime: Math.round(endTime - startTime)
        });
      } catch (error) {
        const endTime = performance.now();
        self.postMessage({
          success: false,
          error: error.message,
          processingTime: Math.round(endTime - startTime)
        });
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};

/**
 * 同步处理JSON数据（适用于小文件）
 * @param data - JSON字符串
 * @param operation - 操作类型
 * @returns Promise<JsonProcessResult> - 处理结果
 */
export const processJsonSync = async (
  data: string,
  operation: JsonOperation
): Promise<JsonProcessResult> => {
  const startTime = performance.now();

  try {
    let result: string;

    switch (operation) {
      case 'compress':
        result = JSON.stringify(JSON.parse(data));
        break;
      case 'format':
        result = JSON.stringify(JSON.parse(data), null, 2);
        break;
      case 'validate':
        JSON.parse(data);
        result = 'JSON格式验证通过！';
        break;
      default:
        throw new Error('未知操作类型');
    }

    const endTime = performance.now();
    return {
      success: true,
      result,
      processingTime: Math.round(endTime - startTime),
    };
  } catch (error: any) {
    const endTime = performance.now();
    return {
      success: false,
      error: error.message,
      processingTime: Math.round(endTime - startTime),
    };
  }
};

/**
 * 使用Web Worker异步处理JSON数据（适用于大文件）
 * @param data - JSON字符串
 * @param operation - 操作类型
 * @param worker - Worker实例
 * @returns Promise<JsonProcessResult> - 处理结果
 */
export const processJsonAsync = (
  data: string,
  operation: JsonOperation,
  worker: Worker
): Promise<JsonProcessResult> => {
  return new Promise((resolve) => {
    worker.postMessage({ type: operation, data });

    worker.onmessage = (e) => {
      resolve(e.data);
    };
  });
};

/**
 * 智能选择处理方式（根据数据大小自动选择同步或异步处理）
 * @param data - JSON字符串
 * @param operation - 操作类型
 * @param worker - Worker实例（可选）
 * @param threshold - 大文件阈值，默认50000字符
 * @returns Promise<JsonProcessResult> - 处理结果
 */
export const processJsonSmart = async (
  data: string,
  operation: JsonOperation,
  worker?: Worker,
  threshold: number = 50000
): Promise<JsonProcessResult> => {
  if (data.length > threshold && worker) {
    return processJsonAsync(data, operation, worker);
  } else {
    return processJsonSync(data, operation);
  }
};

/**
 * 计算JSON统计信息
 * @param original - 原始JSON字符串
 * @param processed - 处理后的JSON字符串
 * @param processingTime - 处理时间
 * @returns JsonStats - 统计信息
 */
export const calculateJsonStats = (
  original: string,
  processed: string,
  processingTime: number
): JsonStats => {
  const originalSize = new Blob([original]).size;
  const compressedSize = new Blob([processed]).size;
  const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);

  return {
    originalSize,
    compressedSize,
    compressionRatio,
    processingTime,
  };
};

/**
 * 格式化字节大小
 * @param bytes - 字节数
 * @returns string - 格式化后的大小字符串
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 验证JSON格式
 * @param data - JSON字符串
 * @returns boolean - 是否为有效JSON
 */
export const isValidJson = (data: string): boolean => {
  try {
    JSON.parse(data);
    return true;
  } catch {
    return false;
  }
};

/**
 * 清理Worker资源
 * @param worker - Worker实例
 */
export const cleanupWorker = (worker: Worker | null): void => {
  if (worker) {
    worker.terminate();
  }
};