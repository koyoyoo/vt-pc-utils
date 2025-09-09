<template>
  <div class="page-header">
    <h1 class="title">{{ title }}</h1>
    <p class="subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
// 定义组件属性
interface Props {
  title: string; // 页面标题
  subtitle?: string; // 页面副标题
}

// 接收父组件传递的属性
withDefaults(defineProps<Props>(), {
  subtitle: ''
});
</script>

<style lang="scss" scoped>
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 2.5rem;
  color: #fff;
  margin-bottom: 10px;
  font-weight: 700;
}

.subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
}
</style>