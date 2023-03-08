const path = require('path');
const fs = require('fs-extra');
const Ajv = require('ajv');
const draft07 = require('ajv/lib/refs/json-schema-draft-07.json');

const createConfig = require('./createConfig');
const isGoogleSpreadsheetUrl = require('../../util/isGoogleSpreadsheetUrl');
const getNameFromLocation = require('../../util/getNameFromLocation');
const {GoogleSpreadsheet} = require('google-spreadsheet');

const schema = require('../../schema/richmediarc.schema.json');

/**
 *
 * @param {string} richmediaConfigLocation
 * @param {any} richmediaConfig
 * @param outputDir
 * @return {{filepathHtml: string, filepathJs: string, filepathRichmediaRC: string, outputPath: string}}
 */
function validateSchemaAndCreatePaths(richmediaConfigLocation, richmediaConfig, outputDir) {
  const ajv = new Ajv({allErrors: true});
  const validate = ajv.compile(schema);
  const valid = validate(richmediaConfig);

  if (!valid) {
    throw new Error('Invalid: ' + ajv.errorsText(validate.errors));
  }

  if (
    !richmediaConfig ||
    !richmediaConfig.settings ||
    !richmediaConfig.settings.entry ||
    !richmediaConfig.settings.entry.js ||
    !richmediaConfig.settings.entry.html
  ) {
    throw new Error(
      `missing js or/and html in settings.entry in file ${path.resolve(richmediaConfigLocation)}`,
    );
  }

  const outputPath = path.resolve(
    path.join(`${outputDir}`, getNameFromLocation(richmediaConfigLocation)),
  );
  const richmediarcFilepath = path.resolve(richmediaConfigLocation);

  return {
    richmediarcFilepath,
    outputPath,
  };
}

/**
 *
 * @param {Array<{location, data}>} richmediarcList
 * @param {string} mode
 * @param stats
 * @param outputDir
 * @return {Promise<any[]>}
 */
async function createConfigByRichmediarcList(richmediarcList, {mode, stats, outputDir}) {
  const promiseList = richmediarcList.map(
    ({location, data}) => {
      /**
       * const {
       *   filepathHtml,
       *   filepathJs,
       *   filepathRichmediaRC,
       *   outputPath,
       *   platform
       * } = validateSchemaAndCreatePaths(location, data);
       */
      const webpackConfig = createConfig({
        ...validateSchemaAndCreatePaths(location, data, outputDir),
        richmediarc: data,
        options: {
          mode,
          stats,
        },
      });

      const webpackFilepath = path.resolve(`${path.dirname(location)}/webpack.config.js`);

      // check if webpackconfig exists
      return fs.pathExists(webpackFilepath).then(exists => {
        if (exists) {
          // eslint-disable-next-line
          const webpack = require(webpackFilepath);

          if (typeof webpack === 'function') {
            return webpack(webpackConfig);
          }

          return webpack;
        }

        return webpackConfig;
      });
    },
    // projects can have there own webpack config. this will override the generated one.
  );

  const webpackConfigs = await Promise.all(promiseList);

  return webpackConfigs.filter(config => !!config);
}

module.exports = createConfigByRichmediarcList;
