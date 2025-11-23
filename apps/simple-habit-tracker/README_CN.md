# Simple Habit Tracker - 极简习惯追踪器 ✨

一款专注于习惯养成的移动端应用,帮助你建立和保持良好的生活习惯。

<p align="center">
  <img src="https://img.shields.io/badge/Expo-~51.0-blue.svg" />
  <img src="https://img.shields.io/badge/Rails-7.2-red.svg" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue.svg" />
  <img src="https://img.shields.io/badge/Status-MVP%20Complete-success.svg" />
</p>

## ✨ 特性

- 🎯 **简洁直观** - 极简设计,专注核心功能
- 📊 **数据可视化** - 清晰展示习惯完成情况和连续记录
- 🔥 **连续打卡** - 激励你保持习惯,建立长期坚持
- 🎨 **精美设计** - 现代化UI,支持深色/浅色模式
- ⚡ **快速响应** - 流畅的动画和即时反馈
- 📱 **跨平台** - iOS、Android、Web三端支持

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Ruby 3.3+
- PostgreSQL 14+

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd simple-habit-tracker

# 安装前端依赖
npm install

# 安装后端依赖
cd backend
bundle install

# 数据库设置
bin/rails db:create db:migrate

# 返回根目录
cd ..
```

### 运行

**启动后端API**:
```bash
npm run start-backend
# Rails API 运行在 http://localhost:3001
```

**启动前端**:
```bash
npm run start
# Expo 运行在 http://localhost:3000
```

访问 http://localhost:3000 查看应用。

## 📱 功能说明

### 习惯管理
- 创建自定义习惯 (名称、图标、颜色)
- 编辑和删除习惯
- 设置习惯频率 (每日/每周/自定义)

### 打卡系统
- 一键打卡
- 防重复打卡
- 自动计算连续天数
- 历史记录追踪

### 统计数据
- 活跃习惯数量
- 总连续天数
- 今日完成数
- 7天历史记录
- 最长连续记录

### UI/UX
- 极简设计风格
- 积极向上的配色
- 流畅动画效果
- 深色/浅色模式
- 响应式布局

## 🏗️ 技术架构

### 前端
- **Expo** - React Native开发框架
- **Expo Router** - 文件系统路由
- **NativeWind** - Tailwind CSS for React Native
- **Zustand** - 轻量级状态管理
- **TypeScript** - 类型安全

### 后端
- **Rails 7.2** - API模式
- **PostgreSQL** - 关系型数据库
- **RSpec** - 测试框架

### 架构特点
- 三层架构: Service → Store → Component
- RESTful API设计
- 类型安全的前后端通信
- 统一的错误处理

## 📂 项目结构

```
├── app/                    # 页面路由
│   ├── index.tsx          # 主页
│   ├── habit/
│   │   ├── new.tsx        # 创建习惯
│   │   └── [id].tsx       # 习惯详情
│   └── _layout.tsx        # 根布局
├── components/            # 可复用组件
├── types/                 # TypeScript类型
├── services/              # API服务
├── stores/                # 状态管理
├── utils/                 # 工具函数
└── backend/               # Rails API
    ├── app/
    │   ├── controllers/
    │   └── models/
    └── spec/              # 测试
```

## 🧪 测试

**运行后端测试**:
```bash
cd backend
bundle exec rspec
```

测试结果: ✅ **6 examples, 0 failures**

## 🎨 设计系统

应用采用定制的设计系统,配置在 `tailwind.config.js`:

- **品牌色**:
  - Primary (Indigo) - 主色调
  - Secondary (Teal) - 副色调
  - Accent (Gold) - 强调色

- **语义化颜色**:
  - `text-text-primary` - 主要文本
  - `bg-surface` - 背景色
  - `border-border` - 边框色
  - 等等...

- **Typography Scale**: 
  - 从 `text-caption` 到 `text-display`
  - 统一的行高和字重

## 📊 数据模型

### Habit (习惯)
```ruby
name: string              # 习惯名称
icon: string              # Emoji图标
color: string             # 颜色标识
description: text         # 描述
frequency: string         # 频率 (daily/weekly/custom)
target_days: integer      # 目标天数
reminder_time: string     # 提醒时间
reminder_enabled: boolean # 是否启用提醒
streak_count: integer     # 当前连续天数
longest_streak: integer   # 最长连续记录
total_completions: integer # 总完成次数
completed_dates: text     # 完成日期数组 (JSON)
```

## 🔌 API 端点

```
GET    /api/v1/habits              # 获取所有习惯
GET    /api/v1/habits/:id          # 获取单个习惯
POST   /api/v1/habits              # 创建习惯
PATCH  /api/v1/habits/:id          # 更新习惯
DELETE /api/v1/habits/:id          # 删除习惯
POST   /api/v1/habits/:id/check_in # 打卡
```

## 🎯 开发计划

### MVP (已完成) ✅
- [x] 习惯CRUD
- [x] 打卡系统
- [x] 连续记录
- [x] 数据可视化
- [x] 极简UI
- [x] 深色模式

### 未来功能
- [ ] AI习惯建议
- [ ] 云同步
- [ ] 社交分享
- [ ] 成就系统
- [ ] 数据导出
- [ ] 本地通知

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 许可证

MIT License

## 👨‍💻 开发者

Clacky AI - 2025

---

**开始建立更好的习惯,今天就是最好的开始! 🌱**
