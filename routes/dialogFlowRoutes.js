// request.body.originalDetectIntentRequest.payload.user.userId
// request.body.originalDetectIntentRequest.payload.conversation.conversationId

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
      // console.log(request.body)
      // reply.payload.google.richResponse.items[0].simpleResponse["textToSpeech"] = "Response 2";
      reply.payload['google']= {
        "expectUserResponse": true,
        "expectedInputs": [
            {
                "inputPrompt": {
                    "richInitialPrompt": {
                        "items": [
                            {
                                "simpleResponse": {
                                    "textToSpeech": "Math and prime numbers it is!"
                                }
                            },
                            {
                                "basicCard": {
                                    "title": "Math & prime numbers",
                                    "formattedText": "42 is an even composite number. It\n    is composed of three distinct prime numbers multiplied together. It\n    has a total of eight divisors. 42 is an abundant number, because the\n    sum of its proper divisors 54 is greater than itself. To count from\n    1 to 42 would take you about twenty-one…",
                                    "image": {
                                        "url": "https://example.google.com/42.png",
                                        "accessibilityText": "Image alternate text"
                                    },
                                    "buttons": [
                                        {
                                            "title": "Read more",
                                            "openUrlAction": {
                                                "url": "https://example.google.com/mathandprimes"
                                            }
                                        }
                                    ],
                                    "imageDisplayOptions": "CROPPED"
                                }
                            }
                        ],
                        "suggestions": []
                    }
                },
                "possibleIntents": [
                    {
                        "intent": "actions.intent.TEXT"
                    }
                ]
            }
        ]
    }
    }


    return response.json(reply);
  })
}