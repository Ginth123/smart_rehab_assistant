import React, { useState, useEffect } from 'react';
import { Activity, Sparkles, Play, CheckCircle2, ChevronRight, ActivitySquare, Smile, Frown } from 'lucide-react';
import { saveTrainingLog } from '../services/api';

const RehabSession = () => {
    // 定义动态的训练动作队列
    const planExercises = [
        { name: "患处轻柔主动活动", reps: 12, focus: "在无痛范围内，缓慢活动患处关节，促进局部血液循环，防止僵硬。" },
        { name: "患处肌肉等长收缩", reps: 10, focus: "不改变肌肉长度的前提下收紧肌肉，唤醒肌肉神经，防止肌肉萎缩。" },
        { name: "患处周围轻柔牵伸", reps: 8, focus: "轻柔拉伸周围代偿肌肉，缓解紧张感，恢复正常关节活动度。" },
        { name: "核心稳定性微调", reps: 15, focus: "收紧核心，保持躯干稳定，为受损肢体提供安全的力学支撑环境。" }
    ];

    // 状态管理
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [active, setActive] = useState(false);
    const [count, setCount] = useState(0);
    
    // 疼痛评估环节的状态
    const [showAssessment, setShowAssessment] = useState(false);
    const [painLevel, setPainLevel] = useState(2); // 默认滑块在
    const [isAllFinished, setIsAllFinished] = useState(false); // 是否完成全部4个动作

    // 当前执行的动作对象
    const currentExercise = planExercises[currentExerciseIndex];
    const targetReps = currentExercise.reps;
    
    // 传感器数据 (VR部分)
    const [angle, setAngle] = useState(50);
    const [isGoodForm, setIsGoodForm] = useState(false);

    useEffect(() => {
        let interval;
        if (active) {
            interval = setInterval(() => {
                const newAngle = Math.floor(Math.random() * 40) + 40;
                setAngle(newAngle);
                setIsGoodForm(newAngle > 60);
            }, 800);
        }
        return () => clearInterval(interval);
    }, [active]);

    const handleCompleteRep = () => {
        if (count < targetReps) setCount(c => c + 1);
    };

    // 触发结束，进入评估状态
    const handleEndSession = () => {
        setActive(false);
        setShowAssessment(true); // 弹出疼痛打分面板
    };

    // 保存真实数据并切换到下一个动作
    const submitAndNext = async () => {
        try {
            // 保存 动态的动作名 和 用户打分的疼痛值
            await saveTrainingLog({ 
                userId: 1, 
                exercise: currentExercise.name, 
                reps: count, 
                pain: painLevel, 
                score: Math.min(100, Math.round((count / targetReps) * 100)) 
            });

            // 逻辑判断：是否还有下一个动作
            if (currentExerciseIndex < planExercises.length - 1) {
                setCurrentExerciseIndex(prev => prev + 1); // 切换到下一个
                setCount(0); // 次数归零
                setPainLevel(2); // 疼痛刻度复位
                setShowAssessment(false); // 关闭评估面板
            } else {
                // 全部动作完成
                setIsAllFinished(true);
            }
        } catch (e) {
            console.error(e);
            alert("数据保存失败，请检查后端网络");
        }
    };

    // 如果全部完成，显示祝贺页面
    if (isAllFinished) {
        return (
            <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-200/50">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-3">今日训练已全部圆满完成！</h2>
                <p className="text-slate-500 mb-8 font-medium">所有动作的次数和疼痛数据已同步至您的专属健康档案。</p>
                <div className="text-sm text-slate-400 bg-slate-100 px-6 py-3 rounded-full">
                    👉 请点击顶部导航栏的<strong className="text-slate-600 mx-1">「进度」</strong>或<strong className="text-slate-600 mx-1">「首页」</strong>查看最新数据
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <ActivitySquare className="w-6 h-6 mr-2 text-blue-600" />
                康复训练执行
            </h2>

            {/* 上部：AR 视觉反馈区 */}
            <div className="bg-[#111827] rounded-3xl relative overflow-hidden aspect-video shadow-lg mb-6 flex items-center justify-center border border-slate-200">
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-mono flex items-center border border-white/10">
                    REC <span className="w-2 h-2 bg-red-500 rounded-full ml-2 animate-pulse"></span>
                </div>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-mono border border-white/10">
                    角度: {angle}°
                </div>

                {!active ? (
                    <div className="flex flex-col items-center opacity-50">
                        <div className="w-16 h-16 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-white font-medium tracking-widest">等待开启训练...</p>
                    </div>
                ) : (
                    <>
                        {isGoodForm && <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity" alt="指导图" />}
                        {!isGoodForm && (
                            <div className="flex flex-col items-center relative z-10">
                                <div className="bg-red-500/90 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-red-500/30 animate-bounce">
                                    震动反馈: 动作修正!
                                </div>
                                <p className="text-white mt-4 text-sm font-medium">正在加载全息指导...</p>
                            </div>
                        )}
                        <div className="absolute bottom-6 left-6 right-6">
                            {isGoodForm ? (
                                <div className="bg-black/70 backdrop-blur-md text-green-400 py-3 rounded-2xl text-center font-bold border border-green-500/30">
                                    <CheckCircle2 className="w-5 h-5 inline mr-2" /> 动作标准
                                </div>
                            ) : (
                                <div className="bg-black/80 backdrop-blur-md text-amber-400 py-3 rounded-2xl text-center font-bold border border-amber-500/30">
                                    ⚠️ 角度偏差：请调整关节角度
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* 中部：动态更新的动作要领 */}
            <div className="bg-blue-50/80 border border-blue-100 p-6 rounded-3xl text-sm text-blue-900 leading-relaxed shadow-sm mb-6 transition-all">
                <h4 className="font-bold mb-2 flex items-center text-blue-800">
                    <Sparkles className="w-4 h-4 mr-2 text-blue-600" /> 动作要领
                </h4>
                <p className="font-medium text-blue-800/80">{currentExercise.focus}</p>
            </div>

            {/* 底部：控制台 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="flex justify-between items-end mb-5">
                    <div>
                        {/* 动态显示的动作名称 */}
                        <h3 className="text-2xl font-black text-slate-800 transition-all">{currentExercise.name}</h3>
                        <p className="text-slate-400 font-medium mt-1">第 {currentExerciseIndex + 1} / {planExercises.length} 个动作</p>
                    </div>
                    <div className="text-right">
                        <span className="text-5xl font-black text-blue-600 tracking-tighter">{count}</span>
                        {/* 动态显示的目标次数 */}
                        <span className="text-slate-300 text-xl font-bold ml-1">/ {targetReps}</span>
                    </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 mb-8 overflow-hidden">
                    <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(count / targetReps) * 100}%` }}
                    ></div>
                </div>

                {/* 普通模式 & 评估模式 */}
                {showAssessment ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        {/* 疼痛评估 UI */}
                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                            <h4 className="font-bold text-orange-800 mb-2 flex items-center text-lg">
                                <Frown className="w-5 h-5 mr-2" /> 训练后疼痛评估
                            </h4>
                            <p className="text-orange-700/80 text-sm mb-6 font-medium">请拖动滑块，评估刚才完成「{currentExercise.name}」时的疼痛程度。</p>
                            
                            <input 
                                type="range" 
                                min="0" max="10" 
                                value={painLevel} 
                                onChange={e => setPainLevel(parseInt(e.target.value))}
                                className="w-full accent-orange-500 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                            />
                            
                            <div className="flex justify-between text-orange-800 font-bold mt-4 items-center">
                                <span className="text-sm flex items-center text-orange-600/70"><Smile className="w-4 h-4 mr-1"/> 无痛 (0)</span>
                                <span className="text-3xl bg-white px-4 py-1 rounded-xl shadow-sm border border-orange-100">{painLevel}</span>
                                <span className="text-sm flex items-center text-red-600/70">剧痛 (10) <Frown className="w-4 h-4 ml-1"/></span>
                            </div>
                        </div>

                        <button 
                            onClick={submitAndNext}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-md transition-all flex items-center justify-center group"
                        >
                            保存记录并{currentExerciseIndex < planExercises.length - 1 ? '进入下一项' : '完成今日训练'} 
                            <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ) : !active ? (
                    <button 
                        onClick={() => setActive(true)} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center group"
                    >
                        <Play className="w-5 h-5 mr-2 fill-white" /> 开始当前动作
                    </button>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                            onClick={handleCompleteRep} 
                            disabled={count >= targetReps}
                            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-sm
                                ${count >= targetReps 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                                    : 'bg-[#10b981] hover:bg-[#059669] text-white shadow-[#10b981]/30 active:scale-[0.98]'
                                }`}
                        >
                            完成一次 (+1)
                        </button>
                        <button 
                            onClick={handleEndSession} 
                            className="w-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 py-4 rounded-2xl font-bold text-lg transition-colors border border-red-100"
                        >
                            结束当前动作
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RehabSession;