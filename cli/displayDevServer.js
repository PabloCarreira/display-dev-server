#! /usr/bin/env node

import displayDevServer from '../src/index.js';
import { program } from 'commander';
import chalk from 'chalk';
import * as base64 from '../src/util/base64.js';
import { createRequire } from 'module';

import fs from 'fs';

const _require = createRequire(import.meta.url);
const packageJson = _require('../package.json');

const chalkPkg = JSON.parse(fs.readFileSync(new URL('../node_modules/chalk/package.json', import.meta.url), 'utf8'));
const inquirerPkg = JSON.parse(fs.readFileSync(new URL('../node_modules/inquirer/package.json', import.meta.url), 'utf8'));
const openPkg = JSON.parse(fs.readFileSync(new URL('../node_modules/open/package.json', import.meta.url), 'utf8'));

console.log(`Welcome to the ${chalk.green.bold(`Display.Monks Development Server`)} v${packageJson.version}`);
console.log(chalk.gray(`[Deps] chalk: v${chalkPkg.version} | inquirer: v${inquirerPkg.version} | open: v${openPkg.version}`));

program
  .version(packageJson.version)
  .option('-g, --glob <data>', 'Globbing pattern like "-p ./src/**/.richmediarc"', "./**/.richmediarc*")
  .option('-s, --stats', 'Show stats when building')
  .option('-c, --choices <data>', 'predetermined settings')
  .option('-m, --mode <data>', 'development or production', 'development')
  .option('-o, --outputDir <data>', 'output dir', './build')
  .option('--skipBuild', 'skip compiling ads phase', false)
  .option('--skipPreview', 'skip preview building phase', false)
  .option('-p, --parallel [data]', 'run webpack in parallel')
  .parse(process.argv);

const options = program.opts();

await displayDevServer({
  ...options,
  choices: options.choices ? JSON.parse(base64.decode(options.choices)) : null,
});

console.log(`${chalk.green('✔')} done`);


