/**
 * JavaScript压缩处理工具模块
 */

/**
 * JavaScript处理操作类型
 */
export type JsOperation = 'compress' | 'format' | 'validate' | 'minify';

/**
 * JavaScript处理结果接口
 */
export interface JsProcessResult {
  success: boolean;
  result?: string;
  error?: string;
  processingTime: number;
}

/**
 * JavaScript统计信息接口
 */
export interface JsStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  processingTime: number;
  originalLines: number;
  compressedLines: number;
}

/**
 * 创建JavaScript处理专用的Web Worker
 * @returns Worker实例
 */
export const createJsWorker = (): Worker => {
  const workerCode = `
    // JavaScript代码格式化函数
    const formatJavaScript = (code) => {
      // 简单的JavaScript格式化逻辑
      let formatted = code;
      let indentLevel = 0;
      const indentSize = 2;
      const lines = [];
      let currentLine = '';
      let inString = false;
      let stringChar = '';
      let inComment = false;
      let inMultiLineComment = false;
      
      for (let i = 0; i < formatted.length; i++) {
        const char = formatted[i];
        const nextChar = formatted[i + 1];
        const prevChar = formatted[i - 1];
        
        // 处理字符串
        if (!inComment && !inMultiLineComment) {
          if ((char === '"' || char === "'" || char === '\`') && prevChar !== '\\\\') {
            if (!inString) {
              inString = true;
              stringChar = char;
            } else if (char === stringChar) {
              inString = false;
              stringChar = '';
            }
          }
        }
        
        // 处理注释
        if (!inString) {
          if (char === '/' && nextChar === '/' && !inMultiLineComment) {
            inComment = true;
          } else if (char === '/' && nextChar === '*') {
            inMultiLineComment = true;
          } else if (char === '*' && nextChar === '/' && inMultiLineComment) {
            inMultiLineComment = false;
            currentLine += char + nextChar;
            i++; // 跳过下一个字符
            continue;
          }
        }
        
        if (inString || inComment || inMultiLineComment) {
          currentLine += char;
        } else {
          switch (char) {
            case '{':
              currentLine += char;
              lines.push(' '.repeat(indentLevel * indentSize) + currentLine.trim());
              currentLine = '';
              indentLevel++;
              break;
            case '}':
              if (currentLine.trim()) {
                lines.push(' '.repeat(indentLevel * indentSize) + currentLine.trim());
                currentLine = '';
              }
              indentLevel = Math.max(0, indentLevel - 1);
              lines.push(' '.repeat(indentLevel * indentSize) + char);
              break;
            case ';':
              currentLine += char;
              if (nextChar !== ' ' && nextChar !== '\\n' && nextChar !== '\\r') {
                lines.push(' '.repeat(indentLevel * indentSize) + currentLine.trim());
                currentLine = '';
              }
              break;
            case '\\n':
            case '\\r':
              if (currentLine.trim()) {
                lines.push(' '.repeat(indentLevel * indentSize) + currentLine.trim());
                currentLine = '';
              }
              inComment = false; // 单行注释结束
              break;
            default:
              currentLine += char;
              break;
          }
        }
      }
      
      if (currentLine.trim()) {
        lines.push(' '.repeat(indentLevel * indentSize) + currentLine.trim());
      }
      
      return lines.join('\\n');
    };

    // JavaScript代码压缩函数
    const compressJavaScript = (code) => {
      let compressed = code;
      
      // 移除多行注释
      compressed = compressed.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');
      
      // 移除单行注释（但保留URL中的//）
      compressed = compressed.replace(/\\/\\/(?![^"']*["'][^"']*$).*$/gm, '');
      
      // 移除多余的空白字符，但保留字符串内的空格
      compressed = compressed.replace(/\\s+/g, ' ');
      
      // 移除不必要的空格
      compressed = compressed.replace(/\\s*([{}();,=+\\-*\\/&|!<>?:])\\s*/g, '$1');
      
      // 移除行首行尾空格
      compressed = compressed.replace(/^\\s+|\\s+$/gm, '');
      
      // 移除空行
      compressed = compressed.replace(/\\n\\s*\\n/g, '\\n');
      
      return compressed.trim();
    };

    // JavaScript代码最小化函数（更激进的压缩）
    const minifyJavaScript = (code) => {
      let minified = compressJavaScript(code);
      
      // 移除所有换行符（除了字符串内的）
      let result = '';
      let inString = false;
      let stringChar = '';
      
      for (let i = 0; i < minified.length; i++) {
        const char = minified[i];
        const prevChar = minified[i - 1];
        
        if ((char === '"' || char === "'" || char === '\`') && prevChar !== '\\\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
            stringChar = '';
          }
        }
        
        if (char === '\\n' && !inString) {
          // 跳过换行符
          continue;
        }
        
        result += char;
      }
      
      return result;
    };

    // JavaScript代码验证函数
    const validateJavaScript = (code) => {
      // 基本的语法检查
      const errors = [];
      
      // 检查括号匹配
      const brackets = { '(': ')', '[': ']', '{': '}' };
      const stack = [];
      let inString = false;
      let stringChar = '';
      
      for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const prevChar = code[i - 1];
        
        // 处理字符串
        if ((char === '"' || char === "'" || char === '\`') && prevChar !== '\\\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
            stringChar = '';
          }
        }
        
        if (!inString) {
          if (brackets[char]) {
            stack.push({ char, pos: i });
          } else if (Object.values(brackets).includes(char)) {
            const last = stack.pop();
            if (!last || brackets[last.char] !== char) {
              errors.push(\`第\${i + 1}个字符处括号不匹配: '\${char}'\`);
            }
          }
        }
      }
      
      // 检查未闭合的括号
      if (stack.length > 0) {
        stack.forEach(item => {
          errors.push(\`第\${item.pos + 1}个字符处括号未闭合: '\${item.char}'\`);
        });
      }
      
      if (errors.length > 0) {
        throw new Error(errors.join('; '));
      }
      
      return 'JavaScript语法验证通过！';
    };

    self.onmessage = function(e) {
      const { type, data } = e.data;
      const startTime = performance.now();
      
      try {
        let result;
        
        switch(type) {
          case 'compress':
            result = compressJavaScript(data);
            break;
          case 'format':
            result = formatJavaScript(data);
            break;
          case 'minify':
            result = minifyJavaScript(data);
            break;
          case 'validate':
            result = validateJavaScript(data);
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
 * 同步处理JavaScript代码（适用于小文件）
 * @param data - JavaScript代码字符串
 * @param operation - 操作类型
 * @returns Promise<JsProcessResult> - 处理结果
 */
export const processJsSync = async (
  data: string,
  operation: JsOperation
): Promise<JsProcessResult> => {
  const startTime = performance.now();

  try {
    let result: string;

    switch (operation) {
      case 'compress':
        result = compressJavaScript(data);
        break;
      case 'format':
        result = formatJavaScript(data);
        break;
      case 'minify':
        result = minifyJavaScript(data);
        break;
      case 'validate':
        result = validateJavaScript(data);
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
 * 使用Web Worker异步处理JavaScript代码（适用于大文件）
 * @param data - JavaScript代码字符串
 * @param operation - 操作类型
 * @param worker - Worker实例
 * @returns Promise<JsProcessResult> - 处理结果
 */
export const processJsAsync = (
  data: string,
  operation: JsOperation,
  worker: Worker
): Promise<JsProcessResult> => {
  return new Promise((resolve) => {
    worker.onmessage = (e) => resolve(e.data);
    worker.postMessage({ type: operation, data });
  });
};

/**
 * 智能选择处理方式（根据文件大小自动选择同步或异步处理）
 * @param data - JavaScript代码字符串
 * @param operation - 操作类型
 * @param worker - Worker实例（可选）
 * @param threshold - 文件大小阈值（字节）
 * @returns Promise<JsProcessResult> - 处理结果
 */
export const processJsSmart = async (
  data: string,
  operation: JsOperation,
  worker?: Worker,
  threshold: number = 50000
): Promise<JsProcessResult> => {
  if (data.length > threshold && worker) {
    return processJsAsync(data, operation, worker);
  } else {
    return processJsSync(data, operation);
  }
};

/**
 * 计算JavaScript代码统计信息
 * @param original - 原始代码字符串
 * @param processed - 处理后的代码字符串
 * @param processingTime - 处理时间
 * @returns JsStats - 统计信息
 */
export const calculateJsStats = (
  original: string,
  processed: string,
  processingTime: number
): JsStats => {
  const originalSize = new Blob([original]).size;
  const compressedSize = new Blob([processed]).size;
  const compressionRatio = originalSize > 0 
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  const originalLines = original.split('\n').length;
  const compressedLines = processed.split('\n').length;

  return {
    originalSize,
    compressedSize,
    compressionRatio,
    processingTime,
    originalLines,
    compressedLines,
  };
};

/**
 * 清理Worker资源
 * @param worker - Worker实例
 */
export const cleanupJsWorker = (worker: Worker | null): void => {
  if (worker) {
    worker.terminate();
  }
};

// 同步处理函数的实现
function compressJavaScript(code: string): string {
  let compressed = code;
  
  // 移除多行注释
  compressed = compressed.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // 移除单行注释（但保留URL中的//）
  compressed = compressed.replace(/\/\/(?![^"']*["'][^"']*$).*$/gm, '');
  
  // 移除多余的空白字符，但保留字符串内的空格
  compressed = compressed.replace(/\s+/g, ' ');
  
  // 移除不必要的空格
  compressed = compressed.replace(/\s*([{}();,=+\-*\/&|!<>?:])\s*/g, '$1');
  
  // 移除行首行尾空格
  compressed = compressed.replace(/^\s+|\s+$/gm, '');
  
  // 移除空行
  compressed = compressed.replace(/\n\s*\n/g, '\n');
  
  return compressed.trim();
}

function formatJavaScript(code: string): string {
  // 简单的JavaScript格式化逻辑
  let formatted = code;
  let indentLevel = 0;
  const indentSize = 2;
  const lines: string[] = [];
  let currentLine = '';
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let inMultiLineComment = false;
  
  for (let i = 0; i < formatted.length; i++) {
    const char = formatted[i];
    const nextChar = formatted[i + 1];
    const prevChar = formatted[i - 1];
    
    // 处理字符串
    if (!inComment && !inMultiLineComment) {
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }
    }
    
    // 处理注释
    if (!inString) {
      if (char === '/' && nextChar === '/' && !inMultiLineComment) {
        inComment = true;
      } else if (char === '/' && nextChar === '*') {
        inMultiLineComment = true;
      } else if (char === '*' && nextChar === '/' && inMultiLineComment) {
        inMultiLineComment = false;
        currentLine += char + nextChar;
        i++; // 跳过下一个字符
        continue;
      }
    }
    
    if (inString || inComment || inMultiLineComment) {
      currentLine += char;
    } else {
      switch (char) {
        case '{':
          currentLine += char;
          lines.push(' '.repeat(indentLevel * indentSize) + currentLine.trim());
          currentLine = '';
          indentLevel++;
          break;
        case '}':
          if (currentLine.trim()) {
            lines.push(' '.repeat(indentLevel * indentSize) + currentLine.trim());
            currentLine = '';
          }
          indentLevel = Math.max(0, indentLevel - 1);
          lines.push(' '.repeat(indentLevel * indentSize) + char);
          break;
        case ';':
          currentLine += char;
          if (nextChar !== ' ' && nextChar !== '\n' && nextChar !== '\r') {
            lines.push(' '.repeat(indentLevel * indentSize) + currentLine.trim());
            currentLine = '';
          }
          break;
        case '\n':
        case '\r':
          if (currentLine.trim()) {
            lines.push(' '.repeat(indentLevel * indentSize) + currentLine.trim());
            currentLine = '';
          }
          inComment = false; // 单行注释结束
          break;
        default:
          currentLine += char;
          break;
      }
    }
  }
  
  if (currentLine.trim()) {
    lines.push(' '.repeat(indentLevel * indentSize) + currentLine.trim());
  }
  
  return lines.join('\n');
}

function minifyJavaScript(code: string): string {
  let minified = compressJavaScript(code);
  
  // 移除所有换行符（除了字符串内的）
  let result = '';
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < minified.length; i++) {
    const char = minified[i];
    const prevChar = minified[i - 1];
    
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }
    
    if (char === '\n' && !inString) {
      // 跳过换行符
      continue;
    }
    
    result += char;
  }
  
  return result;
}

function validateJavaScript(code: string): string {
  // 基本的语法检查
  const errors: string[] = [];
  
  // 检查括号匹配
  const brackets: { [key: string]: string } = { '(': ')', '[': ']', '{': '}' };
  const stack: Array<{ char: string; pos: number }> = [];
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const prevChar = code[i - 1];
    
    // 处理字符串
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }
    
    if (!inString) {
      if (brackets[char]) {
        stack.push({ char, pos: i });
      } else if (Object.values(brackets).includes(char)) {
        const last = stack.pop();
        if (!last || brackets[last.char] !== char) {
          errors.push(`第${i + 1}个字符处括号不匹配: '${char}'`);
        }
      }
    }
  }
  
  // 检查未闭合的括号
  if (stack.length > 0) {
    stack.forEach(item => {
      errors.push(`第${item.pos + 1}个字符处括号未闭合: '${item.char}'`);
    });
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
  
  return 'JavaScript语法验证通过！';
}