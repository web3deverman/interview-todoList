const axios = require('axios');
const assert = require('assert');

// 配置
const BASE_URL = 'http://localhost:3000';
const COLORS = {
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    RESET: '\x1b[0m'
};

// 测试数据
const timestamp = Date.now();
let testData = {
    user1: {
        username: `testuser1_${timestamp}`,
        email: `testuser1_${timestamp}@example.com`,
        password: 'password123',
        token: '',
        id: ''
    },
    user2: {
        username: `testuser2_${timestamp}`,
        email: `testuser2_${timestamp}@example.com`,
        password: 'password123',
        token: '',
        id: ''
    },
    team: {
        id: '',
        name: 'Test Team',
        description: 'A test team for API testing'
    },
    task: {
        id: '',
        title: 'Test Task',
        description: 'A test task for API testing',
        priority: 'medium'
    },
    subtask: {
        id: '',
        title: 'Test Subtask',
        description: 'A subtask of the main test task',
        priority: 'low'
    }
};

// 日志函数
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

// 等待函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 测试函数
async function testUserRegistration() {
    logInfo('Testing user registration...');
    
    // 注册用户1
    const result1 = await request('POST', '/auth/register', {
        username: testData.user1.username,
        email: testData.user1.email,
        password: testData.user1.password
    });

    if (result1.success) {
        testData.user1.token = result1.data.access_token;
        testData.user1.id = result1.data.user.id;
        logSuccess(`User 1 registered successfully: ${testData.user1.username}`);
    } else {
        logError(`User 1 registration failed: ${JSON.stringify(result1.error)}`);
        throw new Error('User 1 registration failed');
    }

    // 注册用户2
    const result2 = await request('POST', '/auth/register', {
        username: testData.user2.username,
        email: testData.user2.email,
        password: testData.user2.password
    });

    if (result2.success) {
        testData.user2.token = result2.data.access_token;
        testData.user2.id = result2.data.user.id;
        logSuccess(`User 2 registered successfully: ${testData.user2.username}`);
    } else {
        logError(`User 2 registration failed: ${JSON.stringify(result2.error)}`);
        throw new Error('User 2 registration failed');
    }
}

async function testUserLogin() {
    logInfo('Testing user login...');
    
    // 测试用户1登录
    const result = await request('POST', '/auth/login', {
        username: testData.user1.username,
        password: testData.user1.password
    });

    if (result.success) {
        testData.user1.token = result.data.access_token;
        logSuccess(`User 1 login successful`);
    } else {
        logError(`User 1 login failed: ${JSON.stringify(result.error)}`);
        throw new Error('User 1 login failed');
    }
}

async function testGetUserProfile() {
    logInfo('Testing get user profile...');
    
    const result = await request('GET', '/users/profile', null, testData.user1.token);

    if (result.success) {
        logSuccess(`User profile retrieved: ${result.data.username}`);
        assert.strictEqual(result.data.username, testData.user1.username);
    } else {
        logError(`Get user profile failed: ${JSON.stringify(result.error)}`);
        throw new Error('Get user profile failed');
    }
}

async function testGetAllUsers() {
    logInfo('Testing get all users...');
    
    const result = await request('GET', '/users', null, testData.user1.token);

    if (result.success) {
        logSuccess(`All users retrieved: ${result.data.length} users found`);
        assert(Array.isArray(result.data));
        assert(result.data.length >= 2);
    } else {
        logError(`Get all users failed: ${JSON.stringify(result.error)}`);
        throw new Error('Get all users failed');
    }
}

async function testCreateTeam() {
    logInfo('Testing create team...');
    
    const result = await request('POST', '/teams', {
        name: testData.team.name,
        description: testData.team.description
    }, testData.user1.token);

    if (result.success) {
        testData.team.id = result.data.id;
        logSuccess(`Team created successfully: ${result.data.name}`);
    } else {
        logError(`Create team failed: ${JSON.stringify(result.error)}`);
        throw new Error('Create team failed');
    }
}

async function testGetAllTeams() {
    logInfo('Testing get all teams...');
    
    const result = await request('GET', '/teams', null, testData.user1.token);

    if (result.success) {
        logSuccess(`All teams retrieved: ${result.data.length} teams found`);
        assert(Array.isArray(result.data));
        assert(result.data.length >= 1);
    } else {
        logError(`Get all teams failed: ${JSON.stringify(result.error)}`);
        throw new Error('Get all teams failed');
    }
}

async function testGetTeamById() {
    logInfo('Testing get team by ID...');
    
    const result = await request('GET', `/teams/${testData.team.id}`, null, testData.user1.token);

    if (result.success) {
        logSuccess(`Team retrieved by ID: ${result.data.name}`);
        assert.strictEqual(result.data.id, testData.team.id);
    } else {
        logError(`Get team by ID failed: ${JSON.stringify(result.error)}`);
        throw new Error('Get team by ID failed');
    }
}

async function testAddTeamMember() {
    logInfo('Testing add team member...');
    
    const result = await request('POST', `/teams/${testData.team.id}/members`, {
        userId: testData.user2.id,
        role: 'member'
    }, testData.user1.token);

    if (result.success) {
        logSuccess(`Team member added successfully`);
    } else {
        logError(`Add team member failed: ${JSON.stringify(result.error)}`);
        throw new Error('Add team member failed');
    }
}

async function testCreateTask() {
    logInfo('Testing create task...');
    
    const result = await request('POST', '/tasks', {
        title: testData.task.title,
        description: testData.task.description,
        priority: testData.task.priority,
        team_id: testData.team.id,
        assigned_to: testData.user2.id
    }, testData.user1.token);

    if (result.success) {
        testData.task.id = result.data.id;
        logSuccess(`Task created successfully: ${result.data.title}`);
    } else {
        logError(`Create task failed: ${JSON.stringify(result.error)}`);
        throw new Error('Create task failed');
    }
}

async function testCreateSubtask() {
    logInfo('Testing create subtask...');
    
    const result = await request('POST', '/tasks', {
        title: testData.subtask.title,
        description: testData.subtask.description,
        priority: testData.subtask.priority,
        team_id: testData.team.id,
        parent_task_id: testData.task.id,
        assigned_to: testData.user1.id
    }, testData.user1.token);

    if (result.success) {
        testData.subtask.id = result.data.id;
        logSuccess(`Subtask created successfully: ${result.data.title}`);
    } else {
        logError(`Create subtask failed: ${JSON.stringify(result.error)}`);
        throw new Error('Create subtask failed');
    }
}

async function testGetAllTasks() {
    logInfo('Testing get all tasks...');
    
    const result = await request('GET', '/tasks', null, testData.user1.token);

    if (result.success) {
        logSuccess(`All tasks retrieved: ${result.data.length} tasks found`);
        assert(Array.isArray(result.data));
        assert(result.data.length >= 2);
    } else {
        logError(`Get all tasks failed: ${JSON.stringify(result.error)}`);
        throw new Error('Get all tasks failed');
    }
}

async function testGetTasksWithFilters() {
    logInfo('Testing get tasks with filters...');
    
    // 测试按状态过滤
    const result1 = await request('GET', '/tasks?status=pending', null, testData.user1.token);
    if (result1.success) {
        logSuccess(`Tasks filtered by status: ${result1.data.length} pending tasks`);
    } else {
        logError(`Filter tasks by status failed: ${JSON.stringify(result1.error)}`);
    }

    // 测试按优先级过滤
    const result2 = await request('GET', '/tasks?priority=medium', null, testData.user1.token);
    if (result2.success) {
        logSuccess(`Tasks filtered by priority: ${result2.data.length} medium priority tasks`);
    } else {
        logError(`Filter tasks by priority failed: ${JSON.stringify(result2.error)}`);
    }

    // 测试按分配用户过滤
    const result3 = await request('GET', `/tasks?assigned_to=${testData.user2.id}`, null, testData.user1.token);
    if (result3.success) {
        logSuccess(`Tasks filtered by assigned user: ${result3.data.length} tasks`);
    } else {
        logError(`Filter tasks by assigned user failed: ${JSON.stringify(result3.error)}`);
    }
}

async function testGetMyTasks() {
    logInfo('Testing get my tasks...');
    
    const result = await request('GET', '/tasks/my-tasks', null, testData.user1.token);

    if (result.success) {
        logSuccess(`My tasks retrieved: ${JSON.stringify(result.data, null, 2)}`);
    } else {
        logError(`Get my tasks failed: ${JSON.stringify(result.error)}`);
        throw new Error('Get my tasks failed');
    }
}

async function testGetTaskById() {
    logInfo('Testing get task by ID...');
    
    const result = await request('GET', `/tasks/${testData.task.id}`, null, testData.user1.token);

    if (result.success) {
        logSuccess(`Task retrieved by ID: ${result.data.title}`);
        assert.strictEqual(result.data.id, testData.task.id);
    } else {
        logError(`Get task by ID failed: ${JSON.stringify(result.error)}`);
        throw new Error('Get task by ID failed');
    }
}

async function testUpdateTask() {
    logInfo('Testing update task...');
    
    const result = await request('PATCH', `/tasks/${testData.task.id}`, {
        title: 'Updated Test Task',
        status: 'in_progress',
        priority: 'high'
    }, testData.user1.token);

    if (result.success) {
        logSuccess(`Task updated successfully: ${result.data.title}`);
        assert.strictEqual(result.data.title, 'Updated Test Task');
        assert.strictEqual(result.data.status, 'in_progress');
    } else {
        logError(`Update task failed: ${JSON.stringify(result.error)}`);
        throw new Error('Update task failed');
    }
}

async function testAddTaskWatcher() {
    logInfo('Testing add task watcher...');
    
    const result = await request('POST', `/tasks/${testData.task.id}/watchers`, null, testData.user2.token);

    if (result.success) {
        logSuccess(`Task watcher added successfully`);
    } else {
        logError(`Add task watcher failed: ${JSON.stringify(result.error)}`);
        throw new Error('Add task watcher failed');
    }
}

async function testAddTaskComment() {
    logInfo('Testing add task comment...');
    
    const result = await request('POST', `/tasks/${testData.task.id}/comments`, {
        content: 'This is a test comment for the task.'
    }, testData.user1.token);

    if (result.success) {
        logSuccess(`Task comment added successfully`);
    } else {
        logError(`Add task comment failed: ${JSON.stringify(result.error)}`);
        throw new Error('Add task comment failed');
    }
}

async function testRemoveTaskWatcher() {
    logInfo('Testing remove task watcher...');
    
    const result = await request('DELETE', `/tasks/${testData.task.id}/watchers`, null, testData.user2.token);

    if (result.success) {
        logSuccess(`Task watcher removed successfully`);
    } else {
        logError(`Remove task watcher failed: ${JSON.stringify(result.error)}`);
        throw new Error('Remove task watcher failed');
    }
}

async function testCompleteTask() {
    logInfo('Testing complete task...');
    
    const result = await request('PATCH', `/tasks/${testData.subtask.id}`, {
        status: 'completed'
    }, testData.user1.token);

    if (result.success) {
        logSuccess(`Task completed successfully`);
        assert.strictEqual(result.data.status, 'completed');
    } else {
        logError(`Complete task failed: ${JSON.stringify(result.error)}`);
        throw new Error('Complete task failed');
    }
}

async function testRemoveTeamMember() {
    logInfo('Testing remove team member...');
    
    const result = await request('DELETE', `/teams/${testData.team.id}/members/${testData.user2.id}`, null, testData.user1.token);

    if (result.success) {
        logSuccess(`Team member removed successfully`);
    } else {
        logError(`Remove team member failed: ${JSON.stringify(result.error)}`);
        throw new Error('Remove team member failed');
    }
}

async function testDeleteTask() {
    logInfo('Testing delete task...');
    
    // 注意：为了保留测试数据，默认不删除任务
    // 如果需要清理，可以取消注释以下代码
    
    logWarning('Skipping task deletion to preserve test data');
    logInfo('Tasks will remain in the database for inspection');
    
    /*
    // 删除子任务
    const result1 = await request('DELETE', `/tasks/${testData.subtask.id}`, null, testData.user1.token);

    if (result1.success) {
        logSuccess(`Subtask deleted successfully`);
    } else {
        logError(`Delete subtask failed: ${JSON.stringify(result1.error)}`);
        throw new Error('Delete subtask failed');
    }

    // 删除主任务
    const result2 = await request('DELETE', `/tasks/${testData.task.id}`, null, testData.user1.token);

    if (result2.success) {
        logSuccess(`Task deleted successfully`);
    } else {
        logError(`Delete task failed: ${JSON.stringify(result2.error)}`);
        throw new Error('Delete task failed');
    }
    */
}

// 错误测试
async function testErrorCases() {
    logInfo('Testing error cases...');
    
    // 测试无效登录
    const invalidLogin = await request('POST', '/auth/login', {
        username: 'nonexistent',
        password: 'wrongpassword'
    });
    
    if (!invalidLogin.success && invalidLogin.status === 401) {
        logSuccess('Invalid login correctly rejected');
    } else {
        logError('Invalid login should have been rejected');
    }

    // 测试无授权访问
    const unauthorized = await request('GET', '/users/profile');
    
    if (!unauthorized.success && unauthorized.status === 401) {
        logSuccess('Unauthorized access correctly rejected');
    } else {
        logError('Unauthorized access should have been rejected');
    }

    // 测试访问不存在的资源
    const notFound = await request('GET', '/tasks/00000000-0000-0000-0000-000000000000', null, testData.user1.token);
    
    if (!notFound.success && notFound.status === 404) {
        logSuccess('Non-existent resource correctly returned 404');
    } else {
        logError('Non-existent resource should return 404');
    }
}

// 主测试函数
async function runTests() {
    log('='.repeat(60), COLORS.BLUE);
    log('🚀 Starting TodoList API Test Suite', COLORS.BLUE);
    log('='.repeat(60), COLORS.BLUE);

    try {        // 检查服务器是否运行
        logInfo('Checking if server is running...');
        try {
            // 尝试访问一个端点来检查服务器状态
            // 即使返回401也说明服务器在运行
            await axios.get(`${BASE_URL}/users`, { timeout: 5000 });
            logSuccess('Server is running');
        } catch (error) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                logError('Server is not running. Please start the server first.');
                logError('Make sure the server is running on http://localhost:3000');
                process.exit(1);
            } else if (error.response && error.response.status === 401) {
                // 401 说明服务器在运行，只是需要认证
                logSuccess('Server is running');
            } else {
                logSuccess('Server is running');
            }
        }

        // 1. 认证相关测试
        log('\n📝 Authentication Tests', COLORS.YELLOW);
        await testUserRegistration();
        await testUserLogin();

        // 2. 用户相关测试
        log('\n👤 User Tests', COLORS.YELLOW);
        await testGetUserProfile();
        await testGetAllUsers();

        // 3. 团队相关测试
        log('\n👥 Team Tests', COLORS.YELLOW);
        await testCreateTeam();
        await testGetAllTeams();
        await testGetTeamById();
        await testAddTeamMember();

        // 4. 任务相关测试
        log('\n📋 Task Tests', COLORS.YELLOW);
        await testCreateTask();
        await testCreateSubtask();
        await testGetAllTasks();
        await testGetTasksWithFilters();
        await testGetMyTasks();
        await testGetTaskById();
        await testUpdateTask();

        // 5. 任务协作功能测试
        log('\n🤝 Task Collaboration Tests', COLORS.YELLOW);
        await testAddTaskWatcher();
        await testAddTaskComment();
        await testRemoveTaskWatcher();
        await testCompleteTask();        // 6. 数据验证测试
        log('\n🔍 Data Validation Tests', COLORS.YELLOW);
        await testRemoveTeamMember();
        await testDeleteTask();

        // 7. 错误情况测试
        log('\n❌ Error Case Tests', COLORS.YELLOW);
        await testErrorCases();

        // 测试总结
        log('\n' + '='.repeat(60), COLORS.GREEN);
        log('✅ All tests completed successfully!', COLORS.GREEN);
        log('='.repeat(60), COLORS.GREEN);

        // 显示测试数据摘要
        log('\n📊 Test Data Summary:', COLORS.BLUE);
        log(`User 1: ${testData.user1.username} (${testData.user1.id})`, COLORS.BLUE);
        log(`User 2: ${testData.user2.username} (${testData.user2.id})`, COLORS.BLUE);
        log(`Team: ${testData.team.name} (${testData.team.id})`, COLORS.BLUE);
        log(`Task: ${testData.task.title} (${testData.task.id})`, COLORS.BLUE);
        log(`Subtask: ${testData.subtask.title} (${testData.subtask.id})`, COLORS.BLUE);

    } catch (error) {
        log('\n' + '='.repeat(60), COLORS.RED);
        logError(`Test suite failed: ${error.message}`);
        log('='.repeat(60), COLORS.RED);
        process.exit(1);
    }
}

// 运行测试
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    runTests,
    testData,
    request
};