FROM node:18

WORKDIR /app

# Set Node options for OpenSSL compatibility
ENV NODE_OPTIONS=--openssl-legacy-provider

COPY package.json ./
COPY package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

RUN npm run build

RUN npm install -g serve
CMD ["serve", "-s", "build"]