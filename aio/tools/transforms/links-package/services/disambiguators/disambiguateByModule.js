module.exports = function disambiguateByModule() {
  return (alias, originatingDoc, docs) => {
    const originatingModule = originatingDoc && originatingDoc.moduleDoc;
    if (originatingModule) {
      const filteredDocs = docs.filter(doc => doc.moduleDoc === originatingModule);
      if (filteredDocs.length > 0) {
        return filteredDocs;
      }
    }
    return docs;
  };
};
