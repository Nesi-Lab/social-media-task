const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'build')));

var jsonParser = bodyParser.json()

// app.get('/ping', function (req, res) {
//  return res.send('pong');
// });

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.post('/add', jsonParser, (req, res) => {
    console.log("server side", req.body);
    res.send(
      `I received your POST request. This is what you sent me: ${req.body}`,
    );
  });

app.listen(process.env.PORT || 8080);