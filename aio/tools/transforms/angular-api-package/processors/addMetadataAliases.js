const cssSelectorParser = require('css-selector-parser');
const parseCss = cssSelectorParser.createParser();

/**
 * @dgProcessor addMetadataAliases
 *
 * Directives and components can also be referenced by their selectors,
 * and Pipes can be referenced by their name.
 * So let's add each selector as an alias to this doc.
 */
module.exports = function addMetadataAliasesProcessor() {
  return {
    $runAfter: ['extractDecoratedClassesProcessor'],
    $runBefore: ['computing-ids'],
    $process: function(docs) {
      docs.forEach(doc => {
        switch(doc.docType) {
        case 'directive':
        case 'component': {
          const selector = doc[doc.docType + 'Options'].selector;
          if (selector) {
            doc.aliases = doc.aliases.concat(extractSelectors(selector));
          }
          break;
        }
        case 'pipe':
          if (doc.pipeOptions.name) {
            doc.aliases = doc.aliases.concat(stripQuotes(doc.pipeOptions.name));
          }
          break;
        }
      });
    }
  };
};

function extractSelectors(selectors) {
  const rules = parseCss(stripQuotes(selectors)).rules;
  const aliases = {};
  rules.forEach(rule => {
    if (rule.items.length === 0) {
      return;
    }
    const tagNames = rule.items.filter(cssSelectorParser.ast.isTagName);
    if (tagNames) {
      for (let tagName of tagNames) {
        aliases[tagName.name] = true;
      }
    }
    const attrs = rule.items.filter(cssSelectorParser.ast.isAttribute);
    if (attrs) {
      attrs.forEach(attr => aliases[attr.name] = true);
    }
  });
  return Object.keys(aliases);
}

function stripQuotes(value) {
  return (typeof(value) === 'string') ? value.trim().replace(/^(['"])(.*)\1$/, '$2') : value;
}
