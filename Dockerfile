# Étape 1: Builder l'application Angular
FROM node:16 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --production

# Étape 2: Servir l'application Angular
FROM nginx:alpine
COPY --from=build /app/dist/frontend-gestion-stock /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
