var _ = require('lodash');

module.exports = function captureClassMembers(log, getJSDocComment) {

  return {
    $runAfter: ['captureModuleExports'],
    $runBefore: ['parsing-tags'],
    ignorePrivateMembers: false,
    $process: function(docs) {
      var memberDocs = [];
      var ignorePrivateMembers = this.ignorePrivateMembers;
      _.forEach(docs, function(classDoc) {
        if ( classDoc.docType === 'class' ) {

          classDoc.members = [];

          // Create a new doc for each member of the class
          _.forEach(classDoc.elements, function(memberDoc) {

            var memberName = memberDoc.name.location.toString();

            if (ignorePrivateMembers && memberName.charAt(0) === '_') return;

            memberDocs.push(memberDoc);

            memberDoc.docType = 'member';
            memberDoc.classDoc = classDoc;
            memberDoc.name = memberName;
            if (memberDoc.parameterList) {
              memberDoc.params = memberDoc.parameterList.parameters.map(function(param) {
                return param.location.toString();
              });
            }

            if (memberDoc.commentBefore ) {
              // If this export has a comment, remove it from the list of
              // comments collected in the module
              var index = classDoc.moduleDoc.comments.indexOf(memberDoc.commentBefore);
              if ( index !== -1 ) {
                classDoc.moduleDoc.comments.splice(index, 1);
              }

              _.assign(memberDoc, getJSDocComment(memberDoc.commentBefore));
            }

            // Constuctor is a special case member
            if (memberName === 'constructor') {
              classDoc.constructorDoc = memberDoc;
            } else {
              insertSorted(classDoc.members, memberDoc, 'name');
            }

          });
        }
      });

      return docs.concat(memberDocs);
    }
  };
};


function insertSorted(collection, item, property) {
  var index = collection.length;
  while(index>0) {
    if(collection[index-1][property] < item[property]) break;
    index -= 1;
  }
  collection.splice(index, 0, item);
}
