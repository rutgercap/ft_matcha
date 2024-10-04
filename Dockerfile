# first we pull the node image
FROM node:20

# environment variable to dl all the dev tools node need
ENV NODE_ENV=development

# set the working directory of the app inside the container
WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package-lock.json* ./
COPY package.json pnpm-lock.yaml ./
COPY *.config.js ./
COPY tsconfig.json ./

RUN pnpm install

COPY . .

EXPOSE 3000
# EXPOSE 5173

CMD ["pnpm", "run", "dev", "--port", "3000", "--host", "0.0.0.0"]