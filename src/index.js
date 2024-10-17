#!/usr/bin/env node

import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import {
  getBitbucketPipelinesFile,
  getBitbucketPipelinesFileForBackendNode,
  getDeployShFile,
  getDeployShFileForBackendNode,
  getDockerComposeFile,
  getDockerComposeFileForBackendNode,
  getDockerFile,
  getDockerFileForBackendNode,
  getDotEnvFileForBackendNode,
  getEcosystemConfigJsFile,
  getEcosystemConfigJsFileForBackendNode,
} from './const.js';

// set default values

const questions = [
  {
    type: 'list',
    name: 'projectType',
    message: 'Select project type:',
    choices: ['frontend (react)', 'backend'],
    default: 'frontend (react)',
  },
  {
    type: 'list',
    name: 'projectLanguage',
    message: 'Select project language:',
    choices: [
      'node-(express or nest.js)',
      'php-(coming soon)',
      'python-(coming soon)',
    ],
    when: answers => answers.projectType === 'backend',
    default: 'node-(express or nest.js)',
  },
  {
    type: 'input',
    name: 'projectName',
    message: 'Enter project name:',
    default: 'my-app',
  },
  {
    type: 'input',
    name: 'dependency',
    message: 'Enter dependency package:',
    default: 'node:20.16.0',
  },
  {
    type: 'input',
    name: 'caches',
    message: 'Enter project caches:',
    default: 'node',
  },
];

async function main() {
  console.log(
    chalk.green(`
  Thank you for using the QUICK-CICD generator.
  If you have any questions or issues, please inform me
  Name: Nazmul Haque
  Email: nazmul2018s@gmail.com
  LinkedIn: https://www.linkedin.com/in/nazmul-haque-020010194/
  My Portfolio: https://nazmulhaque.netlify.app/
`)
  );
  console.log('');

  const currentDir = process.cwd();
  const isExistFiles = [
    'Dockerfile',
    'docker-compose.yml',
    'ecosystem.config.js',
    'deploy.sh',
    'bitbucket-pipelines.yml',
  ];
  const existFiles = isExistFiles.filter(file =>
    fs.existsSync(path.join(currentDir, file))
  );
  if (existFiles.length > 0) {
    console.log(
      chalk.red('Error:'),
      'Files already exist in the current directory.'
    );
    process.exit(1);
  }
  const answers = await inquirer.prompt(questions);
  const keyName =
    answers.projectType === 'backend' ? 'projectLanguage' : 'projectType';
  if (
    answers.projectType === 'backend' &&
    answers.projectLanguage === 'php-(coming soon)'
  ) {
    console.log(chalk.red('Error:'), 'PHP is not supported yet.');
    process.exit(1);
  }
  if (
    answers.projectType === 'backend' &&
    answers.projectLanguage === 'python-(coming soon)'
  ) {
    console.log(chalk.red('Error:'), 'Python is not supported yet.');
    process.exit(1);
  }
  const spinner = ora('Processing...').start();

  const files = {
    'frontend (react)': [
      { name: 'Dockerfile', content: getDockerFile(answers.dependency) },
      {
        name: 'docker-compose.yml',
        content: getDockerComposeFile(answers.projectName),
      },
      {
        name: 'ecosystem.config.js',
        content: getEcosystemConfigJsFile(answers.projectName),
      },
      { name: 'deploy.sh', content: getDeployShFile(answers.projectName) },
      {
        name: 'bitbucket-pipelines.yml',
        content: getBitbucketPipelinesFile(
          answers.projectName,
          answers.dependency,
          answers.caches
        ),
      },
    ],
    'node-(express or nest.js)': [
      {
        name: 'Dockerfile',
        content: getDockerFileForBackendNode(answers.dependency),
      },
      {
        name: 'docker-compose.yml',
        content: getDockerComposeFileForBackendNode(answers.projectName),
      },
      {
        name: 'ecosystem.config.js',
        content: getEcosystemConfigJsFileForBackendNode(answers.projectName),
      },
      {
        name: 'deploy.sh',
        content: getDeployShFileForBackendNode(answers.projectName),
      },
      {
        name: 'bitbucket-pipelines.yml',
        content: getBitbucketPipelinesFileForBackendNode(
          answers.projectName,
          answers.dependency,
          answers.caches
        ),
      },
      {
        name: 'env.example',
        content: getDotEnvFileForBackendNode(answers.projectName),
      },
    ],
    php: [],
    python: [],
  };

  try {
    console.log('');
    const correctFiles = files[answers[keyName]];

    for (const file of correctFiles) {
      const filePath = path.join(currentDir, file.name);
      await fs.outputFile(filePath, file.content);
      console.log(chalk.green(`✔ Created ${file.name}`));
    }
    console.log('');
    spinner.succeed('Files created successfully.');
  } catch (error) {
    spinner.fail('Error creating files.');
    console.error(chalk.red('Error:'), error);
  }

  process.exit(0);
}

main().catch(error => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
