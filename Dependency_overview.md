# Dependency overview

| Dependency | Purpose | Key usage files |
| --- | --- | --- |
| @babel/core | Transpile loader-injected code | [`extractLoader`](src/webpack/loader/extractLoader.js) |
| @babel/preset-env | Babel preset for loader sandbox | [`extractLoader`](src/webpack/loader/extractLoader.js) |
| archiver | Zip outputs/previews | [`buildPreview`](src/webpack/buildPreview.js), [`ZipFilesPlugin`](src/webpack/plugin/ZipFilesPlugin.js), [`OptimizeBundleToFilesizePlugin`](src/webpack/plugin/OptimizeBundleToFilesizePlugin.js) |
| babel-plugin-add-module-exports | Ensure CommonJS export in loader eval | [`extractLoader`](src/webpack/loader/extractLoader.js) |
| btoa | Base64 helper for loader sandbox | [`extractLoader`](src/webpack/loader/extractLoader.js) |
| chalk | CLI coloring/logging | [`getWebpackConfigs`](src/webpack/getWebpackConfigs.js), [`buildFiles`](src/webpack/buildFiles.js), [`devServer`](src/webpack/devServer.js), [`deleteAllGooglesheetFiles`](src/util/deleteAllGooglesheetFiles.js) |
| cli-progress | Build progress bars | [`buildFiles`](src/webpack/buildFiles.js), [`buildFilesParallel`](src/webpack/buildFilesParallel.js), [`devServerParallel`](src/webpack/devServerParallel.js) |
| cli-spinner | Discovery spinner | [`getWebpackConfigs`](src/webpack/getWebpackConfigs.js) |
| commander | CLI argument parsing | [`cli/displayDevServer`](cli/displayDevServer.js) |
| css-loader | CSS resolution in preview build | [`preview webpack config`](src/preview/webpack.config.js) |
| deepmerge | Merge parent/child configs | [`getRichmediaRC`](src/util/getRichmediaRC.js), [`getRichmediaRCSync`](src/util/getRichmediaRCSync.js) |
| esbuild-loader | (Not referenced in current code paths) | – |
| express | Dev servers/router | [`devServer`](src/webpack/devServer.js), [`devServerParallel`](src/webpack/devServerParallel.js), [`devSubServer`](src/webpack/devSubServer.js) |
| file-loader | Emit assets (css/fonts/etc.) | [`createConfig`](src/webpack/config/createConfig.js) |
| fluent-ffmpeg | Video metadata (dimensions) | [`buildPreview`](src/webpack/buildPreview.js) |
| fs-extra | FS utilities | [`getOAuth2Client`](src/util/getOAuth2Client.js), [`buildPreview`](src/webpack/buildPreview.js), [`getRichmediaRC`](src/util/getRichmediaRC.js) |
| glob-promise | File discovery | [`getWebpackConfigs`](src/webpack/getWebpackConfigs.js), [`buildPreview`](src/webpack/buildPreview.js), [`deleteAllGooglesheetFiles`](src/util/deleteAllGooglesheetFiles.js) |
| google-auth-library | OAuth client for Sheets | [`getOAuth2Client`](src/util/getOAuth2Client.js) |
| google-spreadsheet | Read spreadsheet content | [`createConfigByRichmediarcList`](src/webpack/config/createConfigByRichmediarcList.js) |
| handlebars | Preview template compilation | [`getPreviewTemplate`](src/util/getPreviewTemplate.js) |
| handlebars-loader | HBS -> HTML loader | [`createConfig`](src/webpack/config/createConfig.js) |
| html-loader | HTML import/minify | [`createConfig`](src/webpack/config/createConfig.js) |
| html-webpack-plugin | HTML generation | [`createConfig`](src/webpack/config/createConfig.js), [`preview webpack config`](src/preview/webpack.config.js) |
| image-size | Image dimensions for previews | [`buildPreview`](src/webpack/buildPreview.js) |
| inquirer | CLI prompts | [`getOAuth2Client`](src/util/getOAuth2Client.js), [`getWebpackConfigs`](src/webpack/getWebpackConfigs.js) |
| node-html-parser | Parse built HTML | [`buildPreview`](src/webpack/buildPreview.js) |
| open | Open browser to dev/authorize | [`getOAuth2Client`](src/util/getOAuth2Client.js), [`devServer`](src/webpack/devServer.js), [`devServerParallel`](src/webpack/devServerParallel.js) |
| portfinder | Find free dev ports | [`devServer`](src/webpack/devServer.js), [`devServerParallel`](src/webpack/devServerParallel.js) |
| postcss-* | PostCSS processing (CSS pipeline) | [`preview webpack config`](src/preview/webpack.config.js) |
| resolve | Module resolution helper | [`extractLoader`](src/webpack/loader/extractLoader.js) |
| sanitize-filename | Safe bundle filenames | [`createConfig`](src/webpack/config/createConfig.js) |
| sass / sass-loader | SCSS compilation | [`preview webpack config`](src/preview/webpack.config.js) |
| server-destroy | Clean HTTP server in OAuth flow | [`getOAuth2Client`](src/util/getOAuth2Client.js) |
| sharp | Image optimization | [`ImageOptimizeLoader`](src/webpack/loader/ImageOptimizeLoader.js), [`OptimizeBundleToFilesizePlugin`](src/webpack/plugin/OptimizeBundleToFilesizePlugin.js) |
| subset-font | Font subsetting | [`RichmediaFontLoader`](src/webpack/loader/RichmediaFontLoader.js) |
| svgo | (Likely SVG optimization; not referenced in shown files) | – |
| terser-webpack-plugin | JS minification | [`createConfig`](src/webpack/config/createConfig.js) |
| url-loader | (Asset inlining; not referenced in shown files) | – |
| webpack | Bundler core | [`createConfig`](src/webpack/config/createConfig.js), [`webpackRun`](src/webpack/webpackRun.js), [`devServer`](src/webpack/devServer.js) |
| webpack-dev-middleware | Dev asset serving | [`devServer`](src/webpack/devServer.js), [`devSubServer`](src/webpack/devSubServer.js) |
| webpack-hot-middleware | HMR in dev | [`devServer`](src/webpack/devServer.js), [`devSubServer`](src/webpack/devSubServer.js) |
| webpack-virtual-modules | Virtual module injection | [`createConfig`](src/webpack/config/createConfig.js) |
| worker-farm | Parallel builds | [`buildFilesParallel`](src/webpack/buildFilesParallel.js), [`devServerParallel`](src/webpack/devServerParallel.js) |