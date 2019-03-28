FROM mhart/alpine-node:8.11.4
WORKDIR /client
COPY package*.json /client/
RUN npm install
COPY . /client/
EXPOSE 4200
CMD ["npm", "start"]