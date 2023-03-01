const visit = require('unist-util-visit');

function headingToLevel(heading) {
  const match = /^h(\d+)/.exec(heading);
  return match ? match[1] : '0';
}

function parseMappings(mappings) {
  const mapping = {};
  Object.keys(mappings).forEach(key => mapping[headingToLevel(key)] = headingToLevel(mappings[key]));
  return mapping;
}

module.exports = function mapHeadings(mappings) {
  const headings = parseMappings(mappings || {});
  return () => ast => {
    const nodesToFix = [];
    Object.keys(headings).forEach(heading => {
      visit(ast, 'heading', node => {
        if (node.depth === Number(heading)) {
          nodesToFix.push(node);
        }
      });
    });

    // Update the depth of the matched nodes
    nodesToFix.forEach(node => node.depth = headings[node.depth]);

    return ast;
  };
};
