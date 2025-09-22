<template>
  <div class="home-page">
    <div class="container">
      <h1 class="title">🛠️ koyoyoo在线工具集合</h1>
      <p class="subtitle">简单易用的在线工具，提升您的工作效率</p>

      <div class="tools-grid">
        <!-- Excel转JSON工具 -->
        <router-link to="/excel2json" class="tool-card excel">
          <span class="tool-icon">📊</span>
          <h3 class="tool-title">Excel转JSON</h3>
          <p class="tool-description">
            轻松将Excel文件转换为JSON格式数据，支持.xls和.xlsx格式，可自定义转换选项
          </p>
        </router-link>

        <!-- JSON压缩工具 -->
        <router-link to="/json-compressor" class="tool-card json">
          <span class="tool-icon">🗜️</span>
          <h3 class="tool-title">JSON压缩</h3>
          <p class="tool-description">
            高性能JSON格式化、压缩和美化工具，支持大文件处理和格式验证
          </p>
        </router-link>

        <!-- 图片圆形裁剪工具 -->
        <router-link to="/image-clipper" class="tool-card image">
          <span class="tool-icon">🖼️</span>
          <h3 class="tool-title">图片圆形裁剪</h3>
          <p class="tool-description">
            简单易用的图片圆形裁剪工具，支持上传图片、裁剪和下载
          </p>
        </router-link>
      </div>

      <div class="footer">
        <p>选择上方工具开始使用 | 所有处理均在本地完成，保护您的数据安全</p>
      </div>
    </div>

    <!-- 页脚组件 -->
    <CpnFooter />
  </div>
</template>

<script setup lang="ts">
import CpnFooter from "../components/CpnFooter.vue";
</script>

<style lang="scss" scoped>
.home-page {
  height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  text-align: center;
}

.title {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 40px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); // 固定一行显示2条数据
  gap: 30px;
  margin-top: 30px;
}

.tool-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 15px;
  padding: 30px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: block;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }

  &.excel {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  }

  &.json {
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  }
}

.tool-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  display: block;
}

.tool-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.tool-description {
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
}

.footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  color: #999;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 2rem;
  }

  .container {
    padding: 30px 20px;
  }
}
</style>
