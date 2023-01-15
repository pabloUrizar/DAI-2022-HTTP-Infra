setInterval(async() => {

    const animals = await fetch('/api/').then(response => response.json());

    if (animals.length > 0) {
        send = "Ocean animals : " + animals[0].typeOfAnimal;
    }

    document.getElementById("api-animals").innerHTML = send}, 4000)