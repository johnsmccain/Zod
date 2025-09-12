import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import app from "./app";

const DB = process.env.DATABASE_URL || "mongodb://localhost:27017/guildwallet";

mongoose.connect(DB).then(() => {
  console.log("DB connection successful!");
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
