var _ = require('lodash');

module.exports = function generateDocsFromComments(log) {
  return {
    $runAfter: ['files-read'],
    $runBefore: ['parsing-tags'],
    $process: function(docs) {
      var commentDocs = [];
      docs = _.filter(docs, function(doc) {
        if (doc.docType !== 'atScriptFile') {
          return true;
        } else {
          _.forEach(doc.fileInfo.comments, function(comment) {

            // we need to check for `/**` at the start of the comment to find all the jsdoc style comments
            comment.range.toString().replace(/^\/\*\*([\w\W]*)\*\/$/g, function(match, commentBody) {

              // Create a doc from this comment
              commentDocs.push({
                fileInfo: doc.fileInfo,
                startingLine: comment.range.start.line,
                endingLine: comment.range.end.line,
                content: commentBody,
                codeTree: comment.treeAfter,
                docType: 'atScriptDoc'
              });
            });
          });
        }
      });
      return docs.concat(commentDocs);
    }
  };
};