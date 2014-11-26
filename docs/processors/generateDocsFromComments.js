var _ = require('lodash');

module.exports = function generateDocsFromCommentsProcessor(log) {
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

            console.log(comment.range.toString().trim().search(/\/\*\*(.*?)\*\//m));

            // jsdoc comment (i.e. starting with /** ), we need to check for
            // `/**` at the start of the comment
            comment.range.toString().replace(/^\/\*\*\s*(.*?)\s*\*\/$/, function(_, commentBody) {
              console.log('found comment');
              // Create a doc from this comment
              commentDocs.push({
                fileInfo: doc.fileInfo,
                startingLine: comment.range.start.line,
                endingLine: comment.range.end.line,
                content: text,
                codeNode: comment.tree,
                docType: 'atScript'
              });
            });
          });
        }
      });
      return docs.concat(commentDocs);
    }
  };
};