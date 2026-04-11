FROM node:22-slim
WORKDIR /app
COPY package.json ./
COPY shared/package.json shared/
COPY client/package.json client/
COPY server/package.json server/
RUN npm install --include=dev
COPY . .
RUN npm run build
RUN npm prune --omit=dev
ENV NODE_ENV=production
CMD ["npm", "start"]