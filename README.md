# 视频管理系统 (Express + S3)

## 功能
- JWT 身份验证（登录/登出）  
- 使用 MySQL 存储用户和视频  
- 安全上传到 S3  
- 视频列表、搜索、分页  

## 结构
查看 `src/` 文件夹以了解代码组织。

## 启动
1. 复制 `.env.example` 为 `.env` 并填写变量  
	- 变量 `API_VERSION` 用于定义路由前缀（例如：`v1` 对应 `/api/v1`）  
2. 安装依赖：`npm install`  
	- 安装过程中 FFmpeg 会自动下载并安装到 `bin/` 文件夹  
	- 如果自动安装失败，请手动运行：`npm run postinstall`  
3. 启动服务器：`npm run dev`  

## FFmpeg
项目使用 FFmpeg 用于：  
- 上传时提取视频时长  
- 将视频转码为 HLS (M3U8) 格式  

FFmpeg 会在执行 `npm install` 时通过 `postinstall` 脚本自动安装。  
如需手动重新安装 FFmpeg，请运行：`npm run install-ffmpeg`  
