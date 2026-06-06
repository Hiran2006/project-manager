import express from "express"
import cors from "cors"
import test from "@src/routes/test.route.js"
import authRouter from "@src/routes/auth.route.js"
import userRouter from "@src/routes/user.route.js"

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/test", test)
app.use("/api/auth/", authRouter)
app.use("/api/users", userRouter)

export default app
