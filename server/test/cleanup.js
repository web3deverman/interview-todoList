const axios = require('axios');

/**
 * 测试数据清理脚本
 * 用于清理测试过程中创建的数据
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

function logSuccess(message) {
    log(`✓ ${message}`, COLORS.GREEN);
}

function logError(message) {
    log(`✗ ${message}`, COLORS.RED);
}

function logInfo(message) {
    log(`ℹ ${message}`, COLORS.BLUE);
}

function logWarning(message) {
    log(`⚠ ${message}`, COLORS.YELLOW);
}

// HTTP 请求函数
async function request(method, endpoint, data = null, token = null) {
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

    try {
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message, 
            status: error.response?.status 
        };
    }
}

// 获取管理员token（需要提供管理员凭据）
async function getAdminToken() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        log('Usage: node cleanup.js <admin-username> <admin-password>', COLORS.RED);
        log('Example: node cleanup.js admin@example.com password123', COLORS.YELLOW);
        process.exit(1);
    }

    const username = args[0];
    const password = args[1];

    logInfo('Logging in as administrator...');
    const result = await request('POST', '/auth/login', { username, password });

    if (result.success) {
        logSuccess('Administrator login successful');
        return result.data.access_token;
    } else {
        logError(`Administrator login failed: ${JSON.stringify(result.error)}`);
        throw new Error('Administrator login failed');
    }
}

// 清理测试用户
async function cleanupTestUsers(token) {
    logInfo('Cleaning up test users...');
    
    // 获取所有用户
    const usersResult = await request('GET', '/users', null, token);
    
    if (!usersResult.success) {
        logError('Failed to get users list');
        return;
    }

    const testUsers = usersResult.data.filter(user => 
        user.username.includes('test') || 
        user.email.includes('test') ||
        user.username.includes('pwsh_test')
    );

    logInfo(`Found ${testUsers.length} test users to clean up`);

    for (const user of testUsers) {
        logInfo(`Cleaning up user: ${user.username} (${user.email})`);
        // 注意：这里需要实现用户删除的API端点
        // const deleteResult = await request('DELETE', `/users/${user.id}`, null, token);
        logWarning(`User deletion API not implemented: ${user.username}`);
    }
}

// 清理测试团队
async function cleanupTestTeams(token) {
    logInfo('Cleaning up test teams...');
    
    // 获取所有团队
    const teamsResult = await request('GET', '/teams', null, token);
    
    if (!teamsResult.success) {
        logError('Failed to get teams list');
        return;
    }

    const testTeams = teamsResult.data.filter(team => 
        team.name.includes('Test') || 
        team.name.includes('PowerShell')
    );

    logInfo(`Found ${testTeams.length} test teams to clean up`);

    for (const team of testTeams) {
        logInfo(`Cleaning up team: ${team.name}`);
        // 注意：这里需要实现团队删除的API端点
        // const deleteResult = await request('DELETE', `/teams/${team.id}`, null, token);
        logWarning(`Team deletion API not implemented: ${team.name}`);
    }
}

// 清理测试任务
async function cleanupTestTasks(token) {
    logInfo('Cleaning up test tasks...');
    
    // 获取所有任务
    const tasksResult = await request('GET', '/tasks', null, token);
    
    if (!tasksResult.success) {
        logError('Failed to get tasks list');
        return;
    }

    const testTasks = tasksResult.data.filter(task => 
        task.title.includes('Test') || 
        task.description.includes('test')
    );

    logInfo(`Found ${testTasks.length} test tasks to clean up`);

    let deletedCount = 0;
    for (const task of testTasks) {
        logInfo(`Deleting task: ${task.title}`);
        const deleteResult = await request('DELETE', `/tasks/${task.id}`, null, token);
        
        if (deleteResult.success) {
            logSuccess(`Task deleted: ${task.title}`);
            deletedCount++;
        } else {
            logError(`Failed to delete task: ${task.title} - ${JSON.stringify(deleteResult.error)}`);
        }
    }

    logSuccess(`Successfully deleted ${deletedCount} test tasks`);
}

// 主清理函数
async function cleanup() {
    log('='.repeat(60), COLORS.BLUE);
    log('🧹 Starting Test Data Cleanup', COLORS.BLUE);
    log('='.repeat(60), COLORS.BLUE);

    try {
        // 检查服务器是否运行
        logInfo('Checking if server is running...');
        try {
            await axios.get(`${BASE_URL}/users`, { timeout: 5000 });
            logSuccess('Server is running');
        } catch (error) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                logError('Server is not running. Please start the server first.');
                process.exit(1);
            }
        }

        // 获取管理员token
        const adminToken = await getAdminToken();

        // 执行清理操作
        log('\n🗑️ Cleanup Operations', COLORS.YELLOW);
        await cleanupTestTasks(adminToken);
        await cleanupTestTeams(adminToken);
        await cleanupTestUsers(adminToken);

        // 清理完成
        log('\n' + '='.repeat(60), COLORS.GREEN);
        log('✅ Cleanup completed successfully!', COLORS.GREEN);
        log('='.repeat(60), COLORS.GREEN);

        log('\n💡 Notes:', COLORS.YELLOW);
        log('- Only test tasks could be deleted (team and user deletion APIs not implemented)', COLORS.YELLOW);
        log('- Test users and teams are still in the database', COLORS.YELLOW);
        log('- You may need to manually clean them from the database if needed', COLORS.YELLOW);

    } catch (error) {
        log('\n' + '='.repeat(60), COLORS.RED);
        logError(`Cleanup failed: ${error.message}`);
        log('='.repeat(60), COLORS.RED);
        process.exit(1);
    }
}

// 显示帮助信息
function showHelp() {
    console.log(`
Test Data Cleanup Tool

Usage: node cleanup.js <admin-username> <admin-password>

Arguments:
  admin-username    Administrator username or email
  admin-password    Administrator password

Options:
  --help, -h       Show this help message

Examples:
  node cleanup.js admin@example.com password123
  node cleanup.js testuser1_1234567890 password123

Notes:
  - This script requires administrator privileges
  - Only test data (containing 'test' in names) will be cleaned
  - Make sure the server is running on ${BASE_URL}
  - Currently only tasks can be deleted, users and teams need manual cleanup

What gets cleaned:
  ✓ Tasks with 'Test' in title or description
  ⚠ Teams with 'Test' or 'PowerShell' in name (API not implemented)
  ⚠ Users with 'test' in username/email (API not implemented)
`);
}

// 运行清理
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        process.exit(0);
    }
    
    cleanup().catch(console.error);
}

module.exports = { cleanup, cleanupTestTasks, cleanupTestTeams, cleanupTestUsers };
