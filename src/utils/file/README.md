# 文件处理工具 (File Utils)

这个模块提供了一套完整的文件处理工具函数，用于处理文件读取、拖拽上传等常见操作。

## 主要功能

### 1. 文件读取

```typescript
import { readFileContent, type FileReadOptions } from '@/utils/file';

// 基本用法
const result = await readFileContent(file);
if (result.success) {
  console.log('文件内容:', result.content);
} else {
  console.error('读取失败:', result.error);
}

// 带选项的用法
const result = await readFileContent(file, {
  acceptedTypes: ['.json', '.txt', '.csv'],
  maxSize: 5 * 1024 * 1024, // 5MB
  encoding: 'UTF-8'
});
```

### 2. 文件选择处理

```typescript
import { handleFileSelect } from '@/utils/file';

// 在模板中
<input 
  ref="fileInput" 
  type="file" 
  @change="onFileSelect" 
  style="display: none" 
/>

// 在脚本中
const onFileSelect = (event: Event) => {
  handleFileSelect(event, (result) => {
    if (result.success) {
      // 处理文件内容
      console.log(result.content);
    } else {
      // 处理错误
      console.error(result.error);
    }
  }, {
    acceptedTypes: ['.json', '.txt']
  });
};
```

### 3. 拖拽上传处理

```typescript
import { 
  handleFileDrop, 
  handleDragOver, 
  handleDragLeave 
} from '@/utils/file';

// 在模板中
<div 
  @drop="onDrop"
  @dragover="onDragOver"
  @dragleave="onDragLeave"
  :class="{ 'drag-over': isDragOver }"
>
  拖拽文件到这里
</div>

// 在脚本中
const isDragOver = ref(false);

const onDrop = (event: DragEvent) => {
  handleFileDrop(event, (result) => {
    if (result.success) {
      // 处理文件内容
      console.log(result.content);
    }
  });
  isDragOver.value = false;
};

const onDragOver = (event: DragEvent) => {
  handleDragOver(event, (dragState) => {
    isDragOver.value = dragState;
  });
};

const onDragLeave = () => {
  handleDragLeave((dragState) => {
    isDragOver.value = dragState;
  });
};
```

### 4. 触发文件选择

```typescript
import { triggerFileSelect } from '@/utils/file';

const fileInput = ref<HTMLInputElement>();

const openFileDialog = () => {
  triggerFileSelect(fileInput.value);
};
```

### 5. JSON文件验证

```typescript
import { validateJsonFile } from '@/utils/file';

const validation = validateJsonFile(content);
if (validation.valid) {
  console.log('JSON格式正确');
} else {
  console.error('JSON格式错误:', validation.error);
}
```

### 6. 文件下载

```typescript
import { downloadFile } from '@/utils/file';

// 下载JSON文件
downloadFile(
  JSON.stringify(data, null, 2),
  'data.json',
  'application/json'
);

// 下载文本文件
downloadFile(textContent, 'output.txt', 'text/plain');
```

## 接口定义

### FileReadResult

```typescript
interface FileReadResult {
  success: boolean;     // 是否成功
  content?: string;     // 文件内容
  error?: string;       // 错误信息
  fileName?: string;    // 文件名
}
```

### FileReadOptions

```typescript
interface FileReadOptions {
  acceptedTypes?: string[];  // 接受的文件类型，默认 ['.json', '.txt']
  maxSize?: number;          // 最大文件大小（字节），默认 10MB
  encoding?: string;         // 文件编码，默认 'UTF-8'
}
```

## 支持的文件类型

- `.json` - JSON文件
- `.txt` - 文本文件
- `.csv` - CSV文件
- `.xml` - XML文件
- `.html` - HTML文件
- `.css` - CSS文件
- `.js` - JavaScript文件
- `.ts` - TypeScript文件

## 使用示例

查看 `src/views/JsonCompressor.vue` 文件，了解完整的使用示例。