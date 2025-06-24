const axios = require('axios');

/**
 * 快速测试工具 - 用于测试单个 API 端点
 * 使用方法: node quick-test.js <method> <endpoint> [data] [token]
 */

const BASE_URL = 'http://localhost:3000';
const COLORS = {
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    RESET: '\x1b[0m'
};

function log(message, color = COLORS.RESET) {
    console.log(`${color}${message}${COLORS.RESET}`);
}

async function quickTest() {
    const args = process.argv.slice(2);
    
    if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
        console.log(`
Quick API Test Tool

Usage: node quick-test.js <method> <endpoint> [data] [token]

Arguments:
  method    HTTP method (GET, POST, PUT, PATCH, DELETE)
  endpoint  API endpoint (e.g., /auth/login, /tasks, /users/profile)
  data      JSON data for request body (optional)
  token     JWT token for authorization (optional)

Examples:
  # 测试登录
  node quick-test.js POST /auth/login '{"username":"testuser","password":"password123"}'
  
  # 测试获取用户资料 (需要token)
  node quick-test.js GET /users/profile "" "your-jwt-token-here"
  
  # 测试创建任务
  node quick-test.js POST /tasks '{"title":"Test Task","team_id":"team-uuid"}' "your-jwt-token"
  
  # 测试获取所有任务
  node quick-test.js GET /tasks "" "your-jwt-token"

Common endpoints:
  Authentication:
    POST /auth/register - 用户注册
    POST /auth/login    - 用户登录
  
  Users:
    GET /users/profile  - 获取当前用户资料
    GET /users         - 获取所有用户
  
  Teams:
    POST /teams        - 创建团队
    GET /teams         - 获取所有团队
    GET /teams/:id     - 获取团队详情
  
  Tasks:
    POST /tasks        - 创建任务
    GET /tasks         - 获取所有任务
    GET /tasks/:id     - 获取任务详情
    PATCH /tasks/:id   - 更新任务
    DELETE /tasks/:id  - 删除任务
`);
        return;
    }    const method = args[0].toUpperCase();
    const endpoint = args[1];
    let data = null;
    
    if (args[2] && args[2] !== '') {
        try {
            data = JSON.parse(args[2]);
        } catch (error) {
            log(`❌ Invalid JSON data: ${args[2]}`, COLORS.RED);
            log(`Error: ${error.message}`, COLORS.RED);
            log(`💡 Make sure to properly escape quotes in your shell`, COLORS.YELLOW);
            return;
        }
    }
    
    const token = args[3];

    const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
        config.data = data;
    }

    log(`\n🚀 Testing ${method} ${endpoint}`, COLORS.BLUE);
    if (data) {
        log(`📤 Request Data: ${JSON.stringify(data, null, 2)}`, COLORS.YELLOW);
    }
    if (token) {
        log(`🔐 Using Authorization Token`, COLORS.YELLOW);
    }
    log('─'.repeat(50), COLORS.BLUE);

    try {
        const startTime = Date.now();
        const response = await axios(config);
        const endTime = Date.now();
        
        log(`✅ Success (${response.status}) - ${endTime - startTime}ms`, COLORS.GREEN);
        log(`📥 Response:`, COLORS.GREEN);
        console.log(JSON.stringify(response.data, null, 2));
        
        // 如果是登录成功，提取token
        if (endpoint === '/auth/login' && response.data.access_token) {
            log(`\n🔑 JWT Token: ${response.data.access_token}`, COLORS.YELLOW);
            log(`💡 Use this token for authenticated requests`, COLORS.YELLOW);
        }
        
    } catch (error) {
        const endTime = Date.now();
        log(`❌ Error (${error.response?.status || 'Network'}) - ${endTime - startTime}ms`, COLORS.RED);
        log(`📥 Error Response:`, COLORS.RED);
        
        if (error.response?.data) {
            console.log(JSON.stringify(error.response.data, null, 2));
        } else {
            console.log(error.message);
        }
    }
}

if (require.main === module) {
    quickTest().catch(console.error);
}

module.exports = quickTest;
