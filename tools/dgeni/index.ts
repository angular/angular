import {Package} from 'dgeni';
import {DocsPrivateFilter} from './processors/docs-private-filter';
import {Categorizer} from './processors/categorizer';
import {ComponentGrouper} from './processors/component-grouper';
import {ReadTypeScriptModules} from 'dgeni-packages/typescript/processors/readTypeScriptModules';
import {TsParser} from 'dgeni-packages/typescript/services/TsParser';
import {sync as globSync} from 'glob';
import * as path from 'path';

// Dgeni packages
const jsdocPackage = require('dgeni-packages/jsdoc');
const nunjucksPackage = require('dgeni-packages/nunjucks');
const typescriptPackage = require('dgeni-packages/typescript');

// Project configuration.
const projectRootDir = path.resolve(__dirname, '../..');
const sourceDir = path.resolve(projectRootDir, 'src');
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

/** List of CDK packages that need to be documented. */
const cdkPackages = globSync(path.join(sourceDir, 'cdk', '*/'))
  .filter(packagePath => !packagePath.endsWith('testing/'))
  .map(packagePath => path.basename(packagePath));

/** List of Material packages that need to be documented. */
const materialPackages = globSync(path.join(sourceDir, 'lib', '*/'))
  .map(packagePath => path.basename(packagePath));

export const apiDocsPackage = new Package('material2-api-docs', dgeniPackageDeps);


// Processor that filters out symbols that should not be shown in the docs.
apiDocsPackage.processor(new DocsPrivateFilter());

// Processor that appends categorization flags to the docs, e.g. `isDirective`, `isNgModule`, etc.
apiDocsPackage.processor(new Categorizer());

// Processor to group components into top-level groups such as "Tabs", "Sidenav", etc.
apiDocsPackage.processor(new ComponentGrouper());

// Configure the log level of the API docs dgeni package.
apiDocsPackage.config((log: any) => log.level = 'info');

// Configure the processor for reading files from the file system.
apiDocsPackage.config((readFilesProcessor: any, writeFilesProcessor: any) => {
  readFilesProcessor.basePath = sourceDir;
  readFilesProcessor.$enabled = false; // disable for now as we are using readTypeScriptModules

  writeFilesProcessor.outputFolder = outputDir;
});

// Configure the output path for written files (i.e., file names).
apiDocsPackage.config((computePathsProcessor: any) => {
  computePathsProcessor.pathTemplates = [{
    docTypes: ['componentGroup'],
    pathTemplate: '${name}',
    outputPathTemplate: '${name}.html',
  }];
});

// Configure custom JsDoc tags.
apiDocsPackage.config((parseTagsProcessor: any) => {
  parseTagsProcessor.tagDefinitions = parseTagsProcessor.tagDefinitions.concat([
    {name: 'docs-private'}
  ]);
});

// Configure the processor for understanding TypeScript.
apiDocsPackage.config((readTypeScriptModules: ReadTypeScriptModules, tsParser: TsParser) => {
  readTypeScriptModules.basePath = sourceDir;
  readTypeScriptModules.ignoreExportsMatching = [/^_/];
  readTypeScriptModules.hidePrivateMembers = true;

  const typescriptPathMap: any = {};

  cdkPackages.forEach(packageName => {
    typescriptPathMap[`@angular/cdk/${packageName}`] = [`./cdk/${packageName}/index.ts`];
  });

  tsParser.options.baseUrl = sourceDir;
  tsParser.options.paths = typescriptPathMap;

  // Entry points for docs generation. All publically exported symbols found through these
  // files will have docs generated.
  readTypeScriptModules.sourceFiles = [
    ...cdkPackages.map(packageName => `./cdk/${packageName}/index.ts`),
    ...materialPackages.map(packageName => `./lib/${packageName}/index.ts`)
  ];
});

// Configure processor for finding nunjucks templates.
apiDocsPackage.config((templateFinder: any, templateEngine: any) => {
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
