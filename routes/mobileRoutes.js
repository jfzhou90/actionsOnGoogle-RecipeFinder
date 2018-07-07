const axios = require("axios");
const keys = require('./config/keys');

const passport = require('passport');

module.exports = app => {
    app.get('/api/randomRecipe', async (request, response) => {
        try {
            const response = await axios({
              method: 'get',
              url: 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/food/trivia/random',
              headers: {
                'X-Mashape-Key': [keys.apiKey],
                'X-Mashape-Host': [keys.host]
              }
            }).then(response => {
              searchResult = response.data;
              console.log("Random Recipe Sent");
              return response.send(searchResult)
            })
          } catch (error) {
            console.log(error);
          }
    })
}