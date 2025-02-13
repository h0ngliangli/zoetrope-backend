export default {
  db_impl: "./db_mongodb.js",
  storage_impl: "./db_gc_storage.js",
  mongodb: {
    url: "mongodb+srv://cluster0.ir6ye.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=Cluster0",
    db: "zoetrope",
    key_file: "key_mongodb.pem",
  },
  firestore: {
    key_file: "key_firebase.json",
  },
  gc_storage: {
    key_file: "key_gc_storage.json",
    bucket: "bucket-zoetrope-3372",
  },
}
