var _ = require('lodash');

module.exports = function captureModuleDocs(log, getJSDocComment) {

  return {
    $runAfter: ['captureClassMembers'],
    $runBefore: ['parsing-tags'],
    $process: function(docs) {
      // Generate docs for each module's file's comments not already captured
      _.forEach(docs, function(moduleDoc) {

        if ( moduleDoc.docType !== 'module' ) return;

        moduleDoc.extraComments = [];
        _.forEach(moduleDoc.comments, function(comment) {
          var jsDocComment = getJSDocComment(comment);
          if (jsDocComment) {
            jsDocComment.docType = 'moduleDoc';
            jsDocComment.moduleDoc = moduleDoc;
            moduleDoc.extraComments.push(jsDocComment);
            docs.push(jsDocComment);
//            console.log('found', jsDocComment.content);
          }
        });
        if ( moduleDoc.extraComments.length > 0 ) {
//          console.log(moduleDoc.extraComments.length);
        }
      });
    }
  };
};