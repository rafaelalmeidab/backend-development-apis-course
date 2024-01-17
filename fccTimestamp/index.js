// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

//COMECA AQUI
app.get('/', (req, res) => {
  const utcTimestamp = new Date().getTime();
  const gmtDateTime = new Date().toUTCString();

  if (gmtDateTime == 'Invalid Date') {
    var obj = ({ error: "Invalid Date" });
  }
  else {
    var obj = { unix: utcTimestamp, utc: gmtDateTime };
  }
  const jsonObj = (obj);

  res.json(jsonObj);
});

app.get('/api', (req, res) => {
  currentDate = new Date();
  dateParam = ({ unix: (currentDate.getTime()), utc: (currentDate.toUTCString()) });

  res.json(dateParam);
});

app.get('/api/:date?/', (req, res) => {

  var dateParam = decodeURIComponent(req.url.split('/').pop(-1));

  var currentDate = new Date(dateParam);

  if (Date.parse(currentDate.toString()) == "Invalid Date") {
    dateParam = ({ error: "Invalid Date" });
  }
  else {
    if (currentDate.toUTCString() != 'Invalid Date') {
      dateParam = ({ unix: (currentDate.getTime()), utc: (currentDate.toUTCString()) });
    }
    else {
      dateParam = Number(dateParam);
      currentDate = new Date(dateParam);
      if (currentDate.toString() == "Invalid Date") {
        dateParam = ({ error: "Invalid Date" });
      }
      else {
        dateParam = ({ unix: (currentDate.getTime()), utc: (currentDate.toUTCString()) });
      }
    }
  }


  res.json(dateParam);
});