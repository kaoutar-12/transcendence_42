FROM node:20.6.1

WORKDIR /app

COPY package*.json ./

RUN npm install
# RUN command
RUN npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

COPY . .

EXPOSE 3000

ENV NODE_ENV=development

CMD ["npm", "run", "dev"]
