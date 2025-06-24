# TodoList 项目设计文档

## 项目概述

本项目是一个基于 NestJS 的企业级 TodoList 系统，参考 Lark 任务功能设计，实现了完整的任务管理、团队协作和权限控制功能。

## 技术架构

### 后端技术栈
- **框架**: NestJS (基于 TypeScript)
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **ORM**: TypeORM
- **认证**: JWT + Passport
- **文档**: Swagger/OpenAPI
- **容器化**: Docker + Docker Compose

### 架构设计原则
- **模块化设计**: 按业务领域划分模块 (Auth, Users, Teams, Tasks)
- **分层架构**: Controller -> Service -> Repository -> Entity
- **依赖注入**: 使用 NestJS 的 IoC 容器
- **数据验证**: 使用 class-validator 进行 DTO 验证
- **错误处理**: 统一异常过滤器和自定义异常
- **API 文档**: Swagger 自动生成 API 文档

## 核心功能模块

### 1. 认证模块 (Auth Module)
**功能**: 用户注册、登录、JWT 令牌管理

**技术实现**:
- 使用 bcrypt 进行密码哈希
- JWT 策略进行身份验证
- Local 策略进行登录验证
- Guards 保护需要认证的路由

**关键文件**:
```
src/auth/
├── auth.controller.ts     # 认证控制器
├── auth.service.ts        # 认证业务逻辑
├── auth.module.ts         # 认证模块
├── dto/                   # 数据传输对象
├── guards/                # 认证守卫
└── strategies/            # Passport 策略
```

### 2. 用户模块 (Users Module)
**功能**: 用户信息管理、用户查询

**数据模型**:
```typescript
User {
  id: string (UUID)
  username: string (唯一)
  email: string (唯一)
  password: string (哈希)
  created_at: Date
  updated_at: Date
}
```

### 3. 团队模块 (Teams Module)
**功能**: 多人协作团队管理

**核心特性**:
- 团队创建和管理
- 成员添加/移除
- 角色权限控制 (Owner/Admin/Member)
- 团队权限验证

**数据模型**:
```typescript
Team {
  id: string (UUID)
  name: string
  description: string
  created_by: string
  created_at: Date
}

TeamMember {
  id: string (UUID)
  team_id: string
  user_id: string
  role: enum (owner/admin/member)
  joined_at: Date
}
```

### 4. 任务模块 (Tasks Module)
**功能**: 核心任务管理功能

**核心特性**:
- 任务 CRUD 操作
- 层级子任务支持
- 任务指派和关注者
- 任务状态和优先级管理
- 任务历史记录
- 评论系统
- 高级筛选和排序

**数据模型**:
```typescript
Task {
  id: string (UUID)
  title: string
  description: text
  status: enum (pending/in_progress/completed/cancelled)
  priority: enum (low/medium/high/urgent)
  parent_task_id: string (可选)
  team_id: string
  created_by: string
  assigned_to: string (可选)
  due_date: DateTime (可选)
  completed_at: DateTime (可选)
  created_at: Date
  updated_at: Date
}

TaskWatcher {
  id: string (UUID)
  task_id: string
  user_id: string
  created_at: Date
}

TaskHistory {
  id: string (UUID)
  task_id: string
  user_id: string
  action_type: enum (created/updated/completed/commented/etc.)
  old_value: string
  new_value: string
  comment: text
  created_at: Date
}

TaskComment {
  id: string (UUID)
  task_id: string
  user_id: string
  content: text
  created_at: Date
}
```

## 业务逻辑设计

### 权限控制系统
1. **团队级权限**: 用户只能访问所属团队的任务
2. **角色权限**: Owner > Admin > Member
3. **任务权限**: 创建者和被指派者有修改权限
4. **观察者权限**: 可查看但不能修改

### 自动化逻辑
1. **子任务自动完成**: 所有子任务完成时自动完成父任务
2. **历史记录**: 所有操作自动记录到历史
3. **观察者自动添加**: 任务创建者自动成为观察者

### 数据筛选和排序
**支持的筛选条件**:
- 状态 (status)
- 优先级 (priority)
- 指派人 (assigned_to)
- 创建人 (created_by)
- 团队 (team_id)
- 时间范围 (start_date, end_date)

**支持的排序字段**:
- 创建时间 (created_at)
- 截止时间 (due_date)
- 优先级 (priority)
- 标题 (title)
- 创建者 (created_by)

## 部署架构

### Docker 容器化
**多阶段构建策略**:
1. **Builder 阶段**: 安装依赖和构建应用
2. **Production 阶段**: 仅复制生产文件，减小镜像体积

**安全配置**:
- 非 root 用户运行
- 健康检查机制
- 最小权限原则

### 数据库部署
**Docker Compose 配置**:
- MySQL 8.0 主数据库
- Redis 缓存服务
- 数据卷持久化
- 网络隔离

## API 设计

### RESTful API 设计原则
- 资源导向的 URL 设计
- HTTP 动词语义化使用
- 统一的响应格式
- 分页和筛选支持

### API 端点概览
```
Authentication:
POST   /auth/register      # 用户注册
POST   /auth/login         # 用户登录

Users:
GET    /users/profile      # 获取当前用户信息
GET    /users              # 获取所有用户

Teams:
POST   /teams              # 创建团队
GET    /teams              # 获取用户团队列表
GET    /teams/:id          # 获取团队详情
POST   /teams/:id/members  # 添加团队成员
DELETE /teams/:id/members/:userId # 移除团队成员

Tasks:
POST   /tasks              # 创建任务
GET    /tasks              # 获取任务列表（支持筛选）
GET    /tasks/my-tasks     # 获取我的任务
GET    /tasks/:id          # 获取任务详情
PATCH  /tasks/:id          # 更新任务
DELETE /tasks/:id          # 删除任务
POST   /tasks/:id/watchers # 添加观察者
DELETE /tasks/:id/watchers # 移除观察者
POST   /tasks/:id/comments # 添加评论
```

### 文档化
- Swagger/OpenAPI 3.0 规范
- 完整的请求/响应示例
- 错误码说明
- 认证说明

## 测试策略

### 测试工具和框架
- **API 测试**: 自定义测试脚本 (axios)
- **测试覆盖**: 完整的业务流程测试
- **数据管理**: 测试数据保留策略
- **清理工具**: 自动化测试数据清理

### 测试覆盖范围
1. **认证流程测试**
2. **团队管理测试**
3. **任务 CRUD 测试**
4. **权限验证测试**
5. **业务逻辑测试**
6. **错误处理测试**

## 性能优化

### 数据库优化
- 合理的索引设计
- 关联查询优化
- 分页查询支持

### 缓存策略
- Redis 缓存配置
- 查询结果缓存
- 会话状态缓存

### API 优化
- 数据传输优化
- 批量操作支持
- 懒加载策略

## 安全考虑

### 认证安全
- JWT 令牌机制
- 密码强度要求
- 令牌过期管理

### 数据安全
- 输入验证和清理
- SQL 注入防护
- XSS 防护

### 权限安全
- 最小权限原则
- 资源访问控制
- 操作权限验证

---

## 未实现功能的设计规划

### 1. 消息提醒任务即将到期

#### 设计思路
实现一个基于定时任务的提醒系统，在任务即将到期时向相关用户发送通知。

#### 技术实现方案

**1. 数据模型扩展**
```typescript
// 新增通知设置表
NotificationSetting {
  id: string (UUID)
  user_id: string
  task_reminder_enabled: boolean
  reminder_advance_hours: number[] // [24, 2, 0.5] 提前24小时、2小时、30分钟提醒
  notification_channels: enum[] // ['email', 'websocket', 'push']
  created_at: Date
  updated_at: Date
}

// 新增通知记录表
Notification {
  id: string (UUID)
  user_id: string
  task_id: string
  type: enum ('task_reminder', 'task_assigned', 'task_completed')
  title: string
  content: text
  channels: enum[] // 发送渠道
  is_read: boolean
  sent_at: Date
  read_at: Date
  created_at: Date
}
```

**2. 定时任务实现**
```typescript
// 使用 @nestjs/schedule 实现定时任务
@Injectable()
export class NotificationScheduler {
  @Cron('0 */30 * * * *') // 每30分钟执行一次
  async checkTaskReminders() {
    // 查询即将到期的任务
    const upcomingTasks = await this.findUpcomingTasks();
    
    for (const task of upcomingTasks) {
      await this.sendTaskReminder(task);
    }
  }

  private async findUpcomingTasks() {
    // 查询在指定时间内到期且未完成的任务
    // 考虑用户的提醒设置
  }

  private async sendTaskReminder(task: Task) {
    // 获取需要提醒的用户（创建者、指派者、观察者）
    // 根据用户偏好发送不同渠道的通知
  }
}
```

**3. 通知渠道实现**
```typescript
// 邮件通知服务
@Injectable()
export class EmailNotificationService {
  async sendTaskReminder(user: User, task: Task, hoursUntilDue: number) {
    // 发送邮件提醒
  }
}

// WebSocket 实时通知
@Injectable()
export class WebSocketNotificationService {
  async sendRealTimeNotification(userId: string, notification: Notification) {
    // 通过 WebSocket 发送实时通知
  }
}

// 推送通知服务
@Injectable()
export class PushNotificationService {
  async sendPushNotification(user: User, notification: Notification) {
    // 发送推送通知到移动设备
  }
}
```

**4. API 接口设计**
```typescript
// 通知管理接口
@Controller('notifications')
export class NotificationsController {
  @Get()
  async getNotifications(@Request() req, @Query() query: NotificationQueryDto) {
    // 获取用户通知列表，支持分页和筛选
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    // 标记通知为已读
  }

  @Get('settings')
  async getNotificationSettings(@Request() req) {
    // 获取用户通知设置
  }

  @Patch('settings')
  async updateNotificationSettings(@Request() req, @Body() settings: UpdateNotificationSettingsDto) {
    // 更新用户通知设置
  }
}
```

**5. 实现步骤**
1. 安装依赖：`@nestjs/schedule`, `nodemailer`, `socket.io`
2. 创建通知相关的实体和 DTO
3. 实现通知服务和调度器
4. 创建通知管理 API
5. 配置邮件服务和 WebSocket
6. 添加通知设置页面
7. 测试各种提醒场景

### 2. 定时重复任务

#### 设计思路
实现一个灵活的重复任务系统，支持多种重复模式（每日、每周、每月、自定义），自动创建新的任务实例。

#### 技术实现方案

**1. 数据模型扩展**
```typescript
// 重复任务模板表
RecurringTaskTemplate {
  id: string (UUID)
  title: string
  description: text
  priority: enum
  team_id: string
  created_by: string
  assigned_to: string
  
  // 重复规则
  recurrence_type: enum ('daily', 'weekly', 'monthly', 'yearly', 'custom')
  recurrence_interval: number // 间隔数，如每2天、每3周
  recurrence_days: number[] // 星期几重复 [1,2,3,4,5] 表示工作日
  recurrence_months: number[] // 哪几个月重复
  recurrence_day_of_month: number // 每月的第几天
  
  // 时间控制
  start_date: Date // 开始日期
  end_date: Date // 结束日期（可选）
  max_occurrences: number // 最大重复次数（可选）
  
  // 任务设置
  due_date_offset_hours: number // 截止时间偏移（从创建时间算起）
  auto_assign: boolean // 是否自动指派
  
  // 状态
  is_active: boolean
  last_generated_at: Date
  next_generate_at: Date
  total_generated: number
  
  created_at: Date
  updated_at: Date
}

// 重复任务实例关联表
RecurringTaskInstance {
  id: string (UUID)
  template_id: string
  task_id: string
  instance_date: Date // 该实例对应的日期
  created_at: Date
}
```

**2. 重复规则引擎**
```typescript
@Injectable()
export class RecurrenceEngine {
  calculateNextOccurrence(template: RecurringTaskTemplate, currentDate: Date): Date {
    switch (template.recurrence_type) {
      case 'daily':
        return this.calculateDailyNext(template, currentDate);
      case 'weekly':
        return this.calculateWeeklyNext(template, currentDate);
      case 'monthly':
        return this.calculateMonthlyNext(template, currentDate);
      case 'yearly':
        return this.calculateYearlyNext(template, currentDate);
      case 'custom':
        return this.calculateCustomNext(template, currentDate);
    }
  }

  private calculateDailyNext(template: RecurringTaskTemplate, current: Date): Date {
    // 计算下一个每日重复日期
    // 考虑间隔天数和工作日限制
  }

  private calculateWeeklyNext(template: RecurringTaskTemplate, current: Date): Date {
    // 计算下一个每周重复日期
    // 考虑指定的星期几
  }

  // ... 其他重复类型的计算方法
}
```

**3. 定时任务生成器**
```typescript
@Injectable()
export class RecurringTaskScheduler {
  @Cron('0 0 * * * *') // 每小时执行一次
  async generateRecurringTasks() {
    const now = new Date();
    
    // 查询需要生成任务的模板
    const templates = await this.findDueTemplates(now);
    
    for (const template of templates) {
      await this.generateTaskFromTemplate(template, now);
    }
  }

  private async generateTaskFromTemplate(template: RecurringTaskTemplate, now: Date) {
    // 检查是否已经生成过
    const existingInstance = await this.checkExistingInstance(template, now);
    if (existingInstance) return;

    // 创建新任务
    const newTask = await this.createTaskFromTemplate(template, now);
    
    // 记录实例关联
    await this.recordTaskInstance(template, newTask, now);
    
    // 更新模板的下次生成时间
    await this.updateTemplateNextGeneration(template);
  }

  private async createTaskFromTemplate(template: RecurringTaskTemplate, instanceDate: Date): Promise<Task> {
    const dueDate = new Date(instanceDate);
    dueDate.setHours(dueDate.getHours() + template.due_date_offset_hours);

    return this.tasksService.create({
      title: `${template.title} (${this.formatDate(instanceDate)})`,
      description: template.description,
      priority: template.priority,
      team_id: template.team_id,
      assigned_to: template.auto_assign ? template.assigned_to : null,
      due_date: dueDate,
      recurring_template_id: template.id // 添加关联字段
    }, template.created_by);
  }
}
```

**4. API 接口设计**
```typescript
@Controller('recurring-tasks')
export class RecurringTasksController {
  @Post()
  async createTemplate(@Body() createDto: CreateRecurringTaskDto, @Request() req) {
    // 创建重复任务模板
  }

  @Get()
  async getTemplates(@Request() req, @Query() query: RecurringTaskQueryDto) {
    // 获取用户的重复任务模板列表
  }

  @Get(':id')
  async getTemplate(@Param('id') id: string) {
    // 获取模板详情，包括已生成的任务实例
  }

  @Patch(':id')
  async updateTemplate(@Param('id') id: string, @Body() updateDto: UpdateRecurringTaskDto) {
    // 更新模板（注意：只影响未来生成的任务）
  }

  @Delete(':id')
  async deleteTemplate(@Param('id') id: string) {
    // 删除模板（不影响已生成的任务）
  }

  @Post(':id/pause')
  async pauseTemplate(@Param('id') id: string) {
    // 暂停模板生成
  }

  @Post(':id/resume')
  async resumeTemplate(@Param('id') id: string) {
    // 恢复模板生成
  }

  @Get(':id/instances')
  async getInstances(@Param('id') id: string, @Query() query: any) {
    // 获取模板生成的任务实例列表
  }

  @Post(':id/generate-now')
  async generateNow(@Param('id') id: string) {
    // 立即生成一个任务实例（用于测试）
  }
}
```

**5. 重复规则 DTO 设计**
```typescript
class CreateRecurringTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsUUID()
  team_id: string;

  @IsOptional()
  @IsUUID()
  assigned_to?: string;

  @IsEnum(['daily', 'weekly', 'monthly', 'yearly', 'custom'])
  recurrence_type: string;

  @IsNumber()
  @Min(1)
  recurrence_interval: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  recurrence_days?: number[]; // 1-7 表示周一到周日

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  recurrence_months?: number[]; // 1-12 表示月份

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  recurrence_day_of_month?: number;

  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  max_occurrences?: number;

  @IsNumber()
  @Min(0)
  due_date_offset_hours: number;

  @IsBoolean()
  auto_assign: boolean;
}
```

**6. 实现步骤**
1. 创建重复任务相关的实体和 DTO
2. 实现重复规则引擎
3. 创建定时任务调度器
4. 实现重复任务管理 API
5. 添加任务模板管理界面
6. 实现规则配置器（支持复杂重复规则）
7. 添加生成历史和统计功能
8. 测试各种重复场景

**7. 高级特性规划**
- **智能重复**: 基于任务完成情况调整重复间隔
- **节假日处理**: 跳过或推迟节假日的任务
- **时区支持**: 支持不同时区的重复任务
- **批量操作**: 批量暂停/恢复多个模板
- **依赖关系**: 重复任务之间的依赖关系
- **通知集成**: 重复任务生成时发送通知

---

## 总结

本项目已实现了 TodoList 系统的核心功能，包括用户认证、团队协作、任务管理、权限控制等。对于未实现的消息提醒和定时重复任务功能，上述设计方案提供了完整的技术实现路径，包括数据模型、业务逻辑、API 设计和实现步骤。这些功能的加入将使系统更加完善，能够满足企业级任务管理的需求。
