const mongoose = require("mongoose");
const { Schema } = mongoose;

//we will create a schema

//first we imported schema object
const UserSchema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  products: [
    { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
  ],
});

//this is a constructor thats why we use upper  case
//IT CREATES A "users" collection on  "graphql-data" database
const UsersCollection = mongoose.model("users", UserSchema);
module.exports = UsersCollection;
