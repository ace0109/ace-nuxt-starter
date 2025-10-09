export interface ISocketUser {
  userId: string
  username: string
}

export interface IRoomInfo {
  roomId: string
  expireTime: number
  creatorClientId: string
}

export interface RoomUserInfo {
  userId: string
  username: string
  socketId: string
  roomId: string
}

export interface RoomUpdateEvent {
  roomUserList: RoomUserInfo[]
  userInfo: RoomUserInfo | null
  event: 'create' | 'join' | 'leave' | 'close'
}

export interface MessageType {
  type: 'user' | 'system'
  subType?: 'closeVideo'
  openVideo?: boolean
  message: string
  fromId: string
  fromUsername?: string
  toId?: string
  toUsername?: string
  offer?: RTCSessionDescriptionInit
  answer?: RTCSessionDescriptionInit
}
