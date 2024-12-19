# Étape 1: Builder l'application Angular
FROM node:16 AS build
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Installation d'Angular CLI
RUN npm install -g @angular/cli

# Copie du code source
COPY . .

# Augmenter la mémoire pour Node.js (utile pour les builds Angular)
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build

# Étape 2: Servir l'application Angular
FROM nginx:alpine

# Copier les fichiers générés vers NGINX
COPY --from=build /app/dist/frontend-gestion-stock /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Lancer NGINX
CMD ["nginx", "-g", "daemon off;"]
