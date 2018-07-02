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
      reply.payload['google'] = "expectedInputs": [
        {
          "inputPrompt": {
            "initialPrompts": [
              {
                "textToSpeech": "Alright! Here are a few things you can learn. Which sounds interesting?"
              }
            ],
            "noInputPrompts": []
          },
          "possibleIntents": [
            {
              "intent": "actions.intent.OPTION",
              "inputValueData": {
                "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",
                "listSelect": {
                  "title": "Things to learn about",
                  "items": [
                    {
                      "optionInfo": {
                        "key": "MATH_AND_PRIME",
                        "synonyms": [
                          "math",
                          "math and prime",
                          "prime numbers",
                          "prime"
                        ]
                      },
                      "title": "Math & prime numbers",
                      "description": "42 is an abundant number because the sum of its proper divisors 54 is greater…",
                      "image": {
                        "url": "http://example.com/math_and_prime.jpg",
                        "accessibilityText": "Math & prime numbers"
                      }
                    },
                    {
                      "optionInfo": {
                        "key": "EGYPT",
                        "synonyms": [
                          "religion",
                          "egpyt",
                          "ancient egyptian"
                        ]
                      },
                      "title": "Ancient Egyptian religion",
                      "description": "42 gods who ruled on the fate of the dead in the afterworld. Throughout the under…",
                      "image": {
                        "url": "http://example.com/egypt",
                        "accessibilityText": "Egypt"
                      }
                    },
                    {
                      "optionInfo": {
                        "key": "RECIPES",
                        "synonyms": [
                          "recipes",
                          "recipe",
                          "42 recipes"
                        ]
                      },
                      "title": "42 recipes with 42 ingredients",
                      "description": "Here's a beautifully simple recipe that's full of flavor! All you need is some ginger and…",
                      "image": {
                        "url": "http://example.com/recipe",
                        "accessibilityText": "Recipe"
                      }
                    }
                  ]
                }
              }
            }
          ]
        }
      ]
    }


    return response.json(reply);
  })
}