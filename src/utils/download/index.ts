/**
 * 文件下载工具模块
 */

/**
 * 下载选项接口
 */
export interface DownloadOptions {
  filename?: string;
  mimeType?: string;
  charset?: string;
}

/**
 * 支持的文件类型映射
 */
export const MIME_TYPES = {
  json: 'application/json',
  txt: 'text/plain',
  csv: 'text/csv',
  xml: 'application/xml',
  html: 'text/html',
  js: 'application/javascript',
  css: 'text/css',
  md: 'text/markdown',
} as const;

/**
 * 下载文本内容为文件
 * @param content - 文件内容
 * @param filename - 文件名
 * @param options - 下载选项
 */
export const downloadTextFile = (
  content: string,
  filename: string,
  options: DownloadOptions = {}
): void => {
  try {
    const {
      mimeType = MIME_TYPES.txt,
      charset = 'utf-8'
    } = options;

    // 创建Blob对象
    const blob = new Blob([content], {
      type: `${mimeType};charset=${charset}`
    });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理资源
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('文件下载失败:', error);
    throw new Error('文件下载失败，请重试');
  }
};

/**
 * 下载JSON文件
 * @param data - JSON数据（对象或字符串）
 * @param filename - 文件名（不含扩展名）
 * @param formatted - 是否格式化JSON
 */
export const downloadJsonFile = (
  data: any,
  filename: string = 'data',
  formatted: boolean = true
): void => {
  try {
    let content: string;
    
    if (typeof data === 'string') {
      // 如果是字符串，先解析再重新序列化以确保格式正确
      const parsed = JSON.parse(data);
      content = formatted ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
    } else {
      // 如果是对象，直接序列化
      content = formatted ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    }

    downloadTextFile(content, `${filename}.json`, {
      mimeType: MIME_TYPES.json
    });
  } catch (error) {
    console.error('JSON文件下载失败:', error);
    throw new Error('JSON文件下载失败，请检查数据格式');
  }
};

/**
 * 下载CSV文件
 * @param data - CSV数据（二维数组或字符串）
 * @param filename - 文件名（不含扩展名）
 */
export const downloadCsvFile = (
  data: string[][] | string,
  filename: string = 'data'
): void => {
  try {
    let content: string;
    
    if (typeof data === 'string') {
      content = data;
    } else {
      // 将二维数组转换为CSV格式
      content = data.map(row => 
        row.map(cell => 
          // 处理包含逗号、引号或换行符的单元格
          typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
            ? `"${cell.replace(/"/g, '""')}"`
            : cell
        ).join(',')
      ).join('\n');
    }

    downloadTextFile(content, `${filename}.csv`, {
      mimeType: MIME_TYPES.csv
    });
  } catch (error) {
    console.error('CSV文件下载失败:', error);
    throw new Error('CSV文件下载失败，请检查数据格式');
  }
};

/**
 * 下载文本文件
 * @param content - 文本内容
 * @param filename - 文件名（不含扩展名）
 */
export const downloadTxtFile = (
  content: string,
  filename: string = 'document'
): void => {
  downloadTextFile(content, `${filename}.txt`, {
    mimeType: MIME_TYPES.txt
  });
};

/**
 * 下载XML文件
 * @param content - XML内容
 * @param filename - 文件名（不含扩展名）
 */
export const downloadXmlFile = (
  content: string,
  filename: string = 'data'
): void => {
  downloadTextFile(content, `${filename}.xml`, {
    mimeType: MIME_TYPES.xml
  });
};

/**
 * 下载HTML文件
 * @param content - HTML内容
 * @param filename - 文件名（不含扩展名）
 */
export const downloadHtmlFile = (
  content: string,
  filename: string = 'document'
): void => {
  downloadTextFile(content, `${filename}.html`, {
    mimeType: MIME_TYPES.html
  });
};

/**
 * 下载JavaScript文件
 * @param content - JavaScript内容
 * @param filename - 文件名（不含扩展名）
 */
export const downloadJsFile = (
  content: string,
  filename: string = 'script'
): void => {
  downloadTextFile(content, `${filename}.js`, {
    mimeType: MIME_TYPES.js
  });
};

/**
 * 下载CSS文件
 * @param content - CSS内容
 * @param filename - 文件名（不含扩展名）
 */
export const downloadCssFile = (
  content: string,
  filename: string = 'styles'
): void => {
  downloadTextFile(content, `${filename}.css`, {
    mimeType: MIME_TYPES.css
  });
};

/**
 * 下载Markdown文件
 * @param content - Markdown内容
 * @param filename - 文件名（不含扩展名）
 */
export const downloadMarkdownFile = (
  content: string,
  filename: string = 'document'
): void => {
  downloadTextFile(content, `${filename}.md`, {
    mimeType: MIME_TYPES.md
  });
};

/**
 * 根据文件扩展名自动选择下载方法
 * @param content - 文件内容
 * @param filename - 完整文件名（包含扩展名）
 */
export const downloadFileByExtension = (
  content: string,
  filename: string
): void => {
  const extension = filename.split('.').pop()?.toLowerCase();
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  switch (extension) {
    case 'json':
      downloadJsonFile(content, nameWithoutExt);
      break;
    case 'csv':
      downloadCsvFile(content, nameWithoutExt);
      break;
    case 'xml':
      downloadXmlFile(content, nameWithoutExt);
      break;
    case 'html':
    case 'htm':
      downloadHtmlFile(content, nameWithoutExt);
      break;
    case 'js':
      downloadJsFile(content, nameWithoutExt);
      break;
    case 'css':
      downloadCssFile(content, nameWithoutExt);
      break;
    case 'md':
      downloadMarkdownFile(content, nameWithoutExt);
      break;
    case 'txt':
    default:
      downloadTxtFile(content, nameWithoutExt);
      break;
  }
};

/**
 * 批量下载文件（打包为ZIP需要额外库支持）
 * @param files - 文件列表
 */
export const downloadMultipleFiles = (
  files: Array<{ content: string; filename: string }>
): void => {
  files.forEach(({ content, filename }) => {
    // 添加延迟避免浏览器阻止多个下载
    setTimeout(() => {
      downloadFileByExtension(content, filename);
    }, 100 * files.indexOf({ content, filename }));
  });
};

/**
 * 检查浏览器是否支持文件下载
 * @returns boolean - 是否支持
 */
export const isDownloadSupported = (): boolean => {
  return typeof document !== 'undefined' && 'createElement' in document;
};

/**
 * 获取安全的文件名（移除非法字符）
 * @param filename - 原始文件名
 * @returns string - 安全的文件名
 */
export const getSafeFilename = (filename: string): string => {
  return filename.replace(/[<>:"/\\|?*]/g, '_').trim();
};