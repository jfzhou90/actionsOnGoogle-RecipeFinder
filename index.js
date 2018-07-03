const fakeData = require('./initial-data/initializaData');
const express = require('express');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
const routes = require('./routes/dialogFlowRoutes')
const { dialogflow, Image } = require('actions-on-google')

//----------------------------------------------------------- Express server side ----------------------------------------------------------//
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

// require('./routes/dialogFlowRoutes')(app);


//----------------------------------------------------------- DialogFlow Side ----------------------------------------------------------//
// Create an app instance

const googleflow = dialogflow();

// Register handlers for Dialogflow intents

googleflow.intent('Default Welcome Intent', conv => {
  conv.ask('Hi, I\'m Charlie, I\'m your recipe buddy. What shall we cook today?')
  conv.ask(new Image({
    url: 'https://cdn.pixabay.com/photo/2016/01/10/18/59/charlie-brown-1132276_960_720.jpg',
    alt: 'Charlie Brown',
  }))
})

// Intent in Dialogflow called `Goodbye`
googleflow.intent('Query Recipe', conv => {
  conv.ask('Here are some of the related recipes')
})

// Intent in Dialogflow called `Goodbye`
googleflow.intent('Goodbye', conv => {
  conv.close('See you later!')
})

googleflow.intent('Default Fallback Intent', conv => {
  conv.ask(`I didn't understand. Can you tell me something else?`)
})

express().use(bodyParser.json(), googleflow).listen(process.env.PORT || 8000, function () {
  fakeData.initializeData();
  console.log(`Server up and listening on ${process.env.PORT || 8000} `);
});