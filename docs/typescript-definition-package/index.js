var Package = require('dgeni').Package;
var jsdocPackage = require('dgeni-packages/jsdoc');
var nunjucksPackage = require('dgeni-packages/nunjucks');
var typescriptPackage = require('../typescript-package');
var gitPackage = require('dgeni-packages/git');
var path = require('canonical-path');

// Define the dgeni package for generating the docs
module.exports = new Package('angular-v2-docs', [jsdocPackage, nunjucksPackage, typescriptPackage, gitPackage])

// Register the processors
.processor(require('./processors/createTypeDefinitionFile'))

.config(function(readFilesProcessor, inlineTagProcessor) {
  readFilesProcessor.basePath = path.resolve(__dirname, '../..');
  // Don't run unwanted processors
  readFilesProcessor.$enabled = false;
  inlineTagProcessor.$enabled = false;
})


// Configure the log service
.config(function(log) {
  log.level = 'info';
})


.config(function(renderDocsProcessor, versionInfo) {
  renderDocsProcessor.extraData.versionInfo = versionInfo;
})

.config(function(readFilesProcessor, inlineTagProcessor, readTypeScriptModules, createTypeDefinitionFile) {

  // Don't run unwanted processors
  readFilesProcessor.$enabled = false; // We are not using the normal file reading processor
  inlineTagProcessor.$enabled = false; // We are not actually processing the inline link tags

  // Configure file reading
  readFilesProcessor.basePath = path.resolve(__dirname, '../..');
  readTypeScriptModules.sourceFiles = [
    'angular2/angular2.ts',
    'angular2/router.ts'
  ];
  readTypeScriptModules.basePath = path.resolve(path.resolve(__dirname, '../../modules'));

  createTypeDefinitionFile.typeDefinitions = [
      {
        id: 'angular2/angular2',
        references: ['../es6-promise/es6-promise.d.ts', '../rx/rx.d.ts'],
        modules: {
          'angular2/angular2': 'angular2/angular2',
        }
      },
      {
        id: 'angular2/router',
        //Right now the typings live in the same directory, but eventually will not. See #3458
        references: ['../angular2/angular2.d.ts'],
        modules: {
          'angular2/router': 'angular2/router'
        }
      }
  ];
})


.config(function(parseTagsProcessor, getInjectables) {
  // We actually don't want to parse param docs in this package as we are getting the data out using TS
  parseTagsProcessor.tagDefinitions.forEach(function(tagDef) {
    if (tagDef.name === 'param') {
      tagDef.docProperty = 'paramData';
      tagDef.transforms = [];
    }
  });

})


// Configure file writing
.config(function(writeFilesProcessor) {
  writeFilesProcessor.outputFolder  = 'dist/docs';
})


// Configure rendering
.config(function(templateFinder, templateEngine) {

  // Nunjucks and Angular conflict in their template bindings so change Nunjucks
  templateEngine.config.tags = {
    variableStart: '{$',
    variableEnd: '$}'
  };

  templateFinder.templateFolders
      .unshift(path.resolve(__dirname, 'templates'));

  templateFinder.templatePatterns = [
    '${ doc.template }',
    '${ doc.id }.${ doc.docType }.template.html',
    '${ doc.id }.template.html',
    '${ doc.docType }.template.html',
    'common.template.html'
  ];
});