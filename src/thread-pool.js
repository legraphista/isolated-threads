const { makeInspectorFileName } = require('./helpers');
const Thread = require('./thread');
const WebSocket = require('ws');

class ThreadPool {

  /**
   * @param {function:function} contextFunction - context function to call
   * @param {number=} poolSize
   * @param {number=} memoryLimit - memory limit in MB
   * @param {number|WebSocket=} inspector - a port number of a web socket
   * @param {string=} filename - the filename of the thread file
   */
  constructor(contextFunction, poolSize = 1, { memoryLimit, inspector, filename = makeInspectorFileName() } = {}) {

    this._poolSize = poolSize;
    this._pool = new Array(poolSize);

    if (inspector && !(inspector instanceof WebSocket.Server)) {
      inspector = new WebSocket.Server({ port: inspector });
    }

    for (let i = 0; i < poolSize; i++) {
      this._pool[i] = new Thread(contextFunction, {
        memoryLimit,
        inspector,
        filename
      });
    }
    this._threadIndex = -1;
  }

  /**
   * @param {*} args
   * @return {Promise<*>}
   */
  run(...args) {
    this._threadIndex = (this._threadIndex + 1) % this._poolSize;
    return this._pool[this._threadIndex].run(...args);
  }

}

module.exports = ThreadPool;
