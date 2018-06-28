const { createIsolate, stringifyAndRun: run } = require('./helpers');
const bootstrap = require('./helpers/bootstrap');
const makeTransferable = require('./helpers/transferable');

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

    bootstrap({ jail, isolate, context });

    isolate.compileScriptSync(`global.__runnable = ${run(contextFunction)}`).runSync(context);
    isolate.compileScriptSync(run(() => {
      const original = global.__runnable;
      global.__runnable = (...args) => global.__transferable(original(...args));
    })).runSync(context);

    this.__runnable = jail.getSync('__runnable');
  }

  /**
   * @param {*} args
   * @return {Promise<*>}
   */
  run(...args) {
    return this.__runnable.apply(undefined, args.map(makeTransferable));
  }

}

module.exports = Thread;
