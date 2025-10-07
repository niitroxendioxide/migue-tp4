
import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()

app.get('/health', (req, res) => {
  res.send('Hello World!')
})

// setup the app
app.listen(3000, () => {
  console.log('Server running on port 3000')
})