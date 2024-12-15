# Etape 1 : Base
ARG NODE_VERSION=22.3.0
FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

# Etape 2 : Dépendances
FROM base as deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Etape 3 : Construction
FROM deps as build
COPY . .
RUN npm run build

# Etape 4 : Image finale avec NGINX
FROM nginx:1.23.3-alpine

# Créez un utilisateur sécurisé
RUN adduser -D -u 1000 -s /bin/sh node

# Copier l'application
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY /path/to/nginx-config.conf /etc/nginx/conf.d/web.conf

# Assurez-vous des permissions
RUN chown -R node:node /usr/share/nginx/html

# Utilisez l'utilisateur non-root
USER node

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
