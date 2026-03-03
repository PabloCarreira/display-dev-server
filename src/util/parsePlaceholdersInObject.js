import leafs from './leafs.js';
import parsePlaceholders from './parsePlaceholders.js';

/**
 *
 * @param {Object} objectSource
 * @param {Object} model
 */
function parsePlaceholdersInObject(objectSource, model) {
  leafs(objectSource, (value, source, key, path) => {
    source[key] = parsePlaceholders(value, model);
  });

  return objectSource;
}

export default parsePlaceholdersInObject;
