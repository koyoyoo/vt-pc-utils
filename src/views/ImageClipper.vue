<template>
  <CpnVBody>
    <!-- 页面标题 -->
    <CpnPageHeader
      title="🖼️ 图片圆形裁剪工具"
      subtitle="上传图片并将其裁剪为圆形，支持下载裁剪后的图片"
    />
    <div class="main-section">
      <!-- 加载状态 -->
      <div v-if="isProcessing" class="loading">
        <div class="spinner"></div>
        <p>正在处理图片，请稍候...</p>
      </div>

      <!-- 结果展示区 -->
      <div v-if="originalImage && !isProcessing" class="result-area">
        <div class="image-container">
          <!-- 原图预览 -->
          <div class="original-preview">
            <h3>原图预览</h3>
            <div class="image-wrapper">
              <img :src="originalImage" alt="原图" />
            </div>
          </div>

          <!-- 裁剪后预览 -->
          <div class="clipped-preview">
            <h3>圆形裁剪预览</h3>
            <div class="image-wrapper">
              <img
                v-if="clippedImage"
                :src="clippedImage"
                alt="裁剪后的图片"
                class="circle-image"
              />
              <div v-else class="loading-placeholder">
                <div class="loading-spinner"></div>
                <p>正在处理图片...</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 质量调节 -->
        <div class="quality-control">
          <h4>图片质量设置</h4>
          <div class="quality-slider">
            <label for="quality">质量：{{ Math.round(quality * 100) }}%</label>
            <input
              id="quality"
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              v-model="quality"
              @input="processImage"
            />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="result-actions">
          <CpnButton
            type="primary"
            text="🔄 重新裁剪"
            :loading="isProcessing"
            @click="processImage"
          />
          <CpnButton
            type="download"
            text="📥 下载圆形图片"
            :disabled="!clippedImage"
            @click="downloadImage"
          />
          <CpnButton
            type="clear"
            text="🔄 重新选择图片"
            @click="resetAll"
          />
        </div>
      </div>

      <!-- 文件上传区 -->
      <div v-if="!originalImage && !isProcessing" class="upload-section">
        <div
          class="upload-area"
          :class="{ 'drag-over': isDragOver }"
          @drop="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            style="display: none"
          />
          <div class="upload-content">
            <span class="upload-icon">🖼️</span>
            <h3>选择或拖拽图片文件</h3>
            <p>支持 JPG、PNG、GIF 等格式，文件大小不超过10MB</p>
            <CpnButton
              type="primary"
              text="选择图片"
            />
          </div>
        </div>
      </div>
    </div>
  </CpnVBody>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import CpnPageHeader from "@/components/layout/CpnPageHeader.vue";
import CpnVBody from "@/components/layout/CpnVBody.vue";
import CpnButton from "@/components/button/CpnButton.vue";
import { clipImageToCircle } from "@/utils/canvas/clipImage";
import { ElMessage } from "element-plus";

// 响应式数据
const fileInput = ref<HTMLInputElement | null>(null);
const originalImage = ref<string>("");
const clippedImage = ref<string>("");
const isDragOver = ref<boolean>(false);
const isProcessing = ref<boolean>(false);
const quality = ref<number>(0.8);

// 触发文件选择
const triggerFileInput = (): void => {
  fileInput.value?.click();
};

// 处理文件选择
const handleFileSelect = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    handleFile(file);
  }
};

// 处理拖拽上传
const handleDrop = (event: DragEvent): void => {
  event.preventDefault();
  isDragOver.value = false;

  const files = event.dataTransfer?.files;
  if (files && files?.length > 0 && files[0]) {
    handleFile(files[0]);
  }
};

// 处理拖拽悬停
const handleDragOver = (event: DragEvent): void => {
  event.preventDefault();
  isDragOver.value = true;
};

// 处理拖拽离开
const handleDragLeave = (): void => {
  isDragOver.value = false;
};

// 处理文件
const handleFile = (file: File): void => {
  // 验证文件类型
  if (!file.type.startsWith("image/")) {
    ElMessage.error("请选择图片文件！");
    return;
  }

  // 验证文件大小（限制为10MB）
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error("图片文件大小不能超过10MB！");
    return;
  }

  // 读取文件并显示预览
  const reader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>): void => {
    if (e.target?.result) {
      originalImage.value = e.target.result as string;
      processImage();
    }
  };
  reader.readAsDataURL(file);
};

// 处理图片裁剪
const processImage = async (): Promise<void> => {
  if (!originalImage.value) return;

  isProcessing.value = true;
  clippedImage.value = "";

  try {
    // 使用工具函数进行圆形裁剪
    const result = await clipImageToCircle(originalImage.value, quality.value);
    clippedImage.value = result;
  } catch (error) {
    console.error("图片处理失败:", error);
    ElMessage.error("图片处理失败，请重试！");
  } finally {
    isProcessing.value = false;
  }
};

// 下载图片
const downloadImage = (): void => {
  if (!clippedImage.value) return;

  // 创建下载链接
  const link = document.createElement("a");
  link.href = clippedImage.value;
  link.download = `circle-image-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 重置所有状态
const resetAll = (): void => {
  originalImage.value = "";
  clippedImage.value = "";
  isProcessing.value = false;
  quality.value = 0.8;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// 页面加载完成后的初始化
onMounted((): void => {
  // 设置页面标题
  document.title = "图片圆形裁剪工具 - koyoyoo工具集";
});
</script>

<style lang="scss" scoped>
.image-clipper-page {
  padding-top: 60px; // 为导航栏留出空间
  padding-bottom: 80px; // 为页脚留出空间
}

.main-content {
  padding: 40px 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

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
    font-size: 11px;
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

.image-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  padding: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 20px;
  }

  .original-preview,
  .clipped-preview {
    h3 {
      font-size: 16px;
      color: #333;
      margin-bottom: 15px;
      text-align: center;
      font-weight: 600;
    }

    .image-wrapper {
      border: 2px solid #eee;
      border-radius: 10px;
      padding: 15px;
      background: #fafafa;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      &:hover {
        border-color: #667eea;
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
      }

      img {
        max-width: 100%;
        max-height: 270px;
        object-fit: contain;
        border-radius: 5px;

        &.circle-image {
          border-radius: 50%;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
      }

      .loading-placeholder {
        text-align: center;
        color: #666;

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        p {
          font-size: 14px;
        }
      }
    }
  }
}

.quality-control {
  padding: 20px 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-top: 1px solid #eee;

  h4 {
    color: #333;
    margin-bottom: 15px;
    font-size: 14px;
    text-align: center;
    font-weight: 600;
  }

  .quality-slider {
    max-width: 400px;
    margin: 0 auto;

    label {
      display: block;
      font-size: 13px;
      color: #555;
      margin-bottom: 10px;
      text-align: center;
      font-weight: 500;
    }

    input[type="range"] {
      width: 100%;
      height: 6px;
      background: linear-gradient(135deg, #ddd 0%, #ccc 100%);
      border-radius: 3px;
      outline: none;
      transition: all 0.3s ease;

      &::-webkit-slider-thumb {
        appearance: none;
        width: 25px;
        height: 25px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
        }
      }

      &::-moz-range-thumb {
        width: 25px;
        height: 25px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
      }
    }
  }
}

.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding: 25px 30px;
  background: white;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 20px;
  }
}

.upload-section {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
}

.upload-area {
  border: 3px dashed #ddd;
  border-radius: 15px;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);

  &:hover {
    border-color: #667eea;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.05) 0%,
      rgba(118, 75, 162, 0.05) 100%
    );
    transform: translateY(-2px);
    box-shadow: 0 7px 20px rgba(102, 126, 234, 0.15);
  }

  &.drag-over {
    border-color: #667eea;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.1) 0%,
      rgba(118, 75, 162, 0.1) 100%
    );
    transform: scale(1.02);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
  }

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
}

.upload-content {
  .upload-icon {
    font-size: 60px;
    margin-bottom: 20px;
    display: block;
    filter: grayscale(0.3);
  }

  h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 18px;
    font-weight: 600;
  }

  p {
    color: #666;
    margin-bottom: 20px;
    font-size: 13px;
    line-height: 1.5;
  }
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  justify-content: center;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
  }

  &.btn-download {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(17, 153, 142, 0.3);
    }
  }

  &.btn-reset {
    background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
    }
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 15px;
  }

  .image-container {
    .original-preview,
    .clipped-preview {
      h3 {
        font-size: 14px;
      }

      .image-wrapper {
        min-height: 200px;
        padding: 10px;
      }
    }
  }

  .quality-control {
    padding: 15px 20px;

    h4 {
      font-size: 13px;
    }
  }

  .upload-content {
    .upload-icon {
      font-size: 40px;
    }

    h3 {
      font-size: 15px;
    }

    p {
      font-size: 12px;
    }
  }

  .btn {
    padding: 10px 20px;
    font-size: 13px;
    min-width: 80px;
  }
}
</style>
