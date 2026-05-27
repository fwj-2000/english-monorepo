import { Injectable, OnModuleInit } from '@nestjs/common';
import { ResponseService } from '@libs/shared'
import { createDeepSeek, createCheckpoint, createBochaSearch, createDeepSeekReasoner } from '../llm/llm.config';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres'
import type { ChatRoleType, ChatDto } from '@en/common/chat'
import { type ReactAgent, createAgent, AIMessageChunk } from 'langchain'
import { chatMode } from '../prompt/prompt.mode';


@Injectable()
export class ChatService implements OnModuleInit {
  constructor(private readonly responseService: ResponseService) { }
  private checkpointer: PostgresSaver
  // private agents: Map<ChatRoleType, ReactAgent> = new Map()

  /**
   * 模块初始化生命周期钩子。
   * 负责初始化检查点存储并创建不同角色的智能体实例。
   */
  async onModuleInit() {
    this.checkpointer = await createCheckpoint();// 幂等性，避免重复创建表结构

    // 提示词要动态根据用户输入判断是否开启深度思考和网络搜索，不能一开始据就把agent创建好
    // // 遍历聊天模式配置，为每种角色创建对应的智能体并注册到集合中
    // for (const mode of chatMode) {
    //   const agent = createAgent({
    //     model: createDeepSeek(),
    //     systemPrompt: mode.prompt,
    //     checkpointer: this.checkpointer,
    //   })
    //   this.agents.set(mode.role, agent);
    // }

  }

  streamCompletion(createChatDt: ChatDto) {
    const promptObject = chatMode.find(mode => mode.role === createChatDt.role)
    if (!promptObject) {
      throw new Error('当前角色模式不存在');
    }
    let basePrompt = promptObject.prompt

    if (createChatDt.webSearch) {
      const webSearchPrompt = createBochaSearch(createChatDt.content)
      console.log(webSearchPrompt)
      basePrompt += `请根据以下搜索结果回答问题：${webSearchPrompt}(并且返回你参考的网站名称)，用户问题：${createChatDt.content}`
    }
    let model = createDeepSeek() //默认是对话模型
    if (createChatDt.deepThink) {
      model = createDeepSeekReasoner() //深度思考模型
    }
    // 通过role 找对应的agent
    // const agent = this.agents.get(createChatDt.role);
    const agent = createAgent({
      model: model,
      systemPrompt: basePrompt,
      checkpointer: this.checkpointer,
    })
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
    console.log("🚀 ~ ChatService ~ streamCompletion ~ stream:", stream)
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
      reasoning: item.additional_kwargs?.reasoning_content, //返回深度思考的内容
    })))
  }

}
