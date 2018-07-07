const axios = require("axios");
const keys = require('../config/keys');

const passport = require('passport');

module.exports = app => {
    app.get('/api/randomRecipe', async (request, response) => {
        try {
            let result = await axios({
              method: 'get',
              url: 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/random?number=1',
              headers: {
                'X-Mashape-Key': [keys.apiKey],
                'X-Mashape-Host': [keys.host]
              }
            })
            console.log(result.data)
            return response.send(JSON.stringify(result.data))
          } catch (error) {
            console.log(error);
          }
    })
}