const transferable = require('../transferable');

module.exports = ({ jail, isolate, context }) => {
  isolate.compileScriptSync(`
    (() => {
      const ivm = global.ivm;
    
      const __fixFunctions = ${transferable.__fixFunctions.toString()};
      const __transferable = ${transferable.toString()};
      
      Object.defineProperty(global, '__transferable', {
        value: __transferable,
        writable: false,
        enumerable: false,
        configurable: false
      });
    })();
  `, { filename: '/thread/bootstrap/transferable.js' }).runSync(context)
};
