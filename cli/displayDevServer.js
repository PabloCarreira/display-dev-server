#! /usr/bin/env node

import displayDevServer from '../src/index.js';
import { program } from 'commander';
import chalk from 'chalk';
import * as base64 from '../src/util/base64.js';
import { createRequire } from 'module';

const _require = createRequire(import.meta.url);
const packageJson = _require('../package.json');

console.log(`Welcome to the ${chalk.green.bold(`Display.Monks Development Server`)} v${packageJson.version}`);

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


