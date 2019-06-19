const CssSelectorParser = require('css-selector-parser').CssSelectorParser;
const cssParser = new CssSelectorParser();
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
  const selectorAST = cssParser.parse(stripQuotes(selectors));
  const rules = selectorAST.selectors ? selectorAST.selectors.map(ruleSet => ruleSet.rule) : [selectorAST.rule];
  const aliases = {};
  rules.forEach(rule => {
    if (rule.tagName) {
      aliases[rule.tagName] = true;
    }
    if (rule.attrs) {
      rule.attrs.forEach(attr => aliases[attr.name] = true);
    }
  });
  return Object.keys(aliases);
}

function stripQuotes(value) {
  return (typeof(value) === 'string') ? value.trim().replace(/^(['"])(.*)\1$/, '$2') : value;
}
