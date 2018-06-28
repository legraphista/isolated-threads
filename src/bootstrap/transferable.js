const transferable = require('../transferable');

module.exports = ({ jail, isolate, context }) => {
  isolate.compileScriptSync(`global.__fixFunctions = ${transferable.__fixFunctions.toString()}`).runSync(context, {});
  isolate.compileScriptSync(`global.__transferable = ${transferable.toString()}`).runSync(context, {});
};
