var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = express();

const os = require('os');


app.get('/api', function(req, res) {
    res.send( generateAnimals() );
});

app.listen(3000, function () {
   console.log('Accepting HTTP request on port 3000');
});


function generateAnimals() {
    var numberOfAnimals = chance.integer({min: 1, max: 10});
    console.log(numberOfAnimals);
	
    var animals = [];
	
	animals.push({
		hostname: os.hostname()
	});
		
    for (var i = 0; i < numberOfAnimals; i++) {
        var rnd = chance.integer({min: 0, max: 1});
        animals.push({
            typeOfAnimal: chance.animal({type: 'ocean'})
        });
    }
	
    console.log(animals);
    return animals;
}