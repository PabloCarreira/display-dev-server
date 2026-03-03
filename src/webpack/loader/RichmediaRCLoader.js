import isExternalURL from '../../util/isExternalURL.js';
import getRichmediaRC from '../../util/getRichmediaRC.js';
import leafs from '../../util/leafs.js';
import isFile from '../../util/isFile.js';
import path from 'path';
import addConfigsAsWebpackDependencies from '../../util/addConfigsAsWebpackDependencies.js';
import stringifyRequest from './utils/stringifyRequest.js';

/**
 * Allows you to import external files into a json value.
 * Can be used for any value, in an object or array.
 */
export default function RichmediaRCLoader(data) {
  const callback = this.async();
  const options = this.getOptions();
  const loaderContext = this;

  const {configFilepath, config} = options;

  addConfigsAsWebpackDependencies(configFilepath, loaderContext); //recursively add richmediarc and sharedrc files as dependencies for webpack

  let prom = Promise.resolve(config);

  prom = prom.then(() => {
    return getRichmediaRC(configFilepath);
  });

  prom.then(data => {
    data = typeof data === 'string' ? JSON.parse(data) : data;
    data = JSON.parse(JSON.stringify(data));

    let ruuid = Date.now();
    const replaceItems = [];

    if (data && data.content) {
      leafs(data.content, (value, obj, name) => {
        if (isFile(value) && !isExternalURL(value)) {
          const id = `uuid_replace_${ruuid.toString(16)}`;

          replaceItems.push({
            key: stringifyRequest(loaderContext, id),
            value: `require(${stringifyRequest(loaderContext, `${value}`)})`,
          });

          this.addDependency(value);

          obj[name] = id;
        }
      });
    }

    //convert the settings paths to a relative path
    if (data && data.settings) {
      leafs(data.settings, (value, obj, name) => {
        if (isFile(value) && !isExternalURL(value)) {
          obj[name] = "./" + path.basename(value)
        }
      });
    }

    // remove contentSource / API key if it exists
    if (data?.settings?.contentSource) delete data.settings.contentSource;

    data = JSON.stringify(data)
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');

    data = replaceItems.reduce((prev, item) => {
      prev = prev.replace(item.key, item.value);
      return prev;
    }, data);

    callback(null, `module.exports = ${data};`);
  });
};
