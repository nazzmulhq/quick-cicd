# Introduction

Quick CICD With Bitbucket is a tool designed to streamline the setup of Continuous Integration and Continuous Deployment (CI/CD) pipelines for your projects using Bitbucket. This tool automates the creation of essential configuration files and scripts required for Docker-based deployments, making it easier to get your project up and running with CI/CD.

Check out the complete documentation [HERE](https://www.npmjs.com/package/quick-cicd).<br/>

## Features

- **Automated Setup**: Quickly set up Docker and CI/CD configuration files.
- **Customizable**: Supports different project types (React.js,Node.js, PHP (Coming Soon), Python (Coming Soon) etc.).
- **Ease of Use**: Simple command-line interface to guide you through the setup process.
- **Integration with Bitbucket**: Seamlessly integrates with Bitbucket Pipelines for automated deployments.

# Prerequisites

Installed: [Node.js](https://nodejs.org/en/download/package-manager) | [Docker](https://www.docker.com/products/docker-desktop/)

# Installation

Step 1: Open a terminal in the root directory of your project and make sure you have a package.json file. Then run the following command:

```
npx quick-cicd
```

Step 2: env.example file will be created in the root directory of your project. Rename it to .env and fill in the required environment variables.

Step 3: Create a new repository on Bitbucket and push your project to it.

Step 4: Go to the repository settings and enable Pipelines.

Step 5: Go to the Pipelines section and click on the 'Set up a new pipeline' button.

Step 6: Select the language and framework of your project.

Step 7: On your server generate an SSH key Pair, run the following command:

`ssh-keygen -t rsa -b 4096 -C "your_email@example.com`
step 8: Copy the public key (~/.ssh/id_rsa.pub) and add it to bitbucket under the SSH keys section in the settings.

```
Go to the repository settings -> Access keys -> Add key -> Paste the public key.
```

Step 9: git status -> git add . -> git commit -m "Initial commit" -> git push origin branch-name.

Step 10: Go to your server and run the following command:

`bash deploy.sh`

Step 11: Your project will be deployed to the server.

##### Now you have a fully automated CI/CD pipeline set up with Bitbucket Pipelines.

##### If push to the repository is detected, the pipeline will run and deploy your project to the server.
