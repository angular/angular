/**
 * Members that have overloads get long unwieldy anchors because they must be distinguished
 * by their parameter lists.
 * But the primary overload doesn't not need this distinction, so can just be the name of the member.
 */
module.exports = function simplifyMemberAnchors() {
  return {
    $runAfter: ['paths-computed'],
    $runBefore: ['rendering-docs'],
    $process: function(docs) {
      return docs.forEach(doc => {
        if (doc.members) {
          doc.members.forEach(member => {
            member.anchor = computeAnchor(member);
            member.path = doc.path + '#' + member.anchor;
          });
        }
        if (doc.statics) {
          doc.statics.forEach(member => {
            member.anchor = computeAnchor(member);
            member.path = doc.path + '#' + member.anchor;
          });
        }
      });
    }
  };
};

function computeAnchor(member) {
  // if the member is a "call" type then it has no name
  return encodeURI(member.name.trim() || 'call');
}
