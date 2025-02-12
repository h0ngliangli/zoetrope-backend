// Firestore implementation
import create_logger from "./logger.js"
import env from "./env.js"
import fs from "fs"
import { initializeApp, cert } from "firebase-admin/app"
import { Filter, getFirestore } from "firebase-admin/firestore"

const logger = create_logger("db_firestore")
const key = JSON.parse(fs.readFileSync(env.firestore.key_file))
const firebaseApp = initializeApp({
  credential: cert(key),
})

const db = getFirestore(firebaseApp)
const flashcardCol = db.collection("flashcards")

async function getFlashcardById(id) {
  logger.debug("getFlashcardById: ", id)
  const flashcard = await flashcardCol.doc(id).get()
  if (!flashcard.exists) {
    logger.debug("No such document!")
    return
  }
  logger.debug("flashcard: ", flashcard.data())
  return flashcard.data()
}

async function searchFlashcards(kw = "", tag = "") {
  logger.debug("search flashcards: %o", { kw, tag })
  let query = flashcardCol
  if (kw) {
    query = query.where(
      Filter.or(
        Filter.and(
          Filter.where("question", ">=", kw),
          Filter.where("question", "<=", kw + "\uf8ff")
        ),
        Filter.and(
          Filter.where("answer", ">=", kw),
          Filter.where("answer", "<=", kw + "\uf8ff")
        ),
        Filter.and(
          Filter.where("note", ">=", kw),
          Filter.where("note", "<=", kw + "\uf8ff")
        )
      )
    )
  }
  if (tag) {
    query = query.where("tags", "array-contains", tag)
  }
  const snapshot = await query.get()
  const flashcards = []
  snapshot.forEach((doc)=>{
    flashcards.push(doc.data())
  })
  logger.debug("flashcards: %o", flashcards)
  return flashcards
}

async function createFlashcard(flashcard) {
  logger.debug("call createFlashcard %o", flashcard)
  const data = { question, answer, note, tags } = flashcard
  const docRef = await flashcardCol.add(data)
  logger.debug("docRef: %o", docRef)
  return docRef.id
}

export default {
  getFlashcardById,
  searchFlashcards,
  createFlashcard,
}
