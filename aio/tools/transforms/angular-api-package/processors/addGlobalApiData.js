/**
 * @dgProcessor addGlobalApiData
 *
 * Marks APIs tagged with `@globalApi` as globals and
 * prefixes them with the namespace, if there is one.
 */
module.exports = function addGlobalApiDataProcessor() {
  return {
    $runBefore: ['computing-ids'],
    $process: function(docs) {
      docs.forEach(doc => {
        const globalApiTag = doc.globalApi && doc.globalApi.trim();

        if (globalApiTag != null) {
          doc.global = true;

          if (globalApiTag.length > 0) {
            // Prefix the symbol name with the global namespace,
            // if we have one (e.g. `foo` becomes `ng.foo`).
            doc.unprefixedName = doc.name;
            doc.name = `${globalApiTag}.${doc.name}`;
            doc.globalNamespace = globalApiTag;
          }
        }
      });
    }
  };
};
