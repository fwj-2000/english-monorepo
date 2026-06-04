import { io, type Socket } from 'socket.io-client'
import { socketUrl } from '@/apis'
import { useUserStore } from '@/stores/user'

let socket: Socket | null = null

export const useSocket = () => {
  const userId = useUserStore(s => s.user?.id)

  const connect = () => {
    if (!userId || socket) return
    socket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      query: { userId },
    })
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      socket.removeAllListeners()
      socket = null
    }
  }

  const getSocket = (): Socket | null => socket

  return { connect, disconnect, getSocket }
}
