<template>
  <CpnVBody>
    <!-- 页面标题 -->
    <CpnPageHeader
      title="🗜️ 代码压缩工具"
      subtitle="高性能JSON/JavaScript格式化、压缩和美化工具"
    />

    <!-- 文件类型选择 -->
    <div class="file-type-selector">
      <el-radio-group
        v-model="currentFileType"
        @change="handleFileTypeChange"
        size="large"
      >
        <el-radio-button value="json"> 📄 JSON </el-radio-button>
        <el-radio-button value="js"> 📜 JavaScript </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-section">
      <div class="texts-container">
        <!-- 输入区域 -->
        <div class="textarea-container">
          <div class="textarea-label" for="input-code">
            输入{{ currentFileType === "json" ? "JSON" : "JavaScript" }}代码
          </div>
          <textarea
            id="input-code"
            v-model="inputCode"
            :placeholder="
              currentFileType === 'json'
                ? '在此粘贴或输入您的JSON数据...'
                : '在此粘贴或输入您的JavaScript代码...'
            "
            @input="handleInput"
            @paste="handlePaste"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            :class="{ 'drag-over': isDragOver }"
          ></textarea>
        </div>

        <!-- 输出区域 -->
        <div class="textarea-container">
          <div class="textarea-label" for="output-code">处理结果</div>
          <textarea
            id="output-code"
            v-model="outputCode"
            :placeholder="
              '处理后的' +
              (currentFileType === 'json' ? 'JSON' : 'JavaScript') +
              '代码将显示在这里...'
            "
            readonly
          ></textarea>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <CpnButton
          type="compress"
          text="压缩 (Ctrl+Enter)"
          icon="🗜️"
          :disabled="loading || !inputCode.trim()"
          :loading="loading && currentOperation === 'compress'"
          @click="processCode('compress')"
        />

        <CpnButton
          type="format"
          text="格式化 (Ctrl+F)"
          icon="✨"
          :disabled="loading || !inputCode.trim()"
          :loading="loading && currentOperation === 'format'"
          @click="processCode('format')"
        />

        <!-- JavaScript 特有的最小化按钮 -->
        <CpnButton
          v-if="currentFileType === 'js'"
          text="最小化 (Ctrl+M)"
          icon="🔧"
          :disabled="loading || !inputCode.trim()"
          :loading="loading && currentOperation === 'minify'"
          @click="processCode('minify')"
        />

        <CpnButton
          type="clear"
          text="清空 (Ctrl+K)"
          icon="🗑️"
          :disabled="loading"
          @click="clearContent"
        />

        <CpnButton
          type="load"
          text="导入文件"
          icon="📁"
          :disabled="loading"
          @click="loadFile"
        />

        <CpnButton
          type="download"
          text="下载结果"
          icon="💾"
          :disabled="loading || !outputCode.trim()"
          @click="downloadResult"
        />
      </div>

      <!-- 统计信息 -->
      <div class="m-statistics" v-if="stats.originalSize > 0">
        <div class="stat-item">
          <span class="stat-label">原始大小：</span>
          <span class="stat-value">{{ formatBytes(stats.originalSize) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">处理后大小：</span>
          <span class="stat-value">{{
            formatBytes(stats.compressedSize)
          }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">压缩率：</span>
          <span class="stat-value">{{ stats.compressionRatio }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">处理时间：</span>
          <span class="stat-value">{{ stats.processingTime }}ms</span>
        </div>
        <!-- JavaScript 特有的行数统计 -->
        <div
          v-if="currentFileType === 'js' && 'originalLines' in stats"
          class="stat-item"
        >
          <span class="stat-label">原始行数：</span>
          <span class="stat-value">{{ (stats as any).originalLines }}</span>
        </div>
        <div
          v-if="currentFileType === 'js' && 'compressedLines' in stats"
          class="stat-item"
        >
          <span class="stat-label">处理后行数：</span>
          <span class="stat-value">{{ (stats as any).compressedLines }}</span>
        </div>
      </div>

      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInput"
        type="file"
        :accept="currentFileType === 'json' ? '.json,.txt' : '.js,.txt'"
        @change="handleFileSelect"
        style="display: none"
      />
    </div>
  </CpnVBody>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { ElMessage, ElRadioGroup, ElRadioButton } from "element-plus";
import CpnPageHeader from "@/components/layout/CpnPageHeader.vue";
import CpnVBody from "@/components/layout/CpnVBody.vue";
import CpnButton from "@/components/button/CpnButton.vue";
import { formatBytes, type JsonStats } from "@/utils/jsCompressor/jsonWorker";
import { useJsonWorker, type JsonOperation } from "@/composables/useJsonWorker";
import {
  useJsWorker,
  type JsOperation,
  type JsStats,
} from "@/composables/useJsWorker";
import {
  handleFileSelect as handleFileSelectUtil,
  handleFileDrop,
  handleDragOver as handleDragOverUtil,
  handleDragLeave as handleDragLeaveUtil,
  triggerFileSelect,
  type FileReadResult,
} from "@/utils/file";
import { detectContentType } from "@/utils/contentDetector";

// 文件类型定义
type FileType = "json" | "js";
type CodeOperation = JsonOperation | JsOperation;

// 响应式数据
const inputCode = ref("");
const outputCode = ref("");
const loading = ref(false);
const isDragOver = ref(false);
const currentOperation = ref("");
const currentFileType = ref<FileType>("json");
const fileInput = ref<HTMLInputElement>();

// 统计信息（支持两种类型）
const stats = reactive<JsonStats | JsStats>({
  originalSize: 0,
  compressedSize: 0,
  compressionRatio: 0,
  processingTime: 0,
});

// 使用 JSON Worker hooks
const { processJson: processJsonWithWorker, getJsonStats } = useJsonWorker();

// 使用 JavaScript Worker hooks
const { processJs: processJsWithWorker, getJsStats } = useJsWorker();

// 显示提示消息
const showToast = (
  message: string,
  type: "success" | "error" | "info" = "success"
) => {
  ElMessage({
    message,
    type,
    duration: 3000,
  });
};

// 设置加载状态
const setLoading = (isLoading: boolean, operation = "") => {
  loading.value = isLoading;
  currentOperation.value = operation;
};

// 切换文件类型
const handleFileTypeChange = (value: string | number | boolean | undefined) => {
  const fileType = value as FileType;
  if (fileType && fileType !== currentFileType.value) {
    // 清空内容和统计信息
    inputCode.value = "";
    outputCode.value = "";
    resetStats();
    showToast(
      `已切换到${fileType === "json" ? "JSON" : "JavaScript"}模式`,
      "info"
    );
  }
};

// 重置统计信息
const resetStats = () => {
  Object.assign(stats, {
    originalSize: 0,
    compressedSize: 0,
    compressionRatio: 0,
    processingTime: 0,
  });
};

// 处理代码数据（统一处理JSON和JavaScript）
const processCode = async (operation: CodeOperation) => {
  if (!inputCode.value.trim()) {
    showToast(
      `请输入${currentFileType.value === "json" ? "JSON" : "JavaScript"}代码`,
      "error"
    );
    return;
  }

  setLoading(true, operation);

  try {
    if (currentFileType.value === "json") {
      // 处理JSON
      const result = await processJsonWithWorker(
        inputCode.value,
        operation as JsonOperation
      );

      if (result.success && result.result) {
        if (operation === "validate") {
          showToast(result.result, "success");
          outputCode.value = inputCode.value;
        } else {
          outputCode.value = result.result;
          // 计算JSON统计信息
          const newStats = getJsonStats(
            inputCode.value,
            result.result,
            result.processingTime
          );
          Object.assign(stats, newStats);
          showToast(
            `${operation === "compress" ? "压缩" : "格式化"}完成`,
            "success"
          );
        }
      } else {
        showToast(`处理失败: ${result.error}`, "error");
      }
    } else {
      // 处理JavaScript
      const result = await processJsWithWorker(
        inputCode.value,
        operation as JsOperation
      );

      if (result.success && result.result) {
        if (operation === "validate") {
          showToast(result.result, "success");
          outputCode.value = inputCode.value;
        } else {
          outputCode.value = result.result;
          // 计算JavaScript统计信息
          const newStats = getJsStats(
            inputCode.value,
            result.result,
            result.processingTime
          );
          Object.assign(stats, newStats);
          const operationName =
            operation === "compress"
              ? "压缩"
              : operation === "format"
              ? "格式化"
              : "最小化";
          showToast(`${operationName}完成`, "success");
        }
      } else {
        showToast(`处理失败: ${result.error}`, "error");
      }
    }
  } catch (error: any) {
    showToast(`处理失败: ${error.message}`, "error");
  } finally {
    setLoading(false);
  }
};

// 清空内容
const clearContent = () => {
  inputCode.value = "";
  outputCode.value = "";
  resetStats();
  showToast("内容已清空", "info");
};

// 加载文件
const loadFile = () => {
  triggerFileSelect(fileInput.value);
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  handleFileSelectUtil(
    event,
    (result: FileReadResult) => {
      if (result.success && result.content) {
        inputCode.value = result.content;
        showToast(`文件 "${result.fileName}" 加载成功`, "success");
      } else {
        showToast(result.error || "文件读取失败", "error");
      }
    },
    {
      acceptedTypes:
        currentFileType.value === "json" ? [".json", ".txt"] : [".js", ".txt"],
    }
  );
};

// 下载结果
const downloadResult = () => {
  if (!outputCode.value.trim()) {
    showToast("没有可下载的内容", "error");
    return;
  }

  try {
    const fileExtension = currentFileType.value === "json" ? "json" : "js";
    const fileName = `processed_${Date.now()}.${fileExtension}`;
    const blob = new Blob([outputCode.value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("文件下载成功", "success");
  } catch (error: any) {
    showToast(`下载失败: ${error.message}`, "error");
  }
};

// 处理输入变化
const handleInput = () => {
  // 自动保存到本地存储
  console.log(inputCode.value);
  localStorage.setItem("code-compressor-input", inputCode.value);
};

// 处理粘贴事件 - 自动识别内容类型
const handlePaste = async (event: ClipboardEvent) => {
  // 获取粘贴的文本内容
  const pastedText = event.clipboardData?.getData("text") || "";

  if (!pastedText.trim()) {
    return;
  }

  // 检测内容类型
  const detection = detectContentType(pastedText);

  // 如果检测到的类型与当前选择的类型不同，且置信度足够高，则自动切换
  if (
    detection.confidence > 0.6 &&
    detection.type !== "unknown" &&
    detection.type !== currentFileType.value
  ) {
    // 自动切换文件类型
    currentFileType.value = detection.type as FileType;

    // 显示提示信息
    const typeNames = { json: "JSON", js: "JavaScript" };
    showToast(
      `🎯 已自动识别并切换到${
        typeNames[detection.type]
      }模式 (置信度: ${Math.round(detection.confidence * 100)}%)`,
      "info"
    );

    // 清空输出区域和统计信息
    outputCode.value = "";
    resetStats();
  }
};

// 处理拖拽事件
const handleDrop = (event: DragEvent) => {
  isDragOver.value = false;

  handleFileDrop(
    event,
    (result: FileReadResult) => {
      if (result.success && result.content) {
        inputCode.value = result.content;
        showToast(`文件 "${result.fileName}" 加载成功`, "success");
      } else {
        showToast(result.error || "文件读取失败", "error");
      }
    },
    {
      acceptedTypes:
        currentFileType.value === "json" ? [".json", ".txt"] : [".js", ".txt"],
    }
  );
};

const handleDragOver = (event: DragEvent) => {
  handleDragOverUtil(event, (dragState: boolean) => {
    isDragOver.value = dragState;
  });
};

const handleDragLeave = () => {
  handleDragLeaveUtil((dragState: boolean) => {
    isDragOver.value = dragState;
  });
};

// 键盘快捷键处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        processCode("compress");
        break;
      case "f":
      case "F":
        event.preventDefault();
        processCode("format");
        break;
      case "m":
      case "M":
        if (currentFileType.value === "js") {
          event.preventDefault();
          processCode("minify");
        }
        break;
      case "t":
      case "T":
        // 使用 Ctrl+T 作为验证快捷键，避免与粘贴冲突
        event.preventDefault();
        processCode("validate");
        break;
      case "k":
      case "K":
        event.preventDefault();
        clearContent();
        break;
    }
  }
};

// 组件挂载时的初始化
onMounted(() => {
  // 设置页面标题
  document.title = "代码压缩工具 - koyoyoo工具集";

  // 从本地存储恢复内容
  const savedInput = localStorage.getItem("code-compressor-input");
  if (savedInput) {
    inputCode.value = savedInput;
  }

  // 添加键盘事件监听
  document.addEventListener("keydown", handleKeydown);
});

// 组件卸载时的清理
onUnmounted(() => {
  // 移除键盘事件监听
  document.removeEventListener("keydown", handleKeydown);
  // Worker 清理由 hooks 自动处理
});
</script>

<style lang="scss" scoped>
.json-compressor-page {
  padding-top: 60px; // 为导航栏留出空间
  padding-bottom: 80px; // 为页脚留出空间
}

.main-content {
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

// 文件类型选择器样式
.file-type-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  gap: 12px;

  .selector-label {
    font-weight: 600;
    color: #333;
    font-size: 1rem;
  }

  .el-radio-group {
    background: white;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  :deep(.el-radio-button__inner) {
    border: none;
    background: transparent;
    color: #666;
    font-weight: 500;
    padding: 12px 24px;
    transition: all 0.3s ease;

    &:hover {
      color: #3d61ff;
    }
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: linear-gradient(135deg, #3d61ff 0%, #3955d1 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(61, 97, 255, 0.3);
  }
}

.texts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}
.textarea-container {
  display: flex;
  flex-direction: column;

  .textarea-label {
    font-weight: 600;
    color: #fff;
    font-size: 1.1rem;
    background: linear-gradient(135deg, #3d61ff 0%, #3955d1 100%);
    padding: 8px 16px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    display: inline-block;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

    // 根据文件类型显示不同的图标
    &.json-label::before {
      content: "{ }";
      margin-right: 8px;
      font-weight: bold;
    }

    &.js-label::before {
      content: "JS";
      margin-right: 8px;
      font-weight: bold;
      font-size: 0.9em;
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  textarea {
    width: 100%;
    height: 400px;
    padding: 20px;
    border: 2px solid #e1e5e9;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    font-family: "Consolas", "Monaco", monospace;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    transition: all 0.3s ease;
    background: #fafbfc;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      background: white;
    }

    &.drag-over {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }

    &[readonly] {
      background: #f8f9fa;
      cursor: default;
    }
  }
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin-bottom: 30px;

  // 为JavaScript特有的最小化按钮添加特殊样式
  .minify-btn {
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);

    &:hover {
      background: linear-gradient(135deg, #ff5722 0%, #ff9800 100%);
      transform: translateY(-2px);
    }
  }
}

.m-statistics {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f5f5;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  .stat-label {
    font-weight: 500;
    color: #666;
  }

  .stat-value {
    font-weight: 600;
    color: #333;
  }

  // 为JavaScript特有的统计项添加样式
  &.js-stat {
    .stat-label {
      color: #ff6b35;
    }
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 15px;
  }

  .title {
    font-size: 2rem;
  }

  .file-type-selector {
    margin-bottom: 20px;

    :deep(.el-radio-button__inner) {
      padding: 10px 20px;
      font-size: 0.9rem;
    }
  }

  .texts-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .textarea-container textarea {
    height: 300px;
  }

  .controls {
    gap: 10px;
  }

  .btn {
    min-width: 120px;
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .m-statistics {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .file-type-selector {
    :deep(.el-radio-button__inner) {
      padding: 8px 16px;
      font-size: 0.85rem;
    }
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    min-width: auto;
  }
}
.texts-container {
  margin-bottom: 30px;
}
</style>
