// webpackRun.cjs — MUST stay CommonJS (used by worker-farm via child_process.fork)
module.exports = async function ({ config, options }, cb) {
  const [
    { default: webpack },
    { default: chalk },
    { default: createConfigByRichmediarcList },
  ] = await Promise.all([
    import('webpack'),
    import('chalk'),
    import('./config/createConfigByRichmediarcList.js'),
  ]);

  const webpackConfig = await createConfigByRichmediarcList([config], options);

  webpack(webpackConfig[0]).run((err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        err.details.forEach((item, index) => {
          console.error(index, item.message);
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

    // if (stats.hasWarnings()) {
    //   info.warnings.forEach((item) => {
    //     console.log(chalk.green(item.message));
    //   });
    // }

    cb(stats.compilation.quality);
  });
}
