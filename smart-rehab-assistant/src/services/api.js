const API_BASE_URL = 'http://localhost:3000/api'; // 指向 Express 后端地址

// 通用 Fetch 封装 (处理错误和响应)
const request = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Request Failed:", error);
    return null; // 返回 null 让组件处理空状态
  }
};


// 获取用户档案
export const fetchUserProfile = async (userId) => {
  return await request(`/user/${userId}`);
};

// 更新用户档案
export const updateUserProfile = async (userData) => {
  return await request('/user', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// 发送聊天消息
export const sendChatMessage = async (message) => {
    return await request('/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
    });
};

// 保存训练记录
export const saveTrainingLog = async (data) => {
    return await request('/training', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// 获取历史训练记录
export const fetchTrainingLogs = async (userId = 1) => {
  const data = await request(`/training/${userId}`);
  return data || []; // 如果没有数据，返回空数组
};