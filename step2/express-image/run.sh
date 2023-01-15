#!/bin/bash

docker run -d --rm --name node_http_dynamique -p 3000:3000 --platform=linux/amd64 http_dynamique

