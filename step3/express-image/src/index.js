var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = express();

app.get('/api', function(req, res) {
    res.send( generateAnimals() );
});

app.listen(3000, function () {
   console.log('Accepting HTTP request on port 3000');
});

function generateAnimals() {
    var numberOfAnimals = chance.integer({min: 0, max: 10});

    console.log(numberOfAnimals);
    var animals = [];
    for (var i = 0; i < numberOfAnimals; i++) {
        var rnd = chance.integer({min: 0, max: 1});
        animals.push({
            typeOfAnimal: chance.animal({type: 'pet'})
        });
    }
    console.log(animals);
    return animals;
}