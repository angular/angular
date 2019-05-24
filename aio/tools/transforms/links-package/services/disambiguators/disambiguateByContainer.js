/**
 * This link disambiguator looks for matching docs that have a common container with the
 * originatingDoc and will return just those.
 */
module.exports = function disambiguateByContainer() {
  return _disambiguate;
};

function _disambiguate(alias, originatingDoc, docs) {
  if (originatingDoc) {
    const filteredDocs = docs.filter(doc => doc.containerDoc === originatingDoc);
    if (filteredDocs.length === 0) {
      // No docs match so let's look at the containers container
      return _disambiguate(alias, originatingDoc.containerDoc, docs);
    }
    return filteredDocs;
  }
  return docs;
}
