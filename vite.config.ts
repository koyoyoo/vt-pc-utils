import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
      template: {
        compilerOptions: {
          // 启用更严格的模板检查
          isCustomElement: () => false,
        },
      },
    }),
    // 移除 checker 插件，将类型检查完全交给 IDE 处理
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["crypto-js"],
  },
  esbuild: {
    // 在开发模式下禁用 ESBuild 的 TypeScript 处理，让 vue-tsc 处理
    // 移除 tsconfigRaw 配置，让 esbuild 使用默认的 TypeScript 配置
  },
  // 添加开发服务器配置
  server: {
    host: true, // 允许外部访问
    port: 5173, // 指定端口
    open: false, // 不自动打开浏览器
    // 热更新配置
    hmr: {
      overlay: true, // 显示错误覆盖层
    },
  },
});
