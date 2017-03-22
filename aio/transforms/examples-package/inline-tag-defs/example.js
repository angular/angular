var path = require('canonical-path');
var fs = require('fs');
var entities = require('entities');

/**
 * @dgService exampleInlineTagDef
 * @description
 * Process inline example tags (of the form {@example relativePath region -title='some title'
 * -stylePattern='{some style pattern}' }),
 * replacing them with code from a shredded file
 * Examples:
 * {@example core/application_spec.ts hello-app -title='Sample component' }
 * {@example core/application_spec.ts -region=hello-app -title='Sample component' }
 * @kind function
 */
module.exports = function exampleInlineTagDef(
    parseArgString, exampleMap, createDocMessage, log, collectExamples) {
  return {
    name: 'example',
    description:
        'Process inline example tags (of the form {@example some/uri Some Title}), replacing them with HTML anchors',


    handler: function(doc, tagName, tagDescription) {
      const EXAMPLES_FOLDERS = collectExamples.exampleFolders;

      var tagArgs = parseArgString(entities.decodeHTML(tagDescription));
      var unnamedArgs = tagArgs._;
      var relativePath = unnamedArgs[0];
      var regionName = tagArgs.region || (unnamedArgs.length > 1 ? unnamedArgs[1] : '');
      if (regionName === '\'\'') regionName = '';
      var title = tagArgs.title || (unnamedArgs.length > 2 ? unnamedArgs.slice(2).join(' ') : null);
      var linenums = tagArgs.linenums;
      var stylePattern = tagArgs.stylePattern;  // TODO: not yet implemented here

      const sourceCode = getExampleRegion();

      const attributes = [];
      if (title) attributes.push(` title="${title}"`);
      if (linenums !== undefined) attributes.push(` linenums="${linenums}"`);

      return '<code-example' + attributes.join('') + '>\n' + sourceCode + '\n</code-example>';


      function getExampleRegion() {
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

        var sourceCodeDoc = exampleFile.regions[regionName];
        if (!sourceCodeDoc) {
          log.error(createDocMessage('Missing example region... relativePath: "' + relativePath + '", region: "' + regionName + '".', doc));
          log.error('Regions available are:', Object.keys[exampleFile.regions]);
          return '';
        }

        return sourceCodeDoc.renderedContent;
      }
    }
  };
};

