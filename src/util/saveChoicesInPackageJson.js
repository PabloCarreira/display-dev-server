import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import * as base64 from './base64.js';

export default async function saveChoicesInPackageJson(type, {glob, choices, stats}) {
  if (!type || (type !== 'dev' && type !== 'build')) {
    throw new Error('type is not set or not of value dev or build.');
  }

  if (!glob) {
    throw new Error('glob is not set.');
  }

  let result = await inquirer.prompt({
    type: 'confirm',
    name: 'saveSettings',
    default: false,
    message: `save this as a separate command in package.json`,
  });

  if (result.saveSettings) {
    const packageJsonFilepath = path.resolve(process.cwd(), './package.json');
    let packageJson = JSON.parse(fs.readFileSync(packageJsonFilepath, 'utf-8'));
    const {scripts} = packageJson;

    result = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: `please provide a name for your command. You will type something like npm run ${type}:__NAME__
No special chars, spaces, dashes just a single word.`,
      validate: function (value) {
        var pass = value.match(/^[a-zA-Z\d_]+$/g);
        if (pass) {
          if (scripts[`${type}:${value}`]) {
            return `"${type}:${value}" is already in use.`;
          }

          return true;
        } else {
          return 'Please enter a valid command name';
        }
      },
    });

    const command = [`dds --mode ${type === 'dev' ? 'development' : 'production'}`];
    command.push(`--glob ${glob}`);
    command.push(`--choices ${base64.encode(JSON.stringify(choices))}`);

    if (stats) {
      command.push(`--stats`);
    }

    scripts[`${type}:${result.name}`] = `${command.join(' ')}`;

    packageJson = {
      ...packageJson,
      scripts,
    };

    await new Promise((resolve, reject) => {
      fs.writeFile(packageJsonFilepath, JSON.stringify(packageJson, null, 2), function writeJSON(
        err,
      ) {
        if (err) reject(err);
        resolve(true);
      });
    });

    console.log(
      `${chalk.blue('i')} saved choice in package.json. Can now repeat choices with ${chalk.blue(
        `npm run ${type}:${result.name}`,
      )}`,
    );
  }
};
