# Build Stage
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

# Nginx Stage
FROM nginx:alpine
COPY --from=build /app/dist/frontend-gestion-stock /usr/share/nginx/html
