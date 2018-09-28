/**
 * This file reader will pull the contents from a cli command json file
 *
 * The doc will initially have the form:
 * ```
 * {
 *   startingLine: 1,
 *   ...
 * }
 * ```
 */
module.exports = function cliCommandFileReader(log) {
  const json5 = require('json5');
  return {
    name: 'cliCommandFileReader',
    defaultPattern: /\.json$/,
    getDocs(fileInfo) {
      try {
        const doc = json5.parse(fileInfo.content);
        const name = fileInfo.baseName;
        const path = `cli/${name}`;
        // We return a single element array because content files only contain one document
        const result = Object.assign(doc, {
          content: doc.description,
          docType: 'cli-command',
          startingLine: 1,
          id: `cli-${doc.name}`,
          commandAliases: doc.aliases || [],
          aliases: computeAliases(doc),
          path,
          outputPath: `${path}.json`,
          breadCrumbs: [
            { text: 'CLI', path: 'cli' },
            { text: name, path },
          ]
        });
        return [result];
      } catch (e) {
        log.warn(`Failed to read cli command file: "${fileInfo.relativePath}" - ${e.message}`);
      }
    }
  };
};

function computeAliases(doc) {
  return [doc.name].concat(doc.aliases || []).map(alias => `cli-${alias}`);
}