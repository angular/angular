
/**
 * This service is used by the autoLinkCode post-processor to ignore generic words
 * that could be mistaken as classes, functions, etc.
 */

module.exports = function ignoreGenericWords() {
  const ignoredWords = new Set(['a', 'create', 'error', 'group', 'request', 'value']);
  return (docs, words, index) => ignoredWords.has(words[index].toLowerCase()) ? [] : docs;
};
