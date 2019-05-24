
/**
 * This service is used by the autoLinkCode post-processor to filter out ambiguous directive
 * docs where the matching word is a directive selector.
 * E.g. `ngModel`, which is a selector for a number of directives, where we are only really
 * interested in the `NgModel` class.
 */
module.exports = function filterAmbiguousDirectiveAliases() {
  return (docs, words, index) => {
    const word = words[index];

    // we are only interested if there are multiple matching docs
    if (docs.length > 1) {
      if (docs.every(doc =>
        // We are only interested if they are all either directives or components
        (doc.docType === 'directive' || doc.docType === 'component') &&
        // and the matching word is in the selector for all of them
        doc[doc.docType + 'Options'].selector.indexOf(word) != -1
      )) {
        // find the directive whose class name matches the word (case-insensitive)
        return docs.filter(doc => doc.name.toLowerCase() === word.toLowerCase());
      }
    }
    return docs;
  };
};
