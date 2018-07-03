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

// --------------------------------------------------------------test data--------------------------------------------------------------//

// Constants for list and carousel selection
const SELECTION_KEY_GOOGLE_ALLO = 'googleAllo';
const SELECTION_KEY_GOOGLE_HOME = 'googleHome';
const SELECTION_KEY_GOOGLE_PIXEL = 'googlePixel';
const SELECTION_KEY_ONE = 'title';

// Constant for image URLs
const IMG_URL_AOG = 'https://developers.google.com/actions/images/badges' +
  '/XPM_BADGING_GoogleAssistant_VER.png';
const IMG_URL_GOOGLE_ALLO = 'https://allo.google.com/images/allo-logo.png';
const IMG_URL_GOOGLE_HOME = 'https://lh3.googleusercontent.com' +
  '/Nu3a6F80WfixUqf_ec_vgXy_c0-0r4VLJRXjVFF_X_CIilEu8B9fT35qyTEj_PEsKw';
const IMG_URL_GOOGLE_PIXEL = 'https://storage.googleapis.com/madebygoog/v1' +
  '/Pixel/Pixel_ColorPicker/Pixel_Device_Angled_Black-720w.png';
const IMG_URL_MEDIA = 'http://storage.googleapis.com/automotive-media/album_art.jpg';
const MEDIA_SOURCE = 'http://storage.googleapis.com/automotive-media/Jazz_In_Paris.mp3';

// Constants for selected item responses
const SELECTED_ITEM_RESPONSES = {
  [SELECTION_KEY_ONE]: 'You selected the first item in the list or carousel',
  [SELECTION_KEY_GOOGLE_HOME]: 'You selected the Google Home!',
  [SELECTION_KEY_GOOGLE_PIXEL]: 'You selected the Google Home!',
  [SELECTION_KEY_GOOGLE_PIXEL]: 'You selected the Google Pixel!',
  [SELECTION_KEY_GOOGLE_ALLO]: 'You selected Google Allo!',
};



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
  const a11yText = 'Google Assistant Bubbles';
  const googleUrl = 'https://google.com';
  if (!conv.hasScreen) {
    conv.ask('Sorry, try this on a screen device or select the ' +
      'phone surface in the simulator.');
    return;
  }
  conv.ask('This is an example of a "Browse Carousel"');
  // Create a browse carousel
  conv.ask(new BrowseCarousel({
    items: [
      new BrowseCarouselItem({
        title: 'Title of item 1',
        url: googleUrl,
        description: 'Description of item 1',
        image: new Image({
          url: IMG_URL_AOG,
          alt: a11yText,
        }),
        footer: 'Item 1 footer',
      }),
      new BrowseCarouselItem({
        title: 'Title of item 2',
        url: googleUrl,
        description: 'Description of item 2',
        image: new Image({
          url: IMG_URL_AOG,
          alt: a11yText,
        }),
        footer: 'Item 2 footer',
      }),
    ],
  }));
});

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