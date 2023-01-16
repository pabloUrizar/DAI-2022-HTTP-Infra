setInterval(async() => {

    const animals = await fetch('/api/').then(response => response.json());
	
	send = "Session ID : " + animals[0].hostname;

    if (animals.length > 0) {
        send += "  Ocean animals : " + animals[1].typeOfAnimal;
    }

    document.getElementById("api-animals").innerHTML = send}, 4000)