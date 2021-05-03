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
 * @property customFilters array of functions `(docs, words, wordIndex) => docs` that will filter
 * out docs where a word should not link to a doc.
 *   - `docs` is the array of docs that match the link `word`
 *   - `words` is the collection of words parsed from the code text
 *   - `wordIndex` is the index of the current `word` for which we are finding a link
 *
 * @property codeElements an array of strings.
 * Only text contained in these elements will be linked to.
 * Usually set to "code" but also "code-example" for angular.io.
 *
 * @property ignoredLanguages an array of languages that should not be auto-linked
 *
 * @property ignoredLanguages an array of languages that should not be auto-linked
 *
 * @property failOnMissingDocPath if set to true then this post-processor will cause the doc-gen
 * to fail when it attempts to auto-link to a doc that has no `doc.path` property, which implies
 * that it exists but is not public (nor rendered).
 *
 */
module.exports = function autoLinkCode(getDocFromAlias) {
  autoLinkCodeImpl.docTypes = [];
  autoLinkCodeImpl.customFilters = [];
  autoLinkCodeImpl.codeElements = ['code'];
  autoLinkCodeImpl.ignoredLanguages = ['bash', 'sh', 'shell', 'json', 'markdown'];
  autoLinkCodeImpl.failOnMissingDocPath = false;

  return autoLinkCodeImpl;

  function autoLinkCodeImpl() {
    return (ast, file) => {
      visit(ast, 'element', (node, ancestors) => {
        if (!isValidCodeElement(node, ancestors)) {
          return;
        }

        visit(node, 'text', (node, ancestors) => {
          const isInLink = isInsideLink(ancestors);
          if (isInLink) {
            return;
          }

          const parent = ancestors[ancestors.length - 1];
          const index = parent.children.indexOf(node);

          // Can we convert the whole text node into a doc link?
          const docs = getFilteredDocsFromAlias([node.value], 0);
          if (foundValidDoc(docs, node.value, file)) {
            parent.children.splice(index, 1, createLinkNode(docs[0], node.value));
          } else {
            // Parse the text for words that we can convert to links
            const nodes = getNodes(node, file);
            // Replace the text node with the links and leftover text nodes
            Array.prototype.splice.apply(parent.children, [index, 1].concat(nodes));
            // Do not visit this node's children or the newly added nodes
            return [visit.SKIP, index + nodes.length];
          }
        });
      });
    };
  }

  function isValidCodeElement(node, ancestors) {
    // Only interested in code elements that:
    // * do not have `no-auto-link` class
    // * do not have an ignored language
    // * are not inside links
    const isCodeElement = autoLinkCodeImpl.codeElements.some(elementType => is(node, elementType));
    const hasNoAutoLink =
        node.properties.className && node.properties.className.includes('no-auto-link');
    const isLanguageSupported =
        !autoLinkCodeImpl.ignoredLanguages.includes(node.properties.language);
    const isInLink = isInsideLink(ancestors);
    return isCodeElement && !hasNoAutoLink && isLanguageSupported && !isInLink;
  }

  function isInsideLink(ancestors) {
    return ancestors.some(ancestor => is(ancestor, 'a'));
  }

  function getFilteredDocsFromAlias(words, index) {
    // Remove docs that fail the custom filter tests.
    return autoLinkCodeImpl.customFilters.reduce(
        (docs, filter) => filter(docs, words, index), getDocFromAlias(words[index]));
  }

  function getNodes(node, file) {
    return textContent(node)
        .split(/([A-Za-z0-9_.-]+)/)
        .filter(word => word.length)
        .map((word, index, words) => {
          const filteredDocs = getFilteredDocsFromAlias(words, index);

          return foundValidDoc(filteredDocs, word, file) ?
              // Create a link wrapping the text node.
              createLinkNode(filteredDocs[0], word) :
              // this is just text so push a new text node
              {type: 'text', value: word};
        });
  }

  /**
   * Validates the docs to be used to generate the links. The validation ensures
   * that the docs are not `internal` and that the `docType` is supported. The `path`
   * can be empty when the `API` is not public.
   *
   * @param {Array<Object>} docs An array of objects containing the doc details
   *
   * @param {string} keyword The keyword the doc applies to
   */
  function foundValidDoc(docs, keyword, file) {
    if (docs.length !== 1) {
      return false;
    }

    var doc = docs[0];

    const isInvalidDoc = doc.docType === 'member' && !keyword.includes('.');
    if (isInvalidDoc) {
      return false;
    }

    if (!doc.path) {
      var message = `
      autoLinkCode: Doc path is empty for "${doc.id}" - link will not be generated for "${keyword}".
      Please make sure if the doc should be public. If not, it should probably not be referenced in the docs.`;

      if (autoLinkCodeImpl.failOnMissingDocPath) {
        file.fail(message);
      } else {
        file.message(message);
      }
      return false;
    }

    return !doc.internal && autoLinkCodeImpl.docTypes.includes(doc.docType);
  }

  function createLinkNode(doc, text) {
    return {
      type: 'element',
      tagName: 'a',
      properties: {href: doc.path, class: 'code-anchor'},
      children: [{type: 'text', value: text}]
    };
  }
};
