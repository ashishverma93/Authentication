import mongoose from "mongoose";
const DB_URL= "mongodb://localhost:27017/AuthKit";
const connect = async () => {
    try {
        console.log("Connecting to the database...");
        await mongoose.connect(DB_URL, {});
        console.log("Connected to the database!!");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
}

export default connect;