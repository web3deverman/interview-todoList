# TodoList API 测试脚本使用说明

## 概述

这个测试脚本 `test.js` 是为 TodoList 后端 API 设计的完整测试套件，测试所有主要的业务流程和 API 端点。

## 测试数据管理

### 🗂️ 测试文件结构

所有测试相关文件已整理到 `test/` 文件夹中：

```
test/
├── test.js                # 主测试套件
├── test-runner.js         # 测试运行器
├── quick-test.js          # 快速单端点测试工具
├── test-examples.ps1      # PowerShell 测试示例
├── cleanup.js             # 测试数据清理工具
└── TEST_README.md         # 本文档
```

### 🔄 测试数据策略

**保留测试数据**: 默认情况下，测试完成后不会删除创建的数据，这样便于：
- 验证测试结果
- 手动检查数据完整性
- 后续调试和分析

**清理选项**: 如需清理测试数据，可以：
1. 使用清理脚本：`npm run test:cleanup <admin-username> <admin-password>`
2. 手动修改 `test.js` 中的 `testDeleteTask()` 函数
3. 直接从数据库删除测试数据

## 功能特性

### 🔍 测试覆盖范围

1. **认证模块 (Authentication)**
   - 用户注册 (`POST /auth/register`)
   - 用户登录 (`POST /auth/login`)

2. **用户模块 (Users)**
   - 获取用户资料 (`GET /users/profile`)
   - 获取所有用户 (`GET /users`)

3. **团队模块 (Teams)**
   - 创建团队 (`POST /teams`)
   - 获取所有团队 (`GET /teams`)
   - 根据ID获取团队 (`GET /teams/:id`)
   - 添加团队成员 (`POST /teams/:id/members`)
   - 移除团队成员 (`DELETE /teams/:id/members/:userId`)

4. **任务模块 (Tasks)**
   - 创建任务 (`POST /tasks`)
   - 创建子任务 (`POST /tasks` with parent_task_id)
   - 获取所有任务 (`GET /tasks`)
   - 使用过滤器获取任务 (`GET /tasks?status=...&priority=...`)
   - 获取我的任务 (`GET /tasks/my-tasks`)
   - 根据ID获取任务 (`GET /tasks/:id`)
   - 更新任务 (`PATCH /tasks/:id`)
   - 删除任务 (`DELETE /tasks/:id`)

5. **任务协作功能**
   - 添加任务观察者 (`POST /tasks/:id/watchers`)
   - 移除任务观察者 (`DELETE /tasks/:id/watchers`)
   - 添加任务评论 (`POST /tasks/:id/comments`)

6. **错误处理测试**
   - 无效登录凭据
   - 未授权访问
   - 访问不存在的资源

### 🎯 测试业务流程

脚本模拟了完整的业务场景：

1. **用户注册和登录流程**
   - 注册两个测试用户
   - 验证登录功能

2. **团队协作流程**
   - 创建团队
   - 添加团队成员
   - 查看团队信息

3. **任务管理流程**
   - 创建主任务
   - 创建子任务
   - 分配任务给不同用户
   - 添加任务观察者
   - 添加任务评论
   - 更新任务状态和优先级
   - 完成任务

4. **清理流程**
   - 移除团队成员
   - 删除任务

## 使用方法

### 前置条件

1. 确保 Node.js 已安装
2. 确保服务器正在运行在 `http://localhost:3000`
3. 确保数据库已配置并可访问

### 安装依赖

```powershell
cd server
npm install axios
```

### 运行测试

```powershell
# 主要测试套件
npm run test:api                    # 运行完整测试套件
npm run test:api-runner             # 使用测试运行器
npm run test:api-verbose            # 详细模式

# 快速测试工具
npm run test:quick -- POST /auth/login '{"username":"user","password":"pass"}'

# 清理测试数据
npm run test:cleanup <admin-username> <admin-password>

# PowerShell 示例 (在 test 文件夹中)
cd test
.\test-examples.ps1
```

### 测试数据清理

```powershell
# 使用管理员账号清理测试数据
npm run test:cleanup admin@example.com password123

# 或者直接运行清理脚本
node test/cleanup.js admin@example.com password123

# 查看清理帮助
node test/cleanup.js --help
```

### 配置选项

可以在脚本顶部修改以下配置：

```javascript
const BASE_URL = 'http://localhost:3000';  // 服务器地址
```

## 测试输出

### 彩色日志

脚本使用彩色输出来增强可读性：
- 🟢 绿色：成功操作
- 🔴 红色：错误信息
- 🔵 蓝色：信息提示
- 🟡 黄色：警告信息

### 测试分组

测试按功能模块分组显示：
```
📝 Authentication Tests
👤 User Tests
👥 Team Tests
📋 Task Tests
🤝 Task Collaboration Tests
🧹 Cleanup Tests
❌ Error Case Tests
```

### 测试数据摘要

测试完成后会显示创建的测试数据摘要：
```
📊 Test Data Summary:
User 1: testuser1 (uuid)
User 2: testuser2 (uuid)
Team: Test Team (uuid)
Task: Test Task (uuid)
Subtask: Test Subtask (uuid)
```

## 测试数据

脚本使用以下测试数据：

```javascript
testData = {
    user1: {
        username: 'testuser1',
        email: 'testuser1@example.com',
        password: 'password123'
    },
    user2: {
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: 'password123'
    },
    team: {
        name: 'Test Team',
        description: 'A test team for API testing'
    },
    task: {
        title: 'Test Task',
        description: 'A test task for API testing',
        priority: 'medium'
    },
    subtask: {
        title: 'Test Subtask',
        description: 'A subtask of the main test task',
        priority: 'low'
    }
}
```

## 错误处理

- 如果服务器未运行，测试会立即退出并显示错误信息
- 每个测试失败都会显示详细的错误信息
- 使用 `assert` 进行数据验证
- 测试失败会停止整个测试套件

## 扩展使用

### 作为模块使用

```javascript
const { runTests, testData, request } = require('./test.js');

// 运行完整测试套件
await runTests();

// 使用请求函数进行自定义测试
const result = await request('GET', '/custom-endpoint', null, token);
```

### 添加自定义测试

可以在脚本中添加新的测试函数：

```javascript
async function testCustomFunction() {
    logInfo('Testing custom function...');
    
    const result = await request('POST', '/custom-endpoint', {
        data: 'test'
    }, testData.user1.token);

    if (result.success) {
        logSuccess('Custom test passed');
    } else {
        logError(`Custom test failed: ${JSON.stringify(result.error)}`);
        throw new Error('Custom test failed');
    }
}
```

## 注意事项

1. **数据库清理**: 测试会在数据库中创建数据，运行前请确保使用测试数据库
2. **并发执行**: 不建议同时运行多个测试实例
3. **端口配置**: 确保服务器运行在正确的端口
4. **权限验证**: 测试包含权限验证，确保 JWT 配置正确

## 故障排除

### 常见错误

1. **连接被拒绝**: 检查服务器是否运行
2. **401 未授权**: 检查 JWT 配置和令牌处理
3. **404 未找到**: 检查路由配置
4. **500 服务器错误**: 检查数据库连接和配置

### 调试技巧

1. 检查服务器日志
2. 验证数据库状态
3. 确认API端点路径
4. 检查请求数据格式

## 贡献

欢迎提交 Issue 和 Pull Request 来改进测试脚本！
