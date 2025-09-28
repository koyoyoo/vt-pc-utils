/**
 * 内容类型检测工具
 * 用于自动识别粘贴的内容是JSON还是JavaScript代码
 */

// 内容类型枚举
export type ContentType = 'json' | 'js' | 'unknown';

// 检测结果接口
export interface DetectionResult {
  type: ContentType;
  confidence: number; // 置信度 0-1
  reason: string; // 检测原因
}

/**
 * 检测内容类型
 * @param content 要检测的内容
 * @returns 检测结果
 */
export function detectContentType(content: string): DetectionResult {
  if (!content || !content.trim()) {
    return {
      type: 'unknown',
      confidence: 0,
      reason: '内容为空'
    };
  }

  const trimmedContent = content.trim();
  
  // JSON检测
  const jsonResult = detectJSON(trimmedContent);
  if (jsonResult.confidence > 0.7) {
    return jsonResult;
  }

  // JavaScript检测
  const jsResult = detectJavaScript(trimmedContent);
  if (jsResult.confidence > 0.7) {
    return jsResult;
  }

  // 返回置信度更高的结果
  return jsonResult.confidence >= jsResult.confidence ? jsonResult : jsResult;
}

/**
 * 检测是否为JSON格式
 * @param content 内容
 * @returns 检测结果
 */
function detectJSON(content: string): DetectionResult {
  let confidence = 0;
  const reasons: string[] = [];

  // 1. 尝试JSON.parse
  try {
    const parsed = JSON.parse(content);
    confidence += 0.6;
    reasons.push('JSON解析成功');
    
    // 检查是否为对象或数组
    if (typeof parsed === 'object' && parsed !== null) {
      confidence += 0.2;
      reasons.push('解析结果为对象或数组');
    }
  } catch (error) {
    // JSON解析失败，但可能是格式不完整的JSON
    confidence -= 0.3;
  }

  // 2. 检查JSON特征
  const jsonPatterns = [
    /^\s*[\{\[]/, // 以 { 或 [ 开头
    /[\}\]]\s*$/, // 以 } 或 ] 结尾
    /"[^"]*"\s*:/, // 包含键值对格式
    /:\s*"[^"]*"/, // 包含字符串值
    /:\s*\d+/, // 包含数字值
    /:\s*(true|false|null)/, // 包含布尔值或null
  ];

  let patternMatches = 0;
  jsonPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      patternMatches++;
    }
  });

  if (patternMatches >= 3) {
    confidence += 0.3;
    reasons.push(`匹配${patternMatches}个JSON特征模式`);
  }

  // 3. 检查是否包含JavaScript特有语法（降低JSON可能性）
  const jsOnlyPatterns = [
    /\bfunction\s+\w+/, // 函数声明
    /\bvar\s+\w+/, // var声明
    /\blet\s+\w+/, // let声明
    /\bconst\s+\w+/, // const声明
    /\bif\s*\(/, // if语句
    /\bfor\s*\(/, // for循环
    /\bwhile\s*\(/, // while循环
    /\breturn\s+/, // return语句
    /\/\/.*$/, // 单行注释
    /\/\*[\s\S]*?\*\//, // 多行注释
  ];

  let jsPatternMatches = 0;
  jsOnlyPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      jsPatternMatches++;
    }
  });

  if (jsPatternMatches > 0) {
    confidence -= jsPatternMatches * 0.1;
    reasons.push(`包含${jsPatternMatches}个JavaScript特有语法`);
  }

  return {
    type: 'json',
    confidence: Math.max(0, Math.min(1, confidence)),
    reason: reasons.join(', ')
  };
}

/**
 * 检测是否为JavaScript代码
 * @param content 内容
 * @returns 检测结果
 */
function detectJavaScript(content: string): DetectionResult {
  let confidence = 0;
  const reasons: string[] = [];

  // 1. 检查JavaScript关键字和语法
  const jsPatterns = [
    { pattern: /\bfunction\s+\w+/, weight: 0.2, desc: '函数声明' },
    { pattern: /\b(var|let|const)\s+\w+/, weight: 0.15, desc: '变量声明' },
    { pattern: /\bif\s*\([^)]*\)\s*\{/, weight: 0.1, desc: 'if语句' },
    { pattern: /\bfor\s*\([^)]*\)\s*\{/, weight: 0.1, desc: 'for循环' },
    { pattern: /\bwhile\s*\([^)]*\)\s*\{/, weight: 0.1, desc: 'while循环' },
    { pattern: /\breturn\s+[^;]+;?/, weight: 0.1, desc: 'return语句' },
    { pattern: /\/\/.*$/, weight: 0.05, desc: '单行注释' },
    { pattern: /\/\*[\s\S]*?\*\//, weight: 0.05, desc: '多行注释' },
    { pattern: /\w+\s*\([^)]*\)\s*\{/, weight: 0.1, desc: '函数调用或方法' },
    { pattern: /\.\w+\s*\(/, weight: 0.05, desc: '方法调用' },
    { pattern: /=>\s*\{?/, weight: 0.1, desc: '箭头函数' },
    { pattern: /\bclass\s+\w+/, weight: 0.15, desc: '类声明' },
    { pattern: /\bimport\s+/, weight: 0.15, desc: 'import语句' },
    { pattern: /\bexport\s+/, weight: 0.15, desc: 'export语句' },
    { pattern: /\bconsole\.(log|error|warn|info)/, weight: 0.1, desc: 'console语句' },
  ];

  jsPatterns.forEach(({ pattern, weight, desc }) => {
    if (pattern.test(content)) {
      confidence += weight;
      reasons.push(desc);
    }
  });

  // 2. 检查是否包含分号结尾（JavaScript特征）
  const semicolonLines = content.split('\n').filter(line => 
    line.trim().endsWith(';') && !line.trim().startsWith('//')
  );
  if (semicolonLines.length > 0) {
    confidence += Math.min(0.1, semicolonLines.length * 0.02);
    reasons.push(`${semicolonLines.length}行以分号结尾`);
  }

  // 3. 检查花括号使用（代码块）
  const braceMatches = content.match(/\{[\s\S]*?\}/g);
  if (braceMatches && braceMatches.length > 0) {
    confidence += Math.min(0.1, braceMatches.length * 0.03);
    reasons.push(`包含${braceMatches.length}个代码块`);
  }

  // 4. 检查是否为有效JSON（降低JS可能性）
  try {
    JSON.parse(content);
    confidence -= 0.3;
    reasons.push('内容可解析为JSON');
  } catch (error) {
    // 不是有效JSON，增加JS可能性
    confidence += 0.1;
  }

  return {
    type: 'js',
    confidence: Math.max(0, Math.min(1, confidence)),
    reason: reasons.join(', ')
  };
}

/**
 * 快速检测内容类型（简化版本）
 * @param content 内容
 * @returns 内容类型
 */
export function quickDetectContentType(content: string): ContentType {
  const result = detectContentType(content);
  return result.confidence > 0.5 ? result.type : 'unknown';
}