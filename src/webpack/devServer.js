const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackDevMiddleware = require('webpack-dev-middleware');
const express = require('express');
// const handlebars = require('handlebars');
const portfinder = require('portfinder');
const util = require('util');
const chalk = require('chalk');
const open = require('open');

const extendObject = require('../util/extendObject');
const createObjectFromJSONPath = require('../util/createObjectFromJSONPath');
const getDataFromGoogleSpreadsheet = require('../util/getDataFromGoogleSpreadsheet');
const removeTempRichmediaRc = require('../util/removeTempRichmediaRc');

const getNameFromLocation = require('../util/getNameFromLocation');

/**
 *
 * @param {Array<{webpack: *, settings: {location, data}}>} configs
 * @param {boolean} openLocation
 */
module.exports = async function devServer(configs, openLocation = true) {
  const webpackConfigList = configs.map(({ webpack }) => webpack);
  const settingsList = configs.map(({ settings }) => settings);
  const port = await portfinder.getPortPromise();

  const httpLocation = `http://localhost:${port}`;

  if (openLocation) {
    // opener
    open(`${httpLocation}?gsdevtools=true`);
  }

  console.log(`
${chalk.blue('i')} ${openLocation
  ? `Server ${httpLocation} is running and will open automatically. It might take a while to load.`
  : `Server ${httpLocation} is running. It might take a while to load.`
}
${chalk.grey.bold('-------------------------------------------------------')}
  `);

  const app = express();

  webpackConfigList.forEach((config, index) => {
    const hmrPath = '__webpack_hmr';
    const name = getNameFromLocation(settingsList[index].location);

    config.mode = 'development';

    config.output = {
      ...config.output,
      hotUpdateChunkFilename: '.hot/.hot-update.js',
      hotUpdateMainFilename: '.hot/.hot-update.json',
    };

    const compiler = webpack(config, function(result) {
      console.log(result)
    });

    app.use(
      webpackDevMiddleware(compiler, {
        publicPath: `/${name}/`,
      }),
    );

    app.use(
      webpackHotMiddleware(compiler, {
        path: `/${name}/${hmrPath}`,
      }),
    );
  });

  app.use('/', express.static(path.join(__dirname, '../preview/dist')));

  app.get('/data/ads.json', (req, res) => {
    res.json({
      isGoogleSpreadsheetBanner: typeof configs[0].settings.data.settings.contentSource !== 'undefined',
      ads: settingsList.map(e => {
        const assetName = getNameFromLocation(e.location)
        const bundleName = e.data.settings.bundleName || getNameFromLocation(e.location)
        const url = `${httpLocation}/${assetName}/index.html`
        return {
          url,
          ...e.data.settings.size,
          bundleName,
          output: {
            html: {
              url,
            },
          },
        }
      })
    })
  })

  app.get("/reload_dynamic_data", async function (req, res) {
    const contentSource = configs[0].settings.data.settings.contentSource;
    const spreadsheetData = await getDataFromGoogleSpreadsheet(contentSource);

    configs.forEach(config => {
      let row = spreadsheetData.rows[config.settings.row.rowNumber-2]; //for example, row number 2 is array element 0

      const staticRow = spreadsheetData.headerValues.reduce((prev, name) => {
        prev[name] = row[name];
        return prev;
      }, {});

      let staticRowObject = {};
      for (const key in staticRow) {
        if (staticRow.hasOwnProperty(key)) {
          let obj = createObjectFromJSONPath(key, staticRow[key]);
          extendObject(staticRowObject, obj);
        }
      }

      // filter out everything that is not needed.
      if (config.settings.data.settings.contentSource.filter) {
        const filters = [];
        if (config.settings.data.settings.contentSource.filter instanceof Array) {
          filters.push(...config.settings.data.settings.contentSource.filter);
        } else {
          filters.push(config.settings.data.settings.contentSource.filter);
        }

        // for loop so i can break or return emmediatly
        for (let j = 0; j < filters.length; j++) {
          const filter = filters[j];
          for (const key in filter) {
            if (filter.hasOwnProperty(key) && staticRowObject[key] && staticRowObject[key] !== filter[key]) {
              return;
            }
          }
        }
      }

      // new content object with updated content from sheet
      let content = extendObject({}, (config.settings.data.content || {}), staticRowObject)

      // next 4 lines is reading existing richmediarc from the disk, updating the content object, and then writing the new file to disk again
      const configFile = fs.readFileSync(config.settings.location, {encoding:'utf8', flag:'r'})
      const configFileJson = JSON.parse(configFile);
      content = JSON.parse(JSON.stringify(content))

      if (!util.isDeepStrictEqual(configFileJson.content, content)) { //compare 'new' content with old content. If anything has changed, write a new file
        configFileJson.content = content;
        fs.writeFileSync(config.settings.location, Buffer.from(JSON.stringify(configFileJson)));
      }
    })

    res.send('ok');
  });

  // notr sure if this does anything
  // app.post('/api/upload', (req, res) => {});

  // eslint-disable-next-line
  process.stdin.resume();//so the program will not close instantly

  function exitHandler(options, exitCode) {
    if (options.cleanup) removeTempRichmediaRc(configs);
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
  }

  //do something when app is closing
  process.on('exit', exitHandler.bind(null,{cleanup:true}));

  //catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, {exit:true}));

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
  process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

  //catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

  app.listen(port, () => {});
};
