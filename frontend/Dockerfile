FROM node:18

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

RUN npm run build

RUN npm install -g serve
CMD ["serve", "-s", "build"]