<div align="center">

  <h1 align="center">🏥 智愈随行</h1>
  <p align="center">
    <em>全程守护软组织损伤的智慧康复平台</em>
  </p>

  <p align="center">
    <a href="#-项目简介">项目简介</a> •
    <a href="#-核心功能">核心功能</a> •
    <a href="#-技术架构">技术架构</a> •
    <a href="#-快速开始">快速开始</a> •
    <a href="#-项目结构">项目结构</a> •
    <a href="#-使用指南">使用指南</a>
  </p>

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)

</div>

---

## 📖 项目简介

**智愈随行** 是一个专注于**软组织损伤康复**的全栈 Web 应用平台。通过集成 AI 智能诊断、个性化康复计划生成、实时训练监测和进度可视化追踪，为用户提供专业、便捷、科学的康复指导。

### ✨ 主要特色

- 🤖 **AI 智能康复顾问** - 基于 DeepSeek AI 的专业康复咨询
- 📊 **数据驱动追踪** - 可视化进度图表，科学评估康复效果
- 🎯 **个性化训练计划** - 根据伤情和阶段智能定制训练方案
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🚀 **现代化技术栈** - React 19 + Vite + Tailwind CSS 4

---

## 🎯 核心功能

### 1. 🏠 智能仪表板
- 欢迎页面与用户档案展示
- AI 自动生成每日康复计划
- 近七日完成度趋势图
- 康复档案卡片（伤情、阶段、情绪状态）
- 智能贴士与快速导航
- 连续打卡天数与康复评分统计

### 2. 💪 康复训练系统
- 多动作顺序训练流程
- 实时动作计数与进度条
- 模拟 AR 视觉反馈界面
- 训练后疼痛评估（VAS 评分 0-10）
- 动作质量实时监控
- 训练数据自动保存至数据库
- 完成后的祝贺页面

**预设训练动作**：
- 患处轻柔主动活动（12次）
- 患处肌肉等长收缩（10次）
- 患处周围轻柔牵伸（8次）
- 核心稳定性微调（15次）

### 3. 📈 进度追踪
- 从数据库获取真实训练数据
- 双轴趋势图（完成度 + 疼痛指数）
- 关键指标统计（累计训练、平均完成度）
- 历史记录详情表格
- 数据评级系统（优秀/良好/需努力）
- 空状态友好提示

### 4. 🤖 智能咨询
- 实时聊天交互界面
- 专业物理治疗师 AI 助手
- 聊天历史记录保存
- **双模式支持**：
  - 🟢 在线模式：调用 DeepSeek API
  - 🟡 离线模式：关键词匹配演示模式
- 温柔专业的回复风格

### 5. ⚙️ 个人设置
- 个人档案编辑表单
- 伤情诊断输入
- 康复阶段选择（急性期/修复期/重塑期/功能强化期）
- 情绪状态管理
- 数据隐私说明

---

## 🏗️ 技术架构

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.0 | UI 框架 |
| Vite | 8.0.0-beta.13 | 构建工具 |
| Tailwind CSS | 4.1.18 | 样式框架 |
| Lucide React | 0.575.0 | 图标组件 |
| Recharts | 3.7.0 | 数据可视化 |
| ESLint | 9.39.1 | 代码检查 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Express | 5.2.1 | Web 框架 |
| MySQL | mysql2@3.17.2 | 数据库 |
| OpenAI SDK | 6.22.0 | AI API 客户端 |
| CORS | 2.8.6 | 跨域处理 |
| dotenv | 17.3.1 | 环境变量管理 |

### AI 集成

- **AI 提供商**：DeepSeek
- **模型**：deepseek-chat
- **API 端点**：https://api.deepseek.com
- **备用模式**：离线关键词匹配

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- MySQL 5.7+
- npm 或 yarn

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd bio-xiu
```

#### 2. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd smart-rehab-assistant
npm install

# 安装后端依赖
cd ../rehab-server
npm install
```

#### 3. 配置数据库

创建 MySQL 数据库：

```sql
CREATE DATABASE smart_rehab_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

创建数据表：

```sql
-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT,
    injury_type VARCHAR(255),
    recovery_phase VARCHAR(255)
);

-- 插入测试用户
INSERT INTO users (id, name, age, injury_type, recovery_phase)
VALUES (1, '测试用户', 30, '肌肉拉伤', '修复期');

-- 训练记录表
CREATE TABLE training_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    exercise_name VARCHAR(255) NOT NULL,
    reps_completed INT NOT NULL,
    pain_level INT CHECK (pain_level >= 0 AND pain_level <= 10),
    performance_score DECIMAL(5, 2) CHECK (performance_score >= 0 AND performance_score <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 4. 配置环境变量

在 `rehab-server/.env` 文件中配置：

```env
# DeepSeek AI 配置
AI_API_KEY=your_deepseek_api_key_here
AI_BASE_URL=https://api.deepseek.com
AI_MODEL_NAME=deepseek-chat

# MySQL 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_rehab_db
```

> 💡 **提示**：如果没有 DeepSeek API Key，系统会自动使用离线演示模式。

#### 5. 启动后端服务

```bash
cd rehab-server
node index.js
```

后端服务将在 `http://localhost:3000` 启动。

#### 6. 启动前端服务

```bash
# 新开一个终端
cd smart-rehab-assistant
npm run dev
```

前端服务将在 `http://localhost:5173` 启动。

### 访问应用

打开浏览器访问：[http://localhost:5173](http://localhost:5173)

---

## 📁 项目结构

```
bio-xiu/
├── 📂 smart-rehab-assistant/        # 前端应用
│   ├── 📂 public/                   # 静态资源
│   ├── 📂 src/
│   │   ├── 📂 pages/               # 页面组件
│   │   │   ├── Dashboard.jsx       # 首页仪表板
│   │   │   ├── RehabSession.jsx    # 康复训练页面
│   │   │   ├── LLMChat.jsx         # AI 聊天页面
│   │   │   ├── ProgressTracking.jsx # 进度追踪页面
│   │   │   └── SettingsPage.jsx     # 设置页面
│   │   ├── 📂 services/             # API 服务
│   │   │   └── api.js              # API 封装
│   │   ├── App.jsx                 # 主应用组件
│   │   ├── main.jsx                # 应用入口
│   │   └── index.css               # 全局样式
│   ├── index.html                  # HTML 入口
│   ├── package.json                # 前端依赖配置
│   └── vite.config.js              # Vite 配置
│
├── 📂 rehab-server/                 # 后端服务
│   ├── db.js                       # 数据库连接
│   ├── index.js                    # Express 主文件
│   ├── .env                        # 环境变量
│   └── package.json                # 后端依赖配置
│
└── README.md                        # 项目文档
```

---

## 📚 使用指南

### 导航说明

应用包含以下五个主要页面：

| 页面 | 路径 | 功能 |
|------|------|------|
| 🏠 首页 | `dashboard` | 查看康复计划、统计数据 |
| 💪 训练 | `session` | 执行康复训练动作 |
| 📈 进度 | `progress` | 查看训练历史和趋势 |
| 💬 咨询 | `chat` | 与 AI 康复顾问对话 |
| ⚙️ 设置 | `settings` | 编辑个人档案 |

### 康复阶段说明

| 阶段 | 特点 | 训练重点 |
|------|------|----------|
| 🔴 急性期 | 受伤后 0-72 小时 | R.I.C.E 原则，控制肿胀 |
| 🟡 修复期 | 受伤后 3-14 天 | 轻柔活动，防止粘连 |
| 🟢 重塑期 | 受伤后 2-6 周 | 增强力量，恢复功能 |
| 🔵 功能强化期 | 受伤后 6 周以上 | 功能性训练，重返运动 |

### VAS 疼痛评分

| 分数 | 疼痛程度 |
|------|----------|
| 0-1 | 无痛或微痛 |
| 2-3 | 轻度疼痛 |
| 4-6 | 中度疼痛 |
| 7-8 | 重度疼痛 |
| 9-10 | 剧烈疼痛 |

> ⚠️ **注意**：训练时疼痛评分超过 6 分，请立即停止并咨询医生。

---

## 🔧 API 接口文档

### 用户相关

#### 获取用户档案
```http
GET /api/user/:id
```

#### 更新用户档案
```http
POST /api/user
Content-Type: application/json

{
  "name": "张三",
  "age": 30,
  "injuryType": "肌肉拉伤",
  "recoveryPhase": "修复期"
}
```

### 训练相关

#### 保存训练记录
```http
POST /api/training
Content-Type: application/json

{
  "userId": 1,
  "exercise": "患处轻柔主动活动",
  "reps": 12,
  "pain": 3,
  "score": 85.5
}
```

#### 获取训练历史
```http
GET /api/training/:userId
```

### AI 咨询

#### 发送聊天消息
```http
POST /api/chat
Content-Type: application/json

{
  "message": "我感到下蹲伴随疼痛，该怎么办？"
}
```

---

## 🎨 界面预览

### 首页仪表板
- 欢迎信息与用户档案卡片
- AI 生成的每日康复计划
- 近七日完成度趋势图
- 智能贴士与快速导航

### 康复训练
- 当前动作展示与说明
- 实时计数器与进度条
- 模拟 VR 视觉反馈（角度显示）
- 训练后疼痛评估

### 进度追踪
- 完成度与疼痛指数双轴趋势图
- 累计训练次数统计
- 历史记录详情表格
- 数据评级徽章

---

## 🛠️ 开发命令

### 前端 (smart-rehab-assistant/)

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run lint     # 代码检查
npm run preview  # 预览构建结果
```

### 后端 (rehab-server/)

```bash
node index.js    # 启动后端服务
```

---

## 📝 开发计划

- [ ] 用户认证系统（登录/注册）
- [ ] 多用户支持
- [ ] 真实 AR/摄像头集成
- [ ] 更多训练动作模板
- [ ] 训练视频教程
- [ ] 推送提醒功能
- [ ] 数据导出功能
- [ ] TypeScript 迁移
- [ ] 单元测试覆盖
- [ ] PWA 支持

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

## 💬 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](../../issues)
- 发送邮件

---

## 🙏 致谢

- [React](https://reactjs.org/) - UI 框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [DeepSeek](https://www.deepseek.com/) - AI 服务提供商
- [Recharts](https://recharts.org/) - 图表库

---

<div align="center">

  **用科技守护健康，让康复更智能** 🌟

</div>
