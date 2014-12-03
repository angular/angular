var _ = require('lodash');

module.exports = function processClassDocs(log, getJSDocComment) {

  return {
    $runAfter: ['processModuleDocs'],
    $runBefore: ['parsing-tags', 'generateDocsFromComments'],
    $process: function(docs) {
      var memberDocs = [];
      _.forEach(docs, function(classDoc) {
        if ( classDoc.docType === 'class' ) {

          classDoc.members = [];

          // Create a new doc for each member of the class
          _.forEach(classDoc.elements, function(memberDoc) {

            classDoc.members.push(memberDoc);
            memberDocs.push(memberDoc);

            memberDoc.docType = 'member';
            memberDoc.classDoc = classDoc;
            memberDoc.name = memberDoc.name.literalToken.value;

            if (memberDoc.commentBefore ) {
              // If this export has a comment, remove it from the list of
              // comments collected in the module
              var index = classDoc.moduleDoc.comments.indexOf(memberDoc.commentBefore);
              if ( index !== -1 ) {
                classDoc.moduleDoc.comments.splice(index, 1);
              }

              _.assign(memberDoc, getJSDocComment(memberDoc.commentBefore));
            }
          });
        }
      });

      return docs.concat(memberDocs);
    }
  };
};
