const keys = require('../config/keys');

module.exports = app => {
  app.post('/api/dialogflow', (request, response) => {
    console.log(request);
    return response.send({ speech: "hi", displayText: "hi", source: "webhook-charlie" });
  }),
  
  app.get('/api/current_user', (req, res) => {
    res.send(req.user)
  })
}