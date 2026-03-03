import getRichmediaRC from './getRichmediaRC.js';
import glob from 'glob-promise';
import doesNestedExist from './doesNestedExists.js';

/**
 * @description will search for files with a pattern.
 * @param {string} globQuery
 * @param {Array<string>} patterns ['data.settings.entry.js', 'data.settings.entry.html']
 * @return {Array<{data: (void|never), location: string}[]>}
 */
export default async function findRichmediaRC(globQuery = '**/.richmediarc', patterns = []) {
  const files = await glob(globQuery, { ignore: ['./node_modules/**/.richmediarc'] });
  let result = await Promise.all(
    files.map(async function(location) {
      return {
        location,
        data: await getRichmediaRC(location),
      };
    }),
  );

  const resolvedPatterns = patterns.map(pattern => pattern.split('.'));

  result = result.filter(({ data }) =>
    resolvedPatterns.every(pattern => doesNestedExist(data, pattern)),
  );

  return result;
};
