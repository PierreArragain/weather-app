FROM node:18 AS build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
ARG BACKEND_URL
ENV BACKEND_URL=${BACKEND_URL}
RUN yarn build


FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/.next ./next
COPY --from=build /app/public ./public
COPY package.json yarn.lock ./
RUN yarn install --production

EXPOSE 4200
CMD ["yarn", "start"]
