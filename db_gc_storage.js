import env from "./env.js"
import create_logger from "./logger.js"
import { Storage } from "@google-cloud/storage"

const logger = create_logger("db_gc-storage", "yellow")
const storage = new Storage({
  keyFilename: env.gc_storage.key_file,
})
const bucket = storage.bucket(env.gc_storage.bucket)
if (!bucket.exists()) {
  logger.error("google cloud storage bucket does not exist")
  process.exit(1)
}
logger.info("google cloud storage is connected")

// upload a file to google cloud storage
export async function db_upload(file_path) {
  logger.info("db_upload(%s)", file_path)
  const [file] = await bucket.upload(file_path)
  const public_url = file.publicUrl()
  logger.info("db_upload => %s", public_url)
  return public_url
}