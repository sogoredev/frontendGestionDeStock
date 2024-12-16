# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.3.0

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

FROM base as deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

FROM deps as build
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

FROM nginx:1.23.3-alpine

# Modifier nginx.conf pour supprimer la directive `user`
RUN sed -i '/^user /d' /etc/nginx/nginx.conf

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY --from=build /usr/src/app/web-stock.conf /etc/nginx/conf.d/web-stock.conf

RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chmod 644 /etc/nginx/conf.d/web-stock.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

