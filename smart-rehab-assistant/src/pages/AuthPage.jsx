import React, { useState } from 'react';
import { 
    Activity, Mail, Lock, User, ArrowRight, 
    Sparkles, ShieldCheck, TrendingUp, CheckCircle2, X 
} from 'lucide-react';

const AuthPage = ({ onLoginSuccess }) => {
    // UI 状态管理
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    // 协议弹窗状态管理
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    
    // 表单数据状态
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(''); 

        try {
            const endpoint = isLogin ? '/api/login' : '/api/register';
            
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }

            if (isLogin) {
                if (onLoginSuccess) onLoginSuccess(data.user);
            } else {
                setIsLogin(true);
                setFormData({ ...formData, password: '' }); 
                setErrorMessage('注册成功！请使用新账号登录。');
                setTimeout(() => setErrorMessage(''), 3000); 
            }

        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 弹窗组件：用于渲染协议内容 ---
    const Modal = ({ title, isOpen, onClose, children }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            {title}
                        </h3>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 text-slate-600 text-sm leading-relaxed space-y-4 font-medium">
                        {children}
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                        <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                            我已阅读并了解
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
            
            {/* 微妙的科技感网格纹理 */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

            {/* 动态模糊光斑 */}
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
            <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-emerald-400/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>

            {/* 主卡片容器 */}
            <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden z-10 border border-white/60">
                
                {/* 左侧：品牌展示 */}
                <div className="hidden md:flex flex-col justify-between w-5/12 bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-wider">智愈随行</span>
                        </div>
                        
                        <h1 className="text-4xl font-bold leading-tight mb-6">让每一次康复<br />都有迹可循</h1>
                        <p className="text-blue-100 text-lg mb-10 font-medium">基于大模型的软组织损伤 DTx 平台</p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white/10 rounded-lg mt-1"><Sparkles className="w-5 h-5 text-purple-200" /></div>
                                <div>
                                    <h3 className="font-bold text-lg">AI 动态数字处方</h3>
                                    <p className="text-blue-100/80 text-sm mt-1">毫秒级推演，千人千面的康复计划</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white/10 rounded-lg mt-1"><TrendingUp className="w-5 h-5 text-blue-200" /></div>
                                <div>
                                    <h3 className="font-bold text-lg">全周期数据闭环</h3>
                                    <p className="text-blue-100/80 text-sm mt-1">打通院内外壁垒，重塑康复体验</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white/10 rounded-lg mt-1"><ShieldCheck className="w-5 h-5 text-emerald-200" /></div>
                                <div>
                                    <h3 className="font-bold text-lg">医疗级隐私合规</h3>
                                    <p className="text-blue-100/80 text-sm mt-1">联邦学习架构，捍卫您的健康数据</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右侧：表单交互 */}
                <div className="w-full md:w-7/12 p-8 sm:p-14 flex flex-col justify-center bg-white/50">
                    <div className="max-w-md w-full mx-auto">
                        
                        <div className="flex md:hidden items-center justify-center gap-2 mb-8 text-blue-600">
                            <Activity className="w-8 h-8" />
                            <span className="text-2xl font-black">智愈随行</span>
                        </div>

                        <h2 className="text-3xl font-black text-slate-800 mb-2">
                            {isLogin ? '欢迎回来' : '开启康复之旅'}
                        </h2>
                        <p className="text-slate-500 mb-8 font-medium">
                            {isLogin ? '登录您的数字康复档案，查看今日处方' : '建立您的专属云端档案，让 AI 护航康复'}
                        </p>

                        {errorMessage && (
                            <div className={`mb-4 p-3 rounded-xl text-sm font-bold ${errorMessage.includes('成功') ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-500 border border-red-200'}`}>
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <div className="relative animate-in fade-in slide-in-from-top-2">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium" placeholder="您的真实姓名" />
                                </div>
                            )}

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium" placeholder="邮箱账号" />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium" placeholder="请输入密码" />
                            </div>

                            {isLogin && (
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <label className="flex items-center text-slate-500 hover:text-slate-800 cursor-pointer transition-colors">
                                        <input type="checkbox" className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> 记住我
                                    </label>
                                    <a href="#" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">忘记密码？</a>
                                </div>
                            )}

                            <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-500/30 text-base font-bold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all group disabled:opacity-70 disabled:cursor-not-allowed mt-4">
                                {isLoading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <>{isLogin ? '安全登录' : '创建档案'} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-slate-500 font-medium">
                            {isLogin ? "还没有康复档案？" : "已有账号？"}
                            <button onClick={() => { setIsLogin(!isLogin); setErrorMessage(''); }} className="ml-2 font-bold text-blue-600 hover:text-purple-600 transition-colors">
                                {isLogin ? '立即注册' : '返回登录'}
                            </button>
                        </div>
                        
                        {!isLogin && (
                            <div className="mt-6 flex items-start justify-center text-xs text-slate-400">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1 shrink-0" />
                                <p>注册即代表您同意智愈随行的 
                                    <button type="button" onClick={() => setShowTerms(true)} className="text-slate-600 underline font-bold hover:text-blue-600 mx-1">服务条款</button> 
                                    与 
                                    <button type="button" onClick={() => setShowPrivacy(true)} className="text-slate-600 underline font-bold hover:text-blue-600 mx-1">隐私协议</button>
                                    。
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- 服务条款弹窗 --- */}
            <Modal title="智愈随行 - 服务条款" isOpen={showTerms} onClose={() => setShowTerms(false)}>
                <p>欢迎您使用“智愈随行”数字疗法（DTx）平台。在使用本平台前，请务必仔细阅读以下条款：</p>
                <div className="space-y-2 mt-4">
                    <h4 className="font-bold text-slate-800">1. 服务性质与医疗免责声明</h4>
                    <p>本平台利用大模型技术为您生成个性化的康复建议与运动处方。<strong>但请注意，本平台不能完全替代骨科医生或物理治疗师的面诊。</strong>在执行任何康复动作前，若您感到异常疼痛，请立即停止并寻求专业医疗救助。</p>
                    <h4 className="font-bold text-slate-800 pt-2">2. 用户责任与数据真实性</h4>
                    <p>系统生成的处方依赖于您在训练和进度追踪中反馈的真实数据（如疼痛指数、完成度）。您有责任确保填写的身体状态和感受是真实、准确的。故意瞒报疼痛情况可能导致误判，从而加重您的损伤。</p>
                    <h4 className="font-bold text-slate-800 pt-2">3. 平台升级与维护</h4>
                    <p>为了提供更优质的空间计算（VR）和多模态算法服务，我们可能会不定期对系统进行升级维护。在此期间可能会产生短暂的服务中断，我们将尽可能提前通知。</p>
                </div>
            </Modal>

            {/* --- 隐私协议弹窗 --- */}
            <Modal title="智愈随行 - 隐私保护协议" isOpen={showPrivacy} onClose={() => setShowPrivacy(false)}>
                <p>作为一家医疗科技平台，我们深知健康数据对您的重要性。我们承诺采用最高级别的安全标准来捍卫您的隐私。</p>
                <div className="space-y-2 mt-4">
                    <h4 className="font-bold text-slate-800">1. 我们收集哪些数据？</h4>
                    <p>在您授权的前提下，我们仅收集与您康复直接相关的数据，包括：基础档案（年龄、伤情）、康复训练日志（动作完成度、疼痛打分）以及您与 AI 咨询的交互记录。</p>
                    <h4 className="font-bold text-slate-800 pt-2">2. 数据加密 (Bcrypt)</h4>
                    <p>您的账号密码均通过 Bcrypt 单向加盐哈希算法进行严格加密存储。这意味着包括平台开发者和 DBA 在内的任何人都无法获取您的明文密码，从物理底层杜绝了密码泄露的可能。</p>
                    <h4 className="font-bold text-slate-800 pt-2">3. 联邦学习架构</h4>
                    <p>为了不断优化 AI 大模型对骨科康复的理解，我们采用了“联邦学习”架构。您的核心健康特征将只在您的本地设备进行计算和脱敏，传回云端的仅是“模型梯度”而非您的原始隐私数据。我们在让 AI 变得更聪明的同时，绝不窥探您的个人隐私。</p>
                    <h4 className="font-bold text-slate-800 pt-2">4. 数据删除权</h4>
                    <p>您拥有对自身数据的绝对控制权。您可以在“设置”页面随时申请注销账号，届时我们将从数据库中彻底删除您的所有关联档案与训练记录。</p>
                </div>
            </Modal>

        </div>
    );
};

export default AuthPage;