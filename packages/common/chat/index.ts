/**
 * 对话角色区分用户和ai 前端用这个在页面上显示气泡布局
 */
export type ChatRole = 'human' | 'ai'; //角色 human: 用户 ai: 助手
/**
 * 对话角色类型 区分普通用户、助手、业务用户、企业用户、小助手用户
 */
export type ChatRoleType = 'normal' | 'master' | 'business' | 'qilinge' | 'xiaoman'; // 角色类型
/**
 * 对话消息类型 页面上区分深度思考和聊天消息
 */
export type ChatMessageType = 'reasoning' | 'chat'; //消息类型 reasoning: 深度思考 chat: 聊天
/**
 * 对话消息对象 包含角色、内容、思考过程和消息类型
 */
export type ChatMessage = {
  role: ChatRole; // 角色 human: 用户 ai: 助手
  content: string; // chat聊天返回的内容
  reasoning?: string; // 深度思考返回的内容
  type: ChatMessageType;
}
/**
 * 对话消息列表 包含多个对话消息对象
 */
export type ChatMessageList = ChatMessage[]


/**
 * 角色标签 用于显示在左侧列表
*/
export type ChatMode = {
  label: string; // 标签
  id: string; // id
  role: ChatRoleType; // 角色
}
/**
 * agent对话模式列表 包含角色标签、id和角色类型
 */
export type ChatModeList = ChatMode[] //返回角色列表

/**
 * 发送消息所需要的对象 包含是否深度思考、是否开启网络搜索、角色、内容和用户id
 */
export type ChatDto = {
  deepThink: boolean; // 是否深度思考 
  webSearch: boolean; // 是否开启网络搜索
  role: ChatRoleType; // 角色
  content: string; // 内容
  userId: string; // 用户id
}
// 会话隔离 线程id userId 