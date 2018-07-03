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

  // Pre-flight Request
  if ('OPTIONS' == request.method) {
    return response.status(200).send();
  }

  next();
});

//----------------------------------------------------------- DialogFlow Side ------------------------------------------------------------------//
// stores sessions locally, resets everytime heroku sleeps or resets
let sessionsStorage = {}

// Create an app instance
const googleflow = dialogflow();

// Middleware
googleflow.middleware((conv) => {
  conv.hasScreen =
    conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
  conv.hasAudioPlayback =
    conv.surface.capabilities.has('actions.capability.AUDIO_OUTPUT');
});

// -------------------------- Register handlers for Dialogflow intents --------------------//
googleflow.intent('Default Welcome Intent', conv => {
  conv.ask('Hi, I\'m Charlie, I\'m your recipe buddy. What shall we cook today?');
  conv.ask(new Image({
    url: 'https://cdn.pixabay.com/photo/2016/01/10/18/59/charlie-brown-1132276_960_720.jpg',
    alt: 'Charlie Brown',
  }))
})

// Intent in Dialogflow called `Query Recipe`
googleflow.intent('Query Recipe', conv => {
  sessionsStorage[conv.id] = { currentRecipe: {} };

  if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
    conv.ask('Sorry, try this on a screen device.');
    return;
  }

  // Replace this with fake data with request call when app is ready for deployment
  let searchResult = fakeData.getAll();

  if (searchResult.results.length > 2) {
    let carouselObj = { items: {} };

    // for each search result, create an detail obj in the carouselObj.items
    searchResult.results.forEach(dish => {
      carouselObj.items[dish.title] = {
        title: dish.title,
        description: `${dish.servings} servings.\n Ready in ${dish.readyInMinutes} minutes.`,
        image: new Image({
          url: searchResult.baseUri + dish.imageUrls,
          alt: dish.title
        })
      }
      // saving current search to session, so it can be used later
      sessionsStorage[conv.id][dish.title] = { id: dish.id, url: searchResult.baseUri + dish.imageUrls }
    });

    conv.ask(`Here are some of recipes for ${conv.body.queryResult.parameters.food}. Click on one to get started.`);
    // Create a carousel
    conv.ask(new Carousel(carouselObj));
  }
})

googleflow.intent('Item Selected', (conv, params, option) => {
  let response = 'You did not select any item from the list or carousel';
  if (option && sessionsStorage[conv.id].hasOwnProperty(option)) {
    sessionsStorage[conv.id].currentRecipe.id = sessionsStorage[conv.id][option].id;

    response = `You have selected ${option}. Would you like me to read all the ingredients or one at a time?`;
  } else {
    response = 'You selected an unknown item from the carousel';
  }

  conv.ask(response);
  conv.ask(new BasicCard({
    image: new Image({
      url: sessionsStorage[conv.id][option].url,
      alt: option
    })
  }))

  // prefetch recipes here. replace getOne() with request call when app ready for deploy
  let recipe = fakeData.getOne();
  sessionsStorage[conv.id].currentRecipe.ingredients = [];
  sessionsStorage[conv.id].currentRecipe.instructions = [];
  sessionsStorage[conv.id].currentRecipe.currentStep = null;
  sessionsStorage[conv.id].currentRecipe.counter = 0;

  recipe.extendedIngredients.forEach(ingredient => {
    sessionsStorage[conv.id].currentRecipe.ingredients.push(ingredient.originalString);
  })

  recipe.analyzedInstructions[0].steps.forEach(step => {
    sessionsStorage[conv.id].currentRecipe.instructions.push(step.step);
  })
});

// read all ingredients
googleflow.intent('All Ingredients', conv => {
  console.log(sessionsStorage[conv.id])
  if (!sessionsStorage[conv.id] || !sessionsStorage[conv.id].currentRecipe.ingredients || sessionsStorage[conv.id].currentRecipe.ingredients.length == 0) {
    conv.ask("I don't have anything. Let's find a recipe together.");
    return;
  }
  let allIngredients = sessionsStorage[conv.id].currentRecipe.ingredients.join('\n');
  sessionsStorage[conv.id].currentRecipe.counter = sessionsStorage[conv.id].currentRecipe.ingredients.length;

  conv.ask(`${allIngredients}\n Would you like me to read the instructions?`);
});

googleflow.intent('Step by Step', conv => {
  console.log(sessionsStorage[conv.id])
  console.log(sessionsStorage[conv.id].currentRecipe.ingredients.length);
  console.log(sessionsStorage[conv.id].currentRecipe.instructions.length);
  if (!sessionsStorage[conv.id] || sessionsStorage[conv.id].currentRecipe.ingredients.length == 0 || sessionsStorage[conv.id].currentRecipe.instructions.length == 0) {
    conv.ask("I don't have anything. Let's find a recipe together.");
    return;
  }
  
  let count = sessionsStorage[conv.id].currentRecipe.counter;
  if(count < sessionsStorage[conv.id].currentRecipe.ingredients.length){
    sessionsStorage[conv.id].currentRecipe.currentStep = sessionsStorage[conv.id].currentRecipe.ingredients[count];
    conv.ask(sessionsStorage[conv.id].currentRecipe.ingredients[count]);
    sessionsStorage[conv.id].currentRecipe.counter = count++;
  }
  console.log(sessionsStorage[conv.id].currentRecipe)

});

googleflow.intent('Repeat', conv => {
  if(!sessionsStorage[conv.id] || !sessionsStorage[conv.id].currentRecipe || !sessionsStorage[conv.id].currentRecipe.currentStep){
    conv.ask("Hmmm? I don't remember that we looked for any recipe, let's try finding one together.")
  }
  conv.ask(sessionsStorage[conv.id].currentRecipe.currentStep);
});

// Intent in Dialogflow called `Goodbye`
googleflow.intent('Goodbye', conv => {
  conv.close('See you later!')
})

googleflow.intent('Default Fallback Intent', conv => {
  conv.ask(`I didn't understand. Can you repeat that??`)
})

express().use(bodyParser.json(), app, googleflow).listen(process.env.PORT || 8000, function () {
  console.log(`Server up and listening on ${process.env.PORT || 8000} `);
});