FROM node:20.6.1

WORKDIR /app

COPY package*.json ./

RUN npm install
# RUN command
# RUN npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
RUN npm install  -D tailwindcss@3.3.0 postcss@8.4.31 autoprefixer@10.4.14

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh


COPY . .


# ENV NODE_ENV=development
ENV NODE_ENV=production

# RUN npm run build 

EXPOSE 3000
# CMD ["npm", "run", "dev"]
# ENTRYPOINT [ "npm run build && npm start" ]
# CMD ["npm", "start"]


ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "start"]
