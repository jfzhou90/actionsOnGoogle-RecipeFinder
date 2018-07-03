const fakeData = require('./initial-data/initializaData');
const express = require('express');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
const routes = require('./routes/dialogFlowRoutes')

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());

app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Authentication");
  response.header("Access-Control-Allow-Origin", "*");
  
  // Pre-flight Request
  if ('OPTIONS' == request.method) {
      return response.status(200).send();
  }

  next();
});

require('./routes/dialogFlowRoutes')(app);

express().use(bodyParser.json(), app).listen(process.env.PORT || 8000, function () {
  fakeData.initializeData();
  console.log(`Server up and listening on ${process.env.PORT || 8000} `);
});