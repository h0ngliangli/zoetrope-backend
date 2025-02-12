function for_create(obj) {
  return {
    question: obj.question ? obj.question : "",
    answer: obj.answer ? obj.answer : "",
    note: obj.note ? obj.note : "",
    tags: obj.tags ? obj.tags : [],
    img_url: obj.img_url ? obj.img_url : "",
  }
}

function for_update(obj) {
  const model = {}
  if (!obj.id) {
    throw new Error("id is required")
  }
  model.id = obj.id
  if (obj.question) {
    model.question = obj.question
  }
  if (obj.answer) {
    model.answer = obj.answer
  }
  if (obj.note) {
    model.note = obj.note
  }
  if (obj.tags) {
    model.tags = obj.tags
  }
  if (obj.img_url) {
    model.img_url = obj.img_url
  }
  return model
}

export default {
  for_create,
  for_update,
}
