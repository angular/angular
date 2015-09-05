module.exports = function convertPrivateClassesToInterfacesProcessor(convertPrivateClassesToInterfaces) {
  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    $process: function(docs) {
      convertPrivateClassesToInterfaces(docs, false);
      return docs;
    }
  };
};