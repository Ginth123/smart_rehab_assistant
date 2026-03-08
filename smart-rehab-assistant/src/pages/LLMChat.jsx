import React, { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { sendChatMessage } from '../services/api';

const LLMChat = () => {
    const [messages, setMessages] = useState([{ role: 'assistant', content: '您好，我是您的专属康复顾问。有什么不舒服的地方吗？' }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const newMsgs = [...messages, { role: 'user', content: input }];
        setMessages(newMsgs);
        setInput('');
        setLoading(true);

        try {
            const res = await sendChatMessage(input);
            setMessages([...newMsgs, { role: 'assistant', content: res.reply }]);
        } catch (e) {
           
            console.error("Chat Error:", e);
            setMessages([...newMsgs, { role: 'assistant', content: '系统连接失败，请检查后端服务。' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center">
                <Bot className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="font-bold text-gray-800">智能康复咨询</h2>
            </div>
            
            {/* flex-grow -> grow */}
            <div className="grow p-6 overflow-y-auto space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && <div className="text-xs text-gray-400 ml-2">AI 正在思考...</div>}
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-2">
                <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="输入您的问题..."
                    // flex-grow -> grow
                    className="grow p-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleSend} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
export default LLMChat;