FROM node:12
WORKDIR /userapi
COPY userapi/package*.json ./
RUN npm install
COPY ./userapi/ /userapi/
EXPOSE 3000
CMD [ "npm", "start" ]
