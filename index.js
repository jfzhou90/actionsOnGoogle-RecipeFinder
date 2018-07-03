const fakeData = require('./initial-data/initializaData');
const express = require('express');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
const routes = require('./routes/dialogFlowRoutes')

// const app = express();
// app.use(
//   bodyParser.urlencoded({
//     extended: true
//   })
// );

// app.use(bodyParser.json());

// app.use(function(request, response, next) {
//   response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Authentication");
//   response.header("Access-Control-Allow-Origin", "*");
  
//   // Pre-flight Request
//   if ('OPTIONS' == request.method) {
//       return response.status(200).send();
//   }

//   next();
// });

const {
  dialogflow,
  Image,
} = require('actions-on-google')

// Create an app instance

const app = dialogflow()

// Register handlers for Dialogflow intents

app.intent('Default Welcome Intent', conv => {
  conv.ask('Hi, how is it going?')
  conv.ask(`Here's a picture of a cat`)
  conv.ask(new Image({
    url: 'https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/imgs/160204193356-01-cat-500.jpg',
    alt: 'A cat',
  }))
})

// Intent in Dialogflow called `Goodbye`
app.intent('Goodbye', conv => {
  conv.close('See you later!')
})

app.intent('Default Fallback Intent', conv => {
  conv.ask(`I didn't understand. Can you tell me something else?`)
})

require('./routes/dialogFlowRoutes')(app);

express().use(bodyParser.json(), app).listen(process.env.PORT || 8000, function () {
  fakeData.initializeData();
  console.log(`Server up and listening on ${process.env.PORT || 8000} `);
});