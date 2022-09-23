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
module.exports = function cliCommandFileReader() {
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
          id: `cli-${doc.name}`,
          commandAliases: doc.aliases || [],
          aliases: computeAliases(doc),
          path,
          outputPath: `${path}.json`,
          longDescriptionDoc: createLongDescriptionDoc(doc),
          breadCrumbs: [
            {text: 'CLI', path: 'cli'},
            {text: name, path},
          ]
        });

        return [result];
      } catch (e) {
        throw new Error(
            `Failed to read cli command file: "${fileInfo.relativePath}" - ${e.message}`);
      }
    }
  };

  function computeAliases(doc) {
    return [doc.name].concat(doc.aliases || []).map(alias => `cli-${alias}`);
  }

  /**
   * Synthesize a doc for the CLI command long description, which is used to generate links
   * for viewing and editing the long description in GitHub.
   *
   * The long description is stored in a markdown file that is referenced from the original
   * schema file for the command, via the `$longDescription` field. The field is a relative path
   * to the markdown file from the schema file.
   *
   * This function tries to retrieve that original schema based on the file path of the help JSON
   * file, which was passed to the `cliCommandFileReader.getDocs()` method.
   */
  function createLongDescriptionDoc(doc) {
    if (doc.longDescriptionRelativePath) {
      return {
        docType: 'content',
        startingLine: 0,
        fileInfo: {
          projectRelativePath: doc.longDescriptionRelativePath.replace(/^@/, 'packages/'),
        },
      };
    }
  }
};
