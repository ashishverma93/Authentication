import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import errorHandler from "./src/helpers/errorhandler.js";
// import errorHandler from "./src/helpers/errorhandler.js";

dotenv.config();

const port = process.env.PORT || 8000;
const CLIENT_URL = process.env.CLIENT_URL;

const app = express();

// middleware
app.use(cors(
    {
        origin: CLIENT_URL,
        Credentials: true,
    }
))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(errorHandler); // error handler middleware

// routes
const routeFiles = fs.readdirSync("./src/routes").filter(file => file.endsWith(".js"));
console.log("Available route files:", routeFiles);
routeFiles.forEach((file) => {
    //use dynamic import to load the route
    import(`./src/routes/${file}`).then(route => {
        app.use("/api/v1", route.default);
    }).catch(err => {
        console.error(`Error loading route ${file}:`, err);
    });
    // const route = import(`./src/routes/${file}`);
    // app.use("/api", route);
});

const server = async () => {
    console.log("server is running normally...");
    try {
        await connect();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Error starting the server:", error);
    }
}

server();