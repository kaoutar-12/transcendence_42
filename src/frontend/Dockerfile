FROM node:20.6.1

WORKDIR /app

COPY package*.json ./

RUN npm install
# RUN command
# RUN npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
RUN npm install  -D tailwindcss@3.3.0 postcss@8.4.31 autoprefixer@10.4.14



COPY . .

EXPOSE 3000

ENV NODE_ENV=development

CMD ["npm", "run", "dev"]
