/* eslint no-param-reassign: 0 */
/* eslint class-methods-use-this: 0 */

import fs from 'fs-extra';
import path from 'path';
import md5File from 'md5-file';
import isExternalURL from '../../util/isExternalURL.js';
import getRichmediaRC from '../../util/getRichmediaRC.js';
import isFile from '../../util/isFile.js';
import leafs from '../../util/leafs.js';

class RichmediaRCPlugin {
  constructor(options) {
    this.config = options.config;
  }

  apply(compiler) {
    compiler.hooks.emit.tapPromise('RichmediaRCPlugin', async compilation => {
      const json = await getRichmediaRC(this.config);

      const all = [];
      leafs(json.content, (value, obj, name) => {
        if (isFile(value) && !isExternalURL(value)) {
          all.push(
            new Promise(resolve => {
              fs.readFile(value, (err, source) => {
                const data = path.parse(value);
                obj[name] = `${md5File.sync(value)}${data.ext}`;
                compilation.assets[obj[name]] = {
                  source: () => source,
                  size() {
                    return Buffer.byteLength(this.source());
                  },
                };

                resolve(compilation);
              });
            }),
          );
        }
      });

      await Promise.all(all);
      const result = JSON.stringify(json);

      console.log(result);

      // Insert this list into the Webpack build as a new file asset:
      compilation.assets['config.json'] = {
        source: () => result,
        size() {
          return this.source().length;
        },
      };

      console.log(Object.keys(compilation.assets));

      return compilation;
    });
  }
}

export default RichmediaRCPlugin;
