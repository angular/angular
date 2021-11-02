
/**
 * This service is used by the autoLinkCode post-processor to ignore generic words
 * that could be mistaken as classes, functions, etc.
 */

module.exports = function ignoreGenericWords() {
  const ignoredWords = new Set(['a', 'classes', 'create', 'error', 'group', 'request', 'state', 'target', 'value', '_']);
  return (docs, words, index) => ignoredWords.has(words[index].toLowerCase()) ? [] : docs;
};
