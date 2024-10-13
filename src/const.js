// for front-end

export const getDockerFile = nodeVersion => {
  return `
FROM ${nodeVersion}

RUN npm install pm2 -g

EXPOSE 3000
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
            image: ${projectName}
            tty: true
            restart: unless-stopped
            container_name: ${projectName}
            working_dir: /app/
            volumes:
                - ./:/app
            ports:
                - "3000:3000"
            networks:
                - ${projectName}
    networks:
        ${projectName}:
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

export const getDeployShFile = projectName => {
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

// for back-end

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
    image: ${projectName}
    tty: true
    restart: unless-stopped
    container_name: ${projectName}
    working_dir: /app/
    volumes:
      - ./:/app
    networks:
      - documentation
    ports:
      - '3010:3010'
    depends_on:
      - db
      - redis

  db:
    image: mysql:8.0
    container_name: ${projectName}_db
    restart: unless-stopped
    command: --max_allowed_packet=32505856
    environment:
      MYSQL_DATABASE: ${projectName}
      MYSQL_ROOT_PASSWORD: 123456
      SERVICE_TAGS: dev
      SERVICE_NAME: mysql
      TZ: Asia/Dhaka
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - documentation
    ports:
      - '3306:3306'

  phpmyadmin:
    depends_on:
      - db
    image: phpmyadmin/phpmyadmin
    restart: always
    ports:
      - '80:80'
    environment:
      PMA_VERBOSE: 'Docker MySQL,Local MySQL'
      MYSQL_ROOT_PASSWORD: 123456
    networks:
      - documentation

  redis:
    image: redis:alpine
    container_name: ${projectName}_redis
    ports:
      - '6379:6379'
    networks:
      - documentation

networks:
  documentation:
    driver: bridge
volumes:
  mysql-data:
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
