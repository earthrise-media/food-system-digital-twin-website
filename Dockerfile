# This can be made much smaller for production
# DATABASE_URL and NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN are required environment vars 

FROM node:lts-alpine

RUN mkdir /app

# Copy sources 
COPY ./config /app/config
COPY ./public /app/public 
COPY ./data /app/data
COPY ./migrations /app/migrations
COPY ./seeds /app/seeds
COPY ./src /app/src
COPY *.json /app/
COPY *.js /app/
COPY *.ts /app/


WORKDIR /app
## Build
RUN npm install yarn && yarn install 
RUN rm /app/next.config.js
COPY docker.next.config /app/next.config.js
RUN yarn build

EXPOSE 3000
ENTRYPOINT [ "yarn","start" ]
