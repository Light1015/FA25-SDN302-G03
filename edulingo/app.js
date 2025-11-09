const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const couponRoutes = require("./routes/couponRoutes");
const quizRoutes = require('./routes/quizRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const courseRoutes = require("./routes/courseRoutes");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

// Cau hinh middleware co ban
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("Missing MongoDB connection string. Set MONGODB_URI in .env");
}

// Ket noi MongoDB dung URL tu .env
mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Dinh nghia cac route cho REST API

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/coupons", couponRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/certificates', certificateRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/feedbacks", feedbackRoutes);

// Serve Swagger UI
try {
  const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.error('Failed to load swagger.yaml for docs:', err.message);
}

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);

});
