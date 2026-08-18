# Whimsy Hub · 奇思妙想中心

> 用心传递每一份祝福

Whimsy Hub 是一个以中国传统节日为主题的**互动祝福体验**静态网站。用户可以选择不同的节日，通过沉浸式的动画场景、摇签抽签、分享祝福等环节，为亲朋好友送上独特的节日祝福。

## 在线体验

🔗 [https://everwynn.github.io/whimsy-hub/](https://everwynn.github.io/whimsy-hub/)

## 功能亮点

- 🌉 **鹊桥相会** — 全屏沉浸式 Canvas 动画，喜鹊从四方飞来搭建鹊桥，牛郎织女终相会
- 🎋 **摇签抽签** — 古风签筒交互，GSAP 驱动摇晃动画，随机抽取诗词签文
- 🌹 **玫瑰绽放** — Canvas 实时渲染玫瑰从花苞到盛放的全过程
- 🔗 **祝福分享** — 生成加密分享链接，支持自定义发送人/接收人/留言
- 📄 **独立 HTML** — 可下载独立 HTML 文件，在任意设备离线播放

## 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | [Astro](https://astro.build/) | ^4.16 |
| UI 组件 | [Vue 3](https://vuejs.org/) | ^3.5 |
| 样式 | [Tailwind CSS](https://tailwindcss.com/) | ^3.4 |
| 动画 | [GSAP](https://gsap.com/) | ^3.12 |
| 内容 | MDX | ^3.1 |
| 字体 | Noto Serif SC / Noto Sans SC | — |
| 部署 | GitHub Pages + Actions | — |

## 快速开始

### 环境要求

- Node.js >= 18.17.1

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/EverWynn/whimsy-hub.git
cd whimsy-hub

# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:4321/whimsy-hub/）
npm run dev

# 构建生产版本
npm run build

# 本地预览构建结果
npm run preview
```

## 项目结构

```
src/
├── assets/              # 全局样式
│   └── global.css
├── components/          # 通用 UI 组件（预留）
├── data/                # 节日与签文数据
│   ├── festivals.json
│   └── fortunes/
├── layouts/             # 页面布局
│   └── BaseLayout.astro
├── modules/             # 功能模块（核心）
│   ├── blessing/        # 祝福页面主控
│   ├── bloom/           # 鹊桥相会动画
│   ├── festival/        # 节日菜单
│   ├── fortune/         # 摇签抽签
│   ├── rose/            # 玫瑰绽放
│   └── share/           # 分享面板
├── pages/               # 路由页面
│   ├── index.astro
│   └── blessing/
└── utils/               # 工具函数
    └── shareCodec.ts
```

## 当前节日

| 节日 | 状态 | 说明 |
|------|------|------|
| 🌹 七夕节 | ✅ 已上线 | 乞巧节 · 中国情人节 |
| 🌸 春节 | 🔜 敬请期待 | 农历新年 |
| 🌕 中秋节 | 🔜 敬请期待 | 团圆节 |
| 🐉 端午节 | 🔜 敬请期待 | 龙舟节 |
| 🏮 元宵节 | 🔜 敬请期待 | 上元节 |
| 🌿 清明节 | 🔜 敬请期待 | 踏青节 |
| 🏔️ 重阳节 | 🔜 敬请期待 | 登高节 · 敬老节 |
| 🧨 除夕 | 🔜 敬请期待 | 年三十 |

## 文档导航

- [架构文档](docs/ARCHITECTURE.md) — 项目架构设计、模块关系、数据流
- [功能详解](docs/FEATURES.md) — 各功能模块的详细说明
- [未来规划](docs/ROADMAP.md) — 发展方向与待办事项

## 部署

项目通过 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 `main` 分支
2. Actions 自动执行 `npm ci` + `npm run build`
3. 构建产物上传并部署到 GitHub Pages

也支持在 Actions 页面手动触发部署（`workflow_dispatch`）。

## 许可证

本项目基于 [LICENSE](LICENSE) 文件中的许可协议开源。
