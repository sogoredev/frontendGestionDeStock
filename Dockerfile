# syntax=docker/dockerfile:1

# Définir la version de Node.js utilisée dans l'image
ARG NODE_VERSION=18.19.1

################################################################################
# Étape de base : utiliser l'image Node.js comme image de base
FROM node:${NODE_VERSION}-alpine as base

# Définir le répertoire de travail pour toutes les étapes de construction
WORKDIR /usr/src/app

################################################################################
# Étape pour installer les dépendances de production
FROM base as deps

# Télécharger les dépendances en utilisant un cache pour améliorer les builds ultérieurs
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

################################################################################
# Étape de construction de l'application
FROM deps as build

# Télécharger les dépendances supplémentaires avant de construire l'application
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copier le reste des fichiers sources dans l'image
COPY . .

# Exécuter le script de build
RUN npm run build

################################################################################
# Étape pour exécuter l'application avec des dépendances minimales en runtime
# Copier les fichiers nécessaires à partir de l'étape build
FROM nginx:1.23.3-alpine

# Copier les fichiers construits dans le répertoire de Nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY --from=build /usr/src/app/web-stock.conf /etc/nginx/conf.d

# Changer les permissions des fichiers copiés pour l'utilisateur nginx
RUN chown -R nginx:nginx /usr/share/nginx/html /etc/nginx/conf.d

# Exposer le port 80 pour l'application
EXPOSE 80

# Définir l'utilisateur nginx pour exécuter Nginx
USER nginx
