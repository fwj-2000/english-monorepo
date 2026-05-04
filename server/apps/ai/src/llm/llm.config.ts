//1.deepseek初始化一下
import { ChatDeepSeek } from "@langchain/deepseek";
import { ConfigService } from "@nestjs/config";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
//初始化deepseek模型 普通chat模型
export const createDeepSeek = () => {
    const configService = new ConfigService();
    return new ChatDeepSeek({
        apiKey: configService.get<string>('DEEPSEEK_API_KEY'), //从环境变量中获取api key
        model: configService.get<string>('DEEPSEEK_API_MODEL'), //从环境变量中获取模型
        temperature: 1.3, //1.3翻译 + 通用对话
        maxTokens: 4396, //token限制
        streaming: true, //流式输出
    })
}
// 初始化deepseek模型 reasoner模型
export const createDeepSeekReasoner = () => {
    const configService = new ConfigService();
    return new ChatDeepSeek({
        apiKey: configService.get<string>('DEEPSEEK_API_KEY'), //从环境变量中获取api key
        model: configService.get<string>('DEEPSEEK_REASONER_API_MODEL'), //从环境变量中获取模型
        temperature: 1.3,
        maxTokens: 18000, //token限制 推理模型篇幅大，所以设置大一些
        streaming: true, //流式输出
    })
}
//2.初始化checkpoint
/**
 * 做「多轮对话 AI」（比如英语学习助手，需要记住用户之前说的话）；
 * 做「AI 智能体」（需要保存执行步骤、调用工具的结果）；
 * 多用户使用的 AI 产品（需要隔离不同用户的状态）；
 */
export const createCheckpoint = async () => {
    const configService = new ConfigService();
    const checkpointer = PostgresSaver.fromConnString(configService.get<string>('AI_DATABASE_URL')!)
    await checkpointer.setup()
    return checkpointer
}
/**
 * 在langchain中使用博查搜索api，拼接成提示词prompt
 */
export const createBochaSearch = async (query: string, count: number = 3) => {
    const configService = new ConfigService();
    const key = configService.get<string>('BOCHA_API_KEY')
    const url = configService.get<string>('BOCHA_SEARCH_URL')
    if (!key || !url) {
        throw new Error('BOCHA_API_KEY 或 BOCHA_SEARCH_URL 未配置')
    }
    const headers = {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
    }
    // - query: 搜索关键词
    // - freshness: 搜索的时间范围  例如 "oneDay", "oneWeek", "oneMonth", "oneYear", "noLimit"
    // - summary: 是否显示文本摘要
    // - count: 返回的搜索结果数量
    const data = {
        query,
        freshness: 'noLimit', // 搜索的时间范围
        count,
        summary: true,// 是否返回长文本摘要
    }
    const result = await fetch(`${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    })
    const json = await result.json()
    const webPages = json?.data?.webPages?.value
    console.log("🚀 ~ createBochaSearch ~ webPages:", webPages)

    if (json?.code !== 200 || !json?.data) {
        return `搜索API请求失败，原因是: ${json?.msg ?? '未知错误'}`
    }

    if (!Array.isArray(webPages) || webPages.length === 0) {
        return '未找到相关结果。'
    }

    const prompt = webPages
        .map((page: any, idx: number) =>
            `标题: ${page?.name ?? ''}
            URL: ${page?.url ?? ''}
            摘要: ${page?.summary?.replace(/\n/g, '') ?? ''}
            网站名称: ${page?.siteName ?? ''}
            网站logo: ${page?.siteIcon ?? ''}
            发布时间: ${page?.dateLastCrawled ?? ''}`
        ).join('\n')
    console.log("🚀 ~ createBochaSearch ~ prompt:", prompt)
    return prompt
}
// 目的是为了在别的文件将return的prompt 作为参数，喂给deepseek推理，得到结果
