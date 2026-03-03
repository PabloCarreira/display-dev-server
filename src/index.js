import getWebpackConfigs from './webpack/getWebpackConfigs.js';
import devServer from './webpack/devServer.js';
import devServerParallel from './webpack/devServerParallel.js';
import buildFiles from './webpack/buildFiles.js';
import buildFilesParallel from './webpack/buildFilesParallel.js';
import buildPreview from './webpack/buildPreview.js';
import deleteAllGooglesheetFiles from './util/deleteAllGooglesheetFiles.js';

export default async function (options) {
  // {mode = "development", glob = "./**/.richmediarc*", choices = null, stats = null, outputDir = "./build", configOverride = {}}
  let {mode, glob, choices, stats, outputDir, skipBuild, skipPreview, parallel} = options;

  if (mode == "cleanup") {
    return await deleteAllGooglesheetFiles()
  }

  const webpackConfigs = !skipBuild ? await getWebpackConfigs(options) : null;

  if (mode === "development") {
    if (parallel) await devServerParallel(webpackConfigs.result, webpackConfigs.choices.openLocation, options);
    else          await devServer(webpackConfigs.result, webpackConfigs.choices.openLocation);
  } else {
    let qualities
    if (!skipBuild) {
      if (parallel) qualities = await buildFilesParallel(webpackConfigs.result, options);
      else          qualities = await buildFiles(webpackConfigs.result, outputDir);
    }
    if (!skipPreview) await buildPreview(webpackConfigs?.result, qualities?.ads, outputDir);
  }
};
