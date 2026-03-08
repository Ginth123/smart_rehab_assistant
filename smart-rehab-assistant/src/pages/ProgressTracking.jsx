import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookOpen, Loader2 } from 'lucide-react';
import { fetchTrainingLogs } from '../services/api';

const ProgressTracking = () => {
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);

    // 从数据库获取数据
    useEffect(() => {
        const loadData = async () => {
            const data = await fetchTrainingLogs(1); // 查询用户ID为1的记录
            setProgressData(data);
            setLoading(false);
        };
        loadData();
    }, []);

    // 加载中状态
    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-500 font-medium">数据加载中...</span>
            </div>
        );
    }

    // 防崩溃保护：如果数据库没数据，显示空状态
    if (!progressData || progressData.length === 0) {
        return (
            <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">康复数据追踪</h2>
                <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                    <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-xl text-gray-500">暂无训练数据</p>
                    <p className="text-gray-400 text-sm mt-2">去“训练”页面完成一次康复后，数据将显示在这里</p>
                </div>
            </div>
        );
    }

    // --- 数据格式化与智能清洗 ---
    const chartData = progressData.map(d => {
        const dateObj = new Date(d.date);
        
        // 1. 获取原始分数
        let rawScore = parseFloat(d.performance || 0);
        // 2. 智能兼容：如果发现是 0.xx 这种老的小数格式，就乘 100；如果是新格式的 50，就原样保留
        let normalizedScore = (rawScore > 0 && rawScore <= 1) ? rawScore * 100 : rawScore;
       
        let finalScore = Math.min(100, Math.round(normalizedScore));

        return {
            // 图表底部显示的短时间，如 "2/19 14:30"
            shortDate: `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`,
            // 完整时间
            fullDate: dateObj.toLocaleString(),
            performance: finalScore,
            painLevel: d.painLevel,
            reps: d.reps,
            exercise: d.exercise
        };
    });

    // 计算平均完成度 
    const avgPerformance = chartData.length > 0 
        ? Math.round(chartData.reduce((acc, curr) => acc + curr.performance, 0) / chartData.length)
        : 0;

    return (
        <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">康复数据追踪</h2>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6">表现趋势图</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            {/* X轴使用精确到分钟的短时间 */}
                            <XAxis dataKey="shortDate" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                            <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} unit="%" />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 10]} hide />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line yAxisId="left" type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{ r: 6, fill: '#3b82f6' }} name="完成度 (%)" />
                            <Line yAxisId="right" type="monotone" dataKey="painLevel" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{r: 3, fill: '#ef4444'}} name="疼痛指数 (0-10)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">关键指标</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                        <p className="text-sm text-blue-600 font-bold mb-1">累计训练次数</p>
                        <p className="text-4xl font-black text-blue-800">{chartData.length}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                        <p className="text-sm text-emerald-600 font-bold mb-1">平均完成度</p>
                        <p className="text-4xl font-black text-emerald-800">{avgPerformance}%</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">历史记录详情 (按时间倒序)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 font-bold">训练时间</th>
                                <th className="px-6 py-4 font-bold">动作名称</th>
                                <th className="px-6 py-4 font-bold">完成度</th>
                                <th className="px-6 py-4 font-bold">综合评级</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* 使用 reverse() 让最新的记录显示在最上面 */}
                            {[...chartData].reverse().map((record, index) => (
                                <tr key={index} className="bg-white border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{record.fullDate}</td>
                                    <td className="px-6 py-4 text-slate-700">{record.exercise}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-20 bg-slate-100 rounded-full h-2 mr-3 overflow-hidden">
                                                {/* 这里的宽度最大也是100%，进度条不会再超出边界 */}
                                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${record.performance}%` }}></div>
                                            </div>
                                            <span className="text-xs font-medium text-slate-500">{record.performance}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                            record.performance >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                                            record.performance >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {record.performance >= 80 ? '优秀' : record.performance >= 50 ? '良好' : '需努力'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProgressTracking;