const axios = require("axios");
const keys = require('../config/keys');

const passport = require('passport');
const fakeData = require('../initial-data/initializaData');

module.exports = app => {
    app.get('/api/randomRecipe', async (request, response) => {
        let fakeOne = fakeData.getOne();
        try {
            let result = await axios({
              method: 'get',
              url: 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/random?number=1',
              headers: {
                'X-Mashape-Key': [keys.apiKey],
                'X-Mashape-Host': [keys.host]
              }
            })
            return response.send(JSON.stringify(result.data.recipes[0]))
            // return response.send(fakeOne)
          } catch (error) {
            console.log(error);
          }
    })
}