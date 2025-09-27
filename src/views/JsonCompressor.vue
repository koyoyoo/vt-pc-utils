<template>
  <div class="json-compressor-page">
    <!-- 导航栏 -->
    <CpnNavigation />

    <div class="main-content">
      <div class="container">
        <!-- 页面标题 -->
        <CpnPageHeader
          title="🗜️ JSON压缩工具"
          subtitle="高性能JSON格式化、压缩和美化工具"
        />

        <!-- 主要内容区域 -->
        <div class="main-section">
          <!-- 输入区域 -->
          <div class="textarea-container">
            <div class="textarea-label" for="input-json">输入JSON数据</div>
            <textarea
              id="input-json"
              v-model="inputJson"
              placeholder="在此粘贴或输入您的JSON数据..."
              @input="handleInput"
              @drop="handleDrop"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              :class="{ 'drag-over': isDragOver }"
            ></textarea>
          </div>

          <!-- 输出区域 -->
          <div class="textarea-container">
            <div class="textarea-label" for="output-json">处理结果</div>
            <textarea
              id="output-json"
              v-model="outputJson"
              placeholder="处理后的JSON数据将显示在这里..."
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
            :disabled="loading || !inputJson.trim()"
            :loading="loading && currentOperation === 'compress'"
            @click="processJson('compress')"
          />

          <CpnButton
            type="format"
            text="格式化 (Ctrl+F)"
            icon="✨"
            :disabled="loading || !inputJson.trim()"
            :loading="loading && currentOperation === 'format'"
            @click="processJson('format')"
          />

          <CpnButton
            type="validate"
            text="验证 (Ctrl+V)"
            icon="✅"
            :disabled="loading || !inputJson.trim()"
            :loading="loading && currentOperation === 'validate'"
            @click="processJson('validate')"
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
            :disabled="loading || !outputJson.trim()"
            @click="downloadResult"
          />
        </div>

        <!-- 统计信息 -->
        <div class="stats" v-if="stats.originalSize > 0">
          <div class="stat-item">
            <span class="stat-label">原始大小：</span>
            <span class="stat-value">{{
              formatBytes(stats.originalSize)
            }}</span>
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
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json,.txt"
      @change="handleFileSelect"
      style="display: none"
    />

    <!-- 页脚 -->
    <CpnFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import CpnPageHeader from "../components/CpnPageHeader.vue";
import CpnNavigation from "../components/CpnNavigation.vue";
import CpnFooter from "../components/CpnFooter.vue";
import CpnButton from "@/components/button/CpnButton.vue";
import { formatBytes, type JsonStats } from "@/utils/jsCompressor";
import { downloadJsonFile } from "@/utils/download";
import { useJsonWorker, type JsonOperation } from "@/composables/useJsonWorker";
import {
  handleFileSelect as handleFileSelectUtil,
  handleFileDrop,
  handleDragOver as handleDragOverUtil,
  handleDragLeave as handleDragLeaveUtil,
  triggerFileSelect,
  type FileReadResult,
} from "@/utils/file";

// 响应式数据
const inputJson = ref("");
const outputJson = ref("");
const loading = ref(false);
const isDragOver = ref(false);
const currentOperation = ref("");
const fileInput = ref<HTMLInputElement>();

// 统计信息
const stats = reactive<JsonStats>({
  originalSize: 0,
  compressedSize: 0,
  compressionRatio: 0,
  processingTime: 0,
});

// 使用 JSON Worker hooks
const { processJson: processJsonWithWorker, getJsonStats } = useJsonWorker();

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

// 处理JSON数据
const processJson = async (operation: JsonOperation) => {
  if (!inputJson.value.trim()) {
    showToast("请输入JSON数据", "error");
    return;
  }

  setLoading(true, operation);

  try {
    // 使用 hooks 处理 JSON
    const result = await processJsonWithWorker(inputJson.value, operation);

    if (result.success && result.result) {
      if (operation === "validate") {
        showToast(result.result, "success");
        outputJson.value = inputJson.value;
      } else {
        outputJson.value = result.result;
        // 计算统计信息
        const newStats = getJsonStats(
          inputJson.value,
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
  } catch (error: any) {
    showToast(`处理失败: ${error.message}`, "error");
  } finally {
    setLoading(false);
  }
};

// 清空内容
const clearContent = () => {
  inputJson.value = "";
  outputJson.value = "";
  stats.originalSize = 0;
  stats.compressedSize = 0;
  stats.compressionRatio = 0;
  stats.processingTime = 0;
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
        inputJson.value = result.content;
        showToast(`文件 "${result.fileName}" 加载成功`, "success");
      } else {
        showToast(result.error || "文件读取失败", "error");
      }
    },
    {
      acceptedTypes: [".json", ".txt"],
    }
  );
};

// 下载结果
const downloadResult = () => {
  if (!outputJson.value.trim()) {
    showToast("没有可下载的内容", "error");
    return;
  }

  try {
    downloadJsonFile(outputJson.value, "processed", true);
    showToast("文件下载成功", "success");
  } catch (error: any) {
    showToast(`下载失败: ${error.message}`, "error");
  }
};

// 处理输入变化
const handleInput = () => {
  // 自动保存到本地存储
  localStorage.setItem("json-compressor-input", inputJson.value);
};

// 处理拖拽事件
const handleDrop = (event: DragEvent) => {
  isDragOver.value = false;

  handleFileDrop(
    event,
    (result: FileReadResult) => {
      if (result.success && result.content) {
        inputJson.value = result.content;
        showToast(`文件 "${result.fileName}" 加载成功`, "success");
      } else {
        showToast(result.error || "文件读取失败", "error");
      }
    },
    {
      acceptedTypes: [".json", ".txt"],
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
        processJson("compress");
        break;
      case "f":
      case "F":
        event.preventDefault();
        processJson("format");
        break;
      case "v":
      case "V":
        if (!event.shiftKey) {
          // 避免与粘贴冲突
          event.preventDefault();
          processJson("validate");
        }
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
  document.title = "JSON压缩工具 - koyoyoo工具集";

  // 从本地存储恢复内容
  const savedInput = localStorage.getItem("json-compressor-input");
  if (savedInput) {
    inputJson.value = savedInput;
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

.main-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
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
}

.stats {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .stat-label {
    font-weight: 500;
    color: #666;
  }

  .stat-value {
    font-weight: 600;
    color: #333;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 15px;
  }

  .title {
    font-size: 2rem;
  }

  .main-section {
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

  .stats {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    min-width: auto;
  }
}
</style>
