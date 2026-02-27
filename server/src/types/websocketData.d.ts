
 type WebSocketData = {
   channelId: string;
   authToken?: string;
   createdAt?: string;

};

type WebSocketMessage = {
  channelId:string;
  userId:number;
   message:string;
}
export { WebSocketData,WebSocketMessage}
