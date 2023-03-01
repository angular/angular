/**
 * @dgService getDocFromAlias
 * @description Get an array of docs that match this alias, relative to the originating doc.
 *
 * @property {Array<(alias: string, originatingDoc: Doc, ambiguousDocs: Doc[]) => Doc[]>} disambiguators
 *           a collection of functions that attempt to resolve ambiguous links. Each disambiguator returns
 *           a new collection of docs with unwanted ambiguous docs removed (see links-package/service/disambiguators
 *           for examples).
 */
module.exports = function getDocFromAlias(aliasMap) {

  getDocFromAlias.disambiguators = [];
  return getDocFromAlias;

  function getDocFromAlias(alias, originatingDoc) {
    return getDocFromAlias.disambiguators.reduce(
      // Run the disambiguators while there is more than 1 doc found
      (docs, disambiguater) => docs.length > 1 ? disambiguater(alias, originatingDoc, docs) : docs,
      // Start with the docs that match the alias
      aliasMap.getDocs(alias)
    );
  }
};
