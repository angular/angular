
/**
 * This service is used by the autoLinkCode post-processor to ignore the `http(s)` part in URLs
 * (i.e. `http://...` or `https://...`).
 */
module.exports = function ignoreHttpInUrls() {
  const ignoredSchemes = ['http', 'https'];
  return (docs, words, index) => {
    const httpInUrl = ignoredSchemes.includes(words[index]) && (words[index + 1] === '://');
    return httpInUrl ? [] : docs;
  };
};
