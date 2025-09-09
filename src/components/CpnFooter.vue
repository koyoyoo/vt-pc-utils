<template>
  <footer class="common-footer">
    <div class="footer-content">
      <p>作者：小白 | QQ：303135056</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 通用Footer组件
// 为所有页面添加统一的页脚信息
</script>

<style lang="scss" scoped>
.common-footer {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  padding: 15px 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }
}

@media (max-width: 768px) {
  .footer-content {
    padding: 0 15px;

    p {
      font-size: 12px;
    }
  }
}
</style>