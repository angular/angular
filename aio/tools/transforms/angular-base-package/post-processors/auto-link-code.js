const visit = require('unist-util-visit');
const is = require('hast-util-is-element');
const textContent = require('hast-util-to-string');

/**
 * Automatically add in a link to the relevant document for simple
 * code blocks, e.g. `<code>MyClass</code>` becomes
 * `<code><a href="path/to/myclass">MyClass</a></code>`
 *
 * @property docTypes an array of strings. Only docs that have one of these docTypes
 * will be linked to.
 * Usually set to the API exported docTypes, e.g. "class", "function", "directive", etc.
 */
module.exports = function autoLinkCode(getDocFromAlias) {
  autoLinkCodeImpl.docTypes = [];
  return autoLinkCodeImpl;

  function autoLinkCodeImpl()  {
    return (ast) => {
      visit(ast, node => {
        if (is(node, 'code')) {
          const docs = getDocFromAlias(textContent(node));
          if (docs.length === 1 && autoLinkCodeImpl.docTypes.indexOf(docs[0].docType) !== -1) {
            const link = {
              type: 'element',
              tagName: 'a',
              properties: { href: docs[0].path },
              children: node.children
            };
            node.children = [link];
          }
        }
      });
    };
  }
};
