const fakeData = require('./initial-data/initializaData');
const express = require('express');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
const routes = require('./routes/dialogFlowRoutes')
const WtoN = require('words-to-num');
const request = require('request');
const { dialogflow, BasicCard, BrowseCarousel, Carousel, Image, LinkOutSuggestion, ListSimpleResponse } = require('actions-on-google');
const baseUrl = 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/';
const apiKey = 'kVM7CT6wCYmshTU7EIozWKueIIuvp1T4lifjsn8lzCKEbe9W7d';
const host = 'spoonacular-recipe-food-nutrition-v1.p.mashape.com'

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
googleflow.intent('Query Recipe', async conv => {
  if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
    conv.ask('Sorry, try this on a screen device.');
    return;
  }

  let searchResult = fakeData.getAll();
  let options = {
    url: baseUrl + `search?number=10&offset=0&query=${conv.body.queryResult.parameters.food}`,
    headers: {
      'X-Mashape-Key': apiKey,
      'X-Mashape-Host': host
    },
  };

  // Replace this with fake data with request call when app is ready for deployment
  await request.get(options, function (error, response, body) {
    if(body){
      console.log(body);
      searchResult = body;
    }
  });

  sessionsStorage[conv.id] = {};
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
  sessionsStorage[conv.id].currentRecipe = {}
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
  if (!sessionsStorage[conv.id] || !sessionsStorage[conv.id].currentRecipe.ingredients || sessionsStorage[conv.id].currentRecipe.ingredients.length == 0) {
    conv.ask("I don't have anything. Let's find a recipe together.");
    return;
  }
  let allIngredients = sessionsStorage[conv.id].currentRecipe.ingredients.join('.\n');
  sessionsStorage[conv.id].currentRecipe.counter = sessionsStorage[conv.id].currentRecipe.ingredients.length;
  let response = `${allIngredients}.\n Would you like me to read the instructions?`;
  sessionsStorage[conv.id].currentRecipe.currentStep = response;
  conv.ask(response);
});

googleflow.intent('Step by Step', conv => {
  if (!sessionsStorage[conv.id] || sessionsStorage[conv.id].currentRecipe.ingredients.length == 0 || sessionsStorage[conv.id].currentRecipe.instructions.length == 0) {
    conv.ask("I don't have anything. Let's find a recipe together.");
    return;
  }

  let count = sessionsStorage[conv.id].currentRecipe.counter;
  let ingredientLength = sessionsStorage[conv.id].currentRecipe.ingredients.length
  let instructionLength = sessionsStorage[conv.id].currentRecipe.instructions.length
  let totalSteps = ingredientLength + instructionLength;

  if (count < ingredientLength) {
    sessionsStorage[conv.id].currentRecipe.currentStep = sessionsStorage[conv.id].currentRecipe.ingredients[count];
    let response = sessionsStorage[conv.id].currentRecipe.ingredients[count];
    if (count == ingredientLength - 1) {
      response += `. \nThat is the last ingredient, let's start cooking. Ready?`
    }
    conv.ask(response);
    count++;
    sessionsStorage[conv.id].currentRecipe.counter = count;
    return;
  }

  if (count < totalSteps) {
    let newCount = count - ingredientLength;
    let response = sessionsStorage[conv.id].currentRecipe.instructions[newCount];
    sessionsStorage[conv.id].currentRecipe.currentStep = response;
    if (newCount == instructionLength - 1) {
      response += ". \nThat's the last step, please enjoy."
    }
    conv.ask(`Step ${newCount + 1}: ${response}`);
    count++;
    sessionsStorage[conv.id].currentRecipe.counter = count;
    return;
  }
  conv.ask('Hmm, there are no steps left, would you like to find another recipe?')
});

googleflow.intent('Repeat Step', conv => {
  if (!sessionsStorage[conv.id] || !sessionsStorage[conv.id].currentRecipe.instructions) {
    conv.ask("Hmmm? I don't remember that we looked for any recipe, let's try finding one together.")
    return;
  }
  let step = conv.body.queryResult.parameters.number;
  let stepNumber = WtoN.convert(step);
  if (step == 'first') {
    stepNumber = 1;
  } else if (step == 'second') {
    stepNumber = 2;
  } else if (step == 'third') {
    stepNumber = 3;
  } else if (conv.body.queryResult.queryText.includes('last')) {
    stepNumber = sessionsStorage[conv.id].currentRecipe.instructions.length;
  }

  if (!sessionsStorage[conv.id].currentRecipe.instructions[stepNumber - 1]) {
    conv.ask("Sorry, I don't think I know that step, could you try again?");
    return;
  }
  let response = sessionsStorage[conv.id].currentRecipe.instructions[stepNumber - 1];
  sessionsStorage[conv.id].currentRecipe.currentStep = response;
  sessionsStorage[conv.id].currentRecipe.counter = sessionsStorage[conv.id].currentRecipe.ingredients.length + stepNumber;
  conv.ask(`Step ${stepNumber}: ${response}`);
});

googleflow.intent('Find Ingredient', conv => {
  if (!sessionsStorage[conv.id] || !sessionsStorage[conv.id].currentRecipe || !sessionsStorage[conv.id].currentRecipe.ingredients) {
    conv.ask("Hmmm? I don't remember that we looked for any recipe, let's try finding one together.")
    return;
  }

  let allIngredientsArray = sessionsStorage[conv.id].currentRecipe.ingredients;
  let term = conv.body.queryResult.parameters.ingredients
  var splits = term.split(' ', 1);
  let matchedIngredient = allIngredientsArray.filter(ingredient => ingredient.includes(splits[0]));

  if (!matchedIngredient || matchedIngredient.length == 0) {
    conv.ask("Don't think we're using that ingredient. Are you sure we're putting that into our food?");
    return;
  }
  conv.ask(matchedIngredient[0]);
});

googleflow.intent('Repeat', conv => {
  if (!sessionsStorage[conv.id] || !sessionsStorage[conv.id].currentRecipe || !sessionsStorage[conv.id].currentRecipe.currentStep) {
    conv.ask("Hmmm? I don't remember that we looked for any recipe, let's try finding one together.")
    return;
  }
  conv.ask(sessionsStorage[conv.id].currentRecipe.currentStep);
});

googleflow.intent('Restart', conv => {
  if (!sessionsStorage[conv.id] || !sessionsStorage[conv.id].currentRecipe || !sessionsStorage[conv.id].currentRecipe.currentStep) {
    conv.ask("Hmmm? I don't remember that we looked for any recipe, let's try finding one together.")
    return;
  }
  sessionsStorage[conv.id].currentRecipe.counter = 0;
  conv.ask('Would you like me to real all ingredients or one at a time?');
});

// Intent in Dialogflow called `Goodbye`
googleflow.intent('Goodbye', conv => {
  conv.close('Thanks for cooking with me. See you later!')
})

googleflow.intent('Default Fallback Intent', conv => {
  conv.ask(`I didn't understand. Can you repeat that??`)
})

express().use(bodyParser.json(), app, googleflow).listen(process.env.PORT || 8000, function () {
  console.log(`Server up and listening on ${process.env.PORT || 8000} `);
});