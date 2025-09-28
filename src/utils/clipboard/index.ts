/**
 * 剪贴板工具函数
 * 提供统一的复制功能，支持文本复制到剪贴板
 */

/**
 * 复制文本到剪贴板的结果接口
 */
export interface CopyResult {
  success: boolean;
  error?: string;
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本内容
 * @returns Promise<CopyResult> 复制操作的结果
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  try {
    // 检查是否为空内容
    if (!text || text.trim() === "") {
      return {
        success: false,
        error: "没有可复制的内容"
      };
    }

    // 检查浏览器是否支持 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代 Clipboard API
      await navigator.clipboard.writeText(text);
      return {
        success: true
      };
    } else {
      // 降级方案：使用传统的 document.execCommand
      return fallbackCopyToClipboard(text);
    }
  } catch (error) {
    console.error("复制失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "复制失败"
    };
  }
}

/**
 * 降级复制方案（兼容旧浏览器）
 * @param text 要复制的文本
 * @returns CopyResult 复制结果
 */
function fallbackCopyToClipboard(text: string): CopyResult {
  try {
    // 创建临时的 textarea 元素
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // 设置样式使其不可见
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    
    // 添加到 DOM
    document.body.appendChild(textArea);
    
    // 选中文本
    textArea.focus();
    textArea.select();
    
    // 执行复制命令
    const successful = document.execCommand("copy");
    
    // 清理临时元素
    document.body.removeChild(textArea);
    
    if (successful) {
      return { success: true };
    } else {
      return {
        success: false,
        error: "浏览器不支持复制功能"
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "复制失败"
    };
  }
}

/**
 * 检查浏览器是否支持剪贴板功能
 * @returns boolean 是否支持剪贴板功能
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard || document.execCommand);
}

/**
 * 从剪贴板读取文本（需要用户授权）
 * @returns Promise<string | null> 剪贴板中的文本内容，失败时返回 null
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      const text = await navigator.clipboard.readText();
      return text;
    } else {
      console.warn("当前环境不支持从剪贴板读取内容");
      return null;
    }
  } catch (error) {
    console.error("读取剪贴板失败:", error);
    return null;
  }
}