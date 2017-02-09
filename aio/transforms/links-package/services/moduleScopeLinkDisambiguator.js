var _ = require('lodash');

module.exports = function moduleScopeLinkDisambiguator() {
  return function(url, title, currentDoc, docs) {
    if (docs.length > 1) {
      // filter out target docs that are not in the same module as the source doc
      var filteredDocs =
          _.filter(docs, function(doc) { return doc.moduleDoc === currentDoc.moduleDoc; });
      // if all target docs are in a different module then just return the full collection of
      // ambiguous docs
      return filteredDocs.length > 0 ? filteredDocs : docs;
    }
    return docs;
  };
};
