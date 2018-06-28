const ivm = require('isolated-vm');
const { stringifyAndRun: run } = require('../helpers');

module.exports = ({ jail, isolate, context }) => {
  jail.setSync('_log', new ivm.Reference(function (...args) {
    console.log(...args);
  }));
  jail.setSync('_error', new ivm.Reference(function (...args) {
    console.error(...args);
  }));
  isolate.compileScriptSync(run(function () {
    const log = global._log;
    global._log = undefined;
    const error = global._error;
    global._error = undefined;

    const console = {};
    global.console = console;

    console.log = function (...args) {
      log.applyIgnored(undefined, args.map(arg => new ivm.ExternalCopy(arg).copyInto()));
    };
    console.error = function (...args) {
      error.applySync(undefined, args.map(arg => new ivm.ExternalCopy(arg).copyInto()));
    };
  })).runSync(context, {});
};
