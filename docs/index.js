var Package = require('dgeni').Package;
var jsdocPackage = require('dgeni-packages/jsdoc');
var nunjucksPackage = require('dgeni-packages/nunjucks');
var path = require('canonical-path');

module.exports = new Package('angular', [jsdocPackage, nunjucksPackage])

.factory(require('./readers/atScript'))

.config(function(log) {
  log.level = 'info';
})

.config(function(readFilesProcessor, atScriptFileReader) {
  readFilesProcessor.fileReaders = [atScriptFileReader];
  readFilesProcessor.basePath = path.resolve(__dirname, '..');
  readFilesProcessor.sourceFiles = [
    { module: 'di', include: 'modules/di/src/**/*.js', basePath: 'modules/di/src' }
  ];
})

.config(function(writeFilesProcessor) {
  writeFilesProcessor.outputFolder  = 'build/docs';
})


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