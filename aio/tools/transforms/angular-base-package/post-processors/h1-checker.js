const visit = require('unist-util-visit');
const is = require('hast-util-is-element');
const source = require('unist-util-source');
const toString = require('hast-util-to-string');
const filter = require('unist-util-filter');

module.exports = function h1CheckerPostProcessor() {
  return (ast, file) => {
    let h1s = [];
    visit(ast, node => {
      if (is(node, 'h1')) {
        h1s.push(node);
        file.title = getText(node);
      }
    });

    if (h1s.length > 1) {
      const h1Src = h1s.map(node => source(node, file)).join(', ');
      file.fail(`More than one h1 found [${h1Src}]`);
    }
  };
};

function getText(h1) {
  // Remove the aria-hidden anchor from the h1 node
  const cleaned = filter(h1, node => !(
    is(node, 'a') && node.properties &&
    (node.properties.ariaHidden === 'true' || node.properties['aria-hidden'] === 'true')
  ));

  return toString(cleaned);
}