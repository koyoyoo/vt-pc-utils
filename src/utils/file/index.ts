/**
 * 文件处理工具函数
 */

// 文件读取结果接口
export interface FileReadResult {
  success: boolean;
  content?: string;
  error?: string;
  fileName?: string;
}

// 文件读取选项接口
export interface FileReadOptions {
  acceptedTypes?: string[]; // 接受的文件类型
  maxSize?: number; // 最大文件大小（字节）
  encoding?: string; // 文件编码，默认为UTF-8
}

/**
 * 读取文件内容
 * @param file 要读取的文件对象
 * @param options 读取选项
 * @returns Promise<FileReadResult> 读取结果
 */
export function readFileContent(
  file: File,
  options: FileReadOptions = {}
): Promise<FileReadResult> {
  return new Promise((resolve) => {
    const {
      acceptedTypes = ['.json', '.txt'],
      maxSize = 10 * 1024 * 1024, // 默认10MB
      encoding = 'UTF-8'
    } = options;

    // 检查文件类型
    // const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = acceptedTypes.some(type => 
      file.type === getContentType(type) || 
      file.name.toLowerCase().endsWith(type)
    );

    if (!isValidType) {
      resolve({
        success: false,
        error: `不支持的文件类型，仅支持: ${acceptedTypes.join(', ')}`,
        fileName: file.name
      });
      return;
    }

    // 检查文件大小
    if (file.size > maxSize) {
      resolve({
        success: false,
        error: `文件过大，最大支持 ${formatBytes(maxSize)}`,
        fileName: file.name
      });
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve({
        success: true,
        content,
        fileName: file.name
      });
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: '文件读取失败',
        fileName: file.name
      });
    };

    reader.readAsText(file, encoding);
  });
}

/**
 * 处理文件选择事件
 * @param event 文件选择事件
 * @param callback 处理回调函数
 * @param options 读取选项
 */
export async function handleFileSelect(
  event: Event,
  callback: (result: FileReadResult) => void,
  options: FileReadOptions = {}
) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const result = await readFileContent(file, options);
    callback(result);
  }
  
  // 清空input值，允许重复选择同一文件
  target.value = '';
}

/**
 * 处理拖拽放置事件
 * @param event 拖拽事件
 * @param callback 处理回调函数
 * @param options 读取选项
 */
export async function handleFileDrop(
  event: DragEvent,
  callback: (result: FileReadResult) => void,
  options: FileReadOptions = {}
) {
  event.preventDefault();
  
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file) {
      const result = await readFileContent(file, options);
      callback(result);
    }
  }
}

/**
 * 处理拖拽悬停事件
 * @param event 拖拽事件
 * @param callback 状态变化回调
 */
export function handleDragOver(
  event: DragEvent,
  callback?: (isDragOver: boolean) => void
) {
  event.preventDefault();
  callback?.(true);
}

/**
 * 处理拖拽离开事件
 * @param callback 状态变化回调
 */
export function handleDragLeave(callback?: (isDragOver: boolean) => void) {
  callback?.(false);
}

/**
 * 触发文件选择对话框
 * @param fileInputRef 文件输入元素引用
 */
export function triggerFileSelect(fileInputRef: HTMLInputElement | undefined) {
  fileInputRef?.click();
}

/**
 * 根据文件扩展名获取Content-Type
 * @param extension 文件扩展名
 * @returns Content-Type字符串
 */
function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.xml': 'application/xml',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.ts': 'application/typescript'
  };
  
  return contentTypes[extension.toLowerCase()] || 'text/plain';
}

/**
 * 格式化字节大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 b';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['b', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 验证文件是否为有效的JSON文件
 * @param content 文件内容
 * @returns 验证结果
 */
export function validateJsonFile(content: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(content);
    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: `JSON格式错误: ${error.message}`
    };
  }
}

/**
 * 创建文件下载
 * @param content 文件内容
 * @param filename 文件名
 * @param contentType 内容类型
 */
export function downloadFile(
  content: string,
  filename: string,
  contentType: string = 'text/plain'
) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}