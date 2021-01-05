/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Package = require('dgeni').Package;

const basePackage = require('../angular-base-package');
const typeScriptPackage = require('dgeni-packages/typescript');
const {API_SOURCE_PATH, API_TEMPLATES_PATH, requireFolder} = require('../config');

module.exports =
    new Package('angular-api', [basePackage, typeScriptPackage])

        // Register the processors
        .processor(require('./processors/mergeParameterInfo'))
        .processor(require('./processors/processPseudoClasses'))
        .processor(require('./processors/convertPrivateClassesToInterfaces'))
        .processor(require('./processors/generateApiListDoc'))
        .processor(require('./processors/addNotYetDocumentedProperty'))
        .processor(require('./processors/mergeDecoratorDocs'))
        .processor(require('./processors/extractDecoratedClasses'))
        .processor(require('./processors/extractPipeParams'))
        .processor(require('./processors/matchUpDirectiveDecorators'))
        .processor(require('./processors/addMetadataAliases'))
        .processor(require('./processors/addGlobalApiData'))
        .processor(require('./processors/updateGlobalApiPath'))
        .processor(require('./processors/computeApiBreadCrumbs'))
        .processor(require('./processors/filterContainedDocs'))
        .processor(require('./processors/processClassLikeMembers'))
        .processor(require('./processors/markBarredODocsAsPrivate'))
        .processor(require('./processors/filterPrivateDocs'))
        .processor(require('./processors/filterMembers'))
        .processor(require('./processors/computeSearchTitle'))
        .processor(require('./processors/simplifyMemberAnchors'))
        .processor(require('./processors/computeStability'))
        .processor(require('./processors/removeInjectableConstructors'))
        .processor(require('./processors/collectPackageContentDocs'))
        .processor(require('./processors/processPackages'))
        .processor(require('./processors/processNgModuleDocs'))
        .processor(require('./processors/fixupRealProjectRelativePath'))
        .processor(require('./processors/processAliasDocs'))


        /**
         * These are the API doc types that will be rendered to actual files.
         * This is a super set of the exported docs, since we convert some classes to
         * more Angular specific API types, such as decorators and directives.
         */
        .factory(function API_DOC_TYPES_TO_RENDER(EXPORT_DOC_TYPES) {
          return EXPORT_DOC_TYPES.concat(['decorator', 'directive', 'ngmodule', 'pipe', 'package']);
        })

        /**
         * These are the doc types that are contained within other docs
         */
        .factory(function API_CONTAINED_DOC_TYPES() {
          return [
            'member', 'function-overload', 'get-accessor-info', 'set-accessor-info', 'parameter'
          ];
        })

        /**
         * These are the doc types that are API docs, including ones that will be merged into
         * container docs,
         * such as members and overloads.
         */
        .factory(function API_DOC_TYPES(API_DOC_TYPES_TO_RENDER, API_CONTAINED_DOC_TYPES) {
          return API_DOC_TYPES_TO_RENDER.concat(API_CONTAINED_DOC_TYPES);
        })

        .factory(require('./readers/package-content'))

        // Where do we get the source files?
        .config(function(
            readTypeScriptModules, readFilesProcessor, collectExamples, tsParser,
            packageContentFileReader) {
          // Tell TypeScript how to load modules that start with with `@angular`
          tsParser.options.paths = {'@angular/*': [API_SOURCE_PATH + '/*']};
          tsParser.options.baseUrl = '.';

          // API files are typescript
          readTypeScriptModules.basePath = API_SOURCE_PATH;
          readTypeScriptModules.ignoreExportsMatching = [/^_|^ɵɵ|^VERSION$/];
          readTypeScriptModules.hidePrivateMembers = true;

          // NOTE: This list should be in sync with the folders/files in `goldens/public-api`.
          readTypeScriptModules.sourceFiles = [
            'animations/index.ts',
            'animations/browser/index.ts',
            'animations/browser/testing/index.ts',
            'common/http/index.ts',
            'common/http/testing/index.ts',
            'common/index.ts',
            'common/testing/index.ts',
            'common/upgrade/index.ts',
            'core/index.ts',
            'core/global/index.ts',
            'core/testing/index.ts',
            'elements/index.ts',
            'forms/index.ts',
            'localize/index.ts',
            'localize/init/index.ts',
            'platform-browser/index.ts',
            'platform-browser/animations/index.ts',
            'platform-browser/testing/index.ts',
            'platform-browser-dynamic/index.ts',
            'platform-browser-dynamic/testing/index.ts',
            'platform-server/index.ts',
            'platform-server/init/index.ts',
            'platform-server/testing/index.ts',
            'platform-webworker/index.ts',
            'platform-webworker-dynamic/index.ts',
            'router/index.ts',
            'router/testing/index.ts',
            'router/upgrade/index.ts',
            'service-worker/index.ts',
            'upgrade/index.ts',
            'upgrade/static/index.ts',
            'upgrade/static/testing/index.ts',
          ];

          readFilesProcessor.fileReaders.push(packageContentFileReader);

          // API Examples
          readFilesProcessor.sourceFiles = [
            {
              basePath: API_SOURCE_PATH,
              include: API_SOURCE_PATH + '/examples/**/*',
              fileReader: 'exampleFileReader'
            },
            {
              basePath: API_SOURCE_PATH,
              include: API_SOURCE_PATH + '/**/PACKAGE.md',
              fileReader: 'packageContentFileReader'
            }
          ];
          collectExamples.exampleFolders.push('examples');
        })

        // Configure jsdoc-style tag parsing
        .config(function(parseTagsProcessor, getInjectables, tsHost) {
          // Load up all the tag definitions in the tag-defs folder
          parseTagsProcessor.tagDefinitions = parseTagsProcessor.tagDefinitions.concat(
              getInjectables(requireFolder(__dirname, './tag-defs')));
          // We don't want license headers to be joined to the first API item's comment
          tsHost.concatMultipleLeadingComments = false;
        })

        .config(function(
            computeStability, splitDescription, addNotYetDocumentedProperty,
            API_DOC_TYPES_TO_RENDER, API_DOC_TYPES) {
          computeStability.docTypes = API_DOC_TYPES_TO_RENDER;
          // Only split the description on the API docs
          splitDescription.docTypes = API_DOC_TYPES.concat(['package-content']);
          addNotYetDocumentedProperty.docTypes = API_DOC_TYPES;
        })

        .config(function(mergeDecoratorDocs) {
          mergeDecoratorDocs.propertiesToMerge = [
            'shortDescription',
            'description',
            'security',
            'deprecated',
            'see',
            'usageNotes',
          ];
        })

        .config(function(checkContentRules, API_DOC_TYPES, API_CONTAINED_DOC_TYPES) {
          addMinLengthRules(checkContentRules);
          addHeadingRules(checkContentRules, API_DOC_TYPES);
          addAllowedPropertiesRules(checkContentRules, API_CONTAINED_DOC_TYPES);
          checkContentRules.failOnContentErrors = true;
        })

        .config(function(filterContainedDocs, API_CONTAINED_DOC_TYPES) {
          filterContainedDocs.docTypes = API_CONTAINED_DOC_TYPES;
        })

        .config(function(filterMembers) {
          filterMembers.notAllowedPatterns.push(/^ɵ/);
        })


        .config(function(computePathsProcessor, EXPORT_DOC_TYPES, generateApiListDoc) {
          const API_SEGMENT = 'api';

          generateApiListDoc.outputFolder = API_SEGMENT;

          computePathsProcessor.pathTemplates.push({
            docTypes: ['package'],
            getPath: function computeModulePath(doc) {
              doc.moduleFolder = `${API_SEGMENT}/${doc.id.replace(/\/index$/, '')}`;
              return doc.moduleFolder;
            },
            outputPathTemplate: '${moduleFolder}.json'
          });
          computePathsProcessor.pathTemplates.push({
            docTypes: EXPORT_DOC_TYPES.concat(['decorator', 'directive', 'ngmodule', 'pipe']),
            pathTemplate: '${moduleDoc.moduleFolder}/${name}',
            outputPathTemplate: '${moduleDoc.moduleFolder}/${name}.json',
          });
        })

        .config(function(templateFinder) {
          // Where to find the templates for the API doc rendering
          templateFinder.templateFolders.unshift(API_TEMPLATES_PATH);
        })


        .config(function(
            convertToJsonProcessor, postProcessHtml, API_DOC_TYPES_TO_RENDER, API_DOC_TYPES,
            autoLinkCode) {
          convertToJsonProcessor.docTypes =
              convertToJsonProcessor.docTypes.concat(API_DOC_TYPES_TO_RENDER);
          postProcessHtml.docTypes =
              convertToJsonProcessor.docTypes.concat(API_DOC_TYPES_TO_RENDER);
          autoLinkCode.docTypes = API_DOC_TYPES;
          autoLinkCode.codeElements = ['code', 'code-example', 'code-pane'];
        });


function addMinLengthRules(checkContentRules) {
  const createMinLengthRule = require('./content-rules/minLength');
  const paramRuleSet = checkContentRules.docTypeRules['parameter'] =
      checkContentRules.docTypeRules['parameter'] || {};
  const paramRules = paramRuleSet['name'] = paramRuleSet['name'] || [];
  paramRules.push(createMinLengthRule());
}

function addHeadingRules(checkContentRules, API_DOC_TYPES) {
  const createNoMarkdownHeadingsRule = require('./content-rules/noMarkdownHeadings');
  const noMarkdownHeadings = createNoMarkdownHeadingsRule();
  const allowOnlyLevel3Headings = createNoMarkdownHeadingsRule(1, 2, '4,');

  API_DOC_TYPES.forEach(docType => {
    let rules;
    const ruleSet = checkContentRules.docTypeRules[docType] =
        checkContentRules.docTypeRules[docType] || {};

    rules = ruleSet['description'] = ruleSet['description'] || [];
    rules.push(noMarkdownHeadings);

    rules = ruleSet['shortDescription'] = ruleSet['shortDescription'] || [];
    rules.push(noMarkdownHeadings);

    rules = ruleSet['usageNotes'] = ruleSet['usageNotes'] || [];
    rules.push(allowOnlyLevel3Headings);
  });
}

function addAllowedPropertiesRules(checkContentRules, API_CONTAINED_DOC_TYPES) {
  API_CONTAINED_DOC_TYPES.forEach(docType => {
    const ruleSet = checkContentRules.docTypeRules[docType] =
        checkContentRules.docTypeRules[docType] || {};

    const rules = ruleSet['usageNotes'] = ruleSet['usageNotes'] || [];
    rules.push(
        (doc, prop, value) => value &&
            // methods are allowed to have usage notes
            !isMethod(doc) &&
            // options on decorators are allowed to ahve usage notes
            !(doc.containerDoc && doc.containerDoc.docType === 'decorator') &&
            `Invalid property: "${prop}" is not allowed on "${doc.docType}" docs.`);
  });
}

function isMethod(doc) {
  return doc.hasOwnProperty('parameters') && !doc.isGetAccessor && !doc.isSetAccessor;
}
