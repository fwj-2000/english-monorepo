import { aiApi, type Response } from '..';
import type { ChatModeList } from '@en/common/chat';

export const getChatMode = () => aiApi.get('/prompt/list') as Promise<Response<ChatModeList>>