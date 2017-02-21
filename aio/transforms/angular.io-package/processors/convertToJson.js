module.exports = function convertToJsonProcessor() {

  return {
    $runAfter: ['checkUnbalancedBackTicks'],
    $runBefore: ['writeFilesProcessor'],
    docTypes: [],
    $process: function(docs) {
      const docTypes = this.docTypes
      docs.forEach((doc) => {
        if (docTypes.indexOf(doc.docType) !== -1) {
          const output = {
            title: doc.title || doc.name,
            content: doc.renderedContent
          };
          doc.renderedContent = JSON.stringify(output, null, 2);
        }
      });
    }
  };
};