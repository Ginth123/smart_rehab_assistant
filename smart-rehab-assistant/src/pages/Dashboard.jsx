import React, { useState, useEffect } from 'react';
import { 
    Activity, BookOpen, Settings, MessageSquare, Loader2, 
    Sparkles, CheckCircle2, ChevronRight, Flame, Trophy, TrendingUp 
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

// 接收 App.jsx 传来的 dailyPlan 和 setDailyPlan
const Dashboard = ({ setCurrentPage, rehabData, dailyPlan, setDailyPlan }) => {
    // 状态管理
    const [planLoading, setPlanLoading] = useState(false);
    const [planMessage, setPlanMessage] = useState('');
    // 删除了原有的局部 rehabPlan 状态
    
    const [predictedDays, setPredictedDays] = useState(null); // 保存AI预测天数
    const [chartData, setChartData] = useState([]); // 保存图表数据
    const [stats, setStats] = useState({ streak: 0, avgScore: 0 }); // 保存打卡天数和评分

    // ==========================================
    // 机器学习模型 1：页面加载时获取康复周期预测
    // ==========================================
    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                // 调用 Node.js 后端，后端会转发给 Python
                const res = await fetch('http://localhost:3000/api/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rehabData)
                });
                const data = await res.json();
                if (data.predicted_days) {
                    setPredictedDays(data.predicted_days);
                }
                const userId = rehabData.id || 1;
                const resTrend = await fetch(`http://localhost:3000/api/trend/${userId}`);
                if (resTrend.ok) {
                    const trendJson = await resTrend.json();
                    setChartData(trendJson);
                }
                const resStats = await fetch(`http://localhost:3000/api/stats/${userId}`);
                if (resStats.ok) {
                    const statsJson = await resStats.json();
                    setStats(statsJson);
                }
            } catch (e) { 
                console.error("预测服务未连接:", e); 
            }
        };
        fetchPrediction();
    }, [rehabData]);

    // ==========================================
    // 机器学习模型 2：点击按钮获取每日智能推荐计划
    // ==========================================
    const generatePlan = async () => {
        setPlanLoading(true);
        try {
            // 调用 Node.js 的机器学习推荐接口
            const res = await fetch('http://localhost:3000/api/recommend-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rehabData) 
            });
            const mlPlan = await res.json();
            // 🌟 修改点 3：使用全局的 setDailyPlan 保存生成的处方
            setDailyPlan({
                name: `今日策略：${mlPlan.strategy}`,
                goal: mlPlan.reason,
                exercises: mlPlan.exercises
            });
            setPlanMessage(`已基于您的历史数据生成精准处方`);
        } catch (e) {
            console.error(e);
            setPlanMessage('计划生成失败，请检查 Python 算法微服务是否已启动。');
        } finally {
            setPlanLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* 欢迎语 + 核心数据指标 */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                        欢迎回来，{rehabData.name} <span className="inline-block animate-wave"></span>
                    </h2>
                    <p className="text-slate-500 mt-3 font-medium text-lg">
                        <strong className="text-blue-600 font-bold">智愈随行</strong> —— 全程守护软组织损伤的智慧康复平台
                    </p>
                </div>
                
                {/* 激励数据与 AI 预测 */}
                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
                    {/* AI 预测天数展示框 */}
                    <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 items-center hidden md:flex hover:-translate-y-1 transition-transform">
                        <div className="bg-purple-50 p-2 rounded-xl mr-3">
                            <Sparkles className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold">预计恢复</p>
                            <p className="text-xl font-black text-slate-800">
                                {predictedDays ? predictedDays : '--'} <span className="text-sm font-medium text-slate-500">天</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center hover:-translate-y-1 transition-transform">
                        <div className="bg-orange-50 p-2 rounded-xl mr-3">
                            <Flame className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold">连续打卡</p>
                            <p className="text-xl font-black text-slate-800">{stats.streak} <span className="text-sm font-medium text-slate-500">天</span></p>
                        </div>
                    </div>

                    <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 hidden sm:flex items-center hover:-translate-y-1 transition-transform">
                        <div className="bg-amber-50 p-2 rounded-xl mr-3">
                            <Trophy className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold">康复评分</p>
                            <p className="text-xl font-black text-slate-800">{stats.avgScore} <span className="text-sm font-medium text-slate-500">分</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 系统提示信息框 */}
            {planMessage && (
                <div className={`p-4 mb-6 rounded-2xl flex items-center shadow-sm animate-in fade-in slide-in-from-top-2 ${planMessage.includes('失败') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200/60'}`}>
                    <CheckCircle2 className={`w-5 h-5 mr-3 ${planMessage.includes('失败') ? 'text-red-500' : 'text-green-500'}`} />
                    <span className="font-medium">{planMessage}</span>
                </div>
            )}

            {/* 主核心区 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                
                {/* 左侧宽卡片 */}
                <div className="lg:col-span-2 bg-white p-7 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center">
                            <div className="p-2 bg-purple-50 rounded-lg mr-3">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                            </div>
                            今日智能处方
                        </h3>
                        {/* 替换为 dailyPlan */}
                        {dailyPlan && (
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">ML 模型已定制</span>
                        )}
                    </div>
                    
                    <div className="grow">
                        {/* 替换为 dailyPlan */}
                        {dailyPlan ? (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <p className="text-slate-800 font-bold text-xl">{dailyPlan.name}</p>
                                    <p className="text-slate-500 text-sm leading-relaxed mt-2">{dailyPlan.goal}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                                    {dailyPlan.exercises.map((ex, idx) => (
                                        <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col justify-center items-center text-center group hover:border-purple-300 transition-colors">
                                            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-black flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">{idx + 1}</span>
                                            <span className="text-slate-700 font-bold">{ex.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-10">
                                <BookOpen className="w-12 h-12 mb-3 opacity-30" />
                                <p className="font-bold text-lg text-slate-500">暂无专属计划</p>
                                <p className="text-sm mt-1">请点击下方按钮，为您生成专属定制计划</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <button onClick={generatePlan} disabled={planLoading} className="flex-1 bg-purple-50 text-purple-700 border border-purple-200/60 py-3.5 px-4 rounded-2xl hover:bg-purple-100 transition-all flex items-center justify-center font-bold">
                            {planLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                            {planLoading ? '思考中...' : '生成 ML 智能处方'}
                        </button>
                        {/* 替换为 dailyPlan */}
                        {dailyPlan && (
                            <button onClick={() => setCurrentPage('session')} className="flex-1 bg-blue-600 text-white py-3.5 px-4 rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center group">
                                开始今日训练 <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>

                {/* 右侧窄卡片 */}
                <div className="lg:col-span-1 bg-white p-7 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                        <div className="p-2 bg-blue-50 rounded-lg mr-3">
                            <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        康复档案
                    </h3>
                    <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 grow">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                            <span className="text-slate-500 text-sm font-medium">伤情</span>
                            <span className="font-bold text-slate-800">{rehabData.injuryType}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                            <span className="text-slate-500 text-sm font-medium">阶段</span>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">{rehabData.recoveryPhase}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                            <span className="text-slate-500 text-sm font-medium">情绪</span>
                            <span className="font-bold text-slate-800">{rehabData.emotion}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm font-medium">上次训练</span>
                            <span className="font-bold text-slate-800">{rehabData.lastSessionDate}</span>
                        </div>
                    </div>
                    
                    <button onClick={() => setCurrentPage('settings')} className="mt-4 w-full flex items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 font-bold group">
                        <Settings className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-500" /> 更新档案
                    </button>
                </div>
            </div>

            {/* 图表 + 康复贴士 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 表现趋势图 */}
                <div className="lg:col-span-2 bg-white p-7 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <div className="p-2 bg-emerald-50 rounded-lg mr-3">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        近七日完成度趋势
                    </h3>
                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height={160}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`${value}%`, '完成度']}
                                />
                                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 竖向康复贴士 */}
                <div className="lg:col-span-1 bg-linear-to-b from-amber-50 to-orange-50/30 p-7 rounded-3xl border border-amber-100/50 flex flex-col shadow-sm">
                    <div className="bg-white w-12 h-12 rounded-2xl shadow-sm border border-amber-100 flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-bold text-amber-900 mb-3">今日智能贴士</h3>
                    <p className="text-amber-800/80 leading-relaxed font-medium grow">
                        软组织损伤在<strong>{rehabData.recoveryPhase}</strong>,
                        今日建议重点：<span className="text-amber-900 font-bold border-b border-amber-300">训练后请进行15分钟冷敷</span>，这能有效缓解次日的肿胀感。保持 {rehabData.emotion} 的心态，您做得很好！
                    </p>
                    <button onClick={() => setCurrentPage('chat')} className="mt-4 w-full flex items-center justify-center p-3 rounded-xl bg-white hover:bg-amber-100 text-amber-700 transition-all font-bold shadow-sm">
                        <MessageSquare className="w-4 h-4 mr-2" /> 问问康复专家
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;