<template>
  <CpnVBody>
    <!-- 页面标题 -->
    <CpnPageHeader
      title="📊 Excel转JSON工具"
      subtitle="将Excel文件快速转换为JSON格式数据"
    />
    <div class="main-section">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>正在处理文件，请稍候...</p>
      </div>

      <!-- 结果展示区 -->
      <div v-if="jsonResult && !loading" class="result-area">
        <div class="result-header">
          <h3>转换结果</h3>
          <div class="result-actions">
            <button @click="downloadJson" class="btn btn-download">
              📥 下载JSON文件
            </button>
            <button @click="resetTool" class="btn btn-reset">
              🔄 重新转换
            </button>
          </div>
        </div>
        <div class="json-preview">
          <pre>{{ jsonResult }}</pre>
        </div>
      </div>

      <!-- 文件上传区 -->
      <div v-if="!jsonResult && !loading" class="upload-section">
        <div
          class="upload-area"
          :class="{ 'drag-over': isDragOver }"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @click="triggerFileInput"
        >
          <div class="upload-content">
            <span class="upload-icon">📁</span>
            <h3>选择或拖拽Excel文件</h3>
            <p>支持 .xls 和 .xlsx 格式</p>
            <button class="btn btn-primary">选择文件</button>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".xls,.xlsx"
            @change="handleFileSelect"
            style="display: none"
          />
        </div>

        <!-- 转换选项 -->
        <div class="options">
          <h4>转换选项</h4>
          <div class="option-group">
            <label class="checkbox-label">
              <input v-model="options.removeLineBreaks" type="checkbox" />
              <span class="checkmark"></span>
              去除换行符
            </label>
            <label class="checkbox-label">
              <input v-model="options.convertDates" type="checkbox" />
              <span class="checkmark"></span>
              转换日期格式
            </label>
            <label class="checkbox-label">
              <input v-model="options.mergeSheets" type="checkbox" />
              <span class="checkmark"></span>
              合并多个工作表
            </label>
          </div>
        </div>
      </div>

      <!-- 下载成功提示 -->
      <div v-if="showDownloadSuccess" class="success-message">
        ✅ JSON文件下载成功！
      </div>
    </div>
  </CpnVBody>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import CpnPageHeader from "@/components/layout/CpnPageHeader.vue";
import CpnVBody from "@/components/layout/CpnVBody.vue";
import {
  processExcelFile,
  downloadJsonFile,
  isExcelFile,
  formatJsonString,
  type ExcelConvertOptions,
} from "../utils/excel/utils";

// 响应式数据
const loading = ref(false);
const jsonResult = ref("");
const isDragOver = ref(false);
const showDownloadSuccess = ref(false);
const fileInput = ref<HTMLInputElement>();

// 转换选项
const options = reactive<ExcelConvertOptions>({
  removeLineBreaks: true,
  convertDates: true,
  mergeSheets: false,
});

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click();
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processFile(file);
  }
};

// 处理拖拽事件
const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file && isExcelFile(file)) {
      processFile(file);
    } else {
      alert("请选择Excel文件（.xls或.xlsx格式）");
    }
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

// 处理Excel文件
const processFile = async (file: File) => {
  loading.value = true;

  try {
    const result = await processExcelFile(file, options);
    // 格式化JSON
    jsonResult.value = formatJsonString(result);
  } catch (error) {
    console.error("文件处理错误:", error);
    alert(
      error instanceof Error
        ? error.message
        : "文件处理失败，请检查文件格式是否正确"
    );
  } finally {
    loading.value = false;
  }
};

// 下载JSON文件
const downloadJson = () => {
  if (!jsonResult.value) return;

  try {
    const jsonData = JSON.parse(jsonResult.value);
    downloadJsonFile(jsonData);

    // 显示下载成功提示
    showDownloadSuccess.value = true;
    setTimeout(() => {
      showDownloadSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error("下载失败:", error);
    alert("下载失败，请重试");
  }
};

// 重置工具
const resetTool = () => {
  jsonResult.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// 页面挂载时的初始化
onMounted(() => {
  // 设置页面标题
  document.title = "Excel转JSON工具 - koyoyoo工具集";
});
</script>

<style lang="scss" scoped>
.loading {
  text-align: center;
  padding: 60px 20px;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  p {
    color: #666;
    font-size: 1.1rem;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.result-area {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.result-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.3rem;
  }
}

.result-actions {
  display: flex;
  gap: 10px;
}

.json-preview {
  padding: 30px;
  max-height: 500px;
  overflow-y: auto;

  pre {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    margin: 0;
    font-family: "Consolas", "Monaco", monospace;
    font-size: 14px;
    line-height: 1.5;
    text-align: justify;
    overflow-x: auto;
  }
}

.upload-section {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.upload-area {
  border: 3px dashed #ddd;
  border-radius: 15px;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }

  &.drag-over {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    transform: scale(1.02);
  }
}

.upload-content {
  .upload-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    display: block;
  }

  h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.5rem;
  }

  p {
    color: #666;
    margin-bottom: 20px;
  }
}

.options {
  h4 {
    color: #333;
    margin-bottom: 15px;
    font-size: 1.2rem;
  }
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1rem;
  color: #555;

  input[type="checkbox"] {
    display: none;
  }

  .checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid #ddd;
    border-radius: 4px;
    margin-right: 10px;
    position: relative;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    &::after {
      content: "";
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      margin-top: -4px;
      transform: rotate(45deg);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }

  input[type="checkbox"]:checked + .checkmark {
    background: #667eea;
    border-color: #667eea;

    &::after {
      opacity: 1;
    }
  }
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
  }

  &.btn-download {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(17, 153, 142, 0.3);
    }
  }

  &.btn-reset {
    background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
    }
  }
}

.success-message {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  margin-top: 20px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .upload-area {
    padding: 40px 20px;
  }

  .upload-content {
    .upload-icon {
      font-size: 3rem;
    }

    h3 {
      font-size: 1.3rem;
    }
  }

  .result-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .result-actions {
    flex-direction: column;
    width: 100%;
  }

  .option-group {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
