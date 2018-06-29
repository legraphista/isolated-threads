const ivm = require('isolated-vm');

const transferable = require('./transferable');
const console = require('./console');
module.exports = ({ jail, isolate, context }) => {
  jail.setSync('ivm', ivm);
  transferable({ jail, isolate, context });
  console({ jail, isolate, context });
  jail.setSync('ivm', undefined);
};
