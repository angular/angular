const path = require('path');
const stylelint = require('stylelint');

// Custom rule that registers all of the custom rules, written in TypeScript, with ts-node. This is
// necessary, because `stylelint` and IDEs won't execute any rules that aren't in a .js file.
require('ts-node').register({
  project: path.join(__dirname, '../tsconfig.json'),
});

// Dummy rule so Stylelint doesn't complain that there aren't rules in the file.
module.exports = stylelint.createPlugin('material/loader', () => {});
