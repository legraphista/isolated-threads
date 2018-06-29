const ivm = require('isolated-vm');
const { stringifyAndRun: run } = require('../');

module.exports = ({ jail, isolate, context }) => {
  jail.setSync('_log', new ivm.Reference(function (...args) {
    console.log(...args);
  }));
  jail.setSync('_error', new ivm.Reference(function (...args) {
    console.error(...args);
  }));
  isolate.compileScriptSync(run(function () {
    const log = global._log;
    delete global._log;
    const error = global._error;
    delete global._error;

    const console = {};

    Object.defineProperty(global, 'console', {
      value: console,
      writable: false,
      enumerable: true,
      configurable: false
    });

    const transferable = global.__transferable;

    console.log = function (...args) {
      log.applySync(undefined, args.map(transferable));
    };
    console.error = function (...args) {
      error.applySync(undefined, args.map(transferable));
    };

    Object.freeze(console);
  }), { filename: '/thread/bootstrap/console.js' }).runSync(context, {});
};
