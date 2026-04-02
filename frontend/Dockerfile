FROM node:16-alpine as build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./

RUN npm install

COPY frontend .

RUN npm run build

# Production server
FROM node:16-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
