# Étape 1 : Construction de l'application Angular
FROM node:22.3.0-alpine AS build
WORKDIR /usr/src/app

# Installer Angular CLI globalement
RUN npm install -g @angular/cli

# Installer les dépendances (y compris devDependencies pour le build)
COPY package.json package-lock.json ./
RUN npm ci

# Copier les fichiers source et construire l'application
COPY . .
RUN npm run build

# Étape 2 : Configuration Nginx
FROM nginx:1.23.3-alpine

# Nettoyage du dossier conf.d
RUN rm -rf /etc/nginx/conf.d/*

# Copier le fichier de configuration personnalisé
#COPY web-stock-front.conf /etc/nginx/conf.d/web-stock.conf

# Copier l'application Angular construite dans le dossier Nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY --from=build /usr/src/app/web-stock-front.conf /etc/nginx/conf.d/web-stock.conf

# Exposition du port 80
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]
