const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db");
const authRoutes = require("./routes/auth.routes");
const colorRoutes = require("./routes/color.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/colors", colorRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Smart Wall Paint Visualizer Backend is running");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});