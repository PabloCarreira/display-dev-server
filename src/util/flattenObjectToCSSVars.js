import leafs from './leafs.js';
import isFile from './isFile.js';

function flattenObjectToCSSVars(obj) {
  const result = {};
  leafs(obj, (val, obj, name, path) => {
    path = path.map(item =>
      item
        .trim()
        .replace(/ /g, '-')
        .replace(/\W/g, ''),
    );

    result[`--${path.join('-')}`] = val;
  });

  return result;
}

export default flattenObjectToCSSVars;
