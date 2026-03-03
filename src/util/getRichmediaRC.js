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
const { readJson } = fs;

/**
 * getJSONConfig retrieves a jsonConfig config file and will
 * also inherit configs from parent jsonConfig files
 *
 * @param {string} filepath
 * @return {Promise<void | never>}
 */
export default async function getRichmediaRC(filepath) {
  filepath = path.resolve(filepath);
  const dirname = path.dirname(filepath);

  let richmediarc = await readJson(filepath);

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

    richmediarc = deepmerge(await getRichmediaRC(parent), richmediarc);
    delete richmediarc.parent;
  }

  return richmediarc;
};
