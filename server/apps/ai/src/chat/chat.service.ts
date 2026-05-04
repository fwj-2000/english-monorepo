import { Injectable, OnModuleInit } from '@nestjs/common';
import { ResponseService } from '@libs/shared'
import { createDeepSeek, createCheckpoint } from '../llm/llm.config';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres'
import type { ChatRoleType, ChatDto } from '@en/common/chat'
import { type ReactAgent, createAgent, AIMessageChunk } from 'langchain'
import { chatMode } from '../prompt/prompt.mode';


@Injectable()
export class ChatService implements OnModuleInit {
  constructor(private readonly responseService: ResponseService) { }
  private checkpointer: PostgresSaver
  private agents: Map<ChatRoleType, ReactAgent> = new Map()

  /**
   * 模块初始化生命周期钩子。
   * 负责初始化检查点存储并创建不同角色的智能体实例。
   */
  async onModuleInit() {
    // 初始化检查点存储，创建所需的数据表结构
    this.checkpointer = await createCheckpoint();

    // 遍历聊天模式配置，为每种角色创建对应的智能体并注册到集合中
    for (const mode of chatMode) {
      const agent = createAgent({
        model: createDeepSeek(),
        systemPrompt: mode.prompt,
        checkpointer: this.checkpointer,
      })
      this.agents.set(mode.role, agent);
    }

  }

  streamCompletion(createChatDt: ChatDto) {
    // 通过role 找对应的agent
    const agent = this.agents.get(createChatDt.role);
    if (!agent) {
      throw new Error('Agent not found');
    }
    // 组装消息格式
    const threadId = `${createChatDt.userId}-${createChatDt.role}`
    const stream = agent.stream({
      messages: [{ role: 'human', content: createChatDt.content }]
    }, {
      configurable: { thread_id: threadId }, // 线程ID 会话隔离+历史记录存储
      streamMode: 'messages' //流式输出
    })
    return stream;
  }

  async findAll(userId: string, role: ChatRoleType) {
    const messages = await this.checkpointer.get({
      configurable: { thread_id: `${userId}-${role}` }
    })
    const list = messages?.channel_values?.messages as AIMessageChunk[]
    if (!list) return this.responseService.success([]) //如果历史记录为空，则返回空数组
    return this.responseService.success(list.map(item => ({
      content: item.content,
      role: item.type,
    })))
  }

}
