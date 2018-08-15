module.exports = function computeSearchTitleProcessor() {
  return {
    $runAfter: ['ids-computed'],
    $runBefore: ['generateKeywordsProcessor'],
    $process(docs) {
      docs.forEach(doc => {
        switch(doc.docType) {
        case 'function':
          doc.searchTitle = `${doc.name}()`;
          break;
        case 'package':
          doc.searchTitle = `${doc.id} package`;
          break;
        }
      });
    }
  };
};
