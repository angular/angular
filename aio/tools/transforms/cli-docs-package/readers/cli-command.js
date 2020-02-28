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
      fileInfo.realProjectRelativePath = 'packages/angular/cli/commands/' + fileInfo.relativePath;
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
          aliases: computeAliases(doc), path,
          outputPath: `${path}.json`,
          breadCrumbs: [
            {text: 'CLI', path: 'cli'},
            {text: name, path},
          ]
        });
        if (doc.longDescription) {
          doc.longDescriptionDoc = createLongDescriptionDoc(fileInfo);
        }
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
  function createLongDescriptionDoc(fileInfo) {
    const path = require('canonical-path');
    const fs = require('fs');
    const json5 = require('json5');

    const schemaJsonPath = path.resolve(fileInfo.basePath, '../commands', fileInfo.relativePath);

    try {
      const schemaJson = fs.readFileSync(schemaJsonPath);
      const schema = json5.parse(schemaJson);
      if (schema.$longDescription) {
        return {
          docType: 'content',
          startingLine: 0,
          fileInfo: {
            realProjectRelativePath:
                path.join(path.dirname(fileInfo.realProjectRelativePath), schema.$longDescription)
          }
        };
      }
    } catch (e) {
      throw new Error(
          `Unable to read CLI "$longDescription" info from the schema: "${schemaJsonPath}" - ${e.message}`);
    }
  }
};
