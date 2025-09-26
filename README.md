# 🛠️ koyoyoo在线工具集合

一个基于 Vue 3 + TypeScript + Vite 构建的现代化在线工具集合，提供简单易用的在线工具，提升您的工作效率。

## ✨ 功能特性

### 📊 Excel转JSON工具
- 支持 `.xls` 和 `.xlsx` 格式文件
- 可选择去除换行符、转换日期格式
- 支持合并多个工作表
- 拖拽上传，操作简便
- 实时预览转换结果

### 🗜️ JSON压缩工具
- 高性能JSON格式化、压缩和美化
- 支持大文件处理（使用Web Worker）
- 实时显示压缩比例和文件大小
- JSON格式验证功能
- 支持语法高亮显示

### 🖼️ 图片圆形裁剪工具
- 上传图片并裁剪为圆形
- 支持质量调节（0.1-1.0）
- 实时预览裁剪效果
- 一键下载裁剪后的图片
- 支持多种图片格式

## 🚀 技术栈

- **前端框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite
- **开发语言**: TypeScript
- **UI组件库**: Element Plus
- **样式预处理**: SCSS
- **路由管理**: Vue Router 4
- **包管理器**: pnpm
- **核心依赖**:
  - `xlsx`: Excel文件处理
  - `element-plus`: UI组件库
  - `vue-router`: 路由管理

## 📦 安装教程

### 环境要求
- Node.js >= 16.0.0
- pnpm >= 7.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone [项目地址]
cd vt-pc-utils
```

2. **安装依赖**
```bash
pnpm install
```

3. **启动开发服务器**
```bash
pnpm dev
# 或
pnpm serve
```

4. **构建生产版本**
```bash
pnpm build
```

5. **预览生产版本**
```bash
pnpm preview
```

## 🎯 使用说明

### 本地开发
1. 启动开发服务器后，访问 `http://localhost:5173`
2. 选择需要使用的工具
3. 按照页面提示操作即可

### 部署说明
1. 执行 `pnpm build` 构建项目
2. 将 `dist` 目录部署到静态文件服务器
3. 配置服务器支持 SPA 路由

## 📁 项目结构

```
vt-pc-utils/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 通用组件
│   │   ├── CpnNavigation.vue    # 导航组件
│   │   ├── CpnPageHeader.vue    # 页面头部组件
│   │   ├── CpnFooter.vue        # 页脚组件
│   │   └── ...
│   ├── composables/        # 组合式函数
│   │   ├── useJsonWorker.ts     # JSON处理Worker
│   │   └── useToast.ts          # 消息提示
│   ├── utils/              # 工具函数
│   │   ├── excel/          # Excel处理工具
│   │   ├── canvas/         # Canvas图片处理
│   │   ├── file/           # 文件处理工具
│   │   ├── download/       # 下载工具
│   │   └── jsCompressor/   # JSON压缩工具
│   ├── views/              # 页面组件
│   │   ├── Home.vue        # 首页
│   │   ├── Excel2Json.vue  # Excel转JSON页面
│   │   ├── JsonCompressor.vue   # JSON压缩页面
│   │   └── ImageClipper.vue     # 图片裁剪页面
│   ├── styles/             # 样式文件
│   └── router/             # 路由配置
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🔧 核心功能模块

### Excel处理模块 (`src/utils/excel/`)
- 支持Excel文件读取和解析
- 提供多种转换选项
- 支持多工作表处理

### 图片处理模块 (`src/utils/canvas/`)
- Canvas图片裁剪功能
- 支持圆形裁剪
- 质量控制和格式转换

### JSON处理模块 (`src/utils/jsCompressor/`)
- 高性能JSON处理
- Web Worker支持
- 压缩比统计

### 文件处理模块 (`src/utils/file/`)
- 文件读取和验证
- 拖拽上传支持
- 文件类型检测

## 🌟 特色功能

- **响应式设计**: 支持PC端和移动端
- **现代化UI**: 基于Element Plus的美观界面
- **高性能处理**: 大文件使用Web Worker处理
- **本地处理**: 所有数据处理均在本地完成，保护隐私
- **TypeScript支持**: 完整的类型定义
- **模块化架构**: 清晰的代码组织结构

## 🤝 参与贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 开源协议

本项目采用 MIT 协议，详情请参阅 [LICENSE](LICENSE) 文件。

## 👨‍💻 作者信息

- **作者**: 小白
- **QQ**: 303135056
- **项目地址**: [GitHub仓库地址]

## 🙏 致谢

感谢以下开源项目的支持：
- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [SheetJS](https://sheetjs.com/)
