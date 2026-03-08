import React, { useState } from 'react';

const SettingsPage = ({ rehabData, setRehabData }) => {
    const [formData, setFormData] = useState(rehabData);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setRehabData(formData); // 本地状态
        setMessage('✅ 保存成功！');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">个人档案设置</h2>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">伤情诊断</label>
                        <input type="text" name="injuryType" value={formData.injuryType} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">当前康复阶段</label>
                            <select name="recoveryPhase" value={formData.recoveryPhase} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="急性期">急性期 (保护与消肿)</option>
                                <option value="修复期">修复期 (活动度恢复)</option>
                                <option value="重塑期">重塑期 (力量强化)</option>
                                <option value="功能强化期 (回归运动)">功能强化期 (回归运动)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">近期情绪状态</label>
                            <select name="emotion" value={formData.emotion} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="积极">😄 积极乐观</option>
                                <option value="中性">😐 平稳</option>
                                <option value="焦虑">😟 焦虑担心</option>
                                <option value="稍感沮丧">😔 稍感沮丧</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center">
                        <button onClick={handleSave} className="bg-blue-600 text-white py-2.5 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-medium shadow-sm">
                            保存修改
                        </button>
                        {message && <span className="ml-4 text-sm font-medium text-green-600 animate-fade-in">{message}</span>}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-500 mb-2">数据隐私说明</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        您的健康数据仅存储于加密的云端数据库，仅用于为您生成个性化的康复建议。我们采用联邦学习技术来优化模型，不会泄露您的原始敏感信息。
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;