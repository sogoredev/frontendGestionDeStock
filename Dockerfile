FROM nginx:1.23.3-alpine

# Créer l'utilisateur node avec un UID fixe
RUN adduser -D -u 1000 node

# Copier les fichiers nécessaires
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY --from=build /usr/src/app/web-stock.conf /etc/nginx/conf.d/web-stock.conf

# Définir l'utilisateur node comme utilisateur par défaut
USER node

EXPOSE 80
