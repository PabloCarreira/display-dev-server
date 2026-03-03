import globPromise from 'glob-promise';
import fsp from 'fs/promises';
import chalk from 'chalk';

export default async function() {
  const start = Date.now()

  const gs_files = await globPromise("**/.googlesheet*", { ignore: ['node_modules/**', 'build/**'] })
  await Promise.all(gs_files.map(async file => {
    await fsp.unlink(file)
  }))

  console.log(chalk.green(`${gs_files.length} .googlesheet* files removed in ${Date.now() - start}ms.`));
}
