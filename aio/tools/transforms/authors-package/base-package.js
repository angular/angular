/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* eslint no-console: "off" */
const path = require('path');
const fs = require('fs');
const Package = require('dgeni').Package;

const jsdocPackage = require('dgeni-packages/jsdoc');
const nunjucksPackage = require('dgeni-packages/nunjucks');
const linksPackage = require('../links-package');
const examplesPackage = require('../examples-package');
const targetPackage = require('../target-package');
const contentPackage = require('../content-package');
const remarkPackage = require('../remark-package');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const API_SOURCE_PATH = path.resolve(PROJECT_ROOT, 'packages');
const AIO_PATH = path.resolve(PROJECT_ROOT, 'aio');
const CONTENTS_PATH = path.resolve(AIO_PATH, 'content');
const TEMPLATES_PATH = path.resolve(AIO_PATH, 'tools/transforms/templates');
const OUTPUT_PATH = path.resolve(AIO_PATH, 'src/content');
const DOCS_OUTPUT_PATH = path.resolve(OUTPUT_PATH, 'docs');

const basePackage = new Package('authors-base', [
  jsdocPackage, nunjucksPackage, linksPackage, examplesPackage,
  targetPackage, contentPackage, remarkPackage
])

  // Register the processors
  .processor(require('../angular.io-package/processors/checkUnbalancedBackTicks'))
  .processor(require('../angular.io-package/processors/convertToJson'))
  .processor(require('../angular.io-package/processors/fixInternalDocumentLinks'))
  .processor(require('../angular.io-package/processors/copyContentAssets'))

  // overrides base packageInfo and returns the one for the 'angular/angular' repo.
  .factory('packageInfo', function() { return require(path.resolve(PROJECT_ROOT, 'package.json')); })
  .factory(require('../angular.io-package/readers/json'))
  .factory(require('../angular.io-package/services/copyFolder'))

  .config(function(checkAnchorLinksProcessor) {
    // TODO: re-enable
    checkAnchorLinksProcessor.$enabled = false;
  })

  // Where do we get the source files?
  .config(function(readFilesProcessor, collectExamples, jsonFileReader) {

    readFilesProcessor.basePath = PROJECT_ROOT;
    readFilesProcessor.fileReaders.push(jsonFileReader);
    collectExamples.exampleFolders = ['examples'];
  })

  // Where do we write the output files?
  .config(function(writeFilesProcessor) { writeFilesProcessor.outputFolder = DOCS_OUTPUT_PATH; })


  // Target environments
  // TODO: remove this stuff when we have no more target inline tags
  .config(function(targetEnvironments) {
    const ALLOWED_LANGUAGES = ['ts', 'js', 'dart'];
    const TARGET_LANGUAGE = 'ts';

    ALLOWED_LANGUAGES.forEach(target => targetEnvironments.addAllowed(target));
    targetEnvironments.activate(TARGET_LANGUAGE);
  })


  // Configure jsdoc-style tag parsing
  .config(function(parseTagsProcessor, getInjectables, inlineTagProcessor) {
    // Load up all the tag definitions in the tag-defs folder
    parseTagsProcessor.tagDefinitions =
        parseTagsProcessor.tagDefinitions.concat(getInjectables(requireFolder('../angular.io-package/tag-defs')));

    // We actually don't want to parse param docs in this package as we are getting the data
    // out using TS
    // TODO: rewire the param docs to the params extracted from TS
    parseTagsProcessor.tagDefinitions.forEach(function(tagDef) {
      if (tagDef.name === 'param') {
        tagDef.docProperty = 'paramData';
        tagDef.transforms = [];
      }
    });

    inlineTagProcessor.inlineTagDefinitions.push(require('../angular.io-package/inline-tag-defs/anchor'));
  })

  // Configure nunjucks rendering of docs via templates
  .config(function(
      renderDocsProcessor, templateFinder, templateEngine, getInjectables) {

    // Where to find the templates for the doc rendering
    templateFinder.templateFolders = [TEMPLATES_PATH];

    // Standard patterns for matching docs to templates
    templateFinder.templatePatterns = [
      '${ doc.template }', '${ doc.id }.${ doc.docType }.template.html',
      '${ doc.id }.template.html', '${ doc.docType }.template.html',
      '${ doc.id }.${ doc.docType }.template.js', '${ doc.id }.template.js',
      '${ doc.docType }.template.js', '${ doc.id }.${ doc.docType }.template.json',
      '${ doc.id }.template.json', '${ doc.docType }.template.json', 'common.template.html'
    ];

    // Nunjucks and Angular conflict in their template bindings so change Nunjucks
    templateEngine.config.tags = {variableStart: '{$', variableEnd: '$}'};

    templateEngine.filters =
        templateEngine.filters.concat(getInjectables(requireFolder('../angular.io-package/rendering')));

    // helpers are made available to the nunjucks templates
    renderDocsProcessor.helpers.relativePath = function(from, to) {
      return path.relative(from, to);
    };
  })

  // We are not going to be relaxed about ambiguous links
  .config(function(getLinkInfo) {
    getLinkInfo.useFirstAmbiguousLink = false;
  })

  .config(function(computeIdsProcessor, computePathsProcessor) {

    // Replace any path templates inherited from other packages
    // (we want full and transparent control)
    computePathsProcessor.pathTemplates = [
      {docTypes: ['example-region'], getOutputPath: function() {}},
      {
        docTypes: ['content'],
        getPath: (doc) => `${doc.id.replace(/\/index$/, '')}`,
        outputPathTemplate: '${path}.json'
      },
      {docTypes: ['navigation-json'], pathTemplate: '${id}', outputPathTemplate: '../${id}.json'},
      {docTypes: ['contributors-json'], pathTemplate: '${id}', outputPathTemplate: '../${id}.json'},
      {docTypes: ['resources-json'], pathTemplate: '${id}', outputPathTemplate: '../${id}.json'}
    ];
  })

  .config(function(convertToJsonProcessor) {
    convertToJsonProcessor.docTypes = ['content'];
  })

  .config(function(copyContentAssetsProcessor) {
    copyContentAssetsProcessor.assetMappings.push(
      { from: path.resolve(CONTENTS_PATH, 'images'), to: path.resolve(OUTPUT_PATH, 'images') }
    );
  });

function requireFolder(folderPath) {
  const absolutePath = path.resolve(__dirname, folderPath);
  return fs.readdirSync(absolutePath)
      .filter(p => !/[._]spec\.js$/.test(p))  // ignore spec files
      .map(p => require(path.resolve(absolutePath, p)));
}

function getBoilerPlateExcludes() {
  return [
    '**/*plnkr.no-link.html',
    '**/node_modules/**',
    // _boilerplate files
    '**/_boilerplate/**',
    '**/*/src/styles.css',
    '**/*/src/systemjs-angular-loader.js',
    '**/*/src/systemjs.config.js',
    '**/*/src/tsconfig.json',
    '**/*/bs-config.e2e.json',
    '**/*/bs-config.json',
    '**/*/package.json',
    '**/*/tslint.json',
    // example files
    '**/_test-output',
    '**/protractor-helpers.js',
    '**/e2e-spec.js',
    '**/ts/**/*.js',
    '**/js-es6*/**/*.js',
    '**/ts-snippets/**/*.js',
  ];
}

module.exports = {
  basePackage,
  PROJECT_ROOT,
  API_SOURCE_PATH,
  AIO_PATH,
  CONTENTS_PATH,
  TEMPLATES_PATH,
  OUTPUT_PATH,
  DOCS_OUTPUT_PATH,
  requireFolder,
  getBoilerPlateExcludes
};
