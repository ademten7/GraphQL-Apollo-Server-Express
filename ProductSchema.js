const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProductSchema = new Schema({
  title: { type: String },
  price: { type: Number },
});

const ProductsCollection = mongoose.model("products", ProductSchema);

module.exports = ProductsCollection;
