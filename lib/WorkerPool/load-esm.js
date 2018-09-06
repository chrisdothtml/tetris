require('esm')(module)(
  // path to actual worker is passed via workerData
  require('worker_threads').workerData
)
