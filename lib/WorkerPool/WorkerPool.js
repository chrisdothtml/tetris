import EventEmitter from 'events'
import os from 'os'
import path from 'path'
import { Worker } from 'worker_threads'

const LOADER_PATH = path.join(__dirname, 'load-esm.js')

function eventEmitted (emitter, event) {
  return new Promise(resolve => {
    emitter.once(event, resolve)
  })
}

export default class WorkerPool {
  constructor (options) {
    const { workerPath } = options

    this._queue = []
    this.busyWorkers = new Set()
    this.events = new EventEmitter()
    this.freeWorkers = new Set()
    this.workerPath = workerPath
    this.workers = {}

    // fill pool
    for (let i = WorkerPool.poolSize(); i; i--) {
      const workerData = this.workerPath
      const worker = new Worker(LOADER_PATH, { workerData })
      const id = worker.threadId

      this.workers[id] = worker
      this.freeWorkers.add(id)
    }
  }

  static poolSize () {
    return os.cpus().length
  }

  _useFreeWorker (data, callback) {
    const workerId = this.freeWorkers.values().next().value
    const worker = this.workers[workerId]

    this.busyWorkers.add(workerId)
    this.freeWorkers.delete(workerId)
    worker.postMessage(data)
    worker.once('message', result => {
      callback(result)
      this.busyWorkers.delete(workerId)
      this.freeWorkers.add(workerId)
      this.events.emit('worker-finished')

      if (!this.busyWorkers.size) {
        this.events.emit('idle')
      }
    })

    return workerId
  }

  destroy () {
    for (const id of Object.keys(this.workers)) {
      this.workers[id].unref()
    }
  }

  queue (data) {
    this._queue.push(data)
  }

  async run () {
    const result = [...new Array(this.queue.length)].map(_ => null)
    let i = 0

    // use for-of loop so we can pause iteration with `await`
    for (const data of this._queue) {
      const myIndex = i

      if (this.freeWorkers.size) {
        this._useFreeWorker(data, res => {
          result[myIndex] = res
        })
      } else {
        // if no free workers, wait for one to free up, then use it
        await eventEmitted(this.events, 'worker-finished')
        this._useFreeWorker(data, res => {
          result[myIndex] = res
        })
      }

      i++
    }

    // wait for remaining workers
    await eventEmitted(this.events, 'idle')
    this._queue = []
    return result
  }
}
