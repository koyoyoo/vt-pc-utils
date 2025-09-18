import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    // ESBuild只支持有限的TypeScript编译选项
    tsconfigRaw: {
      compilerOptions: {
        // 基础严格模式选项
        strict: true,
        // 类字段定义行为
        useDefineForClassFields: true,
        // 模块语法处理
        verbatimModuleSyntax: true
      }
    }
  }
})
