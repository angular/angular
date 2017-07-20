module.exports = function getExampleRegion(exampleMap, createDocMessage, log, collectExamples) {
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
      log.error(createDocMessage('Missing example file... relativePath: "' + relativePath + '".', doc));
      log.error('Example files can be found in: ' + EXAMPLES_FOLDERS.join(', '));
      return '';
    }

    var sourceCodeDoc = exampleFile.regions[regionName || ''];
    if (!sourceCodeDoc) {
      log.error(createDocMessage('Missing example region... relativePath: "' + relativePath + '", region: "' + regionName + '".', doc));
      log.error('Regions available are:', Object.keys[exampleFile.regions]);
      return '';
    }

    return sourceCodeDoc.renderedContent;
  };
};
