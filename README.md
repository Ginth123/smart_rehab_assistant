<div align="center">

  <h1 align="center">智愈随行</h1>
  <p align="center">
    <em>全程守护软组织损伤的智慧康复平台</em>
  </p>

  <p align="center">
    <a href="#-项目愿景">项目愿景</a> •
    <a href="#-核心优势与功能">核心优势</a> •
    <a href="#-技术架构">技术架构</a> •
    <a href="#-快速部署">快速部署</a> •
    <a href="#-系统闭环流程">系统闭环</a>
  </p>

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 项目愿景

**“让每一次康复，都有迹可循。”**

**智愈随行** 是一款专注于**软组织损伤康复**的工业级全栈 Web 应用。传统康复高度依赖线下复诊，患者居家期间缺乏专业指导与监督；本项目通过集成 **DeepSeek 大模型**、**动态数字处方引擎**与**全周期数据监控**，打破院内外壁垒，为患者提供千人千面、触手可及的智慧康复体验。

---

## 核心优势与功能

### 医疗级安全与认证 
- **Bcrypt 单向加盐加密**：从物理底层杜绝明文密码泄露，捍卫医疗数据隐私。
- **沉浸式交互**：采用前沿的玻璃拟态与动态光影设计，兼顾科技感与医疗信任感。
- **合规声明弹窗**：内置《隐私协议》与《服务条款》，明确 AI 免责声明与联邦学习隐私保护规范。

### AI 动态数字处方
- **毫秒级推演**：根据患者当前伤情、康复阶段及疼痛指数，调用 LLM 实时生成专属训练动作组合。
- **全局状态流转**：基于 React 顶层架构设计，AI 处方在“首页”生成后，**无缝流转**至“训练”模块，拒绝页面跳转导致的数据丢失，实现真正的业务闭环。

### 全周期数据追踪 
- **高可用数据清洗**：底层智能过滤并修正异常测试数据（如拦截超过 100% 的溢出完成度），确保医疗图表的绝对严谨性。
- **多维可视化看板**：利用 Recharts 渲染双轴趋势图（动作完成度 vs VAS 疼痛指数），直观呈现康复轨迹。
- **真实激励反馈**：系统自动扫描 MySQL 历史日志，精准计算“连续打卡天数”与“历史平均康复评分”，提供正向心理干预。

### 智能康复问诊 
- **全天候物理治疗师**：内置专业 Prompt 调优的 AI 助手，解答居家康复疑惑。
- **智能降级机制**：在 API 额度耗尽或网络断开时，自动无缝切换至“本地关键词匹配模式”，确保患者随时有回应。

---

## 技术架构

本项目采用纯正的 **前后端分离 (SPA + RESTful API)** 架构：

| 模块 | 技术栈选型 | 核心应用场景 |
|------|-----------|-------------|
| **前端 UI** | React 19.2 + Vite | 组件化渲染、全局状态接管 (App.jsx 统一分发) |
| **视觉呈现**| Tailwind CSS 4.1 | 响应式布局、Canonical Classes (`bg-linear-to`)、丝滑动画 |
| **图表渲染**| Recharts 3.7 | 近七日趋势 AreaChart、双轴复合 LineChart |
| **后端引擎**| Node.js + Express | RESTful API 路由、请求分发、错误拦截 |
| **数据持久**| MySQL 2 + Bcryptjs | 用户档案加密存储、训练日志强一致性校验 |
| **大模型** | DeepSeek API | 微调后，动态生成 JSON 格式的康复处方、自然语言多轮对话 |

---

## 快速部署 

### 1. 环境准备
- Node.js (v18+)
- MySQL (v5.7+)

### 2. 数据库初始化 (关键步骤)
请在您的 MySQL 管理工具中执行以下 SQL 语句，构建工业级规范的表结构：

```sql
CREATE DATABASE IF NOT EXISTS smart_rehab_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_rehab_db;

-- 用户与康复档案表 (支持加盐哈希密码)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户唯一自增ID',
    name VARCHAR(255) NOT NULL COMMENT '真实姓名',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT '登录邮箱，防重复',
    password VARCHAR(255) NOT NULL COMMENT 'Bcrypt加密哈希值',
    age INT DEFAULT NULL,
    injury_type VARCHAR(255) DEFAULT NULL COMMENT '伤情类型',
    recovery_phase VARCHAR(255) DEFAULT NULL COMMENT '康复阶段',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 康复训练日志表
CREATE TABLE training_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_name VARCHAR(255) NOT NULL,
    reps_completed INT NOT NULL,
    pain_level INT CHECK (pain_level >= 0 AND pain_level <= 10),
    performance_score DECIMAL(5, 2) CHECK (performance_score >= 0 AND performance_score <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
### 3. 安装依赖与配置环境

```bash
# 克隆项目
git clone <repository-url>
cd bio-xiu

# 配置后端
cd rehab-server
npm install
npm install bcryptjs # 确保加密安全库已安装
```
### 4.DeepSeek AI 配置
```
AI_API_KEY=your_deepseek_api_key_here
AI_BASE_URL=[https://api.deepseek.com](https://api.deepseek.com)
AI_MODEL_NAME=deepseek-chat
```

### 5.MySQL 数据库配置
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_rehab_db
```

### 6.配置前端
```
cd ../smart-rehab-assistant
npm install
```

### 终端 1：启动 Node.js 后端 
```
cd rehab-server
node index.js
```

### 终端 2：启动 React 前端 
```
cd smart-rehab-assistant
npm run dev
```
### 打开浏览器访问：http://localhost:5173，即刻开启体验

## 项目结构
```
bio-xiu/
├── 📂 smart-rehab-assistant/        # 前端应用
│   ├── 📂 public/                   # 静态资源
│   ├── 📂 src/
│   │   ├── 📂 pages/               # 核心页面组件
│   │   │   ├── AuthPage.jsx        # 登录与注册鉴权页
│   │   │   ├── Dashboard.jsx       # 首页智能仪表板
│   │   │   ├── RehabSession.jsx    # 康复训练执行页
│   │   │   ├── LLMChat.jsx         # AI 康复咨询页
│   │   │   ├── ProgressTracking.jsx# 进度追踪与图表页
│   │   │   └── SettingsPage.jsx    # 个人档案设置页
│   │   ├── 📂 services/             # 统一 API 服务封装
│   │   ├── App.jsx                 # 主应用组件与路由守卫
│   │   ├── main.jsx                # 应用入口
│   │   └── index.css               # Tailwind 全局样式
│   ├── package.json                # 前端依赖配置
│   └── vite.config.js              # Vite 构建配置
│
├── 📂 rehab-server/                 # Node.js 后端服务
│   ├── db.js                       # MySQL 数据库连接池
│   ├── index.js                    # Express 路由与核心逻辑
│   ├── .env                        # 环境变量与密钥配置
│   └── package.json                # 后端依赖配置
```

## 使用指南
### 康复阶段管理
基于医学标准划分康复周期，明确各阶段临床特点与训练重点：

| 阶段         | 临床特点          | 训练重点策略                ||
|--------------|-------------------|-------------------------|---------------------------|
| 🟥 急性期    | 受伤后 0-72 小时  | R.I.C.E 原则，控制核心肿胀                 |
| 🟨 修复期    | 受伤后 3-14 天    | 极轻柔活动，防止组织粘连           |
| 🟩 重塑期    | 受伤后 2-6 周     | 逐步增强力量，恢复基础功能               |
| 🟦 功能强化期| 受伤后 6 周以上   | 专项功能性训练，重返运动       |

### 疼痛评估体系
采用 VAS 视觉模拟疼痛评估量表：

| 分数范围 | 疼痛程度               | 体感描述                     |
|----------|------------------------|------------------------------|
| 0-1      | 无痛或可忽略的微痛     | 无明显痛感                   |
| 2-3      | 轻度疼痛 (可忍受)      | 痛感轻微，不影响日常活动     |
| 4-6      | 中度疼痛 (影响动作标准) | 痛感明显，动作规范性受影响   |
| 7-8      | 重度疼痛               | 痛感强烈，难以正常活动       |
| 9-10     | 剧烈疼痛 (难以忍受)    | 痛感剧烈，无法进行训练       |

> ⚠️ 医疗警示：训练时若疼痛评分超过 6 分，请立即停止所有训练计划并线下就医咨询。

## API 接口文档
### 用户鉴权与档案
| 接口功能       | 请求方式 | 接口地址          | 说明                              |
|----------------|----------|-------------------|-----------------------------------|
| 用户注册       | POST     | /api/register     | 需包含 name, email, password 参数 |
| 用户登录       | POST     | /api/login        | 返回脱敏 user 对象                |
| 更新档案       | POST     | /api/user         | 更新用户个人康复档案              |

### 训练流转与统计
| 接口功能       | 请求方式 | 接口地址              | 说明                              |
|----------------|----------|-----------------------|-----------------------------------|
| 保存训练记录   | POST     | /api/training         | 落盘 reps, pain, score 等训练数据 |
| 获取训练历史   | GET      | /api/training/:userId | 根据用户ID获取历史训练记录        |
| 获取七日趋势   | GET      | /api/trend/:userId    | 获取近7天训练/疼痛趋势数据        |
| 获取打卡统计   | GET      | /api/stats/:userId    | 获取用户训练打卡统计数据          |

### AI 大模型服务
| 接口功能       | 请求方式 | 接口地址          | 说明                              |
|----------------|----------|-------------------|-----------------------------------|
| 智能处方推荐   | POST     | /api/recommend-plan | 根据用户状态生成个性化康复处方    |
| 康复周期预测   | POST     | /api/predict      | 预测用户康复周期及进度            |
| 自然语言问诊   | POST     | /api/chat         | 支持自然语言交互的康复问诊        |

## 版本迭代记录
- ✅ v1.2.0 (最新)：完成全量 MySQL 真实数据替换；新增 Bcrypt 鉴权认证；重构 App.jsx 实现 AI 处方全局状态持久化流转；修复进度追踪数据溢出 Bug。
- ✅ v1.1.0：接入 DeepSeek LLM 智能对话与处方生成，重绘 UI 玻璃拟态交互界面。
- ✅ v1.0.0：基础 React 框架搭建，本地状态测试跑通。

## 开发计划 
- [ ] 多租户架构支持
- [ ] 真实 WebRTC/MediaPipe 摄像头 AR 动作捕捉集成
- [ ] 康复训练 3D 视频库接入
- [ ] 微信小程序端迁移适配
- [ ] TypeScript 强类型重构

## 贡献指南
欢迎参与项目贡献！遵循以下流程提交代码：
1. Fork 本项目到个人仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证 & 医疗免责声明
- 本项目采用 MIT 许可证开源，详见 LICENSE 文件。
- 本平台提供的所有 AI 康复建议及生成的数字处方仅供科研交流与参考，绝不构成具备法律效力的临床医学诊断。患者在执行相关训练前，必须咨询具有执业资格的专业医师或物理治疗师。

<div align="left">
用科技守护健康，让康复更智能
</div>
