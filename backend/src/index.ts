import express from 'express'
import { eventsRouter } from './routers/events-router'
import { errorHandlerMiddleware } from './middleware/errors'
import { registerRouter } from './routers/register-router'

const app = express()

app.use("/api", registerRouter)
app.use('/events', eventsRouter);
app.get('/health', (req, res) => {
  res.send('OK')
})

app.use(errorHandlerMiddleware);

app.listen(3000, () => {
  console.log('Server running on port 3000')
})