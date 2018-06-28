const ivm = require('isolated-vm');

/**
 * @param {*} element
 * @return {*}
 */
const __fixFunctions = (element) => {
  if (typeof element === 'function') {
    // return new ivm.Reference(element).derefInto({ release: true });
    throw new Error('cannot pass function to and from isolate');
  }

  if (Array.isArray(element)) {
    for (let i = 0; i < element.length; i++) {
      element[i] = __fixFunctions(element[i]);
    }
  }

  if (element instanceof Object) {
    const keys = Object.keys(element);
    for (let i = 0; i < keys.length; i++) {
      element[keys[i]] = __fixFunctions(element[keys[i]]);
    }
  }

  return element;
};

const __makeTransferable = (element) => {
  if (
    element === null ||
    typeof element === 'number' ||
    typeof element === 'string' ||
    typeof element === 'boolean' ||
    typeof element === 'undefined'
  ) {
    // primitives are transferable
    return element;
  }

  element = __fixFunctions(element);

  if (element instanceof Object) {
    return new ivm.ExternalCopy(element, { transferOut: true }).copyInto();
  }

  throw new Error(`type ${typeof element} is not transferable`);
};

__makeTransferable.__fixFunctions = __fixFunctions;
module.exports = __makeTransferable;
