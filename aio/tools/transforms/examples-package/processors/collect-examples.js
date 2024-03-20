const {extname} = require('canonical-path');
const {mapObject} = require('../../helpers/utils');

module.exports = function collectExamples(exampleMap, regionParser, log, createDocMessage) {
  return {
    $runAfter: ['files-read'],
    $runBefore: ['parsing-tags'],
    $validate: {exampleFolders: {presence: true}},
    exampleFolders: [],

    $process(docs) {
      const exampleFolders = this.exampleFolders;
      exampleFolders.forEach(folder => exampleMap[folder] = exampleMap[folder] || {});
      const regionDocs = [];
      docs = docs.filter((doc) => {
        if (doc.docType === 'example-file') {
          try {
            // find the first matching folder
            exampleFolders.some((folder) => {
              if (doc.fileInfo.relativePath.indexOf(folder) === 0) {
                const relativePath =
                    doc.fileInfo.relativePath.slice(folder.length).replace(/^\//, '');
                exampleMap[folder][relativePath] = doc;

                // We treat files that end in `.annotated` specially
                // They are used to annotate files that cannot contain comments, such as JSON
                // So you provide two files: `xyz.json` and `xyz.json.annotated`, which is a copy
                // of the original but contains inline doc region comments
                let fileType = doc.fileInfo.extension;
                if (fileType === 'annotated') {
                  fileType = extname(doc.fileInfo.baseName).slice(1) + '.' + fileType;
                }

                const parsedRegions = regionParser(doc.content, fileType);

                log.debug(
                    'found example file', folder, relativePath, Object.keys(parsedRegions.regions));

                doc.renderedContent = parsedRegions.contents;

                // Map each region into a doc that can be put through the rendering pipeline
                doc.regions = mapObject(parsedRegions.regions, (regionName, regionContents) => {
                  const regionDoc =
                      createRegionDoc(folder, relativePath, regionName, regionContents);
                  regionDocs.push(regionDoc);
                  return regionDoc;
                });

                return true;
              }
            });

            return false;

          } catch (e) {
            throw new Error(createDocMessage(e.message, doc, e));
          }
        } else {
          return true;
        }
      });

      return docs.concat(regionDocs);
    }
  };
};

function createRegionDoc(folder, relativePath, regionName, regionContents) {
  const path = folder + '/' + relativePath;
  const id = path + '#' + regionName;
  return {
    docType: 'example-region',
    path: path,
    name: regionName,
    id: id,
    aliases: [id],
    contents: regionContents
  };
}
