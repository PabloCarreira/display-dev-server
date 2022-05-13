const webpack = require('webpack');
const inquirer = require('inquirer');
const chalk = require('chalk');
const Spinner = require('cli-spinner').Spinner;
const fs = require('fs-extra');
const path = require('path');
const globPromise = require('glob-promise');

const findRichmediaRC = require('./util/findRichmediaRC');
const createConfigByRichmediarcList = require('./webpack/config/createConfigByRichmediarcList');
const getTemplate = require('./util/getBuildTemplate');
const expandWithSpreadsheetData = require('./util/expandWithSpreadsheetData');
const saveChoicesInPackageJson = require('./util/saveChoicesInPackageJson');
const parsePlaceholdersInObject = require('./util/parsePlaceholdersInObject');

/**
 *
 * @param {object} options
 * @param {string} options.allConfigsSelector
 * @param {boolean} options.stats
 * @param {object} options.answers
 * @param {boolean} options.answers.emptyBuildDir
 * @param {Array<string>} options.answers.build
 * @return {Promise<any | never>}
 */
module.exports = async function build({
                                        glob = './**/.richmediarc*',
                                        stats = false,
                                        choices = {},
                                      }) {
  const buildTarget = './build';
  const mode = 'production';

  const spinner = new Spinner('processing.. %s');
  spinner.setSpinnerString('/-\\|');
  spinner.start();

  let configs = await findRichmediaRC(glob, ['settings.entry.js', 'settings.entry.html']);

  spinner.stop(true);

  if (configs.length === 0) {
    throw new Error('could not find a compatible .richmediarc with entry points configured');
  }

  // parse placeholders in content source so it works with spreadsheets
  configs.forEach(config => {
    if(config.data.settings.contentSource) {
      config.data.settings.contentSource = parsePlaceholdersInObject(config.data.settings.contentSource, config.data);
    }
  })

  configs = await expandWithSpreadsheetData(configs, mode);

  const bundleNames = [];

  // parse placeholders for everything
  configs.forEach(config => {
    if(config.data) {
      const configCopy = JSON.parse(JSON.stringify(config.data));
      config.data = parsePlaceholdersInObject(configCopy, configCopy);

      // checking if duplicate bundleNames exists
      if(config.data.settings.bundleName){
        if(bundleNames.indexOf(config.data.settings.bundleName) > -1){
          console.warn(`bundleName ${config.data.settings.bundleName} already exists. This will cause huge issues.`);
        } else {
          bundleNames.push(config.data.settings.bundleName);
        }
      }
    }
  });

  const questions = [];

  const filesBuild = await globPromise(`${buildTarget}/**/*`);

  if (!choices) {
    let options = {};
    if (filesBuild.length > 0) {
      if (typeof options.emptyBuildDir !== 'boolean') {
        questions.push({
          type: 'confirm',
          name: 'emptyBuildDir',
          message: `Empty build dir? ${chalk.red(
            `( ${filesBuild.length} files in ${path.resolve(buildTarget)})`,
          )}`,
        });
      }
    }

    if (configs.length > 1) {
      if (!(options.build instanceof Array)) {
        questions.push({
          type: 'checkbox',
          name: 'build',
          message: 'Please choose the current build to start.',
          choices: [
            { name: 'all', checked: false },
            ...configs.map(({ location }) => ({ name: location, checked: false })),
          ],
          validate: function(answer) {
            if (answer.length < 1) {
              return 'You must choose at least one.';
            }
            return true;
          },
        });
      }
    } else {
      console.log(`${chalk.green('✔')} One config found ${configs[0].location}`);
      options.build = [configs[0].location];
    }

    options = {
      ...options,
      ...(await inquirer.prompt(questions)),
    };

    choices = options;

    await saveChoicesInPackageJson('build', {
      glob,
      choices,
      stats,
    });
  }

  if (choices.emptyBuildDir) {
    await fs.emptyDir(buildTarget);
  }

  let configsResult = null;

  if (choices.build.find(item => item === 'all')) {
    configsResult = configs;
  } else {
    configsResult = configs.filter(config => choices.build.indexOf(config.location) >= 0);
  }



  //if the richmediarc location doesn't actually exist, assume its a config derived from google spreadsheets, so we write one to disk
  configsResult.forEach(config => {
    if (!fs.existsSync(config.location)) {
      const data = Buffer.from(JSON.stringify(config.data));
      fs.writeFileSync(config.location, data);
    }
  })

  const result = await createConfigByRichmediarcList(configsResult, {
    mode,
    stats: stats,
  });

  return new Promise((resolve, reject) => {
    webpack(result).run((err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          err.details.forEach((item, index) => {
            console.error(index, item);
          });
        }
        return;
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        info.errors.forEach((item, index) => {
          console.log(chalk.red(item.message));
        });
      }

      if (stats.hasWarnings()) {
        info.warnings.forEach(item => {
          console.log(chalk.green(item.message));
        });
      }

      resolve();
    });
  })

    .then(async () => {
      const template = await getTemplate();

      console.log('Removing temp .richmediarc...')
      configsResult.forEach(config => {
        try {
          if (config.willBeDeletedAfterServerCloses) {
            console.log('checking ' + config.location)
            const fileData = fs.readFileSync(config.location, {encoding: 'utf8'});
            const fileDataJson = JSON.parse(fileData);

            if (config.uniqueHash === fileDataJson.uniqueHash) {
              console.log('valid. deleting ' + config.location)
              fs.unlinkSync(config.location);
            } else {
              console.log('not valid.')
            }
          }

        } catch (e) {
          console.log(e);
          console.log('Could not clean up file(s). Manual cleanup needed');
        }
      })

      const templateConfig = {
        banner: configsResult.map((richmediarc, index) => {

          const webpackConfig = result[index];

          let bundleName = /[^/\\]*$/.exec(webpackConfig.output.path)[0]
          // bundleName = getNameFromLocation(bundleName);
          // console.log(name);

          let width = richmediarc.data.settings.size.width;
          let height = richmediarc.data.settings.size.height;
          const isDevelopment = false;

          // if (item.data.settings.expandable) {
          //   width = item.data.settings.expandable.width;
          //   height = item.data.settings.expandable.height;
          //   title += "_EXP_" + width + "x" + height;
          // }

          return {
            src: `./${bundleName}/`,
            name: bundleName,
            title: bundleName,
            width,
            height,
            isDevelopment,
          };
        }),
      };

      // move static files to folder
      await fs.mkdir('./build/static/');
      const staticPreviewFiles = ['gsap.min.js', 'GSDevTools.min.js', 'main.js', 'material-design.css', 'material-design.js', 'style.css'];
      await staticPreviewFiles.forEach(filename => {
        fs.copyFile(path.join(__dirname, 'data/static/')+filename, './build/static/'+filename, (err) => {
          if (err) throw err;
        });
      });

      //return built index.html
      return fs.outputFile('./build/index.html', template(templateConfig));
    })
    .then(() => {
      return globPromise(`${buildTarget}/**/*`);
    });
};
