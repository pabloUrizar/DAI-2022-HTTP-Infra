# Labo HTTP Infra
Auteurs: Grégoire Guyot, Pablo Urizar

## Étape 1: Serveur HTTP statique avec apache httpd

Nous avons suivi la vidéo de présentation et nous avons choisi l'image `php:7.2-apache` dans le but d'avoir une configuration de base fonctionnelle. Les fichiers de notre site statique se trouvent dans `/var/www/html/`.

Pour construire l'image Docker :
```bash
docker build -t http_statique .
```

Ensuite, pour lancer le container que nous pourrions accéder en localhost :
```bash
docker run -d --name apache_http_statique -p 9090:80 http_statique
```

Pour arrêter le conteneur de notre seveur HTTP statique :
```bash
docker stop apache_http_statique
```

Des scripts bash (`build.sh`, `run.sh` et `run.sh`) ont été créés pour faciliter ces manipulations.

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
docker build -t http_dynamique .
```

Ensuite, pour lancer notre container:
```bash
docker run -d --rm --name node_http_dynamique -p 3000:3000 --platform=linux/amd64 http_dynamique
```

Le flag `platform` a dû être utilisé car nous avons réalisé cette étape sur un processeur ayant une architecture ARM 64 bits. Cependant, le comportement est incertain car de fois ce flag il n'a pas dû être utilisé sur la même machine.

Finalement, pour arrêter le conteneur de notre serveur HTTP dynamique :
```bash
docker stop node_http_dynamique
```

Des scripts bash (`build.sh`, `run.sh` et `run.sh`) ont été créés pour faciliter ces manipulations pour pour le serveur HTTP statique.


## Step 3: Docker compose pour construire l'infrastructure

Nous avons créé notre fichier `docker-compose.yml` avec la configuration nécessaire pour démarrer et arrêter notre infrastructure avec un serveur web statique et dynamique.

La première fois que nous lançons l'infrastructure, nous devons extraire les images configurées sous le noeud `services`, les télécharger et finalement les monter avec la commande:
```bash
docker compose up
```

Pour lancer notre infrastructure, donc les containers existants de notre service, il faut lancer la commande:
```bash
docker compose start
```

Finalement, pour arrêter les différents services de notre infrastructure, nous devons lancer la commande:
```bash
docker compose stop
```

Nous avons configuré notre fichier `docker-compose.yml`pour pouvoir accéder au serveur web statique en localhost sur le port **8080** et au serveur web dynamique sur le port **3000**.




## Step 3: Reverse proxy avec Traefik

En premier lieu, un reverse proxy est un type de serveur placé, en général, au-devant des applications web. Il agit comme un intermédiaire de communication liant un réseau public à un réseau privé.

Pour cette étape nous avons utilisé le reverse proxy `Traefik`. De nombreuses solutions existent, cependant, `Traefik` permet de suivre automatiquement le cycle de vie des conteneurs qui apparaissaient et disparaissaient rapidement. L'objectif de cette étape est d'exécuter un reverse-proxy au devant des serveurs web (statique et dynamique) de sorte que le reverse-proxy reçoive toutes les connexions et les dirige au serveur respectif.

Nous avons ajouté comme service l'image `traefik:v2.9` dans notre fichier docker-compose.yml et l'avons configuré. Pour HTTP nous utilisons le port 80 et le port 8080 pour l'interface web de Traefik.
```yml
version: "3.9"
services:
    reverse-proxy:
        # The official v2 Traefik docker image
        image: traefik:v2.9
        # Enables the web UI and tells Traefik to listen to docker
        command:
            --api.insecure=true --providers.docker
        ports:
            - "80:80"       # The HTTP port
            - "8080:8080"   # The Web UI (enabled by --api.insecure=true)
        volumes:
            # So that Traefik can listen to the Docker events
            - /var/run/docker.sock:/var/run/docker.sock
```

Configuration nécessaire dans le fichier docker-compose.yml pour rediriger les requêtes venant de `localhost/`vers notre serveur web HTTP statique:
```yml
web-static:
    build: apache-php-image/.
    ports:
        - "80"
    labels:
        - "traefik.autodetect=true"
        - "traefik.http.routers.web-static.rule=Host(`localhost`)"
```

Configuration nécessaire dans le fichier docker-compose.yml pour rediriger les requêtes venant de `localhost/api` vers notre serveur web HTTP dynamique:
```yml
web-dynamic:
    build: express-image/.
    ports:
        - "3000"
    labels:
        - "traefik.autodetect=true"
        - "traefik.http.routers.web-dynamic.rule=(Host(`localhost`) && PathPrefix(`/api`))"
```

## Step 3a: Gestion dynamique des clusters

Nous avons utilisé la commande `scale` pour rajouter plusieurs instances de nos serveurs web HTTP statique et dynamique.
```yml
    web-static:
        build: apache-php-image/.
        scale: 3
        ports:
            - "80"
        labels:
            - "traefik.autodetect=true"
            - "traefik.http.routers.web-static.rule=Host(`localhost`)"

    web-dynamic:
        build: express-image/.
        scale: 3
        ports:
            - "3000"
        labels:
            - "traefik.autodetect=true"
            - "traefik.http.routers.web-dynamic.rule=(Host(`localhost`) && PathPrefix(`/api`))"
```

`Traefik` permet de repartir la charge entre les différentes instances de chaque serveur et l'équilibreur de charge se met à jour dynamiquement pour utiliser seulement les instances de chaque serveur qui sont disponibles.

## Step 4: Requêtes AJAX avec JQuery

Pour cette étape nous avons configuré des requêtes AJAX pour mettre à jour automatiquement notre page web statique (toutes les 4 secondes) avec des données venant depuis notre serveur web dynamique. Nous avons utilisé l'API de JS `Fetch`.

Pour récupérer les données JSON générées par notre serveur HTTP dynamique avec express.js développé dans l'étape 2, nous devons configurer 2 fichiers dans notre serveur HTTP statique.

Premièrement, nous avons modifié notre fichier `../apache-php-image/content/index.html` pour ajouter un ID `api-animals`. Cet ID sera utilisé par un script JS que nous allons implémenter par la suite qui mettra à jour les données récupérées depuis notre serveur web dynamique:
```html
<p id="api-animals"></p>
```
En suite, nous avons ajouté tout à la fin du même fichier l'appel à notre script JS:
```html
<!-- Script that loads animals -->
<script src="assets/js/animals.js"></script>
```

Deuxièmement, nous avons créé un script JS, `../apache-php-image/content/assets/js/animals.js`, qui va récupérer les données sous forme JSON depuis notre serveur web dynamique et qui va charger les données à un ID (api-animals) se trouvant dans notre fichier `../apache-php-image/content/index.html`.

```js
setInterval(async() => {

    const animals = await fetch('/api/').then(response => response.json());

    if (animals.length > 0) {
        send = "Ocean animals : " + animals[0].typeOfAnimal;
    }

    document.getElementById("api-animals").innerHTML = send}, 4000)
```


## Step 5: Équilibrage de charge : sessions alternées et persistantes

Nous avons configuré notre fichier `docker-compose.yml` pour mettre en place les sessions persistantes sur notre serveur web HTTP statique.
```yml
    web-static:
        build: apache-php-image/.
        #scale: 3
        ports:
            - "80"
        labels:
            - "traefik.autodetect=true"
            - "traefik.http.routers.web-static.rule=Host(`localhost`)"
            - "traefik.http.services.static.loadbalancer.sticky.cookie=true"
            - "traefik.http.services.static.loadbalancer.sticky.cookie.name=static-cookie"
```

Dans le but de vérifier que les connexions persistantes de notre serveur web HTTP statique fonctionnent, nous affichons l'ID de session. Nous avons utilisé du PHP pour cette étape:
```php
<?php
echo '<h3 class="whiteTextOverride">';
echo 'ID de session : '.gethostname();;
echo '</h3>';
?>
```

## Step 6: Management UI

Pour cette étape, nous avons regardé différentes applications web nous permettant de surveiller notre infrastructure web. En définitive, la solution qui nous a semblé la plus appropriée et la plus "user-friendly" a été [Portainer](https://www.portainer.io/).
