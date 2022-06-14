// const loaderUtils = require('loader-utils');
const leafs = require('../../util/leafs');
const isFile = require('../../util/isFile');
const path = require('path');
const fs = require('fs-extra');

module.exports = function customLoader(content) {

  const callback = this.async();
  const options = this.getOptions();
  const replacementString = '\'webpackWillReplaceThisWithConfig\'';

  // add the source richmediarc to dependencies so it gets watched by the dev server
  this.addDependency(options.configFilepath);

  // check if there's a parent rc and add it too
  try {
    const rawConfigJson = fs.readJSONSync(options.configFilepath);
    const sharedRcPath = rawConfigJson.parent;
    const newPath = path.resolve(path.dirname(options.configFilepath), sharedRcPath);
    this.addDependency(newPath);
  } catch (e) {
    // console.log('no parent rc?')
  }

  if (content.indexOf(replacementString) >= 1) {

    // remove paths from config
    leafs(options.config, function(value, obj, name, path) {
      if (isFile(value)) {
        delete obj[name]
      }
    });

    content = content.replace(replacementString, JSON.stringify(options.config));

  }

  callback(null, content);

};
