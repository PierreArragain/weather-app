# Build stage
FROM node:22 AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

COPY . .

ARG BACKEND_URL
ENV BACKEND_URL=${BACKEND_URL}

RUN yarn build

# Production stage
FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json /app/yarn.lock ./

RUN yarn install --frozen-lockfile --production

ENV PORT=4200
EXPOSE 4200


CMD ["yarn", "next", "start", "-p", "4200"]
