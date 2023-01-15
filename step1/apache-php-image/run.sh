#!/bin/bash

docker run -d --name apache_http_statique -p 9090:80 http_statique
