# Étape 1 : Construction de l'application
ARG NODE_VERSION=22.3.0
FROM node:${NODE_VERSION}-alpine as build
WORKDIR /usr/src/app

# Installer Angular CLI globalement
RUN npm install -g @angular/cli

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# Étape 2 : Configuration Nginx
FROM nginx:1.23.3-alpine

# Suppression de la directive 'user' dans nginx.conf
RUN sed -i '/^user /d' /etc/nginx/nginx.conf

# Nettoyage du dossier conf.d pour éviter les conflits
RUN rm -rf /etc/nginx/conf.d/*

# Copier le fichier de configuration personnalisé
COPY web-stock.conf /etc/nginx/conf.d/web-stock.conf

# Vérification de l'existence du fichier après copie
RUN ls -al /etc/nginx/conf.d/

# Copier les fichiers de l'application build
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Permissions correctes pour les fichiers
RUN chmod 644 /etc/nginx/conf.d/web-stock.conf
RUN chown -R nginx:nginx /usr/share/nginx/html

# Exposition du port 80
EXPOSE 80

# Démarrage de Nginx
CMD ["nginx", "-g", "daemon off;"]
