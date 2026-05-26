import { parentPort } from 'worker_threads';
import webpack from 'webpack';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackDevMiddleware from 'webpack-dev-middleware';
import express from 'express';
import createConfigByRichmediarcList from './config/createConfigByRichmediarcList.js';
import getNameFromLocation from '../util/getNameFromLocation.js';

parentPort.on('message', async ({ configs, options, port }) => {
  try {
    const webpackConfigList = await createConfigByRichmediarcList(configs, options);
    const settingsList = configs;

    const app = express();

    // for loop to make webpacks run 1 at a time, we're anyway in parallel
    for (let index = 0; index < webpackConfigList.length; index++) {
      const config = webpackConfigList[index];

      const hmrPath = '__webpack_hmr';
      const name = getNameFromLocation(settingsList[index].location);

      config.mode = 'development';

      config.output = {
        ...config.output,
        hotUpdateChunkFilename: '.hot/.hot-update.js',
        hotUpdateMainFilename: '.hot/.hot-update.json',
      };

      await new Promise(res => {
        const compiler = webpack(config, res);

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

      parentPort.postMessage({ type: 'increment' });
    }

    app.listen(port, () => {});
    parentPort.postMessage({ type: 'done' });
  } catch (err) {
    console.error(err);
    parentPort.postMessage({ type: 'error', message: err.message });
  }
});
