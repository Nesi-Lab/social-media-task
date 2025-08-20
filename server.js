const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const { Pool } = require('pg');

const app = express();

// Enable compression for better performance
app.use(compression());

// Serve static files with proper caching headers
app.use(express.static(path.join(__dirname, 'build'), {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true,
  lastModified: true,
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
    } else if (path.match(/\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      // Images and fonts can be cached for 1 day
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
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

async function query(q) {

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

  let result = null
  console.log("query", q)
  pool
    .connect()
    .then(client => {
      client
        .query(q)
        .then((r) => {
          client.release()
          result = r
        })
        .catch(err => {
          client.release()
          console.log("err querying", err.stack)
        })
    }).catch(err => {
      console.log("err connecting", err.stack)
    })

  return result

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

app.post('/add', jsonParser, (req, res) => {
  const cols = Object.keys(req.body.data).join(", ")
  const vals = Object.values(req.body.data).join(", ")
  query(`INSERT INTO ${req.body.table}(${cols}) VALUES (${vals});`)
    .then(() => res.send(req.body.table === "eye_tracking" ? `Added to ${req.body.table}` : `Added to ${req.body.table}: ${JSON.stringify(req.body.data)}`))
    .catch(err => console.log("err inserting data", err.stack))
});

app.post('/settz', jsonParser, (req, res) => {
  query(`SET timezone to '${req.body.tz}';`)
    .then(() => res.send(`Set timezone to: ${req.body.tz}`))
    .catch(err => console.log("err setting timezone", err.stack))
});

app.listen(process.env.PORT || 8080);