import mongoose from "mongoose";
const accountSchema = new mongoose.Schema({
    privateKey: String,
    address: String,
});

const Account = mongoose.model("Account", accountSchema);

export default Account;
