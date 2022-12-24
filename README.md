# Labo HTTP Infra
Auteurs: Grégoire Guyot, Pablo Urizar

## Étape 1: Serveur HTTP statique avec apache httpd

Nous avons suivi la vidéo de présentation et nous avons choisi l'image `php:7.2-apache` dans le but d'avoir une configuration de base fonctionnelle. Les fichiers de notre site statique se trouvent dans `/var/www/html/`.

Pour construire l'image Docker, nous avons utilisé le même nom que dans la vidéo de présentation:
```bash
docker build -t res/apache_php .
```

Ensuite, nous pouvons lancer le container que nous pourrions y accéder en localhost avec:
```bash
docker run -p 9090:80 res/apache_php
```

Nous avons remplacé notre simple fichier `index.html` par le template de Bootstrap [Gp](https://bootstrapmade.com/gp-free-multipurpose-html-bootstrap-template/) afin d'avoir une page web plus agréable.


## Step 2: Serveur HTTP dynamique avec express.js

Pour démarrer une nouvelle application node.js nous avons utilisé la commande:
```bash
npm init
```

On installe les modules npm `chance` et `express` car nous en avons besoin pour tester une application simple sous node.js
```bash
npm install chance --save
```

```bash
npm install express --save
```

Le flag `save` est utilisé car nous aimerions enregistrer l'indépendance.

Nous avons d'abord testé le bon fonctionnement de notre application `index.js` en l'exécutant en local comme suit:
```bash
node index.js
```
Nous avons le résultat attendu. Notre application écoute sur le port 3000 et nous pouvons ensuite nous connecter soit via telnet:
```bash
telnet localhost 3000
```

Soit directement depuis un navigateur à l'adresse `http://localhost:3000/`.

Pour construire l'image Docker:
```bash
docker build -t res/express .
```

Ensuite, pour lancer notre container:
```bash
docker run -d --platform=linux/amd64 res/express
```

Le flag `platform` a dû être utilisé car nous avons réalisé cette étape sur un processeur ayant une architecture ARM 64 bits.

### To-do
Problème pour nous connecter sur le container après avoir récupéré son adresse IP avec la commande:
```bash
docker inspect <nomContainer>
```

Et:
```bash
telnet 172.17.0.2 3000
```


### Webcast


## Step 3: Docker compose to build the infrastructure

There are no Webcasts (yet) for this part.

The goal of this step is to use Docker compose to deploy a first version of the infrastructure with a single static and a single dynamic Web server.

* You will need to install Docker compose on your machine. You'll find the instructions [on this link](https://docs.docker.com/compose/).
* You will need to write a `docker-compose.yml` file. To do this, read the [introduction](https://docs.docker.com/compose/features-uses/), then have a look at this [tutorial](https://docs.docker.com/compose/gettingstarted/). They should provide the information you need to write your docker-compose file.

### Acceptance criteria

* You have added a `docker-compose.yml` file to your GitHub repo.
* You can start and stop an infrastructure with a single dynamic and a single static Web server using docker compose.
* You can access both Web servers on your local machine on the respective ports.
* You have **documented** your configuration in your report.

## Step 3: Reverse proxy with Traefik

The goal of this step is to run a reverse proxy in front of the dynamic and static Web servers such that the reverse proxy receives all connections and relays them to the respective Web server. 

*(Several old Webcasts are available ([5a](https://www.youtube.com/watch?v=iGl3Y27AewU) [5b](https://www.youtube.com/watch?v=lVWLdB3y-4I) [5c](https://www.youtube.com/watch?v=MQj-FzD-0mE) [5d](https://www.youtube.com/watch?v=B_JpYtxoO_E) [5e](https://www.youtube.com/watch?v=dz6GLoGou9k)) which show a methods to do this with Apache.
However, **we do not recommend anymore to follow this method** but instead to use a more modern approach, based on [Traefik](https://traefik.io/traefik/). Traefik is a reverse proxy which interfaces directly with Docker to obtain the list of active backend servers. This means that it can dynamically adjust to the number of running server.)*

The steps to follow for this section are thus:

* read the [Traefik Quick Start](https://doc.traefik.io/traefik/getting-started/quick-start/) documentation and add a new service "reverse_proxy" to your `docker-compose.yml` file using the Traefik docker image
* configure the Traefik service and the communication between the Web servers and Traefik:
  * first read the documentation of Traefik, including those ones:
    * the [Traefik Router](https://doc.traefik.io/traefik/routing/routers/) documentation, in particular the "Rule" section,
    * the [Traefik & Docker](https://doc.traefik.io/traefik/routing/providers/docker/) documentation, in particular for the dynamic Web server. 
  * then implement the reverse proxy:
    * start by relaying the requests coming to "localhost/" to the **static HTTP server** (that's the easy part),
    * then relay the requests coming to "localhost/api/" to the **dynamic HTTP server** (here you will need to search a little bit in the documentation how to use the "/api" path prefix),

### Acceptance criteria

* You have a GitHub repo with everything needed to build the various images.
* You can do a demo where you start from an "empty" Docker environment (no container running) and using docker compose you can start your infrastructure with 3 containers: static server, dynamic server and reverse proxy
* In the demo you can access each Web server from the browser in the demo. You can prove that the routing is done correctly through the reverse proxy.
* You are able to explain how you have implemented the solution and walk us through the configuration and the code.
* You are able to explain why a reverse proxy is useful to improve the security of the infrastructure.
* You have **documented** your configuration in your report.


## Step 3a: Dynamic cluster management

The goal of this section is to allow Traefik to dynamically detect several instances of the (dynamic/static) Web servers. You may have already done this in the previous step 3.

Modify your `docker-compose.yml` file such that several instances of each Web server are started. Check that the reverse proxy distributes the connections between the different instances.

### Acceptance criteria

* The modified `docker-compose.yml` file is in your GitHub repo.
* You can use docker compose to start the infrastructure with several instances of each Web server.
* You can do a demo to show that Traefik performs load balancing among the instances.
* If you add or remove instances, you can show that the load balancer is dynamically updated to use the available instances.
* You have **documented** your configuration in your report.

## Step 4: AJAX requests with JQuery

The goal of the step is to use AJAX requests to dynamically update a Web page every few seconds with data coming from the dynamic Web server.

Note: in the webcast we introduce you to JQuery, but you can also use the more modern [JavaScript Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) to easily make AJAX requests.

### Webcasts

* [Labo HTTP (4): AJAX avec JQuery](https://www.youtube.com/watch?v=fgpNEbgdm5k)

### Acceptance criteria

* You have a GitHub repo with everything needed to build the various images.
* You can do a complete, end-to-end demonstration: the web page is dynamically updated every few seconds (with the data coming from the dynamic backend).
* You are able to prove that AJAX requests are sent by the browser and you can show the content of the responses.
* You have **documented** your configuration in your report.

## Step 5: Load balancing: round-robin and sticky sessions

By default, Traefik uses Round Robin to distribute the load among all available instances. However, if a service is stateful, it would be better to send requests of the same session always to the same instance. This is called sticky sessions.

The goal of this step is to change the configuration such that:

* Traefik uses sticky session for the static Web server instances
* Traefik continues to use round robin for the dynamic servers (no change required)

### Acceptance criteria

* You do a setup to demonstrate the notion of sticky session.
* You prove that your load balancer can distribute HTTP requests in a round-robin fashion to the dynamic server nodes (because there is no state).
* You prove that your load balancer can handle sticky sessions when forwarding HTTP requests to the static server nodes.
* You have **documented** your configuration and your validation procedure in your report.

## Step 6: Management UI

The goal of this step is to deploy or develop a Web app that can be used to monitor and update your Web infrastructure dynamically. You should be able to list running containers, start/stop them and add/remove instances.

There are two options for this step:

* you use an existing solution (search on Google)
* you develop your own Web app (e.g. with express.js). In this case, you can use the Dockerode npm module (or another Docker client library, in any of the supported languages) to access the docker API.

### Acceptance criteria

* You can do a demo to show the Management UI and manage the containers of your infrastructure.
* You have **documented** your configuration in your report.
