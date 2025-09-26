<template>
  <nav class="tool-navigation">
    <div class="nav-container">
      <router-link to="/" class="nav-home" title="返回首页">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">首页</span>
      </router-link>
      <div class="nav-divider"></div>
      <div class="nav-tools">
        <router-link
          v-for="tool in tools"
          :key="tool.path"
          :to="tool.path"
          class="nav-item"
          :title="tool.description"
        >
          <span class="nav-icon">{{ tool.icon }}</span>
          <span class="nav-text">{{ tool.name }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";

// 工具配置
const tools = ref([
  {
    name: "Excel转JSON",
    path: "/excel2json",
    icon: "📊",
    description: "Excel文件转换为JSON格式",
  },
  {
    name: "JSON压缩",
    path: "/json-compressor",
    icon: "🗜️",
    description: "JSON数据压缩和格式化",
  },
  {
    name: "图片圆形裁剪",
    path: "/image-clipper",
    icon: "🖼️",
    description: "图片圆形裁剪工具",
  },
  {
    name: "AES加密解密",
    path: "/aes-crypto",
    icon: "🔐",
    description: "AES算法加密解密工具",
  },
]);
</script>

<style lang="scss" scoped>
.tool-navigation {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-home {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  &.router-link-active {
    background: rgba(102, 126, 234, 0.3);
    color: #667eea;
  }
}

.nav-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
}

.nav-tools {
  display: flex;
  gap: 15px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateY(-1px);
  }

  &.router-link-active {
    background: rgba(102, 126, 234, 0.3);
    color: #fff;
  }
}

.nav-icon {
  font-size: 16px;
}

.nav-text {
  font-size: 14px;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 15px;
    gap: 10px;
  }

  .nav-text {
    display: none;
  }

  .nav-item,
  .nav-home {
    padding: 8px 12px;
  }

  .nav-tools {
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .nav-divider {
    display: none;
  }

  .nav-container {
    gap: 5px;
  }

  .nav-tools {
    gap: 5px;
  }
}
</style>
