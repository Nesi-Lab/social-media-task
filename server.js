const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const { Pool } = require('pg');

const app = express();

// Serve static files with proper caching headers
app.use(express.static(path.join(__dirname, 'build'), {
  maxAge: '1d', // Cache static assets for 1 day
  lastModified: false,
  etag: false,
  setHeaders: (res, path) => {
    // Set different cache headers based on file type
    if (path.endsWith('.html')) {
      // HTML files should not be cached long-term
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (path.endsWith('.js') || path.endsWith('.css')) {
      // JS and CSS files with hashes can be cached for 1 day
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      res.removeHeader('ETag');
      res.removeHeader('Last-Modified');
    } else if (path.match(/\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      // Images and fonts can be cached for 1 day
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      res.removeHeader('ETag');
      res.removeHeader('Last-Modified');
    }
  }
}));

var jsonParser = bodyParser.json()


// postgres

const pool = new Pool({
  connectionString: process.env.HEROKU_POSTGRESQL_GOLD_URL,
  // ssl: {
  //   rejectUnauthorized: false
  // }
})
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// const dns = require('dns');
// const os = require('os');
// var hostname = os.hostname();
// // const hostname = "jwindha1"
// console.log("hostname", hostname)
// dns.lookup(hostname, e => console.log("host", e))
// dns.lookup(hostname, {hints: dns.ADDRCONFIG|dns.V4MAPPED}, e => console.log("hints", e))

// const client = new Client(c)

async function query(queryText, params = []) {

  // let result = null, client = null
  // try {
  //   try { 
  //     client = await pool.connect() 
  //   } catch (e) { 
  //     console.log("pool connect error", e.stack) 
  //   }
  //   try { 
  //     result = await client.query(q)
  //   } catch (e) { 
  //     console.log("query error", e.stack) 
  //   }
  // } catch (err) {
  //   console.log("overall error", err.stack)
  // } finally {
  //   if (client !== null) client.release()
  // }
  // return result

  try {
    const client = await pool.connect()
    try {
      const result = await client.query(queryText, params)
      return result
    } finally {
      client.release()
    }
  } catch (err) {
    console.log("query error", err.stack)
    throw err
  }

  // client
  // .connect()
  // .then(() => console.log('connected'))
  // .catch(err => console.error('connection error', err.stack))

  // client
  // .query('SELECT table_schema,table_name FROM information_schema.tables;')
  // .then(result => console.log(result))
  // .catch(e => console.error(e.stack))
  // .then(() => client.end())
}

// apis

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.post('/add', jsonParser, async (req, res) => {
  try {
    // Input validation
    const allowedTables = ['feelings', 'eye_tracking', 'trials', 'metadata'];
    if (!req.body.table || !allowedTables.includes(req.body.table)) {
      console.log(`Invalid table access attempt: ${req.body.table}`);
      return res.status(400).json({ error: 'Invalid table name' });
    }
    
    if (!req.body.data || typeof req.body.data !== 'object') {
      console.log(`Invalid data format`);
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Data sanitization - remove any potentially dangerous keys and validate values
    const sanitizedData = {};
    const allowedKeys = new Set([
      'participant_id', 'timestamp', 'location', 'screen',
      'excited', 'upset', 'included', 'excluded', 'mad', 'worried', 
      'relaxed', 'sad', 'happy', 'unpopular', 'popular', 'embarrassed', 
      'bored', 'proud', 'block', 'subnum', 'majority', 'trial', 
      'rater_id', 'ratee_id', 'num_watching', 'score', 'interpretation_score',
      'name', 'value',
      // Eye tracking coordinates x0-x20, y0-y20
      'x0', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10',
      'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'x17', 'x18', 'x19', 'x20',
      'y0', 'y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9', 'y10',
      'y11', 'y12', 'y13', 'y14', 'y15', 'y16', 'y17', 'y18', 'y19', 'y20'
    ]);

    // Safe character regex - only alphanumeric, spaces, hyphens, underscores, dots, and basic punctuation
    const safeCharRegex = /^[a-zA-Z0-9\s\-_.,!?()@#$%&*+=<>:;'"`~[\]{}|\\\/]+$/;

    for (const [key, value] of Object.entries(req.body.data)) {
      if (allowedKeys.has(key)) {
        // Basic type validation
        if (typeof value === 'string') {
          if (value.length > 1000) {
            console.log(`Suspicious data length`);
            continue; // Skip overly long strings
          }
          
          // Check for special characters that could cause SQL issues
          if (!safeCharRegex.test(value)) {
            continue;
          }
          
          if (value.length > 0) {
            const cleanedValue = value.trim();
            sanitizedData[key] = cleanedValue;
          }
        } else if (typeof value === 'number') {
     
          sanitizedData[key] = value;

        } else if (value === null || value === undefined) {
          // Skip null/undefined values
          continue;
        }
      }
    }

    // Build parameterized query
    const cols = Object.keys(sanitizedData);
    if (cols.length === 0) {
      return res.status(400).json({ error: 'No valid data to insert' });
    }
    
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(sanitizedData);
    
    const queryText = `INSERT INTO ${req.body.table}(${cols.join(', ')}) VALUES (${placeholders})`;
    
    await query(queryText, values);
    
    res.send(req.body.table === "eye_tracking" ? 
      `Added to ${req.body.table}` : 
      `Added to ${req.body.table}: ${JSON.stringify(sanitizedData)}`
    );
  } catch (err) {
    // Log detailed error information server-side
    console.error(`Error inserting data into table "${req.body.table}":`, err);
    res.status(500).json({
      error: "An internal server error occurred. Please try again later."
    });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Production (Heroku)' : 'Local'}`);
});