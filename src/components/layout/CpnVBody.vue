<template>
  <div class="v-body">
    <!-- 顶部导航 -->
    <CpnNavigation />

    <!-- 主要内容区域 -->
    <main class="body-content-wrap">
      <div class="body-content-box">
        <slot />
      </div>
    </main>

    <!-- 底部页脚 -->
    <CpnFooter />
  </div>
</template>

<script setup lang="ts">
import CpnNavigation from "./CpnNavigation.vue";
import CpnFooter from "./CpnFooter.vue";

// VBody公共组件
// 提供统一的页面布局结构：导航栏 + 内容区域 + 页脚
// 内容区域通过slot插槽来展示具体页面内容
</script>

<style lang="scss" scoped>
.v-body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.body-content-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.body-content-box {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>
