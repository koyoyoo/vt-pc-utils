<template>
  <div class="aes-crypto-container">
    <!-- 页面头部 -->
    <CpnPageHeader
      title="AES 加密解密工具"
      description="使用 AES 算法对文本进行加密和解密操作"
    />

    <div class="crypto-content">
      <!-- 密钥输入区域 -->
      <div class="key-section">
        <el-card class="key-card">
          <template #header>
            <div class="card-header">
              <span>密钥设置2</span>
            </div>
          </template>
          <div class="key-input-group">
            <el-input
              v-model="secretKey"
              placeholder="请输入密钥（建议16位以上）"
              show-password
              clearable
              class="key-input"
            >
              <template #prepend>密钥</template>
            </el-input>
            <el-button type="primary" @click="generateRandomKey"
              >生成随机密钥</el-button
            >
          </div>
        </el-card>
      </div>
      <!-- 高级选项 -->
      <div class="advanced-section">
        <el-card class="advanced-card">
          <div class="advanced-options">
            <div class="option-group">
              <label>加密模式：</label>
              <el-select v-model="encryptionMode" placeholder="选择加密模式">
                <el-option label="ECB" value="ECB" />
                <el-option label="CBC" value="CBC" />
                <el-option label="CFB" value="CFB" />
                <el-option label="OFB" value="OFB" />
              </el-select>
            </div>
            <div class="option-group">
              <label>填充模式：</label>
              <el-select v-model="paddingMode" placeholder="选择填充模式">
                <el-option label="Pkcs7" value="Pkcs7" />
                <el-option label="AnsiX923" value="AnsiX923" />
                <el-option label="Iso10126" value="Iso10126" />
                <el-option label="ZeroPadding" value="ZeroPadding" />
              </el-select>
            </div>
            <div class="option-group">
              <label>输出格式：</label>
              <el-select v-model="outputFormat" placeholder="选择输出格式">
                <el-option label="Base64" value="Base64" />
                <el-option label="Hex" value="Hex" />
              </el-select>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 加密解密操作区域 -->
    <div class="operation-section">
      <div class="operation-left">
        <el-card class="operation-card">
          <template #header>
            <div class="card-header">
              <span>原文输入</span>
              <div class="header-actions">
                <el-button size="small" @click="clearPlainText">清空</el-button>
                <el-button
                  size="small"
                  type="primary"
                  @click="encryptText"
                  :loading="isEncrypting"
                >
                  🔒 加密
                </el-button>
              </div>
            </div>
          </template>
          <el-input
            v-model="plainText"
            type="textarea"
            :rows="12"
            placeholder="请输入要加密的文本..."
            resize="none"
            class="text-area"
          />
        </el-card>
      </div>

      <div class="operation-right">
        <el-card class="operation-card">
          <template #header>
            <div class="card-header">
              <span>密文输出</span>
              <div class="header-actions">
                <el-button size="small" @click="clearCipherText"
                  >清空</el-button
                >
                <el-button size="small" @click="copyResult">复制</el-button>
                <el-button
                  size="small"
                  type="success"
                  @click="decryptText"
                  :loading="isDecrypting"
                >
                  🔓 解密
                </el-button>
              </div>
            </div>
          </template>
          <el-input
            v-model="cipherText"
            type="textarea"
            :rows="12"
            placeholder="加密后的密文将显示在这里..."
            resize="none"
            class="text-area"
          />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CpnPageHeader from "@/components/CpnPageHeader.vue";
import { useToast } from "@/composables/useToast";
import CryptoJS from "crypto-js";

// 响应式数据
const secretKey = ref(""); // 密钥
const plainText = ref(""); // 原文
const cipherText = ref(""); // 密文
const isEncrypting = ref(false); // 加密状态
const isDecrypting = ref(false); // 解密状态

// 高级选项
const encryptionMode = ref("CBC"); // 加密模式
const paddingMode = ref("Pkcs7"); // 填充模式
const outputFormat = ref("Base64"); // 输出格式

// Toast 实例
const toast = useToast();

// 生成随机密钥
const generateRandomKey = () => {
  const randomKey = CryptoJS.lib.WordArray.random(16).toString();
  secretKey.value = randomKey;
  toast.success("随机密钥已生成");
};

// 加密文本
const encryptText = async () => {
  if (!secretKey.value.trim()) {
    toast.error("请输入密钥");
    return;
  }

  if (!plainText.value.trim()) {
    toast.error("请输入要加密的文本");
    return;
  }

  isEncrypting.value = true;

  try {
    // 获取加密配置
    const mode = (CryptoJS.mode as any)[encryptionMode.value];
    const padding = (CryptoJS.pad as any)[paddingMode.value];

    // 执行加密
    const encrypted = CryptoJS.AES.encrypt(plainText.value, secretKey.value, {
      mode: mode,
      padding: padding,
    });

    // 根据输出格式转换结果
    if (outputFormat.value === "Base64") {
      cipherText.value = encrypted.toString();
    } else {
      cipherText.value = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    }

    toast.success("加密成功");
  } catch (error) {
    toast.error("加密失败：" + (error as Error).message);
  } finally {
    isEncrypting.value = false;
  }
};

// 解密文本
const decryptText = async () => {
  if (!secretKey.value.trim()) {
    toast.error("请输入密钥");
    return;
  }

  if (!cipherText.value.trim()) {
    toast.error("请输入要解密的密文");
    return;
  }

  isDecrypting.value = true;

  try {
    // 获取解密配置
    const mode = (CryptoJS.mode as any)[encryptionMode.value];
    const padding = (CryptoJS.pad as any)[paddingMode.value];

    let decrypted;

    // 根据输出格式处理密文
    if (outputFormat.value === "Base64") {
      decrypted = CryptoJS.AES.decrypt(cipherText.value, secretKey.value, {
        mode: mode,
        padding: padding,
      });
    } else {
      // Hex格式需要特殊处理
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(cipherText.value),
      });
      decrypted = CryptoJS.AES.decrypt(cipherParams, secretKey.value, {
        mode: mode,
        padding: padding,
      });
    }

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      throw new Error("解密失败，请检查密钥和密文是否正确");
    }

    plainText.value = decryptedText;
    toast.success("解密成功");
  } catch (error) {
    toast.error("解密失败：" + (error as Error).message);
  } finally {
    isDecrypting.value = false;
  }
};

// 复制结果
const copyResult = async () => {
  if (!cipherText.value.trim()) {
    toast.error("没有可复制的内容");
    return;
  }

  try {
    await navigator.clipboard.writeText(cipherText.value);
    toast.success("已复制到剪贴板");
  } catch (error) {
    toast.error("复制失败");
  }
};

// 清空原文
const clearPlainText = () => {
  plainText.value = "";
};

// 清空密文
const clearCipherText = () => {
  cipherText.value = "";
};
</script>

<style lang="scss" scoped>
.aes-crypto-container {
  padding-top: 20px;
}

.crypto-content {
  width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.key-section {
  .key-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    .card-header {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: #2c3e50;
    }

    .key-input-group {
      display: flex;
      gap: 12px;
      align-items: center;

      .key-input {
        flex: 1;
      }
    }
  }
}

.operation-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  .operation-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: #2c3e50;

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    .text-area {
      :deep(.el-textarea__inner) {
        border-radius: 8px;
        border: 2px solid #e1e8ed;
        font-family: "Consolas", "Monaco", monospace;
        font-size: 14px;
        line-height: 1.5;

        &:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }
      }
    }
  }
}

.advanced-section {
  margin-bottom: 20px;
  .advanced-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    .card-header {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: #2c3e50;
    }

    .advanced-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;

      .option-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        label {
          font-weight: 500;
          color: #555;
          font-size: 14px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .aes-crypto-container {
    padding: 10px;
  }

  .operation-section {
    grid-template-columns: 1fr;
  }

  .key-input-group {
    flex-direction: column;
    align-items: stretch !important;
  }

  .advanced-options {
    grid-template-columns: 1fr !important;
  }
}
</style>
