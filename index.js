// entry point of the api-server

import api from "./api.js"
import cors from "cors"
import create_logger from "./logger.js"
import db from "./dbs.js"
import env from "./env.js"
import express from "express"

const logger = create_logger("api-server", "blue")
const webapp = express()
webapp.use(cors()) // enable Cross Origin Resource Sharing and allow all origins
webapp.use(express.json()) // enable JSON body parsing

webapp.get("/", (req, res) => {
  res.send("api-server is running.")
})

// router of /flashcard/*
webapp.use("/flashcard", api)

// start the server
const port = process.env.PORT
webapp.listen(port, () => {
  logger.info(`api-server is running on port ${port}`)
})

// close the server when SIGINT
process.on("SIGINT", () => {
  logger.info("api-server is shutting down")
  db.db_close()
  process.exit(0)
})
