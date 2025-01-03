FROM ghcr.io/puppeteer/puppeteer:21.0.0

USER root
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=3000
CMD ["npm", "start"]