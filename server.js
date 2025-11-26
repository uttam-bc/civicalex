const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const WebSocket = require("ws"); // For Python AI WebSocket

dotenv.config();

// ==== ENV CHECK ======================================================
const requiredEnv = ["SESSION_SECRET", "MONGODB_URI"];
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required env var: ${envVar}`);
    process.exit(1);
  }
}

// ==== EXPRESS APP ====================================================
const app = express();

// ==== SECURITY: HELMET ==============================================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws://127.0.0.1:8000"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ==== RATE LIMITING =================================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skipSuccessfulRequests: true,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many uploads. Please try again later.",
});

app.use("/login", authLimiter);
app.use("/register", authLimiter);
app.use(generalLimiter);
app.use("/api", apiLimiter);
app.use("/dashboard/upload-document", uploadLimiter);

// ==== BODY PARSERS ==================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// ==== SANITIZATION ==================================================
app.use((req, res, next) => {
  if (!req.body || typeof req.body !== "object") return next();

  Object.keys(req.body).forEach((key) => {
    if (key.startsWith("$")) {
      delete req.body[key];
      return;
    }
  });

  Object.keys(req.body).forEach((key) => {
    let val = req.body[key];
    if (typeof val !== "string") return;

    val = val.trim();

    if (val.startsWith("$")) val = val.replace(/^\$+/, "");

    if (key === "email") {
      req.body.email = val.replace(/\s+/g, "");
      return;
    }

    if (key === "phone") {
      req.body.phone = val.replace(/[()\s\-]/g, "");
      return;
    }

    req.body[key] = val.replace(/[\0\r\n]+/g, "").replace(/\$/g, "");
  });

  next();
});

// ==== SESSION (MUST BE BEFORE CSRF) ================================
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// ==== CSRF SETUP ====================================================
// We want: NO CSRF for /api/* (including /api/ai/chat), CSRF ON for forms.
const csrfProtection = csrf();

app.use((req, res, next) => {
  // Skip CSRF for any JSON/API route
  if (req.originalUrl.startsWith("/api/")) {
    return next();
  }
  csrfProtection(req, res, next);
});

// ==== PYTHON AI WEBSOCKET CLIENT ====================================
let ws;

function connectWS() {
  console.log("🔌 Connecting to Python AI WebSocket...");

  ws = new WebSocket("ws://127.0.0.1:8000/ws");

  ws.on("open", () => {
    console.log("🟢 Connected to Python AI WebSocket");
  });

  ws.on("close", () => {
    console.log("🔴 Python WS closed — reconnecting...");
    setTimeout(connectWS, 2000);
  });

  ws.on("error", (err) => {
    console.error("WS Error:", err.message);
  });
}

connectWS();
app.set("pythonWS", ws);

// ==== VIEW ENGINE & STATIC FILES ====================================
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Block access to private uploads folder
app.use("/uploads", (req, res, next) => {
  if (req.path.includes("private_uploads")) {
    return res.status(403).send("Access denied");
  }
  next();
});

// ==== MONGODB CONNECTION ============================================
mongoose
  .connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ==== ROUTES ========================================================

// Main routes (HTML pages)
app.use("/", require("./routes/auth"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/law", require("./routes/law"));
app.use("/act", require("./routes/act"));
app.use("/services", require("./routes/services"));
app.use("/documents", require("./routes/document"));
app.use("/about", require("./routes/about"));
app.use("/contact", require("./routes/contact"));
app.use("/profile", require("./routes/profile"));
app.use("/cases", require("./routes/cases"));
app.use("/petitions", require("./routes/petition"));
app.use("/search", require("./routes/search"));

// AI chatbot API
const aiRoutes = require("./routes/ai");
app.use("/api/ai", aiRoutes);

// Other JSON APIs
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

// Extra static pages
app.get("/privacy", (req, res) => {
  res.render("privacy", {
    title: "Privacy Policy - CivicaLex",
    user: req.session.userId ? { _id: req.session.userId } : null,
  });
});

app.get("/terms", (req, res) => {
  res.render("terms", {
    title: "Terms of Service - CivicaLex",
    user: req.session.userId ? { _id: req.session.userId } : null,
  });
});

app.get("/faq", (req, res) => {
  res.render("faq", {
    title: "FAQ - CivicaLex",
    user: req.session.userId ? { _id: req.session.userId } : null,
  });
});

// ==== ERROR HANDLER =================================================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);

  if (err.code === "EBADCSRFTOKEN") {
    // This will ONLY trigger for NON-API routes now
    return res.status(403).render("error", {
      title: "Security Error",
      message: "Invalid security token. Please refresh the page and try again.",
    });
  }

  res.status(err.status || 500).render("error", {
    title: "Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again later."
        : err.message,
  });
});

// ==== 404 HANDLER ===================================================
app.use((req, res) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    message: "The page you are looking for does not exist.",
  });
});

// ==== START SERVER ==================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `🚀 CivicaLex server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});
