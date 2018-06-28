const console = require('./console');
module.exports = ({ jail, isolate, context }) => {
  console({ jail, isolate, context });
};
