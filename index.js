const fakeData = require('./initial-data/initializaData');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const keys = require('./config/keys');

const app = express();
app.use(cors);
app.use(
    bodyParser.urlencoded({
      extended: true
    })
);

app.use(bodyParser.json());

require('./routes/dialogFlowRoutes')(app);

app.listen(process.env.PORT || 8000, function() {
    fakeData.initializeData();
    console.log("Server up and listening");
  });