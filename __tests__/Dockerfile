FROM node:19.6.1-slim@sha256:a1ba21bf0c92931d02a8416f0a54daad66cb36a85d2b73af9d73b044f5f57cfc

RUN apt-get update && apt-get -y install \
  git python3 make curl netcat

RUN npm i typescript -g


RUN mkdir -p /app
WORKDIR /app

COPY package.json package-lock.json ./connect-sdk/
RUN --mount=type=cache,uid=1000,gid=1000,target=/home/node/.npm \
  npm ci --prefix connect-sdk 
COPY . ./connect-sdk
RUN npm run rebuild --prefix connect-sdk

RUN mkdir -p testing
COPY __tests__/wait-run.sh ./testing
WORKDIR /app/testing