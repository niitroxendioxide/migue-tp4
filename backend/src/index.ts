
import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.listen(3000, () => {
  console.log('Server running on port 3000')
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})