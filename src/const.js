// for front-end react

export const getDockerFile = (nodeVersion, projectType, projectName) => {
  let command = '';
  if (projectType === 'NextJS-(React)') {
    command = `CMD ["pm2-runtime", "start", "npm", "--name", "${projectName}-prod", "--", "run", "start"]`;
  } else if (projectType === 'ViteJS-(React)') {
    command = `CMD ["pm2-runtime", "start", "npm", "--name", "${projectName}-prod", "--", "run", "preview"]`;
  }
  return `
# Use an official Node.js runtime as a parent image
FROM ${nodeVersion}

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install PM2 globally and install dependencies
RUN npm install pm2 -g && npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the application's default port
EXPOSE 3000

# Start the application using PM2
${command}

`;
};

export const getDockerComposeFile = projectName => {
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
export const getEcosystemConfigJsFile = projectName => {
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
  } else if (projectType === 'ViteJS-(React)') {
    command = `docker exec ${projectName}_container pm2 start npm --name ${projectName}-prod -- run preview -- --host 0.0.0.0 --port 3000`;
  }
  return `
    git pull
    docker compose down
    docker compose up -d --build
    # docker exec ${projectName}_container npm install --legacy-peer-deps
    # docker exec ${projectName}_container npm run build
    # docker exec ${projectName}_container pm2 delete "${projectName}-prod"
    # ${command}
    # docker exec ${projectName}_container pm2 save
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

export const getDotEnvFile = projectName => {
  return `
PORT=3000

COMPOSE_PROJECT_NAME=${projectName}
  `;
};

// for back-end

// node.js
export const getDockerFileForBackendNode = nodeVersion => {
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

export const getDockerComposeFileForBackendNode = projectName => {
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
      - documentation
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
      - documentation
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
      - documentation

  redis:
    image: redis:alpine
    container_name: \${COMPOSE_PROJECT_NAME:?err}_redis
    ports:
      - '\${DOCKER_REDIS_PORT:?err}:6379'
    networks:
      - documentation

networks:
  documentation:
    driver: bridge
volumes:
  mysql-data:
`;
};

export const getEcosystemConfigJsFileForBackendNode = projectName => {
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

export const getDeployShFileForBackendNode = projectName => {
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

export const getDotEnvFileForBackendNode = projectName => {
  return `
PORT=3010
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

// php laravel

export const getDockerFileForBackendPhp = phpVersion => {
  return `
# Use the official PHP image as the base image  
FROM webdevops/php-nginx:8.2

# Set timezone
ENV TZ=Asia/Dhaka

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    mariadb-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /app

# Copy Laravel application
COPY . /app

# Set permissions
RUN chown -R application:application /app \
    && chmod -R 775 /app/storage /app/bootstrap/cache

# Configure cron for Laravel scheduler
RUN docker-cronjob '* * * * * root /usr/local/bin/php /app/artisan schedule:run >> /app/storage/logs/cron.log 2>&1'

# Enable cron service
RUN docker-service enable cron



# Expose web server port
EXPOSE 80

# Start supervisord
CMD ["supervisord"]
`;
};

export const getDockerComposeFileForBackendPhp = projectName => {
  return `
version: "3.7"

services:
    application:
        build:
            context: .
            dockerfile: Dockerfile
        image: \${COMPOSE_PROJECT_NAME:?err}_image
        tty: true
        restart: unless-stopped
        container_name: \${COMPOSE_PROJECT_NAME:?err}_container
        environment:
            - TZ=Asia/Dhaka
            - WEB_DOCUMENT_ROOT=/app/public
            - php.memory_limit=2048M
            - php.session.gc_maxlifetime=31536000
            - php.session.cookie_lifetime=31536000
            - PHP_DISPLAY_ERRORS=1
            - PHP_ERROR_REPORTING=E_ALL
            - PHP_LOG_ERRORS=1
        ports:
            - "\${PORT}:80"
        volumes:
            - ./:/app
            - ./storage/logs/cron.log:/app/storage/logs/cron.log
        networks:
            - \${COMPOSE_PROJECT_NAME:?err}_network
        command: >
            sh -c "
            php artisan migrate &&
            supervisord -n
            "

    db:
        image: mariadb:10.8.2
        container_name: \${COMPOSE_PROJECT_NAME:?err}_db
        restart: unless-stopped
        environment:
            MYSQL_DATABASE: \${DB_DATABASE}
            MYSQL_ROOT_PASSWORD: \${DB_PASSWORD}
            MYSQL_USER: \${DB_USERNAME}
            MYSQL_PASSWORD: \${DB_PASSWORD}
            TZ: Asia/Dhaka
        ports:
            - "\${DOCKER_MYSQL_PORT}:3306"
        volumes:
            - db_data:/var/lib/mysql
        networks:
            - \${COMPOSE_PROJECT_NAME:?err}_network

    phpmyadmin:
        image: phpmyadmin/phpmyadmin
        container_name: \${COMPOSE_PROJECT_NAME:?err}_phpmyadmin
        restart: unless-stopped
        environment:
            PMA_HOST: \${DB_HOST}
            MYSQL_ROOT_PASSWORD: \${DB_PASSWORD}
        ports:
            - "\${DOCKER_PHPMYADMIN_PORT}:80"
        networks:
            - \${COMPOSE_PROJECT_NAME:?err}_network

networks:
    ${projectName}_network:
        driver: bridge

volumes:
    db_data:
`;
};

export const getDeployShFileForBackendPhp = projectName => {
  return `
git pull
docker-compose down
docker-compose up -d --build
docker exec ${projectName}_container php artisan migrate
`;
};

export const getBitbucketPipelinesFileForBackendPhp = (
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

export const getDotEnvFileForBackendPhp = projectName => {
  return `
APP_URL=http://localhost:8099
PORT=8099
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=${projectName}
DB_USERNAME=root
DB_PASSWORD=123456
COMPOSE_PROJECT_NAME=${projectName}
DOCKER_MYSQL_PORT=3377
DOCKER_PHPMYADMIN_PORT=3378
  `;
};
