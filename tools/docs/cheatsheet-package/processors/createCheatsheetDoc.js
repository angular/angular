var _ = require('lodash');

module.exports = function createCheatsheetDoc(
    createDocMessage, renderMarkdown, versionInfo, targetEnvironments) {
  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    $process: function(docs) {

      var currentEnvironment = targetEnvironments.isActive('ts') && 'TypeScript' ||
          targetEnvironments.isActive('js') && 'JavaScript' ||
          targetEnvironments.isActive('dart') && 'Dart';

      var cheatsheetDoc = {
        id: 'cheatsheet',
        aliases: ['cheatsheet'],
        docType: 'cheatsheet-data',
        sections: [],
        version: versionInfo,
        currentEnvironment: currentEnvironment
      };

      docs = docs.filter(function(doc) {
        if (doc.docType === 'cheatsheet-section') {
          var section = _.pick(doc, ['name', 'description', 'items', 'index']);

          // Let's make sure that the descriptions are rendered as markdown
          section.description = renderMarkdown(section.description);
          section.items.forEach(function(item) {
            item.description = renderMarkdown(item.description);
          });


          cheatsheetDoc.sections.push(section);
          return false;
        }
        return true;
      });

      // Sort the sections by their index
      cheatsheetDoc.sections.sort(function(a, b) { return a.index - b.index; });

      docs.push(cheatsheetDoc);

      return docs;
    }
  };
};