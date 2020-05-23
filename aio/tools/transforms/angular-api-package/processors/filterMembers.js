/**
 * Filter out members (i.e. static and instance properties and methods) that match specific
 * patterns. Patterns can be added (as `RegExp`s) to the `notAllowedPatterns` array.
 *
 * (By default, no members are excluded.)
 */
module.exports = function filterMembers() {
  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    notAllowedPatterns: [],
    $process(docs) {
      const isAllowed = ({name}) => !this.notAllowedPatterns.some(re => re.test(name));

      docs.forEach(doc => {
        if (doc.statics) doc.statics = doc.statics.filter(isAllowed);
        if (doc.members) doc.members = doc.members.filter(isAllowed);
      });
    },
  };
};
