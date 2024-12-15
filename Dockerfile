# Étape 1 : Base
ARG NODE_VERSION=22.3.0
FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

# Étape 2 : Dépendances
FROM base as deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
# Installer Angular CLI globalement
RUN npm install -g @angular/cli

# Étape 3 : Construction
FROM deps as build
COPY . .
RUN npm run build

# Étape 4 : Image finale avec NGINX
FROM nginx:1.23.3-alpine

# Créez un utilisateur sécurisé
RUN adduser -D -u 1000 -s /bin/sh node

# Copier l'application
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY --from=build /usr/src/app/dist /etc/nginx/conf.d/web-stock.conf

# Assurez-vous des permissions
RUN chown -R node:node /usr/share/nginx/html

# Utilisez l'utilisateur non-root
USER node

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
