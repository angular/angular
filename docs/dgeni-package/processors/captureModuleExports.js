var _ = require('lodash');

module.exports = function captureModuleExports(log, ExportTreeVisitor, getJSDocComment) {

  return {
    $runAfter: ['files-read'],
    $runBefore: ['parsing-tags'],
    $process: function(docs) {
      var extraDocs = [];
      _.forEach(docs, function(doc) {
        if ( doc.docType === 'module' ) {

          log.debug('processing', doc.moduleTree.moduleName);

          doc.exports = [];

          if ( doc.moduleTree.visit ) {
            var visitor = new ExportTreeVisitor();
            visitor.visit(doc.moduleTree);

            _.forEach(visitor.exports, function(exportDoc) {

              doc.exports.push(exportDoc);
              extraDocs.push(exportDoc);
              exportDoc.moduleDoc = doc;

              if (exportDoc.comment) {
                // If this export has a comment, remove it from the list of
                // comments collected in the module
                var index = doc.comments.indexOf(exportDoc.comment);
                if ( index !== -1 ) {
                  doc.comments.splice(index, 1);
                }

                _.assign(exportDoc, getJSDocComment(exportDoc.comment));
              }

            });
          }
        }
      });

      return docs.concat(extraDocs);
    }
  };
};