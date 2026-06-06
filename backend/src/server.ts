import "dotenv/config.js"
import app from "./app.js"
import ENV from "./ENV.js"

const PORT = ENV.PORT

app.listen(PORT, () => {
  console.log("Server Start at port", PORT)
})
