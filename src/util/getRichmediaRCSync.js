/* eslint no-param-reassign: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-loop-func: 0 */
/* eslint no-shadow: 0 */

import fs from 'fs-extra';
import path from 'path';
import deepmerge from 'deepmerge';
import leafs from './leafs.js';
import isFile from './isFile.js';
import isExternalURL from './isExternalURL.js';

/**
 * getJSONConfig retrieves a jsonConfig config file and will
 * also inherit configs from parent jsonConfig files
 *
 * @param {string} filepath
 * @param {function} onDependecy
 * @return {Promise<void | never>}
 */
export default function getRichmediaRCSync(filepath, onDependecy = () => {}) {
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
