const express = require('express');
require("dotenv").config(); // Load environment variables from .env file
const userRouter = require('./routes/userRouter');
const app = express();
const cors= require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./middlewares/errorHandlerMiddleware');
const categoryRouter = require('./routes/categoryRouter');
const transactionRouter = require('./routes/transactionRouter');
const geminiRouter = require("./routes/geminiRouter");


//! Connect mongodb here
mongoose.connect(process.env.MONGO_URI).then(() => console.log("Database connected successfully")).catch((error) => console.log("Database connection failed", error));

//! cors config
const corsOptions = {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", process.env.CLIENT_URL],
};
app.use(cors(corsOptions));

//! Middleware
app.use(express.json()); // To parse JSON bodies

//! Routes
app.use("/api/v1", userRouter);
app.use("/api/v1", categoryRouter);
app.use("/api/v1", transactionRouter);
app.use("/api/v1", geminiRouter);

//! Error handling middleware
app.use(errorHandler);

//! Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT,()=> console.log(`Server is running on port.. ${PORT}`));