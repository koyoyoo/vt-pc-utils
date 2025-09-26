import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import checker from "vite-plugin-checker";

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
    // 添加 TypeScript 检查插件
    checker({
      typescript: {
        tsconfigPath: "tsconfig.app.json",
      },
      vueTsc: {
        tsconfigPath: "tsconfig.app.json",
      },
      overlay: {
        initialIsOpen: false,
        position: "tl",
      },
      terminal: true,
      enableBuild: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ['crypto-js']
  },
  esbuild: {
    // 在开发模式下禁用 ESBuild 的 TypeScript 处理，让 vue-tsc 处理
    // 移除 tsconfigRaw 配置，让 esbuild 使用默认的 TypeScript 配置
  },
  // 添加开发服务器配置
  server: {
    // 启用 TypeScript 类型检查
    hmr: {
      overlay: true,
    },
  },
});
