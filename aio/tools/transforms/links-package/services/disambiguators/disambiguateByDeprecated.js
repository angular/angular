module.exports = function disambiguateByDeprecated() {
  return (alias, originatingDoc, docs) => docs.filter(doc => doc.deprecated === undefined);
};
