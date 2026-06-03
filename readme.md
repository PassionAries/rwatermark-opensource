# RWatermark - 多平台无水印视频解析服务

一个基于 NestJS 的多平台短视频无水印解析后端服务，支持从抖音、小红书、快手、微博、B 站、头条等平台提取无水印视频，并配套微信小程序用户体系与广告积分模块。

## ✨ 特性

- 🎯 **多平台支持**：支持抖音、小红书、快手、微博、B 站、头条等多个主流短视频平台
- 🚀 **流式下载**：支持大文件流式传输，节省内存
- 💾 **智能缓存**：自动缓存已下载文件，支持断点续传（Range 请求）
- 🔄 **自动清理**：定时清理超过 24 小时的缓存文件
- 🛡️ **并发控制**：防止同一文件重复下载
- 📊 **数据持久化**：解析记录保存到 MySQL，支持查询和管理
- 📱 **小程序集成**：内置微信登录、用户信息、广告积分等能力

## 🎬 支持的平台

| 平台 | 支持状态 | URL 格式示例 |
|------|---------|-------------|
| 抖音 | ✅ | `https://v.douyin.com/xxx` 或 `https://www.iesdouyin.com/share/video/xxx` |
| 小红书 | ✅ | `https://xhslink.com/o/xxx` |
| 快手 | ✅ | `https://v.kuaishou.com/xxx` |
| 微博 | ✅ | `https://video.weibo.com/show?fid=xxx` |
| B 站 | ✅ | `https://www.bilibili.com/video/xxx` 或 `https://b23.tv/xxx` |
| 头条 | ✅ | `https://m.toutiao.com/is/xxx` |
| 头条 | ✅ | `https://m.toutiao.com/is/xxx` |
| 剪映 | ✅ | `` |
| 梨视频 | ✅ | `` |
| 绿洲 | ✅ | `` |
| 皮皮搞笑 | ✅ | `` |
| 皮皮虾 | ✅ | `` |
| 全民K歌 | ✅ | `` |
| 搜狐 | ✅ | `` |
| 视频号 | ✅ | `` |
| 小云雀 | ✅ | `` |
| 最右 | ✅ | `` |
| 豆包 | ✅ | `` |

> 逐渐增加，



> 解析接口支持粘贴分享文案，服务会自动从文本中提取上述格式的链接。

## 📱 客户端

本项目提供客户端应用，扫码即可使用：
二维码无法加载出来，可以 微信搜 “小猪去水印Pro”
<img src="imgs/f2838ca8ea2dca0dfd657fefc354c250.jpg" alt="客户端二维码" width="200" />

扫码后即可体验完整功能，无需手动配置 API 接口。

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | NestJS 11、TypeScript |
| 数据库 | MySQL + TypeORM |
| 浏览器自动化 | Puppeteer Core + chrome-finder |
| 认证 | JWT |
| 文档 | Swagger（开发环境） |
| 定时任务 | @nestjs/schedule |

## 📋 前置要求

- **Node.js** >= 18.x（推荐 LTS）
- **MySQL** >= 8.0
- **Chrome / Chromium**（抖音解析依赖 Puppeteer，需本机安装 Chrome 或设置 `CHROME_PATH`）
- **npm** 或 **pnpm**

## 🚀 快速开始

### 1. 安装依赖

```bash
git clone <repository-url>
cd rwatermark-server
npm install
```

### 2. 初始化数据库

创建 MySQL 数据库后，执行项目内的建表脚本：

```bash
mysql -u root -p your_database < sql/rwatermark.sql
```

脚本会创建以下核心表：

- `short_video` — 短视频解析记录
- `mini_user` — 小程序用户
- `play_video_ad` — 广告播放记录
- `slow_sql` — 慢 SQL 日志（可选）

### 3. 配置服务

复制配置模板并编辑：

```bash
cp conf-json/rwatermark-server.example.json conf-json/rwatermark-server.json
```

`conf-json/rwatermark-server.json` 已加入 `.gitignore`，不会提交到 Git。主要配置项：

```json
{
  "port": 9200,
  "serviceName": "rwatermark-server",
  "env": "dev",
  "defaultAppid": "",
  "jwt": {
    "secret": "your-jwt-secret",
    "expiresIn": "365d"
  },
  "encryption": {
    "secretKey": "your-encryption-secret-key"
  },
  "typeorm": {
    "host": "127.0.0.1",
    "port": 3306,
    "username": "root",
    "password": "your-password",
    "database": "rwatermark"
  },
  "xhs": {
    "proxyUrl": ""
  },
  "wechatMiniMap": {
    "wxXXXXXXXXXXXXXXXX": {
      "appId": "wxXXXXXXXXXXXXXXXX",
      "appSecret": "your-app-secret"
    }
  },
  "ad": {
    "points": 10
  },
  "checkIn": {
    "pointsPerDay": 10
  }
}
```

> `defaultAppid` 可选；留空时若 `wechatMiniMap` 只配置一个小程序，会自动使用其 appId。

**平台 Cookie（微博 / 头条解析需要）**

```bash
cp cookies/weibo.cookie.example cookies/weibo.cookie
cp cookies/toutiao.cookie.example cookies/toutiao.cookie
```

填入对应平台的登录 Cookie，`cookies/*.cookie` 同样不会提交到 Git。

> ⚠️ 请勿将包含真实密钥的配置文件提交到公开仓库。

### 4. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# 运行环境，local 模式下部分服务会启用本地调试逻辑
NODE_ENV=local

# Chrome 可执行文件路径（可选，默认自动查找）
CHROME_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome

# Puppeteer 是否无头模式（可选）
PUPPETEER_HEADLESS=true

# 慢 SQL 阈值，单位毫秒（可选）
SLOW_SQL_TIME=1000
```

### 5. 启动服务

```bash
# 开发模式（热重载）
npm run dev

# 生产构建 & 运行
npm run build
npm run start:prod
```

服务默认监听 `9200` 端口（可在配置文件中修改）。开发环境下可访问 Swagger 文档：

```
http://localhost:9200/api
```

## 📡 API 接口

### 认证说明

除下载接口外，大部分接口需要在请求头中携带：

| Header | 必填 | 说明 |
|--------|------|------|
| `token` | 是 | 登录后获得的 JWT Token |
| `appid` | 否 | 微信小程序 AppID，未传时使用服务端默认值 |

统一响应格式：

```json
{
  "code": 200,
  "data": {},
  "msg": "success"
}
```

---

### 用户模块 `/api/mini-user`

#### 小程序登录

```
POST /api/mini-user/spLogin
```

**请求体：**

```json
{
  "code": "微信 wx.login 返回的 code",
  "appid": "wxXXXXXXXXXXXXXXXX",
  "inviteCode": "邀请码（可选）"
}
```

**响应示例：**

```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "openid": "oXXXX",
      "nickname": "用户昵称"
    }
  }
}
```

#### 校验登录状态

```
POST /api/mini-user/checkLogin
```

需携带 `token` 请求头，返回当前登录用户信息。

#### 更新用户信息

```
POST /api/mini-user/updateUserInfo
```

需携带 `token` 请求头。

---

### 解析模块 `/api/rwatermark`

#### 1. 解析视频水印

```
POST /api/rwatermark/parseWatermark
```

**请求体：**

```json
{
  "url": "3.33 复制打开抖音，看看【xxx的作品】... https://v.douyin.com/xxx"
}
```

**响应示例：**

```json
{
  "code": 200,
  "data": {
    "id": 123
  }
}
```

返回 `id` 后，通过「获取视频详情」接口查询解析结果。`short_video.status` 含义：

| status | 含义 |
|--------|------|
| `0` | 解析中 |
| `1` | 解析成功 |
| `2` | 解析失败 |

#### 2. 获取视频列表

```
POST /api/rwatermark/findShortVideoList
```

**响应示例：**

```json
{
  "code": 200,
  "data": {
    "rows": [
      {
        "id": 1,
        "type": "douyin",
        "contentType": "video",
        "content": {
          "title": "视频标题",
          "cover": "封面图片 URL",
          "url": "无水印视频 URL"
        },
        "status": 1,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### 3. 获取视频详情

```
POST /api/rwatermark/findShortVideoDetail
```

**请求体：**

```json
{
  "id": 1
}
```

#### 4. 删除视频记录

```
POST /api/rwatermark/deleteShortVideo
```

**请求体：**

```json
{
  "id": 1
}
```

> 软删除，仅设置 `deleted_at` 字段。

#### 5. 下载文件（无需认证）

```
GET /api/rwatermark/download?url={文件URL}
```

**说明：**

- 支持 HTTP Range 请求（断点续传）
- 自动缓存文件到 `shortVideos/` 目录，提高重复下载速度
- 支持流式传输，节省服务器内存
- 缓存不存在时会转发 Range 请求到源站，同时后台异步缓存

**示例：**

```
GET /api/rwatermark/download?url=https://example.com/video.mp4
Range: bytes=0-1023
```

---

### 广告模块 `/api/ad`

| 接口 | 说明 |
|------|------|
| `POST /api/ad/getAdConfig` | 获取广告配置（是否需要播放视频广告） |
| `POST /api/ad/playAd` | 记录广告播放 |
| `POST /api/ad/playAdAndGetPoints` | 播放广告并领取积分 |
| `POST /api/ad/getPlayVideoAdCount` | 获取今日广告播放次数 |

以上接口均需携带 `token` 请求头。

## 🏗️ 项目结构

```
rwatermark-server/
├── conf-json/                          # 服务配置文件
│   └── rwatermark-server.json
├── sql/                                # 数据库建表脚本
│   └── rwatermark.sql
├── imgs/                               # README 图片资源
├── shortVideos/                        # 视频下载缓存目录（运行时自动创建）
├── cookies/                            # 平台 Cookie（如微博）
├── src/
│   ├── main.ts                         # 应用入口
│   ├── app.module.ts                   # 根模块
│   ├── config/                         # 配置模块
│   ├── core/                           # 通用能力
│   │   ├── guards/                     # 鉴权守卫
│   │   ├── interceptors/               # 日志、响应转换
│   │   ├── filters/                    # 全局异常处理
│   │   └── middleware/                 # CORS、限流、Helmet 等
│   ├── entities/                       # TypeORM 实体
│   │   ├── shortVideo.entity.ts
│   │   ├── miniUser.entity.ts
│   │   └── playVideoAd.entity.ts
│   └── modules/
│       ├── rwatermark/                 # 核心解析模块
│       │   ├── dto/
│       │   ├── puppeteer/              # Puppeteer 工具
│       │   ├── bilibili.service.ts
│       │   ├── douyinV2.service.ts
│       │   ├── kuaishou.service.ts
│       │   ├── toutiao.service.ts
│       │   ├── weibo.service.ts
│       │   ├── xhs.service.ts
│       │   ├── index.controller.ts
│       │   ├── index.service.ts
│       │   └── stream-download.implementation.ts
│       ├── mini-user/                  # 小程序用户
│       ├── ad/                         # 广告积分
│       └── wechat-mini-api/            # 微信 API 封装
├── package.json
└── README.md
```

## 🔧 核心功能

### 1. 视频解析

服务会自动识别 URL 所属平台，并调用对应的解析服务：

```typescript
// 自动识别平台并解析
await rwatermarkService.parseWatermark({
  url: "https://v.douyin.com/xxx",
  openid: "user_openid",
  appid: "wx_appid"
});
```

各平台解析逻辑位于 `src/modules/rwatermark/` 下对应的 `*.service.ts` 文件中。

### 2. 流式下载

支持大文件的流式传输，避免内存溢出：

- 自动缓存已下载文件
- 支持 HTTP Range 请求（断点续传）
- 并发下载控制，避免重复下载
- 自动重试机制（最多 2 次）

### 3. 缓存管理

- 文件缓存路径：项目根目录 `shortVideos/`
- 缓存文件命名：URL 的 MD5 值
- 自动清理：每小时清理超过 24 小时的缓存文件

## ⚙️ 配置说明

### Puppeteer 配置

抖音解析使用 Puppeteer Core，通过 `chrome-finder` 自动查找本机 Chrome。若查找失败，请在 `.env` 中指定：

```bash
CHROME_PATH=/path/to/chrome
```

Linux 服务器示例：

```bash
CHROME_PATH=/usr/bin/google-chrome
PUPPETEER_HEADLESS=true
```

### 代理配置

部分平台（如小红书）在特定网络环境下可能需要代理，在配置文件中设置：

```json
"xhs": {
  "proxyUrl": "http://your-proxy-host:9022"
}
```

留空则不使用代理。

### 微信小程序配置

在 `conf-json/rwatermark-server.json` 的 `wechatMiniMap` 中配置小程序 `appId` 和 `appSecret`，用于 `spLogin` 接口换取用户 openid。

## 📜 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式启动（热重载） |
| `npm run build` | 编译 TypeScript |
| `npm run start:prod` | 运行编译后的生产代码 |
| `npm run lint` | ESLint 检查并自动修复 |
| `npm run test` | 运行单元测试 |
| `npm run test:e2e` | 运行端到端测试 |

## 🚢 生产部署

以下以 Linux 服务器（Ubuntu / Debian / CentOS）为例，使用 **PM2** 守护进程 + **Nginx** 反向代理。项目已内置 `ecosystem.config.js` 配置文件。

### 1. 服务器环境准备

**安装 Node.js（>= 18）**

```bash
# 推荐使用 nvm 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

**安装 MySQL 8.0**

确保数据库已创建，并导入 `sql/rwatermark.sql` 建表脚本。

**安装 Chrome（抖音解析必需）**

```bash
# Ubuntu / Debian
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install -y google-chrome-stable

# 验证
google-chrome --version
```

**安装 PM2**

```bash
npm install -g pm2
```

### 2. 拉取代码 & 安装依赖

```bash
cd /opt
git clone <repository-url> rwatermark-server
cd rwatermark-server
npm install --production=false
npm run build
```

### 3. 生产环境配置

**修改 `conf-json/rwatermark-server.json`**

```json
{
  "port": 9200,
  "env": "prod",
  "jwt": {
    "secret": "请替换为足够长的随机字符串",
    "expiresIn": "365d"
  },
  "encryption": {
    "secretKey": "请替换为足够长的随机字符串"
  },
  "typeorm": {
    "host": "127.0.0.1",
    "port": 3306,
    "username": "rwatermark",
    "password": "your-password",
    "database": "rwatermark"
  },
  "wechatMiniMap": {
    "your-key": {
      "appId": "wxXXXXXXXXXXXXXXXX",
      "appSecret": "your-app-secret"
    }
  }
}
```

> 生产环境请将 `env` 设为 `prod`，Swagger 文档（`/api`）仅在 `env: "dev"` 时启用。

**创建 `.env` 文件**

```bash
NODE_ENV=prod
CHROME_PATH=/usr/bin/google-chrome
PUPPETEER_HEADLESS=true
```

**创建运行时目录**

```bash
mkdir -p shortVideos pm2logs
```

`shortVideos/` 用于视频缓存，`pm2logs/` 用于 PM2 日志输出。

### 4. 使用 PM2 启动

项目根目录已提供 `ecosystem.config.js`，直接启动：

```bash
# 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs rwatermark-server

# 设置开机自启
pm2 save
pm2 startup
```

**常用 PM2 命令**

| 命令 | 说明 |
|------|------|
| `pm2 restart rwatermark-server` | 重启服务 |
| `pm2 stop rwatermark-server` | 停止服务 |
| `pm2 reload rwatermark-server` | 零停机重载 |
| `pm2 monit` | 实时监控 CPU / 内存 |

**更新部署**

```bash
cd /opt/rwatermark-server
git pull
npm install --production=false
npm run build
pm2 reload rwatermark-server
```

### 5. Nginx 反向代理

将外部 80/443 端口转发到 NestJS 服务的 9200 端口，并支持大文件下载与 Range 请求。

```nginx
# /etc/nginx/conf.d/rwatermark.conf

upstream rwatermark_backend {
    server 127.0.0.1:9200;
    keepalive 64;
}

server {
    listen 80;
    server_name api.example.com;

    client_max_body_size 100m;

    location / {
        proxy_pass http://rwatermark_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        # 视频下载需要较长超时
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;

        # 支持断点续传
        proxy_set_header Range $http_range;
        proxy_set_header If-Range $http_if_range;
        proxy_buffering off;
    }
}
```

```bash
# 检查配置并重载
sudo nginx -t
sudo systemctl reload nginx
```

**配置 HTTPS（推荐）**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.example.com
```

小程序后台需将 `api.example.com` 加入 request 合法域名（须为 HTTPS）。

### 6. 部署检查清单

| 检查项 | 说明 |
|--------|------|
| 服务启动 | `pm2 status` 显示 `online` |
| 端口监听 | `curl http://127.0.0.1:9200` 有响应 |
| 数据库连接 | 日志无 TypeORM 连接报错 |
| Chrome 可用 | `.env` 中 `CHROME_PATH` 路径正确 |
| 磁盘空间 | `shortVideos/` 所在分区空间充足 |
| 防火墙 | 仅开放 80/443，9200 端口不对公网暴露 |
| 微信域名 | 小程序后台已配置 HTTPS 合法域名 |

### 7. 资源建议

| 场景 | CPU | 内存 | 磁盘 |
|------|-----|------|------|
| 低流量（< 100 次/天） | 1 核 | 2 GB | 20 GB |
| 中流量 | 2 核 | 4 GB | 50 GB+ |
| 高流量 / 多 Puppeteer 实例 | 4 核+ | 8 GB+ | 100 GB+ |

Puppeteer 启动 Chrome 会占用较多内存，建议预留至少 2 GB 可用内存。

## 📝 注意事项

1. **合规使用**：请遵守各平台的使用条款，仅用于个人学习和研究
2. **频率限制**：建议控制请求频率，避免被平台封禁
3. **缓存目录**：确保 `shortVideos/` 目录有足够的存储空间
4. **数据库**：TypeORM 配置中 `synchronize` 为 `false`，表结构变更请通过 SQL 脚本管理
5. **认证**：除下载接口外，其他接口需要 JWT Token 认证
6. **敏感信息**：配置文件中的 JWT Secret、数据库密码、微信 AppSecret 等请勿泄露

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证。

---

**免责声明**：本项目仅供学习交流使用，请勿用于商业用途。使用本工具产生的任何后果由使用者自行承担。
