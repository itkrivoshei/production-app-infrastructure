import { Worker } from "node:worker_threads";

const workerSource = `
  const { parentPort, workerData } = require("node:worker_threads");
  const end = Date.now() + workerData.durationMs;
  let operations = 0;

  while (Date.now() < end) {
    Math.sqrt(Math.random() * Number.MAX_SAFE_INTEGER);
    operations += 1;
  }

  parentPort.postMessage(operations);
`;

export function createCpuLoad(durationMs: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerSource, {
      eval: true,
      workerData: { durationMs },
    });

    worker.once("message", (operations: number) => resolve(operations));
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`CPU load worker stopped with exit code ${code}`));
      }
    });
  });
}
