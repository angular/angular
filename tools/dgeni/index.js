const path = require('path');
const fs = require('fs');
const Dgeni = require('dgeni');
const DgeniPackage = Dgeni.Package;

// dgeni packages
const jsdocPackage = require('dgeni-packages/jsdoc');
const nunjucksPackage = require('dgeni-packages/nunjucks');
const typescriptPackage = require('dgeni-packages/typescript');


// Project configuration.
const projectRootDir = path.resolve(__dirname, '../..');
const sourceDir = path.resolve(projectRootDir, 'src/lib');
const outputDir = path.resolve(projectRootDir, 'dist/docs/api');
const templateDir = path.resolve(__dirname, './templates');

// Package definition for material2 api docs. This only *defines* the package- it does not yet
// actually *run* anything.
//
// A dgeni package is very similar to an AngularJS module. Modules contain:
//  "services" (injectables)
//  "processors" (injectables that conform to a specific interface)
//  "templates": nunjucks templates that can be used to render content
//
// A dgeni package also has a `config` method, similar to an AngularJS module.
// A config block can inject any services/processors and configure them before
// docs processing begins.

const dgeniPackageDeps = [
  jsdocPackage,
  nunjucksPackage,
  typescriptPackage,
];

let apiDocsPackage = new DgeniPackage('material2-api-docs', dgeniPackageDeps)

.processor(require('./processors/link-inherited-docs'))

// Processor that filters out symbols that should not be shown in the docs.
.processor(require('./processors/docs-private-filter'))

// Processor that appends categorization flags to the docs, e.g. `isDirective`, `isNgModule`, etc.
.processor(require('./processors/categorizer'))

// Processor to group components into top-level groups such as "Tabs", "Sidenav", etc.
.processor(require('./processors/component-grouper'))

.config(function(log) {
  log.level = 'info';
})

// Configure the processor for reading files from the file system.
.config(function(readFilesProcessor, writeFilesProcessor) {
  readFilesProcessor.basePath = sourceDir;
  readFilesProcessor.$enabled = false; // disable for now as we are using readTypeScriptModules

  writeFilesProcessor.outputFolder = outputDir;
})

// Configure the output path for written files (i.e., file names).
.config(function(computePathsProcessor) {
  computePathsProcessor.pathTemplates = [{
    docTypes: ['componentGroup'],
    pathTemplate: '${name}',
    outputPathTemplate: '${name}.html',
  }];
})

// Configure custom JsDoc tags.
.config(function(parseTagsProcessor) {
  parseTagsProcessor.tagDefinitions = parseTagsProcessor.tagDefinitions.concat([
    {name: 'docs-private'}
  ]);
})

// Configure the processor for understanding TypeScript.
.config(function(readTypeScriptModules) {
  console.log(sourceDir);
  readTypeScriptModules.basePath = sourceDir;
  readTypeScriptModules.ignoreExportsMatching = [/^_/];
  readTypeScriptModules.hidePrivateMembers = true;

  // Entry points for docs generation. All publically exported symbols found through these
  // files will have docs generated.
  readTypeScriptModules.sourceFiles = [
    'autocomplete/index.ts',
    'button/index.ts',
    'button-toggle/index.ts',
    'card/index.ts',
    'checkbox/index.ts',
    'chips/index.ts',
    'core/index.ts',
    'dialog/index.ts',
    'grid-list/index.ts',
    'icon/index.ts',
    'input/index.ts',
    'list/index.ts',
    'menu/index.ts',
    'progress-bar/index.ts',
    'progress-spinner/index.ts',
    'radio/index.ts',
    'select/index.ts',
    'sidenav/index.ts',
    'slide-toggle/index.ts',
    'slider/index.ts',
    'snack-bar/index.ts',
    'tabs/index.ts',
    'toolbar/index.ts',
    'tooltip/index.ts',
  ];
})


// Configure processor for finding nunjucks templates.
.config(function(templateFinder, templateEngine) {
  // Where to find the templates for the doc rendering
  templateFinder.templateFolders = [templateDir];

  // Standard patterns for matching docs to templates
  templateFinder.templatePatterns = [
    '${ doc.template }',
    '${ doc.id }.${ doc.docType }.template.html',
    '${ doc.id }.template.html',
    '${ doc.docType }.template.html',
    '${ doc.id }.${ doc.docType }.template.js',
    '${ doc.id }.template.js',
    '${ doc.docType }.template.js',
    '${ doc.id }.${ doc.docType }.template.json',
    '${ doc.id }.template.json',
    '${ doc.docType }.template.json',
    'common.template.html'
  ];

  // dgeni disables autoescape by default, but we want this turned on.
  templateEngine.config.autoescape = true;

  // Nunjucks and Angular conflict in their template bindings so change Nunjucks
  templateEngine.config.tags = {
    variableStart: '{$',
    variableEnd: '$}'
  };
});


module.exports = apiDocsPackage;