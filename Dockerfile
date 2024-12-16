FROM node:${NODE_VERSION}-alpine as base
RUN addgroup -S node && adduser -S node -G node
WORKDIR /usr/src/app
USER node

FROM base as deps
USER root # Pour exécuter les commandes `npm ci`
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

FROM deps as build
USER root
COPY . .
RUN npm ci
RUN npm run build

FROM nginx:1.23.3-alpine
RUN sed -i '/^user /d' /etc/nginx/nginx.conf

# Copie le build dans l'image nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY --from=build /usr/src/app/web-stock.conf /etc/nginx/conf.d/web-stock.conf

RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chmod 644 /etc/nginx/conf.d/web-stock.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
