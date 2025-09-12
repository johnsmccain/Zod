import mongoose from "mongoose";
const tokenSchema = new mongoose.Schema({
    address: String,
    name: String,
    symbol: String,
    decimals: Number,
});

const Token = mongoose.model("Token", tokenSchema);

export default Token;