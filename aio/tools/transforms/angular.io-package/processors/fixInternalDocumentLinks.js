/**
 * @dgProcessor fixInternalDocumentLinks
 * @description
 * Add in the document path to links that start with a hash.
 * This is important when the web app has a base href in place,
 * since links like: `<a href="#some-id">` would get mapped to
 * the URL `base/#some-id` even if the current location is `base/some/doc`.
 */
module.exports = function fixInternalDocumentLinks() {

  var INTERNAL_LINK = /(<a [^>]*href=")(#[^"]*)/g;

  return {
    $runAfter: ['inlineTagProcessor'],
    $runBefore: ['convertToJsonProcessor'],
    $process: function(docs) {
      docs.forEach(doc => {
        doc.renderedContent = doc.renderedContent.replace(INTERNAL_LINK, (_, pre, hash) => {
          return pre + doc.path + hash;
        });
      });
    }
  };
};