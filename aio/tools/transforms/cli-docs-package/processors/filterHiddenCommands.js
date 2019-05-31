module.exports = function filterHiddenCommands() {
  return {
    $runAfter: ['files-read'],
    $runBefore: ['processCliContainerDoc', 'createSitemap'],
    $process(docs) {
      return docs.filter(doc => doc.docType !== 'cli-command' || doc.hidden !== true);
    }
  };
};
