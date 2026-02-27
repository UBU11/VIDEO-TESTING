import db from '../config/dirzzle'
import { webSocketDataTable } from '../models/schema'
import { WebSocketMessage } from '../types/websocketData'

export const saveMessageToDatabase = async(data:WebSocketMessage)=>{

  try {

    const result = await db.insert(webSocketDataTable).values({
      channelId:data.channelId,
      userId:data.userId!,
      message:data.message,
    }).returning()

    return result[0]

  } catch (error) {
    console.error("Error saving message to database:", error)
    return null
  }
}
