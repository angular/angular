
/**
 * This service is used by the autoLinkCode post-processor to ignore the `http` part in URLs
 * (i.e. `http://...`).
 */
module.exports = function ignoreHttpInUrls() {
  return (docs, words, index) => {
    const httpInUrl = (words[index] === 'http') && (words[index + 1] === '://');
    return httpInUrl ? [] : docs;
  };
};
