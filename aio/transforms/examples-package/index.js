var Package = require('dgeni').Package;
var jsdocPackage = require('dgeni-packages/jsdoc');

module.exports =
    new Package('examples', [jsdocPackage])

        .factory(require('./inline-tag-defs/example'))
        // .factory(require('./inline-tag-defs/exampleTabs'))
        .factory(require('./services/parseArgString'))
        .factory(require('./services/getExampleFilename'))
        .factory(require('./services/example-map'))
        .factory(require('./file-readers/example-reader'))
        .factory(require('./services/region-parser'))

        .processor(require('./processors/collect-examples'))

        .config(function(readFilesProcessor, exampleFileReader) {
          readFilesProcessor.fileReaders.push(exampleFileReader);
        })

        .config(function(inlineTagProcessor, exampleInlineTagDef) {
          inlineTagProcessor.inlineTagDefinitions.push(exampleInlineTagDef);
          // inlineTagProcessor.inlineTagDefinitions.push(exampleTabsInlineTagDef);
        })

        .config(function(computePathsProcessor) {
          computePathsProcessor.pathTemplates.push(
              {docTypes: ['example-region'], getPath: function() {}, getOutputPath: function() {}});
        });
