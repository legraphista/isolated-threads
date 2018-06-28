const transferable = require('./transferable');
const console = require('./console');
module.exports = ({ jail, isolate, context }) => {
  transferable({ jail, isolate, context });
  console({ jail, isolate, context });
};
