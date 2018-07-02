// request.body.originalDetectIntentRequest.payload.user.userId

const keys = require('../config/keys');

module.exports = app => {
  app.post('/api/dialogflow', (request, response) => {
    let reply = {
      "payload": {
        "google": {
          "expectUserResponse": true,
          "richResponse": {
            "items": [
              {
                "simpleResponse": {
                  "textToSpeech": "Response 1"
                }
              }
            ]
          }
        }
      }
    };

    if (request.body.queryResult.action == 'input.queryrecipe') {
      console.log(request.body.originalDetectIntentRequest.payload.user.userId);
      reply.payload.google.richResponse.items[0].simpleResponse["textToSpeech"] = "Response 2";
    }


    return response.json(reply);
  })
}