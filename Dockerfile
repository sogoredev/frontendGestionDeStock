# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.3.0

# Étape 1 : Utiliser l'image Node.js pour le développement et le build
FROM node:${NODE_VERSION}-alpine as build

# Répertoire de travail
WORKDIR /usr/src/app

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier les fichiers sources et construire l'application
COPY . .
RUN npm run build

# Étape 2 : Utiliser l'image Nginx pour le runtime
FROM nginx:1.23.3-alpine

# Créer un utilisateur non root (solution si USER est nécessaire)
RUN adduser -D node

# Copier les fichiers statiques générés
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Ajouter une configuration personnalisée de Nginx si nécessaire
COPY ./web-stock.conf /etc/nginx/conf.d/default.conf

# Utiliser l'utilisateur non root (facultatif)
USER node

# Exposer le port utilisé par Nginx
EXPOSE 80

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
