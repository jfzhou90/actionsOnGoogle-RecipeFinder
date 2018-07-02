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

require('./routes/dialogFlowRoutes')(app);


const PORT = process.env.PORT || 8000
app.listen(PORT)
// app.listen(process.env.PORT || 8000, function () {
//   fakeData.initializeData();
//   console.log(`Server up and listening on ${process.env.PORT || 8000} `);
// });