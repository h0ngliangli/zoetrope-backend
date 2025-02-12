import env from "./env.js"
import create_logger from "./logger.js"

const logger = create_logger("dbs", "yellow")

const db_impl = await import(env.db_impl)
const storage_impl = await import(env.storage_impl)
logger.info("database implementation is %s", env.db_impl)
logger.info("storage implementation is %s", env.storage_impl)

export default {
  db_insert_flashcard: db_impl.db_insert_flashcard,
  db_get_flashcard: db_impl.db_get_flashcard,
  db_delete_flashcard: db_impl.db_delete_flashcard,
  db_update_flashcard: db_impl.db_update_flashcard,
  db_search_flashcard: db_impl.db_search_flashcard,
  db_fulltext_search_flashcard: db_impl.db_fulltext_search_flashcard,
  db_get_recent_flashcard: db_impl.db_get_recent_flashcard,
  db_close: db_impl.db_close,
  db_upload: storage_impl.db_upload,
  db_get_random_flashcard: db_impl.db_get_random_flashcard,
}
