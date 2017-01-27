/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const path = require('path');
const fs = require('fs');
const Package = require('dgeni').Package;

const jsdocPackage = require('dgeni-packages/jsdoc');
const nunjucksPackage = require('dgeni-packages/nunjucks');
const typescriptPackage = require('dgeni-packages/typescript');
const gitPackage = require('dgeni-packages/git');
const linksPackage = require('../links-package');
const examplesPackage = require('../examples-package');
const targetPackage = require('../target-package');
const cheatsheetPackage = require('../cheatsheet-package');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const API_SOURCE_PATH = path.resolve(PROJECT_ROOT, 'modules');
const CONTENTS_PATH = path.resolve(PROJECT_ROOT, 'docs/content');
const TEMPLATES_PATH = path.resolve(PROJECT_ROOT, 'docs/templates');

module.exports =
    new Package(
        'angular.io',
        [
          jsdocPackage, nunjucksPackage, typescriptPackage, linksPackage, examplesPackage,
          gitPackage, targetPackage, cheatsheetPackage
        ])

        // Register the processors
        .processor(require('./processors/convertPrivateClassesToInterfaces'))
        .processor(require('./processors/generateNavigationDoc'))
        .processor(require('./processors/generateKeywords'))
        .processor(require('./processors/extractTitleFromGuides'))
        .processor(require('./processors/createOverviewDump'))
        .processor(require('./processors/checkUnbalancedBackTicks'))
        .processor(require('./processors/addNotYetDocumentedProperty'))
        .processor(require('./processors/mergeDecoratorDocs'))
        .processor(require('./processors/extractDecoratedClasses'))
        .processor(require('./processors/matchUpDirectiveDecorators'))
        .processor(require('./processors/filterMemberDocs'))

        .config(function(checkAnchorLinksProcessor, log) {
          // TODO: re-enable
          checkAnchorLinksProcessor.$enabled = false;
        })

        // Where do we get the source files?
        .config(function(
            readTypeScriptModules, readFilesProcessor, collectExamples, generateKeywordsProcessor) {

          // API files are typescript
          readTypeScriptModules.basePath = API_SOURCE_PATH;
          readTypeScriptModules.ignoreExportsMatching = [/^_/];
          readTypeScriptModules.hidePrivateMembers = true;
          readTypeScriptModules.sourceFiles = [
            '@angular/common/index.ts',
            '@angular/common/testing/index.ts',
            '@angular/core/index.ts',
            '@angular/core/testing/index.ts',
            '@angular/forms/index.ts',
            '@angular/http/index.ts',
            '@angular/http/testing/index.ts',
            '@angular/platform-browser/index.ts',
            '@angular/platform-browser/testing/index.ts',
            '@angular/platform-browser-dynamic/index.ts',
            '@angular/platform-browser-dynamic/testing/index.ts',
            '@angular/platform-server/index.ts',
            '@angular/platform-server/testing/index.ts',
            '@angular/platform-webworker/index.ts',
            '@angular/platform-webworker-dynamic/index.ts',
            '@angular/router/index.ts',
            '@angular/router/testing/index.ts',
            '@angular/upgrade/index.ts',
            '@angular/upgrade/static.ts',
          ];

          readFilesProcessor.basePath = PROJECT_ROOT;
          readFilesProcessor.sourceFiles = [
            {basePath: CONTENTS_PATH, include: CONTENTS_PATH + '/cheatsheet/*.md'}, {
              basePath: API_SOURCE_PATH,
              include: API_SOURCE_PATH + '/@angular/examples/**/*',
              fileReader: 'exampleFileReader'
            }
          ];

          collectExamples.exampleFolders = ['@angular/examples'];

          generateKeywordsProcessor.ignoreWordsFile = 'tools/docs/angular.io-package/ignore.words';
          generateKeywordsProcessor.docTypesToIgnore = ['example-region'];
        })



        // Where do we write the output files?
        .config(function(writeFilesProcessor) { writeFilesProcessor.outputFolder = 'dist/docs'; })


        // Target environments
        .config(function(targetEnvironments) {
          const ALLOWED_LANGUAGES = ['ts', 'js', 'dart'];
          const TARGET_LANGUAGE = 'ts';

          ALLOWED_LANGUAGES.forEach(target => targetEnvironments.addAllowed(target));
          targetEnvironments.activate(TARGET_LANGUAGE);

          // TODO: we may need to do something with `linkDocsInlineTagDef`
        })


        // Configure jsdoc-style tag parsing
        .config(function(parseTagsProcessor, getInjectables) {
          // Load up all the tag definitions in the tag-defs folder
          parseTagsProcessor.tagDefinitions =
              parseTagsProcessor.tagDefinitions.concat(getInjectables(requireFolder('./tag-defs')));

          // We actually don't want to parse param docs in this package as we are getting the data
          // out using TS
          // TODO: rewire the param docs to the params extracted from TS
          parseTagsProcessor.tagDefinitions.forEach(function(tagDef) {
            if (tagDef.name === 'param') {
              tagDef.docProperty = 'paramData';
              tagDef.transforms = [];
            }
          });
        })



        // Configure nunjucks rendering of docs via templates
        .config(function(
            renderDocsProcessor, versionInfo, templateFinder, templateEngine, getInjectables) {

          // Where to find the templates for the doc rendering
          templateFinder.templateFolders = [TEMPLATES_PATH];
          // templateFinder.templateFolders.unshift(TEMPLATES_PATH);

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
              templateEngine.filters.concat(getInjectables(requireFolder('./rendering')));

          // Add the version data to the renderer, for use in things like github links
          renderDocsProcessor.extraData.versionInfo = versionInfo;

          // helpers are made available to the nunjucks templates
          renderDocsProcessor.helpers.relativePath = function(from, to) {
            return path.relative(from, to);
          };
        })



        // We are going to be relaxed about ambigous links
        .config(function(getLinkInfo) {
          getLinkInfo.useFirstAmbiguousLink = false;
          // TODO: I think we don't need this for Igor's shell app
          //   getLinkInfo.relativeLinks = true;
        })



        .config(function(
            computeIdsProcessor, computePathsProcessor, EXPORT_DOC_TYPES, generateNavigationDoc,
            generateKeywordsProcessor) {

          const API_SEGMENT = 'api';
          const GUIDE_SEGMENT = 'guide';
          const APP_SEGMENT = 'app';

          generateNavigationDoc.outputFolder = APP_SEGMENT;
          generateKeywordsProcessor.outputFolder = APP_SEGMENT;

          // Replace any path templates inherited from other packages
          // (we want full and transparent control)
          computePathsProcessor.pathTemplates = [
            {
              docTypes: ['module'],
              getPath: function computeModulePath(doc) {
                doc.moduleFolder =
                    doc.id.replace(/^@angular\//, API_SEGMENT + '/').replace(/\/index$/, '');
                return doc.moduleFolder;
              },
              outputPathTemplate: '${moduleFolder}/index.html'
            },
            {
              docTypes: EXPORT_DOC_TYPES.concat(['decorator', 'directive', 'pipe']),
              pathTemplate: '${moduleDoc.moduleFolder}/${name}',
              outputPathTemplate: '${moduleDoc.moduleFolder}/${name}.html',
            },
            {
              docTypes: ['api-list-data', 'api-list-audit'],
              pathTemplate: APP_SEGMENT + '/${docType}.json',
              outputPathTemplate: '${path}'
            },
            {
              docTypes: ['cheatsheet-data'],
              pathTemplate: GUIDE_SEGMENT + '/cheatsheet.json',
              outputPathTemplate: '${path}'
            },
            {docTypes: ['example-region'], getOutputPath: function() {}}
          ];
        });

function requireFolder(folderPath) {
  const absolutePath = path.resolve(__dirname, folderPath);
  return fs.readdirSync(absolutePath)
      .filter(p => !/[._]spec\.js$/.test(p))  // ignore spec files
      .map(p => require(path.resolve(absolutePath, p)));
}