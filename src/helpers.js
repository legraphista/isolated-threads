const ivm = require('isolated-vm');
const helpers = {};

/**
 * @param {function}fn
 * @return {string}
 */
helpers.stringifyAndRun = (fn) => `(${fn.toString()})();`;

/**
 * @param {number} memoryLimit
 * @param {boolean} inspector
 * @return {{
 *  isolate: module:isolated-vm.Isolate,
 *  context: Context,
 *  jail: Reference<Object>
 * }}
 */
helpers.createIsolate = ({ memoryLimit, inspector } = {}) => {
  const isolate = new ivm.Isolate({ memoryLimit, inspector });
  const context = isolate.createContextSync();
  const jail = context.globalReference();
  jail.setSync('global', jail.derefInto());
  jail.setSync('ivm', ivm);

  return {
    isolate,
    context,
    jail
  };
};

module.exports = helpers;
