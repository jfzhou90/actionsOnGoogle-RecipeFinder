const fakeData = require('./initial-data/initializaData');
const express = require('express');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
const routes = require('./routes/dialogFlowRoutes')
const { dialogflow, BasicCard, BrowseCarousel, BrowseCarouselItem, Button, Carousel, Image, LinkOutSuggestion, List, MediaObject, Suggestions, SimpleResponse, Table } = require('actions-on-google');

//----------------------------------------------------------- Express server side ----------------------------------------------------------//
const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());

// fake data section.
fakeData.initializeData();
let fakeGroup = fakeData.getAll();
let fakeOne = fakeData.getOne();

app.use(function (request, response, next) {
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Authentication");
  response.header("Access-Control-Allow-Origin", "*");
  // console.log(request.body)

  // Pre-flight Request
  if ('OPTIONS' == request.method) {
    return response.status(200).send();
  }

  next();
});

require('./routes/dialogFlowRoutes')(app);


//----------------------------------------------------------- DialogFlow Side ----------------------------------------------------------//
// Create an app instance

const googleflow = dialogflow();

googleflow.middleware((conv) => {
  conv.hasScreen =
    conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
  conv.hasAudioPlayback =
    conv.surface.capabilities.has('actions.capability.AUDIO_OUTPUT');
});

// Register handlers for Dialogflow intents

googleflow.intent('Default Welcome Intent', conv => {
  conv.ask('Hi, I\'m Charlie, I\'m your recipe buddy. What shall we cook today?');
  conv.ask(new Image({
    url: 'https://cdn.pixabay.com/photo/2016/01/10/18/59/charlie-brown-1132276_960_720.jpg',
    alt: 'Charlie Brown',
  }))
})

// Intent in Dialogflow called `Query Recipe`
googleflow.intent('Query Recipe', conv => {
  console.log(conv.body);

  if (!conv.hasScreen) {
    conv.ask('Sorry, try this on a screen device or select the ' +
      'phone surface in the simulator.');
    return;
  }

  conv.ask(`Here are some of recipes about ${conv.body.queryResult.parameters.food}`);
  // Create a carousel
})

// Intent in Dialogflow called `Goodbye`
googleflow.intent('Goodbye', conv => {
  conv.close('See you later!')
})

googleflow.intent('Default Fallback Intent', conv => {
  conv.ask(`I didn't understand. Can you tell me something else?`)
})

express().use(bodyParser.json(), app, googleflow).listen(process.env.PORT || 8000, function () {
  console.log(`Server up and listening on ${process.env.PORT || 8000} `);
});