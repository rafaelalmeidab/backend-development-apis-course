require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const dns = require('dns');
const urlParser = require('url');

const client = new MongoClient(process.env.DB_URL);
const db = client.db('freeCodeCamp');
const urls = db.collection('urls');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

//COMECA AQUI
// const client = "mongodb+srv://" + process.env.USERNAME + ":" + process.env.PASSWORD + "@cluster0.y9bnpk7.mongodb.net/freeCodeCamp?retryWrites=true&w=majority";

// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// //Creating a Schema
// let urlSchema = new mongoose.Schema({
//   originalUrl: { type: String, required: true },
//   shortUrl: Number
// });

// //Creating a model
// var urlModel = mongoose.model('urls', urlSchema);


app.post('/api/shorturl/', function(req, res) {
  const url = req.body.url;

  const dnslookup = dns.lookup(urlParser.parse(url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: 'invalid url' });
    }
    else {
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        url: req.body.url,
        shortUrl: urlCount
      };

      const result = await urls.insertOne(urlDoc);
      console.log("result");
      console.log(result);

      res.json(
        {
          original_url: url,
          short_url: urlCount
        });
    }
  });
});

app.get('/api/shorturl/:short_url', async function(req, res) {
  const shortUrl = req.params.short_url;
  const urlDoc = await urls.findOne({ shortUrl: +shortUrl });
  res.redirect(urlDoc.url);
});