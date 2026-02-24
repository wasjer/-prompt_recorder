# 扩展图标

## 问题

如果遇到 "Could not load icon" 错误，说明缺少图标文件。

## 解决方案

### 方案一：使用提供的工具创建图标（推荐）

1. 在浏览器中打开 `create-icons.html` 文件
2. 点击每个尺寸的"下载"按钮
3. 将下载的文件保存到此目录（`extension/browser/icons/`）
4. 确保文件名为：
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

### 方案二：使用在线工具

1. 访问在线图标生成工具，如：
   - https://www.favicon-generator.org/
   - https://realfavicongenerator.net/
2. 上传或创建一个图标
3. 下载不同尺寸的图标
4. 重命名为 `icon16.png`, `icon48.png`, `icon128.png`
5. 放置到此目录

### 方案三：使用简单占位图标

如果暂时不需要图标，可以：

1. 创建三个简单的 PNG 文件（16x16, 48x48, 128x128）
2. 可以使用任何图片编辑工具创建
3. 或者使用命令行工具（如果有 ImageMagick）：
   ```bash
   # Windows (需要安装 ImageMagick)
   convert -size 16x16 xc:#4A90E2 icon16.png
   convert -size 48x48 xc:#4A90E2 icon48.png
   convert -size 128x128 xc:#4A90E2 icon128.png
   ```

## 图标要求

- **格式**: PNG
- **尺寸**: 
  - icon16.png: 16x16 像素
  - icon48.png: 48x48 像素
  - icon128.png: 128x128 像素
- **位置**: `extension/browser/icons/` 目录

## 临时解决方案

如果暂时不想创建图标，可以修改 `manifest.json`，移除图标配置（但扩展会显示默认图标）。
