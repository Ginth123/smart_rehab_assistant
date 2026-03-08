const express = require('express');
const cors = require('cors');
const db = require('./db'); // 引入数据库连接池
const { OpenAI } = require('openai');
const axios = require('axios');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = 3000;

// --- 中间件配置 ---
app.use(cors()); // 允许前端跨域访问
app.use(express.json()); // 解析 JSON 请求体

// --- AI 客户端初始化 ---
const client = new OpenAI({
    apiKey: process.env.AI_API_KEY || 'sk-placeholder', 
    baseURL: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1', // 指向 DeepSeek
});

// ==========================================
//               API 路由定义
// ==========================================

// 获取用户档案
app.get('/api/user/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            //数据库下划线字段转驼峰 
            const user = rows[0];
            res.json({
                id: user.id,
                name: user.name,
                age: user.age,
                injuryType: user.injury_type,
                recoveryPhase: user.recovery_phase
            });
        } else {
            res.status(404).json({ message: '用户不存在' });
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 更新用户档案
app.post('/api/user', async (req, res) => {
    const { name, age, injuryType, recoveryPhase } = req.body;
    try {
        // 更新 ID=1 的用户
        await db.query(
            'UPDATE users SET name=?, age=?, injury_type=?, recovery_phase=? WHERE id=1',
            [name, age, injuryType, recoveryPhase]
        );
        res.json({ success: true, message: '用户档案更新成功' });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 1. 用户注册接口 (Register)
// ==========================================
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. 检查邮箱是否已被注册
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: '该邮箱已被注册，请直接登录' });
        }

        // 2. 密码加密 (加盐哈希) - 极具含金量的安全操作
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. 将新用户存入数据库 (赋予一些默认的康复档案值)
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, age, injury_type, recovery_phase) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, 25, '待评估损伤', '急性期'] // 默认值，用户后续可在设置页修改
        );

        res.json({ message: '注册成功', userId: result.insertId });

    } catch (error) {
        console.error("注册失败:", error);
        res.status(500).json({ error: "服务器内部错误" });
    }
});

// ==========================================
// 2. 用户登录接口 (Login)
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. 根据邮箱查找用户
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: '账号不存在或邮箱输入错误' });
        }

        const user = users[0];

        // 2. 验证密码 (将输入的明文密码与数据库中的加密密码比对)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: '密码错误，请重试' });
        }

        // 3. 登录成功，返回用户的脱敏信息 (绝对不要把密码返回给前端)
        res.json({
            message: '登录成功',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                age: user.age,
                injuryType: user.injury_type,
                recoveryPhase: user.recovery_phase
            }
        });

    } catch (error) {
        console.error("登录失败:", error);
        res.status(500).json({ error: "服务器内部错误" });
    }
});

// 保存训练记录 (RehabSession)
app.post('/api/training', async (req, res) => {
    const { userId, exercise, reps, pain, score } = req.body;
    console.log(`收到训练记录: ${exercise} - ${reps}次`);

    try {
        await db.query(
            'INSERT INTO training_logs (user_id, exercise_name, reps_completed, pain_level, performance_score) VALUES (?, ?, ?, ?, ?)',
            [userId || 1, exercise, reps, pain, score]
        );
        res.json({ success: true, message: '训练数据已同步至云端数据库' });
    } catch (error) {
        console.error("Training Log Error:", error);
        res.status(500).json({ error: '保存训练记录失败' });
    }
});

// 获取用户的历史训练记录
app.get('/api/training/:userId', async (req, res) => {
    try {
        // 按时间先后顺序查询该用户的所有训练记录
        const [rows] = await db.query(
            `SELECT 
                id, 
                exercise_name as exercise, 
                reps_completed as reps, 
                pain_level as painLevel, 
                performance_score as performance, 
                created_at as date 
            FROM training_logs 
            WHERE user_id = ? 
            ORDER BY created_at ASC`,
            [req.params.userId]
        );
        res.json(rows);
    } catch (error) {
        console.error("Fetch Training Error:", error);
        res.status(500).json({ error: '获取训练记录失败' });
    }
});

// AI 智能咨询
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    // --- 模式 A: 离线智能 ---
    if (!process.env.AI_API_KEY) {
        console.log("AI 模式: 离线模拟 (Demo Mode)");
        
        // 网络思考延迟
        await new Promise(resolve => setTimeout(resolve, 800));

        let reply = "我是您的智能康复助手。请遵循医嘱进行适度训练。";
        
        // 关键词匹配逻辑
        if (message.includes("痛") || message.includes("不舒服")) {
            reply = "检测到您反馈疼痛。根据 VAS 疼痛评分标准，如果疼痛感超过 3 分，建议立即停止当前动作并冰敷患处 15 分钟。";
        } else if (message.includes("多久") || message.includes("时间")) {
            reply = "根据软组织修复周期，急性期通常为 3-7 天，亚急性期为 2-3 周。完全恢复运动功能可能需要 6-8 周，请保持耐心。";
        } else if (message.includes("你好") || message.includes("开始")) {
            reply = "您好！我是基于大语言模型的康复助手。您可以问我关于动作规范、疼痛管理或康复进度的任何问题。";
        } else {
            reply = `关于"${message}"，这是一个很好的问题。在当前康复阶段，保持关节活动度(ROM)是首要目标，请避免剧烈负重。`;
        }
        
        return res.json({ reply });
    }

    // --- 模式 B: 真实AI 
    try {
        console.log("AI 模式: 在线调用 (Live API)");
        const completion = await client.chat.completions.create({
            messages: [
                { role: "system", content: "你是一个专业的物理治疗师助手，语气温柔、专业。回答要简练，多给出具体的康复建议。" },
                { role: "user", content: message }
            ],
            model: "deepseek-chat", 
            temperature: 0.7,
        });
        
        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error("AI API Error:", error);
        res.status(500).json({ 
            reply: "AI 连接暂时中断，正在切换至备用线路... (请检查后端日志)" 
        });
    }
});

// 1. 获取康复天数预测
app.post('/api/predict', async (req, res) => {
    try {
        const userId = req.body.id || 1; 
        const userAge = parseInt(req.body.age) || 30;
        const phaseStr = req.body.recoveryPhase || '修复期';

        // 从 MySQL 数据库拉取该患者最近3次的真实训练记录，用于计算平均表现
        const [logs] = await db.query(
            'SELECT pain_level, performance_score FROM training_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 3', 
            [userId]
        );

        let avgPain = 2.5; 
        let avgPerf = 80.0;
        let consecutiveDays = 1;

        if (logs.length > 0) {
            // 计算真实平均痛感和完成度
            const totalPain = logs.reduce((sum, log) => sum + Number(log.pain_level), 0);
            const totalPerf = logs.reduce((sum, log) => sum + Number(log.performance_score), 0);
            avgPain = totalPain / logs.length;
            avgPerf = totalPerf / logs.length;

            // 查询用户实际打卡天数（去重计算日期）
            const [countRes] = await db.query(
                'SELECT COUNT(DISTINCT DATE(created_at)) as days FROM training_logs WHERE user_id = ?', 
                [userId]
            );
            consecutiveDays = countRes[0].days || 1;
        }

        // 2. 将文本阶段转换为数值权重
        const phaseMap = { '急性期': 1, '修复期': 2, '重塑期': 3, '功能强化期': 4 };
        let phaseValue = 2; 
        for (let key in phaseMap) {
            if (phaseStr.includes(key)) {
                phaseValue = phaseMap[key];
                break;
            }
        }

        // 3. 核心算法：医学经验加权公式 
        // 逻辑：年纪大(+)、疼痛高(+)、完成度低(+)、打卡少(-) = 恢复慢，天数多
        let predictedDays = 
            (userAge * 0.2) +               // 年龄惩罚
            (avgPain * 3.0) +               // 疼痛惩罚：痛感越高，天数加得越多
            ((100 - avgPerf) * 0.5) -       // 表现惩罚：完成度越低，天数加得越多
            (consecutiveDays * 0.4) +       // 依从性奖励：打卡越多，天数减少
            (phaseValue * 5);               // 基础阶段耗时

        // 确保天数不会出现负数或小数
        predictedDays = Math.max(1, Math.round(predictedDays));

        // 4. 返回给前端
        res.json({ 
            predicted_days: predictedDays,
            calc_method: "real_data_rule_based"
        });

    } catch (error) {
        console.error("预测计算失败:", error.message);
        res.status(500).json({ error: "内部计算错误" });
    }
});

app.get('/api/trend/:userId', async (req, res) => {
    try {
        const userId = req.params.userId || 1;
        
        // 1. 从 MySQL 按天分组，查询过去 7 天的平均完成度
        const [logs] = await db.query(
            `SELECT 
                DATE(created_at) as log_date, 
                AVG(performance_score) as avg_score 
            FROM training_logs 
            WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(created_at)
            ORDER BY log_date ASC`,
            [userId]
        );

        // 2. 构造连续的 7 天数据（包含没有训练的日期填 0）
        const trendData = [];
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            
            // 格式化
            const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            
            // 查找数据库中是否有这一天的数据
            const log = logs.find(l => {
                const dbDate = new Date(l.log_date);
                const dbDateStr = dbDate.getFullYear() + '-' + String(dbDate.getMonth() + 1).padStart(2, '0') + '-' + String(dbDate.getDate()).padStart(2, '0');
                return dbDateStr === dateStr;
            });

            // 确定 X 轴显示的文字（最后一天显示“今日”，其余显示星期）
            let dayName = (i === 0) ? '今日' : weekdays[d.getDay()];

            trendData.push({
                day: dayName,
                score: log ? Math.round(log.avg_score) : 0 // 如果当天有记录就取平均分，没有就是 0
            });
        }

        res.json(trendData);

    } catch (error) {
        console.error("获取趋势数据失败:", error);
        res.status(500).json({ error: "服务器内部错误" });
    }
});

app.get('/api/stats/:userId', async (req, res) => {
    try {
        const userId = req.params.userId || 1;
        
        // 1. 获取该用户所有按时间倒序的训练日期和分数
        const [logs] = await db.query(
            'SELECT DATE(created_at) as log_date, performance_score FROM training_logs WHERE user_id = ? ORDER BY log_date DESC',
            [userId]
        );

        let streak = 0;
        let avgScore = 0;

        if (logs.length > 0) {
            // --- 计算历史平均康复评分 ---
            const totalScore = logs.reduce((sum, log) => sum + Number(log.performance_score), 0);
            avgScore = Math.round(totalScore / logs.length);

            // 提取所有不重复的打卡日期格式 (YYYY-MM-DD)
            const uniqueDates = [...new Set(logs.map(l => {
                const d = new Date(l.log_date);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }))];

            // 获取今天的日期字符串
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            // 获取昨天的日期字符串
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

            let checkDateStr = todayStr;

            // 如果今天没打卡，但昨天打卡了，连续记录依然有效（从昨天开始往前算）
            if (uniqueDates[0] !== todayStr) {
                if (uniqueDates[0] === yesterdayStr) {
                    checkDateStr = yesterdayStr;
                } else {
                    // 昨天和今天都没打卡，连续中断
                    streak = 0;
                }
            }

            // 循环倒推连续天数
            if (uniqueDates[0] === checkDateStr) {
                for (let dateStr of uniqueDates) {
                    if (dateStr === checkDateStr) {
                        streak++;
                        // 将检查日期往前推一天
                        const prev = new Date(checkDateStr);
                        prev.setDate(prev.getDate() - 1);
                        checkDateStr = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`;
                    } else {
                        break; // 断一天=直接结束循环
                    }
                }
            }
        }

        res.json({ streak, avgScore });

    } catch (error) {
        console.error("获取统计数据失败:", error);
        res.status(500).json({ error: "服务器内部错误" });
    }
});

// 2. 获取今日智能训练计划
app.post('/api/recommend-plan', async (req, res) => {
    try {
        const { id, injuryType, recoveryPhase, emotion } = req.body;
        const userId = id || 1; 

        // 1. 从 MySQL 数据库拉取该患者最新的真实训练记录
        const [logs] = await db.query(
            'SELECT pain_level, performance_score FROM training_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', 
            [userId]
        );

        // 获取真实的昨日数据（若无记录则赋默认健康值）
        const lastPain = logs && logs.length > 0 ? logs[0].pain_level : 0;
        const lastPerf = logs && logs.length > 0 ? logs[0].performance_score : 100;

        // 2. 组装给DeepSeek的Prompt
        const prompt = `
            【患者真实档案】
            - 伤情：${injuryType}
            - 阶段：${recoveryPhase}
            - 今日情绪：${emotion}
            【患者上次训练真实表现】
            - 疼痛指数(0-10)：${lastPain} 分
            - 动作完成度：${lastPerf}%
            
            【你的决策标准】
            如果疼痛指数大于5或完成度低于50%，说明炎症或受限严重，必须采取【保守降级 (消炎镇痛)】策略；
            如果疼痛指数小于2且完成度大于85%，具备【强化进阶 (力量重塑)】条件；
            其他情况保持【常规维持 (稳步巩固)】。

            请结合以上患者状态和决策标准，为他生成今天的定制康复处方。
            必须严格且仅以纯 JSON 格式返回，不要输出任何 Markdown 标记（如 \`\`\`json ），不要输出任何解释性文字。
            必须包含的 JSON 键值：strategy(策略名称), reason(详细的医学解释和鼓励), exercises(3个动作构成的数组，包含 name 和 focus)。
            
            参考格式：
            {"strategy": "强化进阶 (力量重塑)", "reason": "...", "exercises": [{"name": "...", "focus": "..."}]}
        `;

        let aiResult = {};

        // 3. 调用DeepSeek-LLM（添加超时机制）
        try {
            console.log("🚀 正在向 DeepSeek 发送真实康复数据进行推演...");
            
            // 设置超时（10秒）
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("DeepSeek API 调用超时")), 10000)
            );
            
            const completionPromise = client.chat.completions.create({
                model: process.env.AI_MODEL_NAME || "deepseek-chat", 
                messages: [
                    { 
                        role: "system", 
                        content: "你是一位资深的骨科物理治疗师，你的输出必须是合法的纯 JSON 对象。" 
                    },
                    { 
                        role: "user", 
                        content: prompt 
                    }
                ],
                temperature: 0.2 // 调低温度，保证处方生成的严谨性和 JSON 格式的稳定性
            });

            const completion = await Promise.race([completionPromise, timeoutPromise]);

            // 提取 AI 回复的文本
            const aiResponseText = completion.choices[0].message.content.trim();
            console.log("DeepSeek 原始响应:", aiResponseText.substring(0, 200) + "...");
            
            // 容错处理
            const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
            const cleanJsonString = jsonMatch ? jsonMatch[0] : aiResponseText;

            // 解析为 JavaScript 对象
            aiResult = JSON.parse(cleanJsonString);
            console.log("✅ DeepSeek 处方生成成功！");

        } catch (aiError) {
            console.error("⚠️ DeepSeek 调用或解析失败，触发本地规则引擎兜底:", aiError.message);
            console.error("错误详情:", aiError);
            
            // 4. 如果断网、DeepSeek 接口超时或 JSON 解析失败，依然能给患者发处方
            if (lastPain > 5 || lastPerf < 50) {
                aiResult = {
                    strategy: "保守降级 (消炎镇痛)",
                    reason: `系统监测到您上次训练疼痛值高达 ${lastPain} 分，今日请以轻柔微动为主，切勿逞强。`,
                    exercises: [
                        {name: "极轻柔关节微动", focus: "无痛范围内活动"}, 
                        {name: "局部冰敷与抬高", focus: "控制肿胀"},
                        {name: "深呼吸放松", focus: "缓解紧张情绪"}
                    ]
                };
            } else if (lastPain < 2 && lastPerf > 85) {
                aiResult = {
                    strategy: "强化进阶 (力量重塑)",
                    reason: `您上次完成度高达 ${lastPerf}% 且几乎无痛，身体已具备极佳条件，今日尝试加入抗阻训练！`,
                    exercises: [
                        {name: "等张抗阻收缩", focus: "强化肌肉力量"}, 
                        {name: "本体感觉平衡", focus: "神经肌肉控制"},
                        {name: "渐进式负荷训练", focus: "逐步增加强度"}
                    ]
                };
            } else {
                aiResult = {
                    strategy: "常规维持 (稳步巩固)",
                    reason: `您近期的疼痛(${lastPain}分)和完成度(${lastPerf}%)处于平稳区间，请继续保持。`,
                    exercises: [
                        {name: "患处主动活动", focus: "促进血液循环"}, 
                        {name: "周围肌肉牵伸", focus: "维持活动度"},
                        {name: "轻度有氧运动", focus: "提升心肺功能"}
                    ]
                };
            }
        }

        // 5. 将最终处方返回给前端 React
        res.json(aiResult);

    } catch (error) {
        console.error("处方接口遭遇严重异常:", error.message);
        res.status(500).json({ error: "服务器内部错误" });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`🚀 后端服务已启动: http://localhost:${PORT}`);
    console.log(`📡 数据库连接池: 已初始化`);
    console.log(`🤖 AI 服务状态: ${process.env.AI_API_KEY ? '在线 (Live API)' : '离线演示 (Demo Mode)'}`);
    console.log(`==========================================`);
});