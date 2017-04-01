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
const contentPackage = require('../content-package');
const rhoPackage = require('../rho-package');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const API_SOURCE_PATH = path.resolve(PROJECT_ROOT, 'packages');
const AIO_PATH = path.resolve(PROJECT_ROOT, 'aio');
const CONTENTS_PATH = path.resolve(AIO_PATH, 'content');
const TEMPLATES_PATH = path.resolve(AIO_PATH, 'transforms/templates');
const OUTPUT_PATH = path.resolve(AIO_PATH, 'src/content');
const DOCS_OUTPUT_PATH = path.resolve(OUTPUT_PATH, 'docs');

module.exports =
    new Package(
        'angular.io', [
          jsdocPackage, nunjucksPackage, typescriptPackage, linksPackage, examplesPackage,
          gitPackage, targetPackage, contentPackage, rhoPackage
        ])

        // Register the processors
        .processor(require('./processors/convertPrivateClassesToInterfaces'))
        .processor(require('./processors/generateApiListDoc'))
        .processor(require('./processors/generateKeywords'))
        .processor(require('./processors/createOverviewDump'))
        .processor(require('./processors/checkUnbalancedBackTicks'))
        .processor(require('./processors/addNotYetDocumentedProperty'))
        .processor(require('./processors/mergeDecoratorDocs'))
        .processor(require('./processors/extractDecoratedClasses'))
        .processor(require('./processors/matchUpDirectiveDecorators'))
        .processor(require('./processors/filterMemberDocs'))
        .processor(require('./processors/convertToJson'))
        .processor(require('./processors/markBarredODocsAsPrivate'))
        .processor(require('./processors/filterPrivateDocs'))
        .processor(require('./processors/filterIgnoredDocs'))
        .processor(require('./processors/fixInternalDocumentLinks'))
        .processor(require('./processors/processNavigationMap'))
        .processor(require('./processors/copyContentAssets'))

        // overrides base packageInfo and returns the one for the 'angular/angular' repo.
        .factory('packageInfo', function() { return require(path.resolve(PROJECT_ROOT, 'package.json')); })
        .factory(require('./readers/json'))
        .factory(require('./services/copyFolder'))

        .config(function(checkAnchorLinksProcessor) {
          // TODO: re-enable
          checkAnchorLinksProcessor.$enabled = false;
        })

        // Where do we get the source files?
        .config(function(
            readTypeScriptModules, readFilesProcessor, collectExamples, generateKeywordsProcessor, jsonFileReader) {

          // API files are typescript
          readTypeScriptModules.basePath = API_SOURCE_PATH;
          readTypeScriptModules.ignoreExportsMatching = [/^_/];
          readTypeScriptModules.hidePrivateMembers = true;
          readFilesProcessor.fileReaders.push(jsonFileReader);
          readTypeScriptModules.sourceFiles = [
            'common/index.ts',
            'common/testing/index.ts',
            'core/index.ts',
            'core/testing/index.ts',
            'forms/index.ts',
            'http/index.ts',
            'http/testing/index.ts',
            'platform-browser/index.ts',
            'platform-browser/testing/index.ts',
            'platform-browser-dynamic/index.ts',
            'platform-browser-dynamic/testing/index.ts',
            'platform-server/index.ts',
            'platform-server/testing/index.ts',
            'platform-webworker/index.ts',
            'platform-webworker-dynamic/index.ts',
            'router/index.ts',
            'router/testing/index.ts',
            'upgrade/index.ts',
            'upgrade/static.ts',
          ];

          readFilesProcessor.basePath = PROJECT_ROOT;
          readFilesProcessor.sourceFiles = [
            {
              basePath: CONTENTS_PATH,
              include: CONTENTS_PATH + '/{cookbook,guide,tutorial}/**/*.md',
              fileReader: 'contentFileReader'
            },
            {
              basePath: CONTENTS_PATH + '/marketing',
              include: CONTENTS_PATH + '/marketing/**/*.{html,md}',
              fileReader: 'contentFileReader'
            },
            {
              basePath: CONTENTS_PATH,
              include: CONTENTS_PATH + '/*.md',
              exclude: [CONTENTS_PATH + '/index.md'],
              fileReader: 'contentFileReader'
            },
            {
              basePath: API_SOURCE_PATH,
              include: API_SOURCE_PATH + '/examples/**/*',
              fileReader: 'exampleFileReader'
            },
            {
              basePath: CONTENTS_PATH,
              include: CONTENTS_PATH + '/examples/**/*',
              exclude: [
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
              ],
              fileReader: 'exampleFileReader'
            },
            {
              basePath: CONTENTS_PATH,
              include: CONTENTS_PATH + '/navigation.json',
              fileReader: 'jsonFileReader'
            },
            {
              basePath: CONTENTS_PATH,
              include: CONTENTS_PATH + '/marketing/contributors.json',
              fileReader: 'jsonFileReader'
            },
          ];

          collectExamples.exampleFolders = ['examples', 'examples'];

          generateKeywordsProcessor.ignoreWordsFile = 'aio/transforms/angular.io-package/ignore.words';
          generateKeywordsProcessor.docTypesToIgnore = ['example-region'];
        })

        // Ignore certain problematic files
        .config(function(filterIgnoredDocs) {
          filterIgnoredDocs.ignore = [
            /\/VERSION$/  // Ignore the `VERSION` const, since it would be written to the same file as the `Version` class
          ];
        })

        // Where do we write the output files?
        .config(function(writeFilesProcessor) { writeFilesProcessor.outputFolder = DOCS_OUTPUT_PATH; })


        // Target environments
        .config(function(targetEnvironments) {
          const ALLOWED_LANGUAGES = ['ts', 'js', 'dart'];
          const TARGET_LANGUAGE = 'ts';

          ALLOWED_LANGUAGES.forEach(target => targetEnvironments.addAllowed(target));
          targetEnvironments.activate(TARGET_LANGUAGE);

          // TODO: we may need to do something with `linkDocsInlineTagDef`
        })


        // Configure jsdoc-style tag parsing
        .config(function(parseTagsProcessor, getInjectables, inlineTagProcessor) {
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

          inlineTagProcessor.inlineTagDefinitions.push(require('./inline-tag-defs/anchor'));
        })



        // Configure nunjucks rendering of docs via templates
        .config(function(
            renderDocsProcessor, versionInfo, templateFinder, templateEngine, getInjectables, renderMarkdown) {

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
              templateEngine.filters.concat(getInjectables(requireFolder('./rendering')));

          // Add the version data to the renderer, for use in things like github links
          renderDocsProcessor.extraData.versionInfo = versionInfo;

          // helpers are made available to the nunjucks templates
          renderDocsProcessor.helpers.relativePath = function(from, to) {
            return path.relative(from, to);
          };

          // Tell the HTML formatter not to format code-example blocks
          renderMarkdown.unformattedTags = [
            'code-example',
            'code-pane'
          ];
        })



        // We are not going to be relaxed about ambiguous links
        .config(function(getLinkInfo) {
          getLinkInfo.useFirstAmbiguousLink = false;
        })



        .config(function(
            computeIdsProcessor, computePathsProcessor, EXPORT_DOC_TYPES, generateApiListDoc,
            generateKeywordsProcessor) {

          const API_SEGMENT = 'api';
          const APP_SEGMENT = 'app';

          generateApiListDoc.outputFolder = API_SEGMENT;
          generateKeywordsProcessor.outputFolder = APP_SEGMENT;

          // Replace any path templates inherited from other packages
          // (we want full and transparent control)
          computePathsProcessor.pathTemplates = [
            {
              docTypes: ['module'],
              getPath: function computeModulePath(doc) {
                doc.moduleFolder = `${API_SEGMENT}/${doc.id.replace(/\/index$/, '')}`;
                return doc.moduleFolder;
              },
              outputPathTemplate: '${moduleFolder}.json'
            },
            {
              docTypes: EXPORT_DOC_TYPES.concat(['decorator', 'directive', 'pipe']),
              pathTemplate: '${moduleDoc.moduleFolder}/${name}',
              outputPathTemplate: '${moduleDoc.moduleFolder}/${name}.json',
            },
            {docTypes: ['example-region'], getOutputPath: function() {}},
            {
              docTypes: ['content'],
              getPath: (doc) => `${doc.id.replace(/\/index$/, '')}`,
              outputPathTemplate: '${path}.json'
            },
            {docTypes: ['navigation-json'], pathTemplate: '${id}', outputPathTemplate: '../${id}.json'},
            {docTypes: ['contributors-json'], pathTemplate: '${id}', outputPathTemplate: '../${id}.json'}
          ];
        })

        .config(function(convertToJsonProcessor, EXPORT_DOC_TYPES) {
          convertToJsonProcessor.docTypes = EXPORT_DOC_TYPES.concat([
            'content', 'decorator', 'directive', 'pipe', 'module'
          ]);
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
