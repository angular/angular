module.exports = function createOverviewDump() {

  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    $process: function(docs) {
      const overviewDoc = {
        id: 'overview-dump',
        aliases: ['overview-dump'],
        path: 'overview-dump',
        outputPath: 'overview-dump.html',
        modules: []
      };

      docs.forEach(doc => {
        if (doc.docType === 'package') {
          overviewDoc.modules.push(doc);
        }
      });

      docs.push(overviewDoc);
    }
  };
};