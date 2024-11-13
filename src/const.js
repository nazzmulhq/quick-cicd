// for front-end react

export const getDockerFile = (nodeVersion) => {
  return `
FROM ${nodeVersion}

RUN npm install pm2 -g

EXPOSE 3000
`;
};

export const getDockerComposeFile = (projectName) => {
  return `
    version: "3.9"
    services:
        admin:
            build:
                context: ./
                dockerfile: Dockerfile
            image: \${COMPOSE_PROJECT_NAME:?err}_image
            tty: true
            restart: unless-stopped
            container_name: \${COMPOSE_PROJECT_NAME:?err}_container
            working_dir: /app/
            volumes:
                - ./:/app
            ports:
                - '\${PORT}:3000'
            networks:
                - \${COMPOSE_PROJECT_NAME:?err}_network
    networks:
        ${projectName}_network:
            driver: bridge
    `;
};
export const getEcosystemConfigJsFile = (projectName) => {
  return `
    module.exports = {
        apps: [
          {
            name: "${projectName}-prod",
            script: "yarn",
            args: "start",
            interpreter: "/bin/bash",
            env: {
              NODE_ENV: "production",
            },
          },
          {
            name: "${projectName}-dev",
            script: "yarn",
            args: "dev",
            interpreter: "/bin/bash",
            watch: true,
          },
        ],
      };
    `;
};

export const getDeployShFile = (projectType, projectName) => {
  let command = '';
  if (projectType === 'NextJS-(React)') {
    command = `docker exec ${projectName}_container pm2 start npm --name ${projectName}-prod -- run start`;
  } else if (projectType === 'vite.js-(react)') {
    command = `docker exec ${projectName}_container pm2 start npm --name ${projectName}-prod -- run preview -- --host 0.0.0.0 --port 3000`;
  }
  return `
    git pull
    docker compose down
    docker compose up -d --build
    docker exec ${projectName}_container npm install --legacy-peer-deps
    docker exec ${projectName}_container npm run build
    docker exec ${projectName}_container pm2 delete "${projectName}-prod"
    ${command}
    docker exec ${projectName}_container pm2 save
    `;
};

export const getBitbucketPipelinesFile = (projectName, imageName, caches) => {
  return `
image: ${imageName}
pipelines:
  default:
    - step:
        name: Install, Build, and Deploy
        script:
            - chmod +x ./deploy.sh
            - bash ./deploy.sh

  branches:
    master:
      - step:
          name: Install, Build, and Deploy
          caches:
            - ${caches}
          script:
            - chmod +x ./deploy.sh
            - bash ./deploy.sh

    main:
      - step:
          name: Install, Build, and Deploy
          caches:
            - ${caches}
          script:
            - chmod +x ./deploy.sh
            - bash ./deploy.sh

    dev:
      - step:
          name: Install, Build, and Deploy
          caches:
            - ${caches}
          script:
            - chmod +x ./deploy.sh
            - bash ./deploy.sh

  custom:
    merge-deploy:
      - step:
          name: Manual Deployment After Merge
          caches:
            - ${caches}
          script:
            - chmod +x ./deploy.sh
            - bash ./deploy.sh

  `;
};

export const getDotEnvFile = (projectName) => {
  return `
PORT=3000

COMPOSE_PROJECT_NAME=${projectName}
  `;
};

// for back-end nodejs

export const getDockerFileForBackendNode = (nodeVersion) => {
  return `
# Use the official Node.js image as the base image
FROM ${nodeVersion}

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY package.json .

# Install all the dependencies
RUN npm install pm2 -g && npm install --legacy-peer-deps 

# Copy the content of the server folder to the working directory
COPY . .

# Expose the port the app runs in 
EXPOSE 3010

# Command to run the server in development mode
#CMD ["npm", "run", "start:dev", "--", "-H", "localhost", "--port", "3010"]

# Command to run the server in production mode
# CMD ["npm", "run", "start:prod", "--", "-H", "localhost", "--port", "3010"]
`;
};

export const getDockerComposeFileForBackendNode = (projectName) => {
  return `
version: '3.8'
services:
  app:
    build:
      context: ./
      dockerfile: Dockerfile
    image: \${COMPOSE_PROJECT_NAME:?err}_image
    tty: true
    restart: unless-stopped
    container_name: \${COMPOSE_PROJECT_NAME:?err}_container
    working_dir: /app/
    volumes:
      - ./:/app
    networks:
      - \${COMPOSE_PROJECT_NAME:?err}_network
    ports:
      - '\${HOST_PORT}:3000'
    depends_on:
      - db
      - redis

  db:
    image: mysql:8.0
    container_name: \${COMPOSE_PROJECT_NAME:?err}_db
    restart: unless-stopped
    command: --max_allowed_packet=32505856
    environment:
      MYSQL_DATABASE: \${DB_DATABASE}
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
      SERVICE_TAGS: dev
      SERVICE_NAME: mysql
      TZ: Asia/Dhaka
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - \${COMPOSE_PROJECT_NAME:?err}_network
    ports:
      - '\${DOCKER_DB_HOST_PORT:?err}:3306'

  phpmyadmin:
    depends_on:
      - db
    image: phpmyadmin/phpmyadmin
    restart: always
    ports:
      - '\${PHP_MY_ADMIN_PORT}:80'
    environment:
      PMA_VERBOSE: 'Docker MySQL,Local MySQL'
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
    networks:
      - \${COMPOSE_PROJECT_NAME:?err}_network

  redis:
    image: redis:alpine
    container_name: \${COMPOSE_PROJECT_NAME:?err}_redis
    ports:
      - '\${DOCKER_REDIS_PORT:?err}:6379'
    networks:
      - \${COMPOSE_PROJECT_NAME:?err}_network

networks:
  ${projectName}_network:
    driver: bridge
volumes:
  mysql-data:
`;
};

export const getEcosystemConfigJsFileForBackendNode = (projectName) => {
  return `
module.exports = {
  apps: [
    {
      name: "${projectName}-prod",
      script: "npm run",
      args: "start:prod",
      interpreter: "/bin/bash",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "${projectName}-dev",
      script: "npm run",
      args: "start:dev",
      interpreter: "/bin/bash",
      watch: true,
    },
  ],
};
`;
};

export const getDeployShFileForBackendNode = (projectName) => {
  return `
git pull
docker compose down
docker compose up -d --build
docker exec ${projectName}_container npm install --legacy-peer-deps
docker exec ${projectName}_container npm run build
docker exec ${projectName}_container pm2 delete "${projectName}-prod"
docker exec ${projectName}_container pm2 start npm --name ${projectName}-prod -- run start:prod
docker exec ${projectName}_container pm2 save
`;
};

export const getBitbucketPipelinesFileForBackendNode = (
  projectName,
  imageName,
  caches
) => {
  return `
image: ${imageName}
pipelines:
  default:
    - step:
        name: Install, Build, and Deploy
        script:
            - chmod +x ./deploy.sh
            - bash ./deploy.sh

  branches:
    master:
      - step:
          name: Install, Build, and Deploy
          caches:
            - ${caches}
          script:
            - chmod +x ./deploy.sh
            - bash ./deploy.sh

    main:
      - step:
          name: Install, Build, and Deploy
          caches:
            - ${caches}
          script:
            - chmod +x ./deploy.sh
            - bash ./deploy.sh

    dev:
      - step:
          name: Install, Build, and Deploy
          caches:
            - ${caches}
          script:
            - chmod +x ./deploy.sh
            - bash ./deploy.sh

  custom:
    merge-deploy:
      - step:
          name: Manual Deployment After Merge
          caches:
            - ${caches}
          script:
            - chmod +x ./deploy.sh
            - bash ./deploy.sh

  `;
};

export const getDotEnvFileForBackendNode = (projectName) => {
  return `
PORT=3000
# DB
DB_HOST=db
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=${projectName}

# Swagger
SWAGGER_ENDPOINT=api-docs
SWAGGER_USER=
SWAGGER_PASS=

# JWT Secret
JWT_EXPIRES_IN=1d
JWT_SECRET=YzJSQlFVRldRMFZXUmlNakkwQkFKRUJYWkhOaFpITkFSbVJ6Wmc%3D

# Docker
COMPOSE_PROJECT_NAME=${projectName}
HOST_PORT=3010
DB_DATABASE=${projectName}
MYSQL_ROOT_PASSWORD=123456
DOCKER_DB_HOST_PORT=3307
DOCKER_REDIS_PORT=3308
PHP_MY_ADMIN_PORT=3309
  `;
};

// for php

export const getDockerFileForBackendPHPLaravel = (phpVersion) => {
  return `
# Use the official PHP image as the base image
FROM ${phpVersion}

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y     build-essential     libpng-dev     libjpeg62-turbo-dev     libfreetype6-dev     locales     zip     jpegoptim optipng pngquant gifsicle     vim     unzip     git     curl     libonig-dev     libzip-dev     supervisor

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy existing application directory contents
COPY . /app

# Copy existing application directory permissions
COPY --chown=www-data:www-data . /app


  `;
};

export const getDockerComposeFileForLaravel = (projectName) => {
  return `
version: "3.8"

services:
  app:
    build:
      context: ./
      dockerfile: Dockerfile
    image: \${COMPOSE_PROJECT_NAME:?err}_image
    tty: true
    restart: unless-stopped
    container_name: \${COMPOSE_PROJECT_NAME:?err}_container
    working_dir: /app
    volumes:
      - ./:/app
    ports:
      - "\${APP_PORT}:80"
    env_file:
      - .env
    environment:
      - TZ=Asia/Dhaka
      - WEB_DOCUMENT_ROOT=/app/public
      - php.session.gc_maxlifetime=31536000
      - php.session.cookie_lifetime=31536000
      - php.memory_limit=2048M
      - PHP_DISPLAY_ERRORS=1
    networks:
      - ${projectName}_network
    depends_on:
      - db

  db:
    image: mysql:8.0
    container_name: \${COMPOSE_PROJECT_NAME:?err}_db
    command: --max_allowed_packet=32505856
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: \${DB_DATABASE}
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
      MYSQL_PASSWORD: \${DB_PASSWORD}
      MYSQL_USER: \${DB_USERNAME}
      SERVICE_TAGS: dev
      SERVICE_NAME: mysql
      TZ: Asia/Dhaka
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - ${projectName}_network
    ports:
      - "\${DB_PORT}:3306"

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    restart: always
    ports:
      - "\${PMA_PORT}:80"
    environment:
     - PMA_ARBITRARY=1
    networks:
      - ${projectName}_network

networks:
  ${projectName}_network:
    driver: bridge

volumes:
  mysql_data:
  `;
};

export const getDeployShFileForLaravel = (projectName) => {
  return `
#!/bin/bash

git pull origin main
docker compose down
docker compose up -d --build

docker exec -it ${projectName}_container chmod -R 775 /app/storage /app/bootstrap/cache
docker exec -it  ${projectName}_container chown -R www-data:www-data /app/storage /app/bootstrap/cache

docker exec -it  ${projectName}_container composer install --optimize-autoloader --no-dev
docker exec -it  ${projectName}_container php artisan key:generate
docker exec -it  ${projectName}_container php artisan storage:link
docker exec -it  ${projectName}_container php artisan migrate:fresh --seed
docker exec -it  ${projectName}_container php artisan optimize:clear
docker exec -it  ${projectName}_container php artisan config:cache
docker exec -it  ${projectName}_container php artisan route:cache
docker exec -it  ${projectName}_container php artisan view:cache
  `;
};

export const getBitbucketPipelinesFileForLaravel = (
  projectName,
  imageName,
  caches
) => {
  return `
image: ${imageName}

pipelines:
  default:
    - step:
        name: Install, Build, and Deploy
        caches:
          - ${caches}
        script:
          - chmod +x ./deploy.sh
          - ./deploy.sh

  branches:
    main:
      - step:
          name: Install, Build, and Deploy
          caches:
            - ${caches}
          script:
            - chmod +x ./deploy.sh
            - ./deploy.sh

    dev:
      - step:
          name: Development Deploy
          caches:
            - ${caches}
          script:
            - chmod +x ./deploy.sh
            - ./deploy.sh
  `;
};

export const getDotEnvFileForLaravel = (projectName) => {
  return `
APP_NAME=${projectName}
APP_ENV=local
APP_KEY=base64:ga9YARyP2fPJzl4bSt7ni5iOJgk7RfrhewERxd7mN9o=
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=127.0.0.1

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
# APP_MAINTENANCE_STORE=database

PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# Docker application port
COMPOSE_PROJECT_NAME=${projectName}
APP_PORT=8090

# Database
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3310
DB_DATABASE=${projectName}
DB_USERNAME=root
DB_PASSWORD=123456
MYSQL_ROOT_PASSWORD=123456
# PhpMyAdmin
PMA_PORT=8080

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="\${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="\${APP_NAME}"


  `;
};
