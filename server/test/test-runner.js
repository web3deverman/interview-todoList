#!/usr/bin/env node

/**
 * 简化的测试运行器
 * 用于快速运行 API 测试
 */

const { runTests } = require('./test.js');

console.log('🚀 Starting TodoList API Tests...\n');

// 检查参数
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const help = args.includes('--help') || args.includes('-h');

if (help) {
    console.log(`
TodoList API Test Runner

Usage: node test-runner.js [options]

Options:
  -h, --help     显示帮助信息
  -v, --verbose  详细输出模式
  
Examples:
  node test-runner.js           # 运行所有测试
  node test-runner.js --verbose # 详细模式运行测试
  
Test Coverage:
  ✓ Authentication (register, login)
  ✓ User management (profile, list users)
  ✓ Team management (create, list, add/remove members)
  ✓ Task management (CRUD operations)
  ✓ Task collaboration (watchers, comments)
  ✓ Error handling (invalid requests, unauthorized access)

Make sure the server is running on http://localhost:3000 before running tests.
`);
    process.exit(0);
}

// 运行测试
runTests()
    .then(() => {
        console.log('\n🎉 测试套件执行完成！');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ 测试失败:', error.message);
        if (verbose) {
            console.error('详细错误信息:', error);
        }
        process.exit(1);
    });
