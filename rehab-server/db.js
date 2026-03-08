const mysql = require('mysql2');
require('dotenv').config();

// 创建连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456', 
    database: process.env.DB_NAME || 'smart_rehab_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 导出 promise 包装版本，方便使用 async/await
module.exports = pool.promise();