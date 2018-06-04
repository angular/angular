/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Package = require('dgeni').Package;

const basePackage = require('../angular-base-package');
const typeScriptPackage = require('dgeni-packages/typescript');
const { API_SOURCE_PATH, API_TEMPLATES_PATH, requireFolder } = require('../config');

module.exports = new Package('angular-api', [basePackage, typeScriptPackage])

  // Register the processors
  .processor(require('./processors/migrateLegacyJSDocTags'))
  .processor(require('./processors/splitDescription'))
  .processor(require('./processors/convertPrivateClassesToInterfaces'))
  .processor(require('./processors/generateApiListDoc'))
  .processor(require('./processors/addNotYetDocumentedProperty'))
  .processor(require('./processors/mergeDecoratorDocs'))
  .processor(require('./processors/extractDecoratedClasses'))
  .processor(require('./processors/extractPipeParams'))
  .processor(require('./processors/matchUpDirectiveDecorators'))
  .processor(require('./processors/addMetadataAliases'))
  .processor(require('./processors/computeApiBreadCrumbs'))
  .processor(require('./processors/filterContainedDocs'))
  .processor(require('./processors/processClassLikeMembers'))
  .processor(require('./processors/markBarredODocsAsPrivate'))
  .processor(require('./processors/filterPrivateDocs'))
  .processor(require('./processors/computeSearchTitle'))
  .processor(require('./processors/simplifyMemberAnchors'))
  .processor(require('./processors/computeStability'))

  /**
   * These are the API doc types that will be rendered to actual files.
   * This is a super set of the exported docs, since we convert some classes to
   * more Angular specific API types, such as decorators and directives.
   */
  .factory(function API_DOC_TYPES_TO_RENDER(EXPORT_DOC_TYPES) {
    return EXPORT_DOC_TYPES.concat(['decorator', 'directive', 'pipe', 'module']);
  })

  /**
   * These are the doc types that are API docs, including ones that will be merged into container docs,
   * such as members and overloads.
   */
  .factory(function API_DOC_TYPES(API_DOC_TYPES_TO_RENDER) {
    return API_DOC_TYPES_TO_RENDER.concat(['member', 'function-overload']);
  })

  // Where do we get the source files?
  .config(function(readTypeScriptModules, readFilesProcessor, collectExamples, tsParser) {

    // Tell TypeScript how to load modules that start with with `@angular`
    tsParser.options.paths = { '@angular/*': [API_SOURCE_PATH + '/*'] };
    tsParser.options.baseUrl = '.';

    // API files are typescript
    readTypeScriptModules.basePath = API_SOURCE_PATH;
    readTypeScriptModules.ignoreExportsMatching = [/^[_ɵ]|^VERSION$/];
    readTypeScriptModules.hidePrivateMembers = true;

    // NOTE: This list shold be in sync with tools/public_api_guard/BUILD.bazel
    readTypeScriptModules.sourceFiles = [
      'animations/index.ts',
      'animations/browser/index.ts',
      'animations/browser/testing/index.ts',
      'common/http/index.ts',
      'common/http/testing/index.ts',
      'common/index.ts',
      'common/testing/index.ts',
      'core/index.ts',
      'core/testing/index.ts',
      'elements/index.ts',
      'forms/index.ts',
      'http/index.ts',
      'http/testing/index.ts',
      'platform-browser/index.ts',
      'platform-browser/animations/index.ts',
      'platform-browser/testing/index.ts',
      'platform-browser-dynamic/index.ts',
      'platform-browser-dynamic/testing/index.ts',
      'platform-server/index.ts',
      'platform-server/testing/index.ts',
      'platform-webworker/index.ts',
      'platform-webworker-dynamic/index.ts',
      'router/index.ts',
      'router/testing/index.ts',
      'router/upgrade/index.ts',
      'service-worker/index.ts',
      'upgrade/index.ts',
      'upgrade/static/index.ts',
    ];

    // API Examples
    readFilesProcessor.sourceFiles = [
      {
        basePath: API_SOURCE_PATH,
        include: API_SOURCE_PATH + '/examples/**/*',
        fileReader: 'exampleFileReader'
      }
    ];
    collectExamples.exampleFolders.push('examples');
  })

  // Configure jsdoc-style tag parsing
  .config(function(parseTagsProcessor, getInjectables) {
    // Load up all the tag definitions in the tag-defs folder
    parseTagsProcessor.tagDefinitions =
        parseTagsProcessor.tagDefinitions.concat(getInjectables(requireFolder(__dirname, './tag-defs')));
  })

  .config(function(computeStability, splitDescription, addNotYetDocumentedProperty, EXPORT_DOC_TYPES, API_DOC_TYPES) {
    computeStability.docTypes = EXPORT_DOC_TYPES;
    // Only split the description on the API docs
    splitDescription.docTypes = API_DOC_TYPES;
    addNotYetDocumentedProperty.docTypes = API_DOC_TYPES;
  })

  .config(function(checkContentRules, EXPORT_DOC_TYPES) {
    // Min length rules
    const createMinLengthRule = require('./content-rules/minLength');
    const paramRuleSet = checkContentRules.docTypeRules['parameter'] = checkContentRules.docTypeRules['parameter'] || {};
    const paramRules = paramRuleSet['name'] = paramRuleSet['name'] || [];
    paramRules.push(createMinLengthRule());

    // Heading rules
    const createNoMarkdownHeadingsRule = require('./content-rules/noMarkdownHeadings');
    const noMarkdownHeadings = createNoMarkdownHeadingsRule();
    const allowOnlyLevel3Headings = createNoMarkdownHeadingsRule(1, 2, '4,');
    const DOC_TYPES_TO_CHECK = EXPORT_DOC_TYPES.concat(['member', 'overload-info']);
    const PROPS_TO_CHECK = ['description', 'shortDescription'];

    DOC_TYPES_TO_CHECK.forEach(docType => {
      const ruleSet = checkContentRules.docTypeRules[docType] = checkContentRules.docTypeRules[docType] || {};
      PROPS_TO_CHECK.forEach(prop => {
        const rules = ruleSet[prop] = ruleSet[prop] || [];
        rules.push(noMarkdownHeadings);
      });
      const rules = ruleSet['usageNotes'] = ruleSet['usageNotes'] || [];
      rules.push(allowOnlyLevel3Headings);
    });
  })

  .config(function(computePathsProcessor, EXPORT_DOC_TYPES, generateApiListDoc) {

    const API_SEGMENT = 'api';

    generateApiListDoc.outputFolder = API_SEGMENT;

    computePathsProcessor.pathTemplates.push({
      docTypes: ['module'],
      getPath: function computeModulePath(doc) {
        doc.moduleFolder = `${API_SEGMENT}/${doc.id.replace(/\/index$/, '')}`;
        return doc.moduleFolder;
      },
      outputPathTemplate: '${moduleFolder}.json'
    });
    computePathsProcessor.pathTemplates.push({
      docTypes: EXPORT_DOC_TYPES.concat(['decorator', 'directive', 'pipe']),
      pathTemplate: '${moduleDoc.moduleFolder}/${name}',
      outputPathTemplate: '${moduleDoc.moduleFolder}/${name}.json',
    });
  })

  .config(function(templateFinder) {
    // Where to find the templates for the API doc rendering
    templateFinder.templateFolders.unshift(API_TEMPLATES_PATH);
  })


  .config(function(convertToJsonProcessor, postProcessHtml, API_DOC_TYPES_TO_RENDER, API_DOC_TYPES, autoLinkCode) {
    convertToJsonProcessor.docTypes = convertToJsonProcessor.docTypes.concat(API_DOC_TYPES_TO_RENDER);
    postProcessHtml.docTypes = convertToJsonProcessor.docTypes.concat(API_DOC_TYPES_TO_RENDER);
    autoLinkCode.docTypes = API_DOC_TYPES;
    autoLinkCode.codeElements = ['code', 'code-example', 'code-pane'];
  });
