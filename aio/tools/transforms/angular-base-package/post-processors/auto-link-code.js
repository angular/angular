const visit = require('unist-util-visit-parents');
const is = require('hast-util-is-element');
const textContent = require('hast-util-to-string');

/**
 * Automatically add in a link to the relevant document for code blocks.
 * E.g. `<code>MyClass</code>` becomes `<code><a href="path/to/myclass">MyClass</a></code>`
 *
 * @property docTypes an array of strings.
 * Only docs that have one of these docTypes will be linked to.
 * Usually set to the API exported docTypes, e.g. "class", "function", "directive", etc.
 *
 * @property codeElements an array of strings.
 * Only text contained in these elements will be linked to.
 * Usually set to "code" but also "code-example" for angular.io.
 */
module.exports = function autoLinkCode(getDocFromAlias) {
  autoLinkCodeImpl.docTypes = [];
  autoLinkCodeImpl.codeElements = ['code'];
  return autoLinkCodeImpl;

  function autoLinkCodeImpl()  {
    return (ast) => {
      visit(ast, 'element', (node, ancestors) => {
        // Only interested in code elements that are not inside links
        if (autoLinkCodeImpl.codeElements.some(elementType => is(node, elementType)) &&
            ancestors.every(ancestor => !is(ancestor, 'a'))) {
          visit(node, 'text', (node, ancestors) => {
            // Only interested in text nodes that are not inside links
            if (ancestors.every(ancestor => !is(ancestor, 'a'))) {

              const parent = ancestors[ancestors.length-1];
              const index = parent.children.indexOf(node);

              // Can we convert the whole text node into a doc link?
              const docs = getDocFromAlias(node.value);
              if (foundValidDoc(docs)) {
                parent.children.splice(index, 1, createLinkNode(docs[0], node.value));
              } else {
                // Parse the text for words that we can convert to links
                const nodes = textContent(node).split(/([A-Za-z0-9_]+)/)
                  .filter(word => word.length)
                  .map(word => {
                    const docs = getDocFromAlias(word);
                    return foundValidDoc(docs) ?
                              createLinkNode(docs[0], word) : // Create a link wrapping the text node.
                              { type: 'text', value: word };  // this is just text so push a new text node
                  });

                // Replace the text node with the links and leftover text nodes
                Array.prototype.splice.apply(parent.children, [index, 1].concat(nodes));
              }
            }
          });
        }
      });
    };
  }
  function foundValidDoc(docs) {
    return docs.length === 1 && autoLinkCodeImpl.docTypes.indexOf(docs[0].docType) !== -1;
  }

  function createLinkNode(doc, text) {
    return {
      type: 'element',
      tagName: 'a',
      properties: { href: doc.path, class: 'code-anchor' },
      children: [{ type: 'text', value: text }]
    };
  }
};
