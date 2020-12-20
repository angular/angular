/**
 * @dgProcessor updateGlobalApiPath
 *
 * If a global API has a namespace, its name will contain a dot which will cause its
 * URL to look like a file path. This processor updates it so it's less ambiguous.
 */
module.exports = function updateGlobalApiPathProcessor() {
  return {
    $runAfter: ['computePathsProcessor'],
    $runBefore: ['processNgModuleDocs'],
    $process: function(docs) {
      docs.forEach(doc => {
        if (doc.global && doc.globalNamespace) {
          // We need to change the path to camel case, because having a dot
          // in the URL will make it look like a file path.
          const name = doc.unprefixedName;
          const fileName = doc.globalNamespace + name[0].toUpperCase() + name.slice(1);

          doc.path = `${doc.moduleDoc.moduleFolder}/${fileName}`;
          doc.outputPath =
              `${doc.moduleDoc.moduleFolder}/${fileName}.json`;
        }
      });
    }
  };
};
