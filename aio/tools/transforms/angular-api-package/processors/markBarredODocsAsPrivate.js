module.exports = function markBarredODocsAsPrivate() {
  return {
    $runAfter: ['readTypeScriptModules'],
    $runBefore: ['adding-extra-docs'],
    $process: function(docs) {
      docs.forEach(doc => {
        if (doc.name && doc.name.indexOf('ɵ') === 0) {
          doc.privateExport = true;
        }
      });
    }
  };
};
