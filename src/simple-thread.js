const { createIsolate, stringifyAndRun: run, bootstrapConsole } = require('./helpers');
const bootstrap = require('./bootstrap');

class Thread {

  /**
   * @param {function:function} contextFunction
   * @param {number=} memoryLimit
   * @param {boolean=} inspector
   */
  constructor(contextFunction, { memoryLimit, inspector } = {}) {

    const {
      isolate,
      context,
      jail
    } = createIsolate({ memoryLimit, inspector });

    this._isolate = isolate;
    this._context = context;
    this._jail = jail;

    bootstrap({ jail, isolate, context: context });

    const script = isolate.compileScriptSync(`global.__runnable = ${run(contextFunction)}`);
    script.runSync(context);

    this.__runnable = jail.getSync('__runnable');
  }

  /**
   * @param {*} args
   * @return {Promise<*>}
   */
  run(...args) {
    return this.__runnable.apply(undefined, args);
  }

}

module.exports = Thread;
