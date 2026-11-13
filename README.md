# TTS Studio

基于 Vue 3 + Vuetify + Tailwind CSS 的纯前端 MiMo 语音工作台，提供 **语音合成**、**音色设计**、**音色克隆** 三大功能。无需后端服务，所有偏好设置仅保存在浏览器 localStorage 中。

## 功能

### 语音合成

- 9 种预置音色：MiMo-默认、冰糖、茉莉、苏打、白桦、Mia、Chloe、Milo、Dean
- 可选风格指令，调节语气、节奏与情绪
- 播报文本最长 1024 字，实时字数统计，一键填入示例

### 音色设计

- 用自然语言描述期望的声音特质，生成自定义音色
- 可叠加可选风格指令控制播报风格

### 音色克隆

- 上传 MP3 / WAV 声音样本（最大 10 MB），支持拖拽与点击选择
- 样本页内试听、移除
- 以样本音色合成新的播报内容

### 通用体验

- 生成过程可随时取消；错误以通知提示，不丢失已有结果
- 合成结果页内播放、一键下载 WAV
- Ctrl / ⌘ + Enter 快捷生成
- 简体中文 / English 切换；浅色 / 深色 / 跟随系统主题
- 响应式布局：桌面双栏、结果卡片吸顶，移动端单栏

## 隐私与本地存储

- 纯前端实现：浏览器直接调用 MiMo API，无后端、无中转
- 设置（API 地址、API 密钥、各模式模型、语言、主题）仅存于 `localStorage`（键名 `tts-studio.settings.v1`）
- API 密钥只发送到你配置的 API 地址；清除浏览器站点数据即完全移除

## 快速开始

```bash
npm install
npm run dev
```

启动后打开右上角「设置」（齿轮图标），填入 MiMo API 密钥即可使用；API 地址与模型可保持默认或自定义。

### 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 本地预览构建产物 |
| `npm run type-check` | Vue 类型检查 |
| `npm run lint` / `npm run lint:fix` | ESLint 检查 / 自动修复 |

## API 默认配置

- 地址：`https://api.xiaomimimo.com/v1`（OpenAI 兼容接口，`POST /chat/completions`）
- 默认模型：

  | 模式 | 模型 |
  | --- | --- |
  | 语音合成 | `mimo-v2.5-tts` |
  | 音色设计 | `mimo-v2.5-tts-voicedesign` |
  | 音色克隆 | `mimo-v2.5-tts-voiceclone` |

- 地址与各模式模型均可在设置中修改，并可一键恢复默认

## 技术栈

- Vue 3（组合式 API + `<script setup>`）+ TypeScript
- Vite
- Vuetify 4 —— 组件、主题与组件库国际化
- Tailwind CSS 4 —— 布局工具类
- Pinia —— 状态管理；Vue I18n —— 中英文；Vue Router —— 路由

## 项目结构

```text
src/
├── api/mimo.ts          # MiMo API 客户端（fetch + AbortController）
├── components/          # AudioStudio、AudioResult、SettingsDialog、VoiceSampleUpload、WaveBars
├── constants/audio.ts   # 模式、默认模型、预置音色、长度与大小限制
├── locales/             # zh-CN / en 语言包
├── pages/               # 语音合成 / 音色设计 / 音色克隆页面
├── plugins/             # Vuetify、i18n 注册
├── router/              # 路由定义
├── stores/              # app（通知）、settings（本地偏好）、studio（合成状态）
└── styles/              # 全局样式与 Vuetify Sass 配置
```
