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

    if (request) {
      console.log(request);
      // reply.payload.google.richResponse.items[0].simpleResponse["textToSpeech"] = "Response 2";
    }


    return response.json(reply);
  })
}