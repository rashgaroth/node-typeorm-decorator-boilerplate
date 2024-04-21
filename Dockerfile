FROM node:18.18.2

WORKDIR /run/app

COPY . ./

COPY package-lock.json ./

RUN npm install; \
  npm run build; \
  npm run migration:run

CMD [ "npm", "run", "start" ]