import path from 'path';
import { Worker } from 'worker_threads';
import removeTempRichmediaRc from '../util/removeTempRichmediaRc.js';
import cliProgress from 'cli-progress';
import chalk from 'chalk';

export default async function buildFiles(result, options) {
  const start = Date.now();

  const maxWorkers = options.parallel === true ? 4 : options.parallel;
  const workerPath = new URL('./webpackRun.js', import.meta.url);

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  progressBar.start(result.length, 0);

  // Process items with a pool of workers, limiting concurrency
  const qualities = [];
  const queue = result.map((item, index) => ({ item, index }));

  function runNext() {
    if (queue.length === 0) return null;
    const { item, index } = queue.shift();
    delete item.settings.row;

    return new Promise((resolve, reject) => {
      const worker = new Worker(workerPath);
      let settled = false;
      worker.postMessage({ config: item.settings, options });
      worker.on('message', (msg) => {
        if (msg.type === 'result') {
          settled = true;
          qualities[index] = msg.quality;
          progressBar.increment();
          worker.terminate();
          resolve();
        }
      });
      worker.on('error', (err) => {
        if (!settled) {
          settled = true;
          reject(err);
        }
      });
      worker.on('exit', (code) => {
        if (!settled && code !== 0) {
          settled = true;
          reject(new Error(`Worker exited with code ${code}`));
        }
      });
    });
  }

  // Run up to maxWorkers concurrently
  await new Promise((resolve, reject) => {
    let completed = 0;
    const total = result.length;

    if (total === 0) return resolve();

    function startNext() {
      const task = runNext();
      if (!task) return;
      task.then(() => {
        completed++;
        if (completed === total) {
          resolve();
        } else {
          startNext();
        }
      }).catch(reject);
    }

    for (let i = 0; i < Math.min(maxWorkers, total); i++) {
      startNext();
    }
  });

  progressBar.stop();
  console.log(chalk.green(`Built in ${Date.now() - start}ms`));

  // final clean up
  console.log("Removing temp .richmediarc...");
  await removeTempRichmediaRc(result);

  return {
    outputDir: path.resolve(options.outputDir),
    ads: qualities,
  };
}
