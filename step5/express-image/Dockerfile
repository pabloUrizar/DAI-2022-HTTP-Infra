FROM node:18.12

RUN apt-get update && apt-get install -y nano

COPY ./src /opt/app

EXPOSE 3000

WORKDIR /opt/app
RUN npm install

CMD ["node", "/opt/app/index.js"]
