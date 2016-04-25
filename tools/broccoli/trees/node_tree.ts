'use strict';

import destCopy from '../broccoli-dest-copy';
import compileWithTypescript, { INTERNAL_TYPINGS_PATH }
from '../broccoli-typescript';
var Funnel = require('broccoli-funnel');
import mergeTrees from '../broccoli-merge-trees';
var path = require('path');
import renderLodashTemplate from '../broccoli-lodash';
import replace from '../broccoli-replace';
import generateForTest from '../broccoli-generate-for-test';
var stew = require('broccoli-stew');
var writeFile = require('broccoli-file-creator');

var projectRootDir = path.normalize(path.join(__dirname, '..', '..', '..', '..'));

module.exports = function makeNodeTree(projects, destinationPath) {
  // list of npm packages that this build will create
  var outputPackages = ['@angular', 'benchpress'];

  let srcTree = new Funnel('modules', {
    include: ['@angular/**'],
    exclude: [
      '**/e2e_test/**',
      '@angular/test/**',
      '@angular/examples/**',

      '@angular/src/testing/**',
      '@angular/testing.ts',
      '@angular/testing_internal.ts',
      '@angular/src/upgrade/**',
      '@angular/upgrade.ts',
      '@angular/platform/testing/**',
      '@angular/manual_typings/**',
      '@angular/typings/**'
    ]
  });

  let externalTypings = [
    '@angular/typings/hammerjs/hammerjs.d.ts',
    '@angular/typings/jasmine/jasmine.d.ts',
    '@angular/typings/node/node.d.ts',
    '@angular/manual_typings/globals.d.ts',
    '@angular/typings/es6-collections/es6-collections.d.ts',
    '@angular/typings/es6-promise/es6-promise.d.ts'
  ];

  let externalTypingsTree = new Funnel('modules', {files: externalTypings});

  let packageTypings =
      new Funnel('node_modules', {include: ['rxjs/**/*.d.ts', 'zone.js/**/*.d.ts']});

  let compileSrcContext = mergeTrees([srcTree, externalTypingsTree, packageTypings]);

  // Compile the sources and generate the @internal .d.ts
  let compiledSrcTreeWithInternals = compileTree(compileSrcContext, true, []);

  var testTree = new Funnel('modules', {
    include: [
      '@angular/manual_typings/**',
      '@angular/typings/**',
      '@angular/test/**',
      '@angular/examples/**/*_spec.ts',
      '@angular/src/testing/**',
      '@angular/testing.ts',
      '@angular/testing_internal.ts',
      '@angular/src/upgrade/**',
      '@angular/upgrade.ts',
      '@angular/platform/testing/**',

      'benchpress/**',
      '**/e2e_test/**',
    ],
    exclude: [
      '@angular/core/test/typings.d.ts',
      // the following code and tests are not compatible with CJS/node environment
      '@angular/platform-browser/test/animate/**',
      '@angular/core/test/zone/**',
      '@angular/testing/test/fake_async_spec.ts',
      '@angular/testing/test/testing_public_browser_spec.ts',
      '@angular/platform/test/xhr_impl_spec.ts',
      '@angular/platform/test/browser/**/*.ts',
      '@angular/common/test/forms/**',
      '@angular/manual_typings/**',
      '@angular/typings/**',

      // we call browser's bootstrap
      '@angular/router/test/route_config/route_config_spec.ts',
      '@angular/router/test/integration/bootstrap_spec.ts',

      // we check the public api by importing angular2/angular2
      '@angular/symbol_inspector/test/**/*.ts',
      '@angular/test/public_api_spec.ts',

      '@angular/web_workers/test/worker/renderer_integration_spec.ts',

      '@angular/upgrade/test/**/*.ts',
      'angular1_router/**',
      'payload_tests/**'
    ]
  });

  // Compile the tests against the src @internal .d.ts
  let srcPrivateDeclarations =
      new Funnel(compiledSrcTreeWithInternals, {srcDir: INTERNAL_TYPINGS_PATH});

  let testAmbients = [
    '@angular/typings/jasmine/jasmine.d.ts',
    '@angular/typings/angular-protractor/angular-protractor.d.ts',
    '@angular/typings/selenium-webdriver/selenium-webdriver.d.ts'
  ];
  let testAmbientsTree = new Funnel('modules', {files: testAmbients});

  testTree = mergeTrees(
      [testTree, srcPrivateDeclarations, testAmbientsTree, externalTypingsTree, packageTypings]);

  let compiledTestTree = compileTree(testTree, false, []);

  // Merge the compiled sources and tests
  let compiledSrcTree =
      new Funnel(compiledSrcTreeWithInternals, {exclude: [`${INTERNAL_TYPINGS_PATH}/**`]});

  let compiledTree = mergeTrees([compiledSrcTree, compiledTestTree]);

  // Generate test files
  let generatedJsTestFiles =
      generateForTest(compiledTree, {files: ['*/test/**/*_codegen_untyped.js']});
  let generatedTsTestFiles = stew.rename(
      generateForTest(compiledTree, {files: ['*/test/**/*_codegen_typed.js']}), /.js$/, '.ts');

  // Compile generated test files against the src @internal .d.ts and the test files
  compiledTree = mergeTrees(
      [
        compiledTree,
        generatedJsTestFiles,
        compileTree(
            new Funnel(
                mergeTrees([
                  packageTypings,
                  new Funnel('modules',
                             {include: ['@angular/manual_typings/**', '@angular/typings/**']}),
                  generatedTsTestFiles,
                  srcPrivateDeclarations,
                  compiledTestTree
                ]),
                {include: ['@angular/**', 'rxjs/**', 'zone.js/**']}),
            false, [])
      ],
      {overwrite: true});

  // Down-level .d.ts files to be TS 1.8 compatible
  // TODO(alexeagle): this can be removed once we drop support for using Angular 2 with TS 1.8
  compiledTree = replace(compiledTree, {
    files: ['**/*.d.ts'],
    patterns: [
      {match: /^(\s*(static\s+|private\s+)*)readonly\s+/mg, replacement: "$1"},
    ]
  });

  // Now we add the LICENSE file into all the folders that will become npm packages
  outputPackages.forEach(function(destDir) {
    var license = new Funnel('.', {files: ['LICENSE'], destDir: destDir});
    // merge the test tree
    compiledTree = mergeTrees([compiledTree, license]);
  });

  // Get all docs and related assets and prepare them for js build
  var srcDocs = extractDocs(srcTree);
  var testDocs = extractDocs(testTree);

  var BASE_PACKAGE_JSON = require(path.join(projectRootDir, 'package.json'));
  var srcPkgJsons = extractPkgJsons(srcTree, BASE_PACKAGE_JSON);
  var testPkgJsons = extractPkgJsons(testTree, BASE_PACKAGE_JSON);

  // Copy es6 typings so quickstart doesn't require typings install
  let typingsTree = mergeTrees([
    new Funnel('modules',
               {
                 include: [
                   '@angular/typings/es6-collections/es6-collections.d.ts',
                   '@angular/typings/es6-promise/es6-promise.d.ts',
                 ]
               }),
    writeFile('@angular/typings/browser.d.ts',
              '// Typings needed for compilation with --target=es5\n' +
                  '///<reference path="./es6-collections/es6-collections.d.ts"/>\n' +
                  '///<reference path="./es6-promise/es6-promise.d.ts"/>\n' +
                  '// Workaround for https://github.com/ReactiveX/RxJS/issues/1270\n' +
                  '// to be removed when @angular upgrades to rxjs beta.2\n' +
                  'declare type PromiseConstructor = typeof Promise;\n')
  ]);

  var nodeTree =
      mergeTrees([compiledTree, srcDocs, testDocs, srcPkgJsons, testPkgJsons, typingsTree]);

  // Transform all tests to make them runnable in node
  nodeTree = replace(nodeTree, {
    files: ['**/test/**/*_spec.js'],
    patterns: [
      {
        match: /^/,
        replacement:
            () =>
                `var parse5Adapter = require('@angular/src/platform/server/parse5_adapter');\r\n` +
                `parse5Adapter.Parse5DomAdapter.makeCurrent();`
      },
      {match: /$/, replacement: (_, relativePath) => "\r\n main(); \r\n"}
    ]
  });

  // Prepend 'use strict' directive to all JS files.
  // See https://github.com/Microsoft/TypeScript/issues/3576
  nodeTree = replace(
      nodeTree, {files: ['**/*.js'], patterns: [{match: /^/, replacement: () => `'use strict';`}]});

  return destCopy(nodeTree, destinationPath);
};

function compileTree(tree, genInternalTypings, rootFilePaths: string[] = []) {
  return compileWithTypescript(tree, {
    // build pipeline options
    "rootFilePaths": rootFilePaths,
    "internalTypings": genInternalTypings,
    // tsc options
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "declaration": true,
    "stripInternal": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "noEmitOnError": true,
    "rootDir": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "target": "es5",
    // "traceResolution": true,
    "baseUrl": ".",
    "paths": {
      "rxjs/*": ["./rxjs/*"],
      "@angular/*": ["./@angular/*"]
    }
  });
}

function extractDocs(tree) {
  var docs = new Funnel(tree, {include: ['**/*.md', '**/*.png'], exclude: ['**/*.dart.md']});
  return stew.rename(docs, 'README.js.md', 'README.md');
}

function extractPkgJsons(tree, BASE_PACKAGE_JSON) {
  // Generate shared package.json info
  var COMMON_PACKAGE_JSON = {
    version: BASE_PACKAGE_JSON.version,
    homepage: BASE_PACKAGE_JSON.homepage,
    bugs: BASE_PACKAGE_JSON.bugs,
    license: BASE_PACKAGE_JSON.license,
    repository: BASE_PACKAGE_JSON.repository,
    contributors: BASE_PACKAGE_JSON.contributors,
    dependencies: BASE_PACKAGE_JSON.dependencies,
    devDependencies: BASE_PACKAGE_JSON.devDependencies,
    defaultDevDependencies: {}
  };

  var packageJsons = new Funnel(tree, {include: ['**/package.json']});
  return renderLodashTemplate(packageJsons, {context: {'packageJson': COMMON_PACKAGE_JSON}});
}
