const fs = require('fs');

let cauliflower = [];
let individualCauliflower;

module.exports = {
    initializeData() {
        // Reading cauliflower-search.json file and pushing it to an array.
        fs.readFile(__dirname + '/dataA.json', 'utf8', function (error, data) {
            if (error) throw error;
            cauliflower = JSON.parse(data);
            console.log(`Server setup: ${cauliflower.results.length} types cauliflower dishes loaded.`);
        });

        // Reading pan-roasted-cauliflower.json file and pushing it to an array.
        fs.readFile(__dirname +'/pan-roasted-cauliflower.json', 'utf8', function (error, data) {
            if (error) throw error;
            individualCauliflower = JSON.parse(data);
            console.log(`Server setup: ${individualCauliflower.spoonacularSourceUrl} loaded.`);
        });
    },

    getAll() {
        return cauliflower;
    },

    getSpecific() {
        return individualCauliflower;
    }
}