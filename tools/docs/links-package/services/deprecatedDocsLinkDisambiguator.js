var _ = require('lodash');

module.exports = function deprecatedDocsLinkDisambiguator() {
  return function(url, title, currentDoc, docs) {
    if (docs.length != 2) return docs;

    var filteredDocs = _.filter(
        docs, function(doc) { return !doc.fileInfo.relativePath.match(/\/(\w+)-deprecated\//); });

    return filteredDocs.length > 0 ? filteredDocs : docs;
  };
};
