import "dotenv/config.js"
import app from "./app.js"
import ENV from "./ENV.js"
import { initDb } from "./config/initDb.js"

const PORT = ENV.PORT

async function start() {
  try {
    await initDb()
    app.listen(PORT, () => {
      console.log("Server Start at port", PORT)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

start()
