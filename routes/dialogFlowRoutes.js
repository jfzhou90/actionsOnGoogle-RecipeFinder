const keys = require('../config/keys');

module.exports = app => {
  app.post('/api/dialogflow', (request, response) => {
    return response.send({ speech: "hi", displayText: "hi", source: "webhook-charlie" });
  })
}