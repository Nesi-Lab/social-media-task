const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const { Pool, Client } = require('pg');

const app = express();
app.use(express.static(path.join(__dirname, 'build')));
var jsonParser = bodyParser.json()


// postgres

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

app.post('/add', jsonParser, async (req, res) => {
  res.send(`got ${req.body}`)
//   const table = req.body.table
//   const cols = Object.keys(req.body.data).join(", ")
//   const vals = Object.values(req.body.data).join(", ")
//   query(`INSERT INTO ${table}(${cols}) VALUES (${vals});`)
//     .then(r => res.send(`Added to database: ${r}`))
//     .catch(err => console.log("err inserting data", err.stack))
});

app.listen(process.env.PORT || 8080);