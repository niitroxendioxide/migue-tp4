
import express from 'express'
import { PrismaClient } from '@prisma/client'
import { eventsRouter } from './routers/events-router'
import { errorHandlerMiddleware } from './middleware/errors'

const app = express()

app.use('/events', eventsRouter);
app.get('/health', (req, res) => {
  res.send('Hello World!')
})

app.use(errorHandlerMiddleware);

app.listen(3000, () => {
  console.log('Server running on port 3000')
})