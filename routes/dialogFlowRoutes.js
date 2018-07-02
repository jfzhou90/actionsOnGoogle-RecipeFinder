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
                  "textToSpeech": "Reponse 1"
                }
              }
            ]
          }
        }
      }
    };

    if(request.actions == "input.queryrecipe") {
      reply.payload.google.richResponse.items[0].simpleResponse.textToSpeech = "Response 2";
    }

    
    return response.json({
      "payload": {
        "google": {
          "expectUserResponse": true,
          "richResponse": {
            "items": [
              {
                "simpleResponse": {
                  "textToSpeech": "this is a simple response"
                }
              }
            ]
          }
        }
      }
    });
  })
}