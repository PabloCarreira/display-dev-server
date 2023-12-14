/* eslint no-param-reassign: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-loop-func: 0 */
/* eslint no-shadow: 0 */

const fs = require('fs-extra');
const path = require('path');
const deepmerge = require('deepmerge');
const leafs = require('./leafs');
const isFile = require('./isFile');
const isExternalURL = require("./isExternalURL");
const { readJson } = require('fs-extra');

/**
 * getJSONConfig retrieves a jsonConfig config file and will
 * also inherit configs from parent jsonConfig files
 *
 * @param {string} filepath
 * @param {function} onDependecy
 * @return {Promise<void | never>}
 */
module.exports = function getRichmediaRCSync(filepath, onDependecy = () => {}) {
  filepath = path.resolve(filepath);
  onDependecy(filepath);
  const dirname = path.dirname(filepath);

  let richmediarc = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

  leafs(richmediarc, function(value, obj, name) {
    if (typeof value === 'string'
      && !isExternalURL(value)
      && !path.isAbsolute(value)
      && fs.existsSync(path.resolve(dirname, value))
      && value !== '')
    {
      obj[name] = path.resolve(dirname, value);
    }
  });

  let { parent } = richmediarc;
  if (parent) {
    if(parent !== path.resolve(parent)){
      parent = path.resolve(dirname, parent)
    }

    richmediarc = deepmerge(getRichmediaRCSync(parent), richmediarc);
    delete richmediarc.parent;
  }

  return richmediarc;
};
