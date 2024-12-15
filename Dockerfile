FROM nginx:1.23.3-alpine

# Créez un utilisateur "node" dans l'image Nginx
RUN addgroup -S node && adduser -S node -G node

# Copiez les fichiers nécessaires
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY --from=build /usr/src/app/web-stock.conf /etc/nginx/conf.d/web-stock.conf

# Utilisez l'utilisateur "node"
USER node

# Exposez le port 80 pour le service
EXPOSE 80
