/**
 * 将图片裁剪为圆形
 * @param imageUrl - 图片URL地址
 * @param quality - 图片质量，0-1之间，默认0.8
 * @returns 返回裁剪后的圆形图片base64 URL
 */
export function clipImageToCircle(
  imageUrl: string,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 创建图片对象
      const img = new Image();

      // 设置跨域属性
      img.crossOrigin = "anonymous";

      img.onload = function () {
        try {
          // 计算图片尺寸，取宽高的最小值作为圆形直径
          const imgWidth = img.width;
          const imgHeight = img.height;
          const diameter = Math.min(imgWidth, imgHeight);

          // 创建canvas元素
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            throw new Error("无法获取canvas上下文");
          }

          // 设置canvas尺寸为圆形直径
          canvas.width = diameter;
          canvas.height = diameter;

          // 清除画布
          ctx.clearRect(0, 0, diameter, diameter);

          // 保存当前状态
          ctx.save();

          // 创建圆形裁剪路径
          ctx.beginPath();
          ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          // 计算裁剪区域（取图片中心的正方形区域）
          const sx = (imgWidth - diameter) / 2;
          const sy = (imgHeight - diameter) / 2;

          // 绘制图片到圆形区域内
          ctx.drawImage(
            img,
            sx,
            sy,
            diameter,
            diameter, // 源图片裁剪区域
            0,
            0,
            diameter,
            diameter // 目标绘制区域
          );

          // 恢复状态
          ctx.restore();

          // 转换为base64格式
          const circleImageUrl = canvas.toDataURL("image/png", quality);

          resolve(circleImageUrl);
        } catch (error) {
          console.error("图片裁剪过程中发生错误:", error);
          reject(error);
        }
      };

      img.onerror = function (error) {
        console.error("图片加载失败:", error);
        reject(new Error("图片加载失败"));
      };

      // 开始加载图片
      img.src = imageUrl;
    } catch (error) {
      console.error("创建canvas或处理图片时发生错误:", error);
      reject(error);
    }
  });
}

/**
 * 批量将图片裁剪为圆形
 * @param imageUrls - 图片URL数组
 * @param quality - 图片质量，0-1之间，默认0.8
 * @returns 返回裁剪后的圆形图片base64 URL数组
 */
export function clipImagesToCircle(
  imageUrls: string[],
  quality: number = 0.8
): Promise<string[]> {
  return Promise.all(imageUrls.map((url) => clipImageToCircle(url, quality)));
}
