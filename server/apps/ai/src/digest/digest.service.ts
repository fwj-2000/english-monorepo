import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
import dayjs from 'dayjs'
import { createAgent } from 'langchain'
import { createDeepSeek } from '../llm/llm.config'
import { tool } from '@langchain/core/tools' //引入langchain的工具
import marked from 'marked'
import { Queue } from 'bullmq';
import { digestQueueName } from './digest.queue';
import { InjectQueue } from '@nestjs/bullmq';// 生产者

@Injectable()
export class DigestService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(digestQueueName.name) private readonly digestQueue: Queue,// https://docs.nestjs.cn/techniques/queues/#%E7%94%9F%E4%BA%A7%E8%80%85
  ) { }
  //普通的大模型他只能输出文字，他没有办法进行比如查看代码 查看图片 或者是连接数据库
  //也就是说大模型会根据我们的tool里面的描述会自动选择要不要调用这个工具
  private queryTool() {
    return tool(async ({ userId }: { userId: string }) => {
      const user = await this.prismaService.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          email: true, //邮箱
          name: true, //用户名
          wordNumber: true, //单词数量
          //查询今天的单词记录
          wordBookRecords: {
            where: {
              createdAt: {
                //今天00:00:00 - 明天00:00:00
                gte: dayjs().startOf('day').toDate(),
                lte: dayjs().add(1, 'day').startOf('day').toDate()
              }
            },
            select: {
              //找到那个表
              word: {
                select: {
                  //找到那个单词
                  word: true,
                }
              }
            }
          }
        }
      })
      console.log("🚀 ~ DigestService ~ queryTool ~ user:", user?.wordBookRecords)

      return user
    }, {
      name: 'queryTool', //名字一定要语义化 唯一不能重复
      description: '根据用户id查询用户学习的单词记录', //他会通过desc 和 name 选择要不要调用这个工具
      //JSON Schema 是用来描述数据结构的，他可以用来验证数据是否符合要求
      //给大模型看的 {userId: '1234567890'}
      schema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: '用户id'
          }
        },
        required: ['userId']
      }
    })
  }

  async onModuleInit() {
    this.digestQueue.add(digestQueueName.task.everyDayDigest, {}, {
      repeat: {
        pattern: '0 0 * * *', //每天0点执行 cron
      }
    })
  }

  async handleEmailDigest() {
    console.log("🚀 ~定时任务执行了 DigestService ~ handleEmailDigest ~ handleEmailDigest:")

    // 从user表找出高质量用户 取id即可
    // （
    // 打开定时任务开关的用户 
    // + 定时任务有时间 
    // + 邮箱不为空 
    // + 今天学过单词 
    //  ）
    const userIds = await this.prismaService.user.findMany({
      where: {
        isTimingTask: true,
        timingTaskTime: { not: '' },
        email: { not: null },
        wordBookRecords: {
          some: {
            createdAt: {
              gte: dayjs().startOf('day').toDate(),// 今天开始的时间
              lte: dayjs().add(1, 'day').startOf('day').toDate(),// 明天开始的时间
            }
          }
        }
      },
      select: {
        id: true,
        timingTaskTime: true,
        email: true
      }
    });
    console.log("🚀 ~ DigestService ~ onModuleInit ~ userIds:", userIds)
    for (const user of userIds) {
      const agent = createAgent({
        model: createDeepSeek(),
        tools: [this.queryTool()],
        systemPrompt: '你是一个单词记忆助手，根据用户信息和单词记录，生成单词记忆报告',
      })
      const result = await agent.invoke({
        messages: [{ role: 'user', content: `查询用户信息,并且根据用户id关联单词记录表，查询出用户今天的单词记录,用户id: ${user.id}，过滤掉敏感信息` }]
      })
      const content = result.messages.at(-1)?.content
      if (content) {
        const html = await marked.parse(content as string)
        // console.log("🚀 ~ DigestService ~ onModuleInit ~ html:", html)
        const [hour, minute, second] = user.timingTaskTime.split(':').map(Number)// '00:00:00' ==> [0, 0, 0]

        const target = dayjs().startOf('day').add(hour, 'hour').add(minute, 'minute').add(second, 'second')
        let delay = target.diff(dayjs())
        console.log("🚀 ~ DigestService ~ handleEmailDigest ~ delay:", delay)
        if (delay < 0) {
          delay = 0
        }
        this.digestQueue.add(digestQueueName.task.emailDigest, {
          userId: user.id,
          text: html,
          email: user.email
        }, {
          delay,//延迟多久执行 单位毫秒
        })
      }
    }
  }
}
