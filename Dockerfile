# syntax=docker/dockerfile:1

# Base : Utiliser l'image Node.js pour construire l'application Angular
ARG NODE_VERSION=18.19.1
FROM node:${NODE_VERSION}-alpine as base

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Étape 1 : Installer les dépendances de production
FROM base as deps

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer uniquement les dépendances de production
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# Étape 2 : Construire l'application Angular
FROM deps as build

# Installer les dépendances nécessaires au build
RUN --mount=type=cache,target=/root/.npm npm ci

# Copier le reste des fichiers source
COPY . .

# Construire l'application Angular
RUN npm run build

# Étape 3 : Servir l'application avec Nginx
FROM nginx:1.23.3-alpine

# Copier les fichiers construits dans le répertoire de Nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copier une configuration Nginx personnalisée (si nécessaire)
COPY --from=build /usr/src/app/web-stock.conf /etc/nginx/conf.d/web-stock.conf

# Exposer le port par défaut de Nginx
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
