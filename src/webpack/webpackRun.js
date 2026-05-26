import { parentPort } from 'worker_threads';
import webpack from 'webpack';
import chalk from 'chalk';
import createConfigByRichmediarcList from './config/createConfigByRichmediarcList.js';

parentPort.on('message', async ({ config, options }) => {
  try {
    const webpackConfig = await createConfigByRichmediarcList([config], options);

    webpack(webpackConfig[0]).run((err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          err.details.forEach((item, index) => {
            console.error(index, item.message);
          });
        }
        parentPort.postMessage({ type: 'result', quality: undefined });
        return;
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        info.errors.forEach((item, index) => {
          console.log(chalk.red(item.message));
        });
      }

      parentPort.postMessage({ type: 'result', quality: stats.compilation.quality });
    });
  } catch (err) {
    console.error(err);
    parentPort.postMessage({ type: 'result', quality: undefined });
  }
});
