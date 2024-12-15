FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

# Étape de construction
FROM base as build
COPY . .
RUN npm ci && npm run build

# Étape finale : image NGINX avec utilisateur node
FROM nginx:1.23.3-alpine
RUN apk add --no-cache bash && adduser -D -H -s /bin/bash node
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY --from=build /usr/src/app/web-stock.conf /etc/nginx/conf.d/web-stock.conf
USER node
EXPOSE 80
