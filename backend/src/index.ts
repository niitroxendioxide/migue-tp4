import express from 'express'
import cors from "cors";

import { eventsRouter } from './routers/events-router'
import { errorHandlerMiddleware } from './middleware/errors'
import { registerRouter } from './routers/register-router'
import { paymentRouter } from './routers/payment-router'

const app = express()

app.use(express.json())
app.use(
	cors({
		origin: "http://localhost:5173",
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true, 
		optionsSuccessStatus: 200, 
	}),
);

app.use("/payment", paymentRouter);
app.use("/api", registerRouter);
app.use('/events', eventsRouter);
app.get('/health', (req, res) => {
  res.send('OK\n')
})

app.use(errorHandlerMiddleware);

app.listen(3000, () => {
  console.log('Server running on port 3000')
})

export { app }