#!/usr/bin/env node

import chalk from 'chalk';
import cp from 'child_process';
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
  getDotEnvFile,
  getDotEnvFileForBackendNode,
  getEcosystemConfigJsFile,
} from './const.js';

async function shellCommand(command) {
  try {
    const isError = shell.exec(command).code !== 0;
    if (isError) {
      shell.echo(`Error: ${command} failed`);
      shell.exit(1);
    }
    return null;
  } catch (error) {
    return null;
  }
}

const checkPackageJson = async () => {
  if (!fs.existsSync('./package.json')) {
    console.log(
      chalk.red('Error:'),
      'package.json file not found in the current directory.'
    );
    process.exit(1);
  }
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
  return pkg.name;
};

const checkPHPComposerJson = async () => {
  if (!fs.existsSync('./composer.json')) {
    console.log(
      chalk.red('Error:'),
      'composer.json file not found in the current directory.'
    );
    process.exit(1);
  }
  const composer = JSON.parse(fs.readFileSync('./composer.json', 'utf-8'));
  return 'my-laravel-project';
};

const checkNodeVersion = async () => {
  const nodeVersion = cp.execSync('node -v').toString();
  return String(nodeVersion)
    .trim()
    .slice(1);
};
const checkPHPVersion = async => {
  const phpVersion = cp
    .execSync(`php -r "echo PHP_VERSION . PHP_EOL;"`)
    .toString();
  return phpVersion;
};

const questions = [
  {
    type: 'list',
    name: 'projectType',
    message: 'Select project type:',
    choices: [
      "ViteJS-(React)"
      'NextJS-(React)',
      'NodeJS-(ExpressJS or NestJS)',
      'PHP-(Coming Soon)',
      'Python-(Coming Soon)',
    ],
    default: 'frontend (react or next.js)',
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

  if (answers.projectType === 'PHP-(Coming Soon)') {
    console.log(chalk.red('Error:'), 'PHP is not supported yet.');
    process.exit(1);
  }
  if (answers.projectType === 'Python-(Coming Soon)') {
    console.log(chalk.red('Error:'), 'Python is not supported yet.');
    process.exit(1);
  }

  let projectName = '';
  let dependency = '';
  let caches = '';

  if (
    answers.projectType === 'NextJS-(React)' || answers.projectType === 'ViteJS-(React)'
    answers.projectType === 'NodeJS-(ExpressJS or NestJS)'
  ) {
    projectName = await checkPackageJson();
    const nodeVersion = await checkNodeVersion('node -v');
    dependency = `node:${nodeVersion}`;
    caches = 'npm';
  }

  if (answers.projectType === 'PHP-(Laravel)') {
    projectName = await checkPHPComposerJson();
    const phpVersion = await checkPHPVersion();
    dependency = `php:${phpVersion.trim()}`;
    caches = 'composer';
  }

  if (projectName === '' || dependency === '' || caches === '') {
    console.log(
      chalk.red('Error:'),
      'Project name, dependency, or caches not found.'
    );
    process.exit(1);
  }

  const spinner = ora('Processing...\n').start();

  console.log({
    projectName,
    dependency,
    caches,
  });

  const files = {
    'NextJS-(React)': [
      { name: 'Dockerfile', content: getDockerFile(dependency) },
      {
        name: 'docker-compose.yml',
        content: getDockerComposeFile(projectName),
      },
      {
        name: 'ecosystem.config.js',
        content: getEcosystemConfigJsFile(projectName),
      },
      { name: 'deploy.sh', content: getDeployShFile(answers.projectType, projectName) },
      {
        name: 'bitbucket-pipelines.yml',
        content: getBitbucketPipelinesFile(projectName, dependency, caches),
      },
      {
        name: 'env.example',
        content: getDotEnvFile(projectName),
      },
    ],
    'ViteJS-(React)': [
      { name: 'Dockerfile', content: getDockerFile(dependency) },
      {
        name: 'docker-compose.yml',
        content: getDockerComposeFile(projectName),
      },
      {
        name: 'ecosystem.config.js',
        content: getEcosystemConfigJsFile(projectName),
      },
      { name: 'deploy.sh', content: getDeployShFile(answers.projectType, projectName) },
      {
        name: 'bitbucket-pipelines.yml',
        content: getBitbucketPipelinesFile(projectName, dependency, caches),
      },
      {
        name: 'env.example',
        content: getDotEnvFile(projectName),
      },
    ],
    'NodeJS-(ExpressJS or NestJS)': [
      {
        name: 'Dockerfile',
        content: getDockerFileForBackendNode(dependency),
      },
      {
        name: 'docker-compose.yml',
        content: getDockerComposeFileForBackendNode(projectName),
      },

      {
        name: 'deploy.sh',
        content: getDeployShFileForBackendNode(projectName),
      },
      {
        name: 'bitbucket-pipelines.yml',
        content: getBitbucketPipelinesFileForBackendNode(
          projectName,
          dependency,
          caches
        ),
      },
      {
        name: 'env.example',
        content: getDotEnvFileForBackendNode(projectName),
      },
    ],
    'PHP-(Laravel)': [],
    PythonDjango: [],
  };

  try {
    console.log('');
    const correctFiles = files[answers?.projectType];

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
