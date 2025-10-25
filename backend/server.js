require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// Enable mongoose internal debug logging to help diagnose connection issues in dev
mongoose.set('debug', function (coll, method, query, doc) {
  try {
    console.log('[mongoose]', coll, method, JSON.stringify(query), doc ? JSON.stringify(doc) : '')
  } catch (e) {
    // ignore stringify errors
    console.log('[mongoose]', coll, method)
  }
});
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
// Simple request logger to help debug proxied requests and cookie headers
app.use((req, res, next) => {
  try {
    const cookieHeader = req.headers && req.headers.cookie ? req.headers.cookie : ''
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - cookie: ${cookieHeader}`)
  } catch (e) {
    console.log('Request logger error', e)
  }
  next()
})
// cookie-based sessions (httpOnly)
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_KEY || 'dev_key_change_me'],
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'lax',
  path: '/',
}));
// Enable CORS for frontend dev server (adjust origin in production)
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const eventsRouter = require('./routes/events');
const lostRouter = require('./routes/lostitems');
const issuesRouter = require('./routes/issues');
const clubsRouter = require('./routes/clubs');
const googleAuthRouter = require('./routes/googleAuth');
const requireAuth = require('./middleware/authMiddleware');
const adminRouter = require('./routes/admin');

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/auth/google', googleAuthRouter);
// protect POST routes that create resources
app.use('/api/events', eventsRouter);
app.use('/api/lost-items', lostRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/admin', adminRouter);

app.get('/health', (req, res) => res.json({ ok: true, status: 'running' }));

async function start() {
  // Build mongoose connection options (declare outside try so fallback can reuse)
  const connectOptions = { useNewUrlParser: true, useUnifiedTopology: true };

  // helper: connect with retries/backoff for transient network/DNS errors
  async function connectWithRetry(uri, opts, maxAttempts = 5) {
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        attempt++;
        if (attempt > 1) console.log(`MongoDB connect retry attempt ${attempt}/${maxAttempts}...`);
        await mongoose.connect(uri, opts);
        return;
      } catch (err) {
        console.error(`MongoDB connect attempt ${attempt} failed:`, err.message || err);
        if (attempt >= maxAttempts) throw err;
        const delay = Math.min(30000, 500 * Math.pow(2, attempt)); // exponential backoff, cap 30s
        console.log(`Waiting ${delay}ms before retrying...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  // Optional: allow invalid TLS certs (useful for debugging only)
  if (process.env.MONGO_TLS_ALLOW_INVALID_CERTS === 'true') {
    connectOptions.tls = true;
    connectOptions.tlsAllowInvalidCertificates = true;
    console.log('Warning: TLS cert validation is disabled for MongoDB connection (debug mode)');
  }

  // Start server helper so we only start once after DB is connected
  let serverStarted = false;
  function startHttpServer() {
    if (serverStarted) return;
    serverStarted = true;
    const server = app.listen(port, '0.0.0.0', () => {
      try {
        const addr = server.address()
        if (addr) {
          const bind = typeof addr === 'string' ? addr : `${addr.address}:${addr.port}`
          console.log(`Server listening on ${bind}`)
        } else {
          console.log(`Server listening on port ${port}`)
        }
      } catch (e) {
        console.log(`Server started on port ${port}`)
      }
    })

    // Log uncaught errors to help catch crashes that could cause the process to stop listening
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err)
    })
    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason)
    })
  }

  // Helper to build a non-SRV (direct) URI from env-provided hosts
  function buildNonSrvUriFromEnv() {
    const hostsEnv = process.env.MONGO_HOSTS; // comma separated host:port or hostnames
    if (!hostsEnv) return null;
    const hosts = hostsEnv.split(',').map(h => h.trim()).filter(Boolean);
    if (!hosts.length) return null;
    const user = process.env.MONGO_USER ? encodeURIComponent(process.env.MONGO_USER) : '';
    const pass = process.env.MONGO_PASS ? encodeURIComponent(process.env.MONGO_PASS) : '';
    const auth = user ? `${user}:${pass}@` : '';
    const db = process.env.MONGO_DB || 'smart_campus';
    let qs = 'retryWrites=true&w=majority';
    if (process.env.MONGO_REPLICA_SET) qs += `&replicaSet=${encodeURIComponent(process.env.MONGO_REPLICA_SET)}`;
    if (process.env.MONGO_USE_TLS === 'true' || process.env.MONGO_TLS_ALLOW_INVALID_CERTS === 'true') qs += '&tls=true';
    return `mongodb://${auth}${hosts.join(',')}/${db}?${qs}`;
  }

  // Main attempt loop: try SRV (or provided MONGO_URI), then optional non-SRV fallback, then local fallback, and if all fail retry after interval
  async function attemptConnectAndStart() {
    // Decide which Mongo URI to use. Priority:
    // 1) If MONGO_FORCE_NON_SRV=true and MONGO_HOSTS is provided, build a non-SRV URI and prefer it.
    // 2) Otherwise prefer a full MONGO_URI if provided.
    // 3) Fallback: if MONGO_USER, MONGO_PASS and MONGO_HOST are provided, build a SRV URI from those.
    let baseMongoUri = null;

    if (process.env.MONGO_FORCE_NON_SRV === 'true') {
      const nonSrvCandidate = buildNonSrvUriFromEnv();
      if (nonSrvCandidate) {
        baseMongoUri = nonSrvCandidate;
        console.log('MONGO_FORCE_NON_SRV=true — preferring non-SRV MongoDB URI built from MONGO_HOSTS');
      } else {
        console.log('MONGO_FORCE_NON_SRV=true but MONGO_HOSTS not set; falling back to other URI sources');
      }
    }

    // If we still don't have a URI, prefer an explicit MONGO_URI env var
    if (!baseMongoUri && process.env.MONGO_URI) {
      baseMongoUri = process.env.MONGO_URI;
    }

    // If still unset, but individual components for SRV are provided, build SRV URI
    if (!baseMongoUri && process.env.MONGO_USER && process.env.MONGO_PASS && process.env.MONGO_HOST) {
      const user = encodeURIComponent(process.env.MONGO_USER);
      const pass = encodeURIComponent(process.env.MONGO_PASS);
      const host = process.env.MONGO_HOST; // e.g. cluster0.bx9is7t.mongodb.net
      const db = process.env.MONGO_DB || 'smart_campus';
      // default to SRV format (Atlas)
      baseMongoUri = `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority`;
      console.log('Built MongoDB SRV URI from env vars (credentials URL-encoded)');
    }
    // Fallback to localhost if nothing provided (but we won't exit if it fails)
    baseMongoUri = baseMongoUri || 'mongodb://localhost:27017/smart_campus';

    // Mask password when logging the URI for debugging
    try {
      const masked = baseMongoUri.replace(/:(?:[^:@]+)@/, ':*****@');
      console.log('Connecting to MongoDB URI:', masked);
    } catch (e) {
      // ignore masking errors
    }

    const retryInterval = parseInt(process.env.MONGO_RETRY_INTERVAL_MS || '60000'); // 1 minute default between full cycles

    while (true) {
      try {
        await connectWithRetry(baseMongoUri, connectOptions, parseInt(process.env.MONGO_CONNECT_RETRIES || '5'));
        console.log('Connected to MongoDB');
        startHttpServer();
        break; // connected and server started
      } catch (err) {
        console.error('MongoDB connect attempt failed:', err && err.message ? err.message : err);
        // Provide clearer guidance depending on common error cases
        try {
          const msg = err && err.message ? err.message.toLowerCase() : '';
          if (msg.includes('authentication failed') || msg.includes('not authorized')) {
            console.error('MongoDB authentication failed. Check your DB username/password and ensure special characters in the password are URL-encoded (e.g. @ -> %40).');
          }
          if (err.name && (err.name === 'MongooseServerSelectionError' || msg.includes('could not connect') || msg.includes('replicasetnoprimary') )) {
            console.error('Could not connect to MongoDB cluster. Common causes:');
            console.error('- Your current IP is not listed in MongoDB Atlas Network Access (IP whitelist). Add your public IP in Atlas -> Network Access.');
            console.error('- The Atlas cluster is paused or unreachable; check Atlas cluster status in the Atlas UI.');
            console.error('- Network/proxy/VPN blocking outbound traffic to MongoDB Atlas. Try from a different network (mobile hotspot) to rule this out.');
          }
          console.error('If you need help, visit: https://www.mongodb.com/docs/atlas/ or check the Atlas Network Access settings.');
        } catch (e) {
          // ignore guidance logging errors
        }

        // If the error is an SRV/DNS query failure and user provided MONGO_HOSTS or forced non-SRV, try direct hosts fallback
        if (baseMongoUri && baseMongoUri.startsWith('mongodb+srv') && (process.env.MONGO_FORCE_NON_SRV === 'true' || process.env.MONGO_HOSTS)) {
          const nonSrv = buildNonSrvUriFromEnv();
          if (nonSrv) {
            try {
              console.log('Attempting non-SRV MongoDB URI fallback:', nonSrv.replace(/:(?:[^:@]+)@/, ':*****@'));
              await connectWithRetry(nonSrv, connectOptions, parseInt(process.env.MONGO_CONNECT_RETRIES || '3'));
              console.log('Connected to MongoDB using non-SRV fallback');
              startHttpServer();
              break;
            } catch (nonSrvErr) {
              console.error('Non-SRV fallback failed:', nonSrvErr && nonSrvErr.message ? nonSrvErr.message : nonSrvErr);
            }
          } else {
            console.log('MONGO_HOSTS not set; skipping non-SRV fallback');
          }
        }

        // Optional local fallback for development: try connecting to local MongoDB
        if (process.env.MONGO_FALLBACK_LOCAL === 'true') {
          try {
            const localUri = 'mongodb://localhost:27017/smart_campus';
            console.log('Attempting local MongoDB fallback:', localUri);
            await connectWithRetry(localUri, connectOptions, 3);
            console.log('Connected to local MongoDB fallback');
            startHttpServer();
            break;
          } catch (localErr) {
            console.error('Local fallback failed', localErr && localErr.message ? localErr.message : localErr);
          }
        }

        // All fallbacks failed: wait and retry the entire cycle. Do NOT exit the process so nodemon doesn't constantly crash.
        console.log(`All MongoDB connection attempts failed. Will retry in ${retryInterval}ms...`);
        await new Promise(r => setTimeout(r, retryInterval));
        // loop and try again
      }
    }
  }

  // Launch the connect+start cycle (does not exit the process on failure; keeps retrying)
  attemptConnectAndStart();
}

start();
