FROM nginx:1.23.3-alpine

# Copier les fichiers construits dans le répertoire de Nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY --from=build /usr/src/app/web-stock.conf /etc/nginx/conf.d

# Changer les permissions des fichiers copiés pour l'utilisateur nginx
RUN chown -R nginx:nginx /usr/share/nginx/html /etc/nginx/conf.d

# Passer à l'utilisateur root pour résoudre les problèmes d'accès
USER root

# Exposer le port 80 pour l'application
EXPOSE 80

# Définir l'utilisateur nginx pour exécuter Nginx
USER nginx
