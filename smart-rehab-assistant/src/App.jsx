import React, { useState } from 'react';
import { Home, Activity, BookOpen, MessageSquare, Settings, LogOut } from 'lucide-react';

// 引入所有页面组件
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import RehabSession from './pages/RehabSession';
import LLMChat from './pages/LLMChat';
import ProgressTracking from './pages/ProgressTracking';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const [rehabData, setRehabData] = useState({
      id: null, 
      name: '', 
      age: 30, 
      injuryType: '待完善', 
      recoveryPhase: '待评估', 
      emotion: '平稳', 
      lastSessionDate: '今日'
  });

  // 🌟 新增：将智能处方提升为全局状态，防止切换页面后丢失！
  const [dailyPlan, setDailyPlan] = useState(null);

  const handleLoginSuccess = (userData) => {
      setRehabData({
          ...rehabData,
          id: userData.id,
          name: userData.name,
          age: userData.age || 30,
          injuryType: userData.injuryType || '待完善',
          recoveryPhase: userData.recoveryPhase || '待评估'
      });
      setIsAuthenticated(true);
      setCurrentPage('dashboard'); 
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setRehabData({
          id: null, name: '', age: 30, injuryType: '待完善', recoveryPhase: '待评估', emotion: '平稳', lastSessionDate: '今日'
      });
      setDailyPlan(null); // 退出登录时，清空当前人的处方缓存
  };

  if (!isAuthenticated) {
      return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 🌟 修改：把 dailyPlan 和 setDailyPlan 作为 props 传给 Dashboard
  // 同时传给 RehabSession（这样以后的训练页面也能知道今天要练什么了！）
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard setCurrentPage={setCurrentPage} rehabData={rehabData} dailyPlan={dailyPlan} setDailyPlan={setDailyPlan} />;
      case 'session': return <RehabSession setCurrentPage={setCurrentPage} rehabData={rehabData} dailyPlan={dailyPlan} />;
      case 'progress': return <ProgressTracking rehabData={rehabData} />;
      case 'chat': return <LLMChat rehabData={rehabData} />;
      case 'settings': return <SettingsPage rehabData={rehabData} setRehabData={setRehabData} />;
      default: return <Dashboard setCurrentPage={setCurrentPage} rehabData={rehabData} dailyPlan={dailyPlan} setDailyPlan={setDailyPlan} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl shadow-sm border-b border-slate-200/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
            <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">智</div>
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight hidden sm:block leading-none">智愈随行</h1>
              <span className="text-[11px] text-slate-500 font-medium hidden md:block mt-1 tracking-wide">全程守护软组织损伤的智慧康复平台</span>
            </div>
          </div>
          
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {[
              { id: 'dashboard', icon: Home, label: '首页' },
              { id: 'session', icon: Activity, label: '训练' },
              { id: 'progress', icon: BookOpen, label: '进度' },
              { id: 'chat', icon: MessageSquare, label: '咨询' },
              { id: 'settings', icon: Settings, label: '设置' },
          // eslint-disable-next-line no-unused-vars
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setCurrentPage(id)}
                className={`flex items-center px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 ease-out ${
                  currentPage === id 
                    ? 'text-white bg-blue-600 shadow-md shadow-blue-500/30 font-medium scale-105' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className={`w-5 h-5 sm:mr-2 ${currentPage === id ? 'animate-pulse' : ''}`} />
                <span className="text-sm hidden md:inline">{label}</span>
              </button>
            ))}

            <div className="w-px h-5 bg-slate-300 mx-1 sm:mx-2"></div>

            <button onClick={handleLogout} className="flex items-center px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 ease-out text-red-500 hover:text-white hover:bg-red-500 hover:shadow-md hover:shadow-red-500/30" title="退出登录">
              <LogOut className="w-5 h-5 sm:mr-1" />
              <span className="text-sm hidden lg:inline font-medium">退出</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 container mx-auto px-4 max-w-6xl">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;