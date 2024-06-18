FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install  

EXPOSE 3000

ENV SECRET_KEY=helloworld

CMD [ "node" ,"index.js" ]