const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const { Pool, Client } = require('pg');

const app = express();
app.use(express.static(path.join(__dirname, 'build')));
var jsonParser = bodyParser.json()


// postgre

// const pool = new Pool({ connectionString: process.env.DATABASE_URL })
// pool.on('error', (err, client) => {
//   console.error('Unexpected error on idle client', err)
//   process.exit(-1)
// })

const client = new Client({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false
 })

async function query(q) {

  // let result = null, client = null
  // try {
  //   client = await pool.connect()
  //   result = await client.query(q)
  // } catch (err) {
  //   console.log(err.stack)
  // } finally {
  //   if (client !== null) client.release()
  // }
  // return result

  // return pool
  //   .connect()
  //   .then(client => {
  //     var result;
  //     client
  //       .query(q)
  //       .then((r) => {
  //         client.release()
  //         result = r
  //       })
  //       .catch(err => {
  //         client.release()
  //         console.log(err.stack)
  //       })
  //     return result
  //   })

  client
  .connect()
  .then(() => console.log('connected'))
  .catch(err => console.error('connection error', err.stack))

  client
  .query('SELECT table_schema,table_name FROM information_schema.tables;')
  .then(result => console.log(result))
  .catch(e => console.error(e.stack))
  .then(() => client.end())
}

// apis

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.post('/add', jsonParser, (req, res) => {
  const table = req.body.table
  const cols = Object.keys(req.body.data).join(", ")
  const vals = Object.values(req.body.data).join(", ")
  query(`INSERT INTO ${table}(${cols}) VALUES (${vals});`).then(console.log)
  res.send(`Added to database: ${req.body}`);
});

app.listen(process.env.PORT || 8080);