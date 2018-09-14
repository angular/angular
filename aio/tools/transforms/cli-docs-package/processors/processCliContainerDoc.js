module.exports = function processCliContainerDoc() {
  return {
    $runAfter: ['extra-docs-added'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      const cliDoc = docs.find(doc => doc.id === 'cli/index');
      cliDoc.id = 'cli-container';
      cliDoc.commands = docs.filter(doc => doc.docType === 'cli-command');
    }
  };
};
