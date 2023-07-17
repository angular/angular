module.exports = function getExampleRegion(exampleMap, createDocMessage, collectExamples, log) {
  return function getExampleRegionImpl(doc, relativePath, regionName) {
    const EXAMPLES_FOLDERS = collectExamples.exampleFolders;

    // Find the example in the folders
    var exampleFile;
    // Try an "annotated" version first
    EXAMPLES_FOLDERS.some(EXAMPLES_FOLDER => { return exampleFile = exampleMap[EXAMPLES_FOLDER][relativePath + '.annotated']; });

    // If no annotated version is available then try the actual file
    if (!exampleFile) {
      EXAMPLES_FOLDERS.some(EXAMPLES_FOLDER => { return exampleFile = exampleMap[EXAMPLES_FOLDER][relativePath]; });
    }

    // If still no file then we error
    if (!exampleFile) {
        const message = createDocMessage('Missing example file... relativePath: "' + relativePath + '".', doc) + '\n' +
            'Example files can be found in the following relative paths: ' + EXAMPLES_FOLDERS.map(function(folder) { return '"' + folder + '"'; }).join(', ');
        throw new Error(message);
    }

    var sourceCodeDoc = exampleFile.regions[regionName || ''];
    if (!sourceCodeDoc) {
      const message = createDocMessage('Missing example region... relativePath: "' + relativePath + '", region: "' + regionName + '".', doc) + '\n' +
      'Regions available are: ' + Object.keys(exampleFile.regions).map(function(region) { return '"' + region + '"'; }).join(', ');
      throw new Error(message);
    }

    sourceCodeDoc.usedInDoc = doc;
    log.debug(`Example region ${sourceCodeDoc.id} used in ${doc.id}`);
    return sourceCodeDoc.renderedContent;
  };
};
