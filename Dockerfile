FROM node:lts-alpine3.19

WORKDIR /app

COPY  package.json /app

RUN npm install

COPY . /app

ENV TOKEN=''
ENV CLIENT_ID=''
ENV GUILD_ID=''
ENV JOB_CHANNEL_ID=''

CMD [ "npm", "start"]