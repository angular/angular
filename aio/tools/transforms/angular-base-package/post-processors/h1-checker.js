const visit = require('unist-util-visit');
const is = require('hast-util-is-element');
const source = require('unist-util-source');

module.exports = function h1CheckerPostProcessor() {
  return (ast, file) => {
    let h1s = [];
    visit(ast, node => {
      if (is(node, 'h1')) {
        h1s.push(node);
      }
    });
    if (h1s.length > 1) {
      const h1Src = h1s.map(node => source(node, file)).join(', ');
      file.fail(`More than one h1 found [${h1Src}]`);
    }
  };
};
