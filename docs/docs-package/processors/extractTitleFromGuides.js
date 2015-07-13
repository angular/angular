var _ = require('lodash');

module.exports = function extractTitleFromGuides() {

  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    $process: function(docs) {
      _(docs).forEach(function(doc) {
        if (doc.docType === 'guide') {
          doc.name = doc.name || getNameFromHeading(doc.description);
        }
      });
    }
  };
};


function getNameFromHeading(text) {
  var match = /^\s*#\s*(.*)/.exec(text);
  if (match) {
    return match[1];
  }
}