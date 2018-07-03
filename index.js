const fakeData = require('./initial-data/initializaData');
const express = require('express');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
const routes = require('./routes/dialogFlowRoutes')
const { dialogflow, Image, Carousel } = require('actions-on-google')

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
  console.log(googleflow.getArgument('food'));

  if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
    conv.ask('Sorry, try this on a screen device or select the ' +
      'phone surface in the simulator.');
    return;
  }

  conv.ask(`Here are some of recipes about ${conv.body.queryResult.parameters.food}`);
  // Create a carousel
  conv.ask(new Carousel({
    items: {
      // Add the first item to the carousel
      [SELECTION_KEY_ONE]: {
        synonyms: [
          'synonym of title 1',
          'synonym of title 2',
          'synonym of title 3',
        ],
        title: 'Title of First Carousel Item',
        description: 'This is a description of a carousel item.',
        image: new Image({
          url: IMG_URL_AOG,
          alt: 'Image alternate text',
        }),
      },
      // Add the second item to the carousel
      [SELECTION_KEY_GOOGLE_HOME]: {
        synonyms: [
          'Google Home Assistant',
          'Assistant on the Google Home',
        ],
        title: 'Google Home',
        description: 'Google Home is a voice-activated speaker powered by ' +
          'the Google Assistant.',
        image: new Image({
          url: IMG_URL_GOOGLE_HOME,
          alt: 'Google Home',
        })
      }
    }
  }));

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