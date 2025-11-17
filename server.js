const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');

dotenv.config();

// Validate required environment variables
const requiredEnv = ['SESSION_SECRET', 'MONGODB_URI'];
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    console.error(`${envVar} is required in environment variables`);
    process.exit(1);
  }
}

const app = express();

// 🔒 Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"]
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ⚡ Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skipSuccessfulRequests: true
});

app.use('/login', authLimiter);
app.use('/register', authLimiter);
app.use(generalLimiter);

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many uploads. Please try again later.'
});

app.use('/dashboard/upload-document', uploadLimiter);
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));

// Middleware - ORDER MATTERS!
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ✅ FIXED: Sanitization that doesn't break validation
// ✅ Safer request-body sanitization (do NOT strip dots from emails!)
app.use((req, res, next) => {
  if (!req.body || typeof req.body !== 'object') return next();

  // Defensive: remove dangerous keys (top-level only)
  Object.keys(req.body).forEach(key => {
    if (key.startsWith('$')) {
      delete req.body[key];
      return;
    }
  });

  // Clean each field value safely
  Object.keys(req.body).forEach(key => {
    let val = req.body[key];

    // If it's not a string, leave it (numbers, booleans, arrays, objects)
    if (typeof val !== 'string') return;

    // Trim surrounding whitespace
    val = val.trim();

    // Remove leading $ to avoid NoSQL injection payloads (e.g. "$ne")
    if (val.startsWith('$')) val = val.replace(/^\$+/, '');

    // For email, preserve dots and plus addressing — only normalize spaces
    if (key === 'email') {
      // collapse internal whitespace, leave dots and plus sign intact
      req.body.email = val.replace(/\s+/g, '');
      return;
    }

    // For phone: remove spaces, dashes, parentheses but keep leading +
    if (key === 'phone') {
      req.body.phone = val.replace(/[()\s\-]/g, '');
      return;
    }

    // For any other string field: just remove CR/LF and null-bytes and strip $ at start
    req.body[key] = val.replace(/[\0\r\n]+/g, '').replace(/\$/g, '');
  });

  next();
});


// 🔐 Session configuration - MUST COME BEFORE CSRF
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// 🛡️ CSRF protection - MUST COME AFTER SESSION
const csrfProtection = csrf();
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Set view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Prevent direct access to private uploads
app.use('/uploads', (req, res, next) => {
  if (req.path.includes('private_uploads')) {
    return res.status(403).send('Access denied');
  }
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/law', require('./routes/law'));
app.use('/act', require('./routes/act'));
app.use('/services', require('./routes/services'));
app.use('/documents', require('./routes/document'));
app.use('/api', require('./routes/api'));
app.use('/about', require('./routes/about'));
app.use('/contact', require('./routes/contact'));
app.use('/profile', require('./routes/profile'));
app.use('/cases', require('./routes/cases'));
app.use('/petitions', require('./routes/petition'));
app.use('/search', require('./routes/search'));

app.get('/privacy', (req, res) => {
  res.render('privacy', { 
    title: 'Privacy Policy - CivicaLex',
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

app.get('/terms', (req, res) => {
  res.render('terms', { 
    title: 'Terms of Service - CivicaLex',
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

app.get('/faq', (req, res) => {
  res.render('faq', {
    title: 'FAQ - CivicaLex',
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('error', { 
      title: 'Security Error', 
      message: 'Invalid security token. Please refresh the page and try again.' 
    });
  }
  
  res.status(err.status || 500).render('error', { 
    title: 'Error', 
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong. Please try again later.' 
      : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Page Not Found', 
    message: 'The page you are looking for does not exist.' 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 CivicaLex server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});