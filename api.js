// Web API for flashcard related operations
import create_logger from "./logger.js"
import db from "./dbs.js"
import express from "express"
import fs from "fs/promises"
import model_flashcard from "./model_flashcard.js"
import multer from "multer"
import dbs from "./dbs.js"

const logger = create_logger("api", "blue")
const router = express.Router()

// create ./tmp folder if not exists
fs.mkdir("./tmp", { recursive: true })
  .then(() => {
    logger.info("tmp folder is created")
  })
  .catch((error) => {
    logger.error(error)
    process.exit(1)
  })

// multer storage for img upload
const upload_placer = multer({ dest: "./tmp" })

// get flashcard by req.query.id
router.get("/get", async (req, res) => {
  logger.info(`${req.method} ${req.url}`)
  // get id from req.query
  const id = req.query.id
  logger.debug("id: %s", id)
  // check if id is provided
  if (!id) {
    logger.warn("id is required")
    res.status(400).json({ message: "id is required" })
    return
  }
  // get flashcard by id
  const flashcard = await db.db_get_flashcard(id)
  if (!flashcard) {
    logger.warn("flashcard not found")
    res.status(400).json({ message: `flashcard not found by id ${id}` })
    return
  }
  logger.info("response: %o", flashcard)
  res.send(flashcard)
})

// search flashcards by req.query.kw and req.query.tag
router.get("/search", async (req, res) => {
  logger.info(`${req.method} ${req.url}`)
  const kw = req.query.kw
  const tag = req.query.tag
  if (!kw && !tag) {
    logger.warn("kw or tag is required")
    res.status(400).json({ message: "kw or tag is required" })
    return
  }
  try {
    const flashcards = await db.db_search_flashcard(kw, tag)
    logger.info("%s => %o", req.url, flashcards)
    res.send(flashcards)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: error.message })
  }
})

// full-text search flashcards by req.query.kw
router.get("/fulltext-search", async (req, res) => {
  logger.info(`${req.method} ${req.url}`)
  const kw = req.query.kw
  if (!kw) {
    logger.warn("kw is required")
    res.status(400).json({ message: "kw is required" })
    return
  }
  try {
    const flashcards = await db.db_fulltext_search_flashcard(kw)
    logger.info("%s => %o", req.url, flashcards)
    res.send(flashcards)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: error.message })
  }
})

// get recent flashcards by req.query.limit
router.get("/recent", async (req, res) => {
  logger.info(`${req.method} ${req.url}`)
  let limit = req.query.limit
  if (!limit) {
    limit = 10
  }
  try {
    const flashcards = await db.db_get_recent_flashcard(limit)
    logger.info("%s => %o", req.url, flashcards)
    res.send(flashcards)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: error.message })
  }
})

// create a new flashcard
router.post("/create", async (req, res) => {
  logger.info("%s %s %o", req.method, req.url, req.body)
  const flashcard = model_flashcard.for_create(req.body)
  logger.info("flashcard to save is %o", flashcard)
  console.log("db.db_insert_flashcard", db.db_insert_flashcard)
  const id = await db.db_insert_flashcard(flashcard)
  const res_body = { id }
  logger.info("%s => %o", req.url, res_body)
  res.send(res_body)
})

// delete a flashcard by req.query.id
router.all("/delete", async (req, res) => {
  logger.info(`${req.method} ${req.url}`)
  const id = req.query.id
  if (!id) {
    logger.warn("id is required")
    res.status(400).json({ message: "id is required" })
    return
  }
  try {
    const deletedCount = await db.db_delete_flashcard(id)
    if (deletedCount === 0) {
      logger.warn(`flashcard not found by id ${id}`)
      res.status(400).json({ message: `flashcard not found by id ${id}` })
      return
    }
    const res_body = { message: `flashcard deleted by id ${id}` }
    logger.info(`${req.url} => %o`, res_body)
    res.send(res_body)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: error.message })
  }
})

// update a flashcard by req.body
router.post("/update", async (req, res) => {
  logger.info(`${req.method} ${req.url} %o`, req.body)
  const patch = model_flashcard.for_update(req.body)
  logger.info("update patch is %o", patch)
  try {
    const modified_count = await db.db_update_flashcard(patch)
    if (modified_count === 0) {
      logger.warn(`flashcard not found by id ${patch.id}`)
      res.status(400).json({ message: `flashcard not found by id ${patch.id}` })
      return
    }
    const res_body = { message: "flashcard updated" }
    logger.info(`${req.url} => %o`, res_body)
    res.send(res_body)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: error.message })
  }
})

// attach an image to a flashcard
router.post("/attach-img", upload_placer.single("img"), async (req, res) => {
  // FormData: { id: string, img: file }
  logger.info(`${req.method} ${req.url}`)
  logger.info("req.file: %o", req.file)
  logger.info("id: %o", req.body.id)
  // delete img file in case of error
  req.on("close", async () => {
    if (req.file) {
      try {
        logger.info("delete tmp img file %s", req.file.path)
        await fs.unlink(req.file.path)
      } catch (error) {
        logger.error(error)
      }
    }
  })
  // check if img is provided
  if (!req.file) {
    logger.warn("img is required")
    res.status(400).json({ message: "img is required" })
    return
  }
  if (!req.body.id) {
    logger.warn("id is required")
    res.status(400).json({ message: "id is required" })
    return
  }
  if (!req.file.mimetype.startsWith("image/")) {
    logger.warn("unrecognizable file type %s", req.file.mimetype)
    res
      .status(400)
      .json({ message: `unrecognizable image file type ${req.file.mimetype}` })
    return
  }
  // check if file exists
  try {
    await fs.access(req.file.path)
  } catch (error) {
    logger.warn("img file not found")
    logger.debug("req.file.path: %s", req.file.path)
    res.status(500).json({ message: "img file not found" })
    return
  }
  // check if id is valid
  const flashcard = await dbs.db_get_flashcard(req.body.id)
  if (!flashcard) {
    logger.warn("flashcard not found by id %s", req.body.id)
    res
      .status(400)
      .json({ message: `flashcard not found by id ${req.body.id}` })
    return
  }
  // add extension to img file
  const img_ext = req.file.originalname.split(".").pop().toLowerCase()
  const valid_exts = ["jpg", "jpeg", "png", "gif", "webp"]
  if (!valid_exts.includes(img_ext)) {
    logger.warn("unrecognizable file extension %s", img_ext)
    res.status(400).json({ message: `unrecognizable image file extension ${img_ext}` })
    return
  }
  const img_path = `${req.file.path}.${img_ext}`
  logger.info("update img file to %s", img_path)
  await fs.rename(req.file.path, img_path)
  req.file.path = img_path
  // save img to storage
  const img_url = await dbs.db_upload(img_path)
  await dbs.db_update_flashcard({ id: req.body.id, img_url: img_url })
  // remove tmp img file
  await fs.unlink(img_path)
  const res_body = { message: "img attached" }
  logger.info("%s => %o", req.url, res_body)
  res.send(res_body)
})

// get a random flashcard
router.get("/random", async (req, res) => {
  logger.info(`${req.method} ${req.url}`)
  try {
    const flashcard = await db.db_get_random_flashcard()
    logger.info("%s => %o", req.url, flashcard)
    res.send(flashcard)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: error.message })
  }
})

// get a flashcard for practice
router.get("/practice", async (req, res) => {
  logger.info(`${req.method} ${req.url}`)
  // redirect to /random
  res.redirect("./random")
})

// Error-handling middleware
router.use((err, req, res, next) => {
  logger.error(err.stack)
  res.status(500).json({ message: "Internal Server Error" })
})

export default router
