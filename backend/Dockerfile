FROM node:22 AS build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY tsconfig.json ./
COPY src /app/src
RUN yarn build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./ 
COPY tsconfig.json ./

EXPOSE 3000
COPY wait-for-db.sh ./wait-for-db.sh
RUN chmod +x ./wait-for-db.sh

CMD ["sh", "./wait-for-db.sh"]
