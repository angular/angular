/**
 * This link disambiguator will remove all the members from the list of ambiguous links
 * if there is at least one link to a doc that is not a member.
 *
 * The heuristic is that exports are more important than members when linking, and that
 * in general members will be linked to via a more explicit code links such as
 * `MyClass.member` rather than simply `member`.
 */
module.exports = function disambiguateByNonMember() {
  return (alias, originatingDoc, docs) => {
    const filteredDocs = docs.filter(doc => doc.docType !== 'member');
    return filteredDocs.length > 0 ? filteredDocs : docs;
  };
};
