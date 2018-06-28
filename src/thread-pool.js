const Thread = require('./thread');

class ThreadPool {

  /**
   * @param {function:function} contextFunction
   * @param {number=} poolSize
   * @param {number=} memoryLimit
   * @param {boolean=} inspector
   */
  constructor(contextFunction, poolSize = 1, { memoryLimit, inspector } = {}) {

    this._poolSize = poolSize;
    this._pool = new Array(poolSize);
    for (let i = 0; i < poolSize; i++) {
      this._pool[i] = new Thread(contextFunction, { memoryLimit, inspector });
    }
    this._threadIndex = -1;
  }

  /**
   * @param {*} args
   * @return {Promise<*>}
   */
  run(...args) {
    this._threadIndex = (this._threadIndex + 1) % this._poolSize;
    console.log('will schedule on', this._threadIndex);
    return this._pool[this._threadIndex].run(...args);
  }

}

module.exports = ThreadPool;
