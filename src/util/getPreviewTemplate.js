import handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let prom;

handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});

/**
 *
 * @return {Promise<HandlebarsTemplateDelegate<T>>}
 */
export default function getPreviewTemplate() {
  if (!prom) {
    prom = Promise.resolve(true).then(
      () =>
        new Promise((resolve, reject) => {
          fs.readFile(
            path.join(__dirname, '../data/template.hbs'),
            { encoding: 'utf-8' },
            (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(handlebars.compile(data));
              }
            },
          );
        }),
    );
  }

  return prom;
};
