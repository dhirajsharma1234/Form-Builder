import dotenv from "dotenv/config";
import conn from "./conn/connect.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes/userRoutes.js";
import profileRoutes from "./routes/userRoutes/profileRoute.js";
import formRoutes from "./routes/formRoutes/formRoute.js";

//configuration
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("tiny"));
app.use(cors());

app.use("/api/user", userRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/form", formRoutes);

//define port number
const port = process.env.PORT || 8000;

//server listen to the port
app.listen(port, () => {
  console.log(`Server is listening to the port ${port}`);
});
