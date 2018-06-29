const ivm = require('isolated-vm');
const index = {};

/**
 * @param {function}fn
 * @return {string}
 */
index.stringifyAndRun = (fn) => `(${fn.toString()})();`;

/**
 * @param {number} memoryLimit
 * @param {boolean} inspector
 * @return {{
 *  isolate: module:isolated-vm.Isolate,
 *  context: Context,
 *  jail: Reference<Object>
 * }}
 */
index.createIsolate = ({ memoryLimit, inspector } = {}) => {
  const isolate = new ivm.Isolate({ memoryLimit, inspector });
  const context = isolate.createContextSync({ inspector });
  const jail = context.globalReference();
  jail.setSync('global', jail.derefInto());
  jail.setSync('ivm', ivm);

  return {
    isolate,
    context,
    jail
  };
};

index.makeInspectorFileName = () => {
  const stack = (new Error()).stack;
  const lines = stack.split('\n');

  const callerLine = lines[3];
  const [/*match*/, /*caller*/, file, line, /*column*/] = /at (.*?) \((.*?)\:(\d+):(\d+)\)/.exec(callerLine);

  return `${file}:${line}`;
};

module.exports = index;
