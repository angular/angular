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
        case 'component':
          doc.aliases = doc.aliases.concat(extractSelectors(doc[doc.docType + 'Options'].selector));
          break;
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
  if (selectors) {
    return stripQuotes(selectors).split(',').map(selector => selector.replace(/^\W*([\w-]+)\W*$/, '$1'));
  } else {
    return [];
  }
}

function stripQuotes(value) {
  return (typeof(value) === 'string') ? value.trim().replace(/^(['"])(.*)\1$/, '$2') : value;
}
