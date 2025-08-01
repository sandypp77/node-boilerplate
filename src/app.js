require("dotenv").config();

const express = require("express");
const routes = require("./routes");
const ApiError = require("./utils/ApiError");
const httpStatus = require("http-status");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");
const https = require("https");

const USE_SSL = process.env.USE_SSL === "true"; // Set in .env
const USE_MONGODB = process.env.USE_MONGODB === "true"; // Set in .env
const PORT = process.env.PORT || 3000;

let db; // Holds the database connection instance

if (USE_MONGODB) {
  // MongoDB setup
  const mongoose = require("mongoose");
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
  db = mongoose;
} else {
  // PostgreSQL setup
  const { postgres } = require("./config/postgres");
  const models = require("./db/models");
  models.sequelize
    .sync()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch((err) => console.error("PostgreSQL connection error:", err));
  db = models.sequelize;
}

const app = express();

// Security HTTP headers
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Enable CORS
app.use(cors());
app.options("*", cors());

// Middleware to add the database connection to each request
app.use((req, _, next) => {
  req.db = db; // Attach the appropriate database instance to the request
  next();
});

// Parse JSON and URL-encoded request bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/v1", routes);

// Handle unknown API requests with a 404 error
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

if (USE_SSL) {
  const sslOptions = {
    key: fs.readFileSync(
      path.resolve(__dirname, "../certificates/private.key")
    ),
    cert: fs.readFileSync(
      path.resolve(__dirname, "../certificates/certificate.crt")
    ),
  };

  https.createServer(sslOptions, app).listen(PORT, (error) => {
    if (!error) {
      console.log("HTTPS Server is running on port " + PORT);
    } else {
      console.log("Error occurred, HTTPS server can't start", error);
    }
  });
} else {
  app.listen(PORT, (error) => {
    if (!error) {
      console.log("HTTP Server is running on port " + PORT);
    } else {
      console.log("Error occurred, HTTP server can't start", error);
    }
  });
}
