import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

// 导入页面组件
const Home = () => import("@/views/Home.vue");
const Excel2Json = () => import("@/views/Excel2Json.vue");
const JsonCompressor = () => import("@/views/JsonCompressor.vue");
const ImageClipper = () => import("@/views/ImageClipper.vue");

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "koyoyoo在线工具集合",
    },
  },
  {
    path: "/excel2json",
    name: "Excel2Json",
    component: Excel2Json,
    meta: {
      title: "Excel转JSON工具",
    },
  },
  {
    path: "/json-compressor",
    name: "JsonCompressor",
    component: JsonCompressor,
    meta: {
      title: "JSON压缩工具",
    },
  },
  {
    path: "/image-clipper",
    name: "ImageClipper",
    component: ImageClipper,
    meta: {
      title: "图片圆形裁剪工具",
    },
  },
  {
    // 404页面重定向到首页
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 路由守卫 - 设置页面标题
router.beforeEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string;
  }
});

export default router;
