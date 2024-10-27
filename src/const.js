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
            image: ${projectName}
            tty: true
            restart: unless-stopped
            container_name: ${projectName}
            working_dir: /app/
            volumes:
                - ./:/app
            ports:
                - '\${PORT}:3000'
            networks:
                - ${projectName}
    networks:
        ${projectName}:
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

export const getDeployShFile = (projectName) => {
  return `
    git pull
    docker-compose down
    docker-compose up -d
    docker exec ${projectName} npm ci
    docker exec ${projectName} npm run build
    docker exec ${projectName} pm2 start --only "${projectName}-prod"
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
RUN npm install pm2 -g && npm install

# Copy the content of the server folder to the working directory
COPY . .

# Expose the port the app runs in
EXPOSE 3010

# Command to run the server
CMD ["npm", "run", "start:dev"]
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
    image: \${COMPOSE_PROJECT_NAME:?err}
    tty: true
    restart: unless-stopped
    container_name: \${COMPOSE_PROJECT_NAME:?err}
    working_dir: /app/
    volumes:
      - ./:/app
    networks:
      - ${projectName}_network
    ports:
      - '\${HOST_PORT}:3010'
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
      - ${projectName}_network
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
      - ${projectName}_network

  redis:
    image: redis:alpine
    container_name: \${COMPOSE_PROJECT_NAME:?err}_redis
    ports:
      - '\${DOCKER_REDIS_PORT:?err}:6379'
    networks:
      - ${projectName}_network

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
      args: "start",
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
docker-compose down
docker-compose up -d
docker exec ${projectName} npm ci
docker exec ${projectName} npm run build
docker exec ${projectName} pm2 start --only "${projectName}-prod"
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

export const getDockerFileForLaravel = (phpVersion = 'php:8.1-fpm') => {
  return `
# Use PHP base image
FROM ${phpVersion}

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y && sudo apt install -y php php-common php-cli php-gd php-mysqlnd php-curl php-intl php-mbstring php-bcmath php-xml php-zip curl unzip git

RUN curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/bin --filename=composer

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql zip exif pcntl
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application code
COPY . /app

# Set permissions for Laravel
RUN chown -R www-data:www-data /app && chmod -R 755 /app/storage

# Expose port 9000 for PHP-FPM
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]
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
    container_name: ${projectName}
    restart: unless-stopped
    working_dir: /app
    volumes:
      - ./:/app
    ports:
      - "\${APP_PORT}:9000"
    networks:
      - ${projectName}_network

  db:
    image: mysql:8.0
    container_name: ${projectName}_db
    environment:
      MYSQL_DATABASE: \${DB_DATABASE}
      MYSQL_ROOT_PASSWORD: \${DB_PASSWORD}
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
      PMA_HOST: db
      MYSQL_ROOT_PASSWORD: \${DB_PASSWORD}
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
echo "Pulling latest changes..."
git pull origin main

echo "Building Docker containers..."
docker-compose down
docker-compose up -d --build

echo "Running database migrations..."
docker-compose exec ${projectName} php artisan migrate --force

echo "Clearing caches and optimizing..."
docker-compose exec ${projectName} php artisan config:cache
docker-compose exec ${projectName} php artisan route:cache
docker-compose exec ${projectName} php artisan view:cache

echo "Deployment complete!"
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
APP_KEY=base64:YOUR_APP_KEY
APP_DEBUG=true
APP_URL=http://localhost

# Docker
APP_PORT=8000

# Database
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=${projectName}
DB_USERNAME=root
DB_PASSWORD=123456

# PhpMyAdmin
PMA_PORT=8080

# Cache and session
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
  `;
};
