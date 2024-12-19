# Étape 1: Builder l'application Angular
FROM node:18 AS build
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
RUN echo "Fichiers de dépendances copiés" && ls -l

# Installation des dépendances
RUN npm install
RUN echo "Dépendances installées" && ls -l

# Installation d'Angular CLI
RUN npm install -g @angular/cli
RUN echo "Angular CLI installé"

# Copie du code source
COPY . .
RUN echo "Code source copié" && ls -l

# Augmenter la mémoire pour Node.js (utile pour les builds Angular)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Essayer d'exécuter le build Angular
RUN npm run build
RUN echo "Build terminé"

# Étape 2: Servir l'application Angular
FROM nginx:alpine

# Copier les fichiers générés vers NGINX
COPY --from=build /app/dist/frontend-gestion-stock /usr/share/nginx/html
RUN echo "Fichiers copiés dans NGINX"

# Exposer le port 80
EXPOSE 80

# Lancer NGINX
CMD ["nginx", "-g", "daemon off;"]
