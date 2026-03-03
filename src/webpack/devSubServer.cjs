// devSubServer.cjs — MUST stay CommonJS (used by worker-farm via child_process.fork)
module.exports = async function devSubServer({configs, options, port}, cb) {
  const [
    { default: webpack },
    { default: webpackHotMiddleware },
    { default: webpackDevMiddleware },
    { default: express },
    { default: createConfigByRichmediarcList },
    { default: getNameFromLocation },
  ] = await Promise.all([
    import('webpack'),
    import('webpack-hot-middleware'),
    import('webpack-dev-middleware'),
    import('express'),
    import('./config/createConfigByRichmediarcList.js'),
    import('../util/getNameFromLocation.js'),
  ]);

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

    process.send('increment');
  }

  app.listen(port, () => {});
  cb();
};
