import {Package} from 'dgeni';
import {Host} from 'dgeni-packages/typescript/services/ts-host/host';
import {HighlightNunjucksExtension} from './nunjucks-tags/highlight';
import {patchLogService} from './patch-log-service';
import {DocsPrivateFilter} from './processors/docs-private-filter';
import {Categorizer} from './processors/categorizer';
import {FilterDuplicateExports} from './processors/filter-duplicate-exports';
import {MergeInheritedProperties} from './processors/merge-inherited-properties';
import {EntryPointGrouper} from './processors/entry-point-grouper';
import {ReadTypeScriptModules} from 'dgeni-packages/typescript/processors/readTypeScriptModules';
import {TypeFormatFlags} from 'dgeni-packages/node_modules/typescript';

// Dgeni packages that the Material docs package depends on.
const jsdocPackage = require('dgeni-packages/jsdoc');
const nunjucksPackage = require('dgeni-packages/nunjucks');
const typescriptPackage = require('dgeni-packages/typescript');

/**
 * Dgeni package for the Angular Material docs. This just defines the package, but doesn't
 * generate the docs yet.
 *
 * Dgeni packages are very similar to AngularJS modules. Those can contain:
 *
 *  - Services that can be injected
 *  - Templates that are used to convert the data into HTML output.
 *  - Processors that can modify the doc items (like a build pipeline).
 *
 * Similar to AngularJS, there is also a `config` lifecycle hook, that can be used to
 * configure specific processors, services before the procession begins.
 */
export const apiDocsPackage = new Package('material2-api-docs', [
  jsdocPackage,
  nunjucksPackage,
  typescriptPackage,
]);

// Processor that filters out duplicate exports that should not be shown in the docs.
apiDocsPackage.processor(new FilterDuplicateExports());

// Processor that merges inherited properties of a class with the class doc.
apiDocsPackage.processor(new MergeInheritedProperties());

// Processor that filters out symbols that should not be shown in the docs.
apiDocsPackage.processor(new DocsPrivateFilter());

// Processor that appends categorization flags to the docs, e.g. `isDirective`, `isNgModule`, etc.
apiDocsPackage.processor(new Categorizer());

// Processor to group docs into top-level entry-points such as "tabs", "sidenav", etc.
apiDocsPackage.processor(new EntryPointGrouper());

// Configure the log level of the API docs dgeni package.
apiDocsPackage.config(function(log: any) {
  return log.level = 'info';
});

// Configure the processor for reading files from the file system.
apiDocsPackage.config(function(readFilesProcessor: any) {
  // Disable we currently only use the "readTypeScriptModules" processor
  readFilesProcessor.$enabled = false;
});

// Patches Dgeni's log service to not print warnings about unresolved mixin base symbols.
apiDocsPackage.config(function(log: any) {
  return patchLogService(log);
});

// Configure the output path for written files (i.e., file names).
apiDocsPackage.config(function(computePathsProcessor: any) {
  computePathsProcessor.pathTemplates = [{
    docTypes: ['entry-point'],
    pathTemplate: '${name}',
    outputPathTemplate: '${name}.html',
  }];
});

// Configure custom JsDoc tags.
apiDocsPackage.config(function(parseTagsProcessor: any) {
  parseTagsProcessor.tagDefinitions = parseTagsProcessor.tagDefinitions.concat([
    {name: 'docs-private'},
    {name: 'breaking-change'},
  ]);
});

apiDocsPackage.config(function(checkAnchorLinksProcessor: any) {
  // This ensures that Dgeni will fail if we generate links that don't follow this format.
  checkAnchorLinksProcessor.ignoredLinks.push(/(components|cdk)\/[\w-]+\/api#\w+/);
});

// Configure the processor for understanding TypeScript.
apiDocsPackage.config(function(readTypeScriptModules: ReadTypeScriptModules) {
  readTypeScriptModules.ignoreExportsMatching = [/^_/];
  readTypeScriptModules.hidePrivateMembers = true;
});

apiDocsPackage.config(function(tsHost: Host) {
  // Disable concatenation of multiple leading comments for a TypeScript node. Since all shipped
  // source files have a license banner at top, the license banner comment would be incorrectly
  // considered as "comment" for the first TypeScript node of a given file. Since there are
  // various files in the Material project where the first node of a source file is exported and
  // should only use the first leading comment, we need to disable comment concatenation.
  // See for example: src/cdk/coercion/boolean-property.ts
  tsHost.concatMultipleLeadingComments = false;

  // Explicitly disable truncation for types that will be displayed as strings. Otherwise
  // TypeScript by default truncates long types and causes misleading API documentation.
  tsHost.typeFormatFlags = TypeFormatFlags.NoTruncation;
});

// Configure processor for finding nunjucks templates.
apiDocsPackage.config(function(templateFinder: any, templateEngine: any) {
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
    'common.template.html',
  ];

  // Dgeni disables autoescape by default, but we want this turned on.
  templateEngine.config.autoescape = true;

  // Nunjucks and Angular conflict in their template bindings so change Nunjucks
  templateEngine.config.tags = {
    variableStart: '{$',
    variableEnd: '$}',
  };

  templateEngine.tags.push(new HighlightNunjucksExtension());
});
