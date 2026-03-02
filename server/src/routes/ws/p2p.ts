import { Hono } from 'hono'
import { Socket } from 'socket.io'

const p2p = new Hono()

p2p.get('/video', (c) => {
  return c.text('web rtc checking')
})

p2p.get('/', (c) => {



  return c.text('health check!')
})

export default p2p
