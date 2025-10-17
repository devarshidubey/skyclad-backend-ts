import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import docRoutes from "./routes/docs.js";
import userRoutes from "./routes/users.js";
import folderRoutes from "./routes/folders.js";
import webhookRoutes from "./routes/webhooks.js";
import actionRoutes from "./routes/actions.js"
import { connectDb } from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import type { CorsOptions } from "cors";

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT);

const allowedHeaders = process.env.ALLOWED_HEADERS!.split(",");
const allowedOrigins = process.env.ALLOWED_ORIGINS!.split(",");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders,
  credentials: true
}

app.use(cors(corsOptions));

app.use('/v1/users', userRoutes);
app.use('/v1/auth', authRoutes);
app.use('/v1/docs', docRoutes);
app.use('/v1/folders', folderRoutes);
app.use('/v1/actions', actionRoutes);
app.use('/v1/webhooks', webhookRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Invalid URL",
    data: null,
  });
});

app.use(errorHandler);

await connectDb();
//await connectRedis();
//await connectKafka();

app.listen(PORT, ()=> {
    //console.log(`App listening to port ${PORT}`);
})
