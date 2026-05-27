# 邮件定时任务对接文档

## 概述

本文档记录了英语学习平台（english-monorepo）中邮件定时任务功能的完整实现。系统每天凌晨 0 点自动为符合条件的用户生成单词记忆报告，通过邮件推送给用户。

## Commit 时间线

| Commit    | 说明                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| `7dfc1d8` | feat: 对接邮件推动 init                                                           |
| `9becbe2` | feat: 参考邮件文档初始化邮件功能                                                  |
| `e473758` | feat(digest): 新增单词记忆报告自动生成服务（LangChain Agent + DeepSeek + Prisma） |
| `575d98a` | feat(digest): 集成 BullMQ 作为消息队列，新增邮件任务处理模板                      |
| `b708db9` | feat: 目前保证了每天夜晚 0 点执行定时任务                                         |
| `8dd7893` | feat: 完善定时任务                                                                |

## 架构

```
┌─────────────────────────────────────────────────────────┐
│                    AiModule (端口 3001)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │                  DigestModule                       │  │
│  │                                                    │  │
│  │  ┌──────────────┐    ┌─────────────────────────┐  │  │
│  │  │ DigestService │    │    DigestProcessor       │  │  │
│  │  │  (生产者)      │    │     (消费者)             │  │  │
│  │  │              │    │                         │  │  │
│  │  │ onModuleInit │    │ @Processor(DIGEST_QUEUE) │  │  │
│  │  │   ↓          │    │   ↓                     │  │  │
│  │  │ digestQueue  │    │ process(job)            │  │  │
│  │  │   .add()  ──────→ │   ├─ EMAIL_DIGEST_TASK  │  │  │
│  │  │              │    │   │   └→ EmailService    │  │  │
│  │  │ handleEmail  │    │   │      .sendEmail()    │  │  │
│  │  │   Digest()   │    │   │                     │  │  │
│  │  │   ↓          │    │   └─ EVERY_DAY_DIGEST   │  │  │
│  │  │ digestQueue  │    │       └→ DigestService   │  │  │
│  │  │   .add()  ──────→ │          .handleEmail    │  │  │
│  │  └──────────────┘    │            Digest()      │  │  │
│  │                       └─────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                          ↓                              │
│                    ┌──────────┐                         │
│                    │  BullMQ   │                         │
│                    │ (Redis)  │                         │
│                    └──────────┘                         │
└─────────────────────────────────────────────────────────┘
```

## 涉及文件

| 文件                                            | 作用                                            |
| ----------------------------------------------- | ----------------------------------------------- |
| `server/apps/ai/src/digest/digest.queue.ts`     | 队列名称和任务名称常量定义                      |
| `server/apps/ai/src/digest/digest.service.ts`   | 生产者：添加定时任务 + 生成 AI 报告             |
| `server/apps/ai/src/digest/digest.processor.ts` | 消费者：处理队列中的任务（发邮件/触发每日任务） |
| `server/apps/ai/src/digest/digest.module.ts`    | Digest 模块注册，导入 BullMQ 队列               |
| `server/apps/ai/src/ai.module.ts`               | AiModule 根模块，导入 DigestModule              |
| `server/libs/shared/src/shared.module.ts`       | BullMQ 根配置（Redis 连接）                     |
| `server/libs/shared/src/email/email.service.ts` | 邮件发送服务（Nodemailer）                      |
| `server/libs/shared/src/email/email.module.ts`  | 邮件模块                                        |
| `server/.env`                                   | Redis 连接配置                                  |

## 核心模块详解

### 1. 消息队列定义 (`digest.queue.ts`)

```typescript
export const digestQueueName = {
  name: "DIGEST_QUEUE",
  task: {
    emailDigest: "EMAIL_DIGEST_TASK", // 发送邮件任务
    everyDayDigest: "EVERY_DAY_DIGEST_TASK", // 每日定时触发任务
  },
};
```

### 2. DigestService — 生产者

#### onModuleInit（服务启动时注册定时任务）

```typescript
async onModuleInit() {
    this.digestQueue.add(digestQueueName.task.everyDayDigest, {}, {
        repeat: {
            pattern: '0 0 * * *', // 每天凌晨 0 点执行（cron 表达式）
        }
    })
}
```

#### handleEmailDigest（核心业务逻辑）

1. **筛选高质量用户**：同时满足以下条件
   - `isTimingTask = true`（开启了定时任务开关）
   - `timingTaskTime` 不为空（设置了推送时间）
   - `email` 不为 null（有邮箱地址）
   - 今日有单词学习记录
2. **为每个用户创建 LangChain Agent**：绑定 DeepSeek 大模型 + 自定义工具 `queryTool`
3. **queryTool 工具**：根据 userId 查询用户的邮箱、姓名、单词数量、今日学习单词列表
4. **Agent 生成 Markdown 报告**，通过 `marked` 转为 HTML
5. **按用户设定的时间延迟发送**：计算 `timingTaskTime` 与当前时间的差值作为 delay

### 3. DigestProcessor — 消费者

```typescript
@Processor(digestQueueName.name)
export class DigestProcessor extends WorkerHost {
  async process(job: Job) {
    if (job.name === digestQueueName.task.emailDigest) {
      // 发送邮件
      const { text, email } = job.data;
      await this.emailService.sendEmail(email, "每日单词记忆报告", text);
    }
    if (job.name === digestQueueName.task.everyDayDigest) {
      // 触发每日报告生成
      this.digestService.handleEmailDigest();
    }
  }
}
```

**任务流转：** `EVERY_DAY_DIGEST_TASK` 每天 0 点触发 → `handleEmailDigest()` 为每个用户生成报告 → 对每个用户添加 `EMAIL_DIGEST_TASK` 延迟任务 → `DigestProcessor` 消费并发送邮件。

### 4. EmailService — 邮件发送

基于 Nodemailer，通过 QQ 邮箱 SMTP 发送 HTML 格式邮件。

```typescript
// 环境变量配置
EMAIL_HOST; // SMTP 服务器地址
EMAIL_PORT; // SMTP 端口（SSL: 465, 非SSL: 587）
EMAIL_USE_SSL; // 是否使用 SSL
EMAIL_USER; // 发件人邮箱账号
EMAIL_PASSWORD; // 邮箱授权码
EMAIL_FROM; // 发件人显示地址
```

### 5. BullMQ 配置 (`shared.module.ts`)

```typescript
BullModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    connection: {
      host: configService.get("REDIS_HOST"),
      port: Number(configService.get("REDIS_PORT")),
      maxRetriesPerRequest: null, // BullMQ 强制要求
    },
  }),
});
```

## 环境变量

```env
# Redis（BullMQ 依赖）
REDIS_HOST="localhost"
REDIS_PORT=6379

# 邮件服务（QQ邮箱示例）
EMAIL_HOST="smtp.qq.com"
EMAIL_PORT=465
EMAIL_USE_SSL=1
EMAIL_USER="your-email@qq.com"
EMAIL_PASSWORD="your-auth-code"
EMAIL_FROM="your-email@qq.com"
```

## 数据流

```
每天 00:00
    │
    ▼
EVERY_DAY_DIGEST_TASK 入队（cron: 0 0 * * *）
    │
    ▼
DigestProcessor.process()
    │ job.name === 'EVERY_DAY_DIGEST_TASK'
    ▼
DigestService.handleEmailDigest()
    │
    ├─ 1. 查询符合条件的用户（Prisma）
    │
    ├─ 2. 对每个用户：
    │     ├─ 创建 LangChain Agent（DeepSeek + queryTool）
    │     ├─ Agent 查询用户今日单词记录
    │     ├─ 生成 Markdown 记忆报告
    │     ├─ marked 转换为 HTML
    │     └─ 计算延迟时间（用户设定的推送时间）
    │
    └─ 3. EMAIL_DIGEST_TASK 入队（带 delay）
            │
            ▼
        DigestProcessor.process()
            │ job.name === 'EMAIL_DIGEST_TASK'
            ▼
        EmailService.sendEmail(to, subject, html)
            │
            ▼
        用户收到邮件 ✅
```

## 关键依赖

| 包                              | 用途                   |
| ------------------------------- | ---------------------- |
| `@nestjs/bullmq`                | NestJS BullMQ 集成     |
| `bullmq`                        | 消息队列（基于 Redis） |
| `ioredis`                       | Redis 客户端           |
| `nodemailer`                    | 邮件发送               |
| `langchain` / `@langchain/core` | AI Agent 框架          |
| `@langchain/deepseek`           | DeepSeek LLM 适配      |
| `marked`                        | Markdown → HTML 转换   |
| `dayjs`                         | 时间处理               |

## 注意事项

1. **Redis 必须先启动**，BullMQ 依赖 Redis 存储队列数据
2. **BullMQ 连接必须设置 `maxRetriesPerRequest: null`**，否则 ioredis 内置重试与 BullMQ 冲突
3. `onModuleInit` 中注册重复任务时，BullMQ 会自动去重（相同名称的重复任务不会重复创建）
4. QQ 邮箱需在设置中开启 SMTP 服务并获取授权码
5. 定时任务 cron 表达式 `0 0 * * *` = 每天 UTC 0 点，即北京时间 8:00
