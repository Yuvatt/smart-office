# שלב 1: בנייה
FROM node:20-alpine as build
WORKDIR /app

COPY package*.json ./
# הדגל הזה פותר את הבעיה הנוכחית שלך:
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# שלב 2: שרת (Nginx)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]