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
    'angular2/web_worker/worker.ts',
    'angular2/web_worker/ui.ts',
    'angular2/router.ts',
    'angular2/http.ts',
    'angular2/test_lib.ts'
  ];
  readTypeScriptModules.basePath = path.resolve(path.resolve(__dirname, '../../modules'));

  createTypeDefinitionFile.typeDefinitions = [
    {
      id: 'angular2/angular2',
      references: ['../es6-shim/es6-shim.d.ts'],
      modules: {
        'angular2/angular2': {namespace: 'ng', id: 'angular2/angular2'},
        'angular2/web_worker/worker': {namespace: 'ngWorker', id: 'angular2/web_worker/worker'},
        'angular2/web_worker/ui': {namespace: 'ngUi', id: 'angular2/web_worker/ui'}
      }
    },
    {
      id: 'angular2/router',
      references: ['./angular2.d.ts'],
      remapTypes: {Type: 'ng.Type', InjectableReference: 'ng.InjectableReference'},
      modules: {'angular2/router': {namespace: 'ngRouter', id: 'angular2/router'}}
    },
    {
      id: 'angular2/http',
      references: ['./angular2.d.ts'],
      remapTypes: {Type: 'ng.Type', Observable: 'ng.Observable', EventEmitter: 'ng.EventEmitter', InjectableReference: 'ng.InjectableReference' },
      modules: {'angular2/http': {namespace: 'ngHttp', id: 'angular2/http'}}
    },
    {
      id: 'angular2/test_lib',
      references: ['./angular2.d.ts', '../jasmine/jasmine.d.ts'],
      remapTypes: { Type: 'ng.Type', Binding: 'ng.Binding', ViewMetadata: 'ng.ViewMetadata', Injector: 'ng.Injector',
                    Predicate: 'ng.Predicate', ElementRef: 'ng.ElementRef', DebugElement: 'ng.DebugElement',
                    InjectableReference: 'ng.InjectableReference' },
      modules: {'angular2/test_lib': {namespace: 'ngTestLib', id: 'angular2/test_lib'}}
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
