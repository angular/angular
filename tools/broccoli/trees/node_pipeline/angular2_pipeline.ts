'use strict';

import destCopy from '../../broccoli-dest-copy';
import compileWithTypescript, { INTERNAL_TYPINGS_PATH }
from '../../broccoli-typescript';
var Funnel = require('broccoli-funnel');
import mergeTrees from '../../broccoli-merge-trees';
var path = require('path');
import renderLodashTemplate from '../../broccoli-lodash';
import replace from '../../broccoli-replace';
var stew = require('broccoli-stew');

var projectRootDir = path.normalize(path.join(__dirname, '..', '..', '..', '..', '..'));

function everythingElseBarrel() {
  let testingBarrelPaths =
      ['angular2/testing.ts', 'angular2/src/testing/**', 'angular2/test/testing'];

  let testPaths = [
    'angular2/test/**',
    'angular2/examples/**',

    'angular2/testing_internal.ts',
    'angular2/platform/testing/**',

    'angular2/src/upgrade/**',
    'angular2/upgrade.ts'
  ];

  let srcTree = new Funnel('modules', {
    include: [
      `angular2/**`,
      'angular2/typings/**',
      'angular2/manual_typings/globals.d.ts',
      'angular2/manual_typings/globals-es6.d.ts'
    ],
    exclude: testPaths.concat(testingBarrelPaths)
  });

  let testTree = new Funnel('modules', {
    include: testPaths.concat([
      'angular2/typings/**',
      'angular2/manual_typings/globals.d.ts',
      'angular2/manual_typings/globals-es6.d.ts'
    ]),
    exclude: testingBarrelPaths.concat([
      // the following code and tests are not compatible with CJS/node environment
      'angular2/test/animate/**',
      'angular2/test/core/zone/**',
      'angular2/test/testing/fake_async_spec.ts',
      'angular2/test/testing/testing_public_spec.ts',
      'angular2/test/platform/xhr_impl_spec.ts',
      'angular2/test/platform/browser/**/*.ts',
      'angular2/test/common/forms/**',

      // we call browser's bootstrap
      'angular2/test/router/route_config_spec.ts',
      'angular2/test/router/integration/bootstrap_spec.ts',

      // we check the public api by importing angular2/angular2
      'angular2/test/symbol_inspector/**/*.ts',
      'angular2/test/public_api_spec.ts',

      'angular2/test/web_workers/worker/renderer_integration_spec.ts',

      // TODO(igor): this is wrong- upgrade should be compiled in CJS tree too
      'angular2/test/upgrade/**/*.ts'
    ])
  });

  // Get all docs and related assets and prepare them for js build
  var srcDocs = extractDocs(srcTree);
  var testDocs = extractDocs(testTree);

  let compiledSrcTreeWithInternals =
      compileTree(srcTree, true, ['angular2/manual_typings/globals.d.ts']);

  // Filter the src @internal .d.ts
  let srcPrivateDeclarations =
      new Funnel(compiledSrcTreeWithInternals, {srcDir: INTERNAL_TYPINGS_PATH});


  // Generate the `angular2/testing` bundle
  var testingTestTree = new Funnel('modules', {
    include: [
      'angular2/testing.ts',
      'angular2/src/testing/**',
      'angular2/typings/**',
      'angular2/manual_typings/globals.d.ts',
      'angular2/manual_typings/globals-es6.d.ts'
    ]
  });

  testingTestTree = mergeTrees([testingTestTree, srcPrivateDeclarations]);

  let compiledTestingTree = compileTree(testingTestTree, true, [
    'angular2/typings/jasmine/jasmine.d.ts',
    'angular2/typings/angular-protractor/angular-protractor.d.ts',
    'angular2/manual_typings/globals.d.ts'
  ]);
  let compiledTestingSrcTree = new Funnel(compiledTestingTree, {exclude: [`angular2/src/**.d.ts`]});
  let testingInternalDeclTree = new Funnel(compiledTestingTree, {include: ['**/**.d.ts']});



  // compile tests and benchmarks for the angular2 module
  testTree = mergeTrees([testTree, testingInternalDeclTree, srcPrivateDeclarations]);

  let compiledTestTree = compileTree(testTree, false, [
    'angular2/typings/jasmine/jasmine.d.ts',
    'angular2/typings/angular-protractor/angular-protractor.d.ts',
    'angular2/manual_typings/globals.d.ts'
  ]);

  compiledTestTree =
      new Funnel(compiledTestTree, {exclude: ['angular2/manual_typings/globals-es6.d.ts']});

  let compiledSrcTree =
      new Funnel(compiledSrcTreeWithInternals, {exclude: [`${INTERNAL_TYPINGS_PATH}/**`]});

  let compiledTree =
      mergeTrees([compiledTestTree, compiledSrcTree, compiledTestingSrcTree, srcDocs, testDocs]);

  return {compiledTree, internalDeclTree: srcPrivateDeclarations, testingInternalDeclTree};
}


module.exports = function makeNodeTree() {

  let everythingElseBarrelTrees = everythingElseBarrel();

  // let testTreeGlobs = [
  //  'angular2/test/**',
  //  'angular2/examples/**',
  //
  //  'angular2/testing_internal.ts',
  //  'angular2/platform/testing/**',
  //
  //  'angular2/src/upgrade/**',
  //  'angular2/upgrade.ts',
  //];
  //
  // let srcTree = new Funnel('modules', {
  //  include: ['angular2/**'],
  //  exclude: testTreeGlobs
  //});
  //
  //// Compile the sources and generate the @internal .d.ts
  // let compiledSrcTreeWithInternals =
  //  compileTree(srcTree, true, ['angular2/manual_typings/globals.d.ts']);
  //
  // var testTree = new Funnel('modules', {
  //  include: testTreeGlobs,
  //  exclude:
  //});
  //
  //// Compile the tests against the src @internal .d.ts
  // let srcPrivateDeclarations =
  //  new Funnel(compiledSrcTreeWithInternals, {srcDir: INTERNAL_TYPINGS_PATH});
  //
  // var typingsTree = new Funnel(
  //  'modules',
  //  {include: ['angular2/typings/**/*.d.ts', 'angular2/manual_typings/*.d.ts'], destDir: '/'});
  //
  // testTree = mergeTrees([testTree,
  //  testingBarrelTree.internalDeclTree,
  //  srcPrivateDeclarations,
  //  typingsTree]);
  //
  // let compiledTestTree = compileTree(testTree, false, [
  //  'angular2/typings/jasmine/jasmine.d.ts',
  //  'angular2/typings/angular-protractor/angular-protractor.d.ts',
  //  'angular2/manual_typings/globals.d.ts'
  //]);
  //
  //// Merge the compiled sources and tests
  // let compiledSrcTree =
  //  new Funnel(compiledSrcTreeWithInternals, {exclude: [`${INTERNAL_TYPINGS_PATH}/**`]});
  //
  //// Grab just the type definitions so we can pass them along to other modules
  // let internalDeclTree = new Funnel(compiledSrcTreeWithInternals, {srcDir:
  // INTERNAL_TYPINGS_PATH});

  // Now we add the LICENSE file into all the folders that will become npm packages
  var license = new Funnel('.', {files: ['LICENSE'], destDir: 'angular2'});

  var BASE_PACKAGE_JSON = require(path.join(projectRootDir, 'package.json'));
  var srcPkgJsons = extractPkgJsons(everythingElseBarrelTrees.compiledTree, BASE_PACKAGE_JSON);

  var nodeTree = mergeTrees([everythingElseBarrelTrees.compiledTree, license, srcPkgJsons]);

  // Transform all tests to make them runnable in node
  nodeTree = replace(nodeTree, {
    files: ['**/test/**/*_spec.js'],
    patterns: [
      {
        match: /^/,
        replacement:
            () =>
                `var parse5Adapter = require('angular2/src/platform/server/parse5_adapter');\r\n` +
                `parse5Adapter.Parse5DomAdapter.makeCurrent();`
      },
      {match: /$/, replacement: (_, relativePath) => "\r\n main(); \r\n"}
    ]
  });


  // var typingsTree = new Funnel(
  //  'modules',
  //  {include: ['angular2/typings/**/*.d.ts', 'angular2/manual_typings/*.d.ts'], destDir: '/'});


  // Prepend 'use strict' directive to all JS files.
  // See https://github.com/Microsoft/TypeScript/issues/3576
  nodeTree = replace(
      nodeTree, {files: ['**/*.js'], patterns: [{match: /^/, replacement: () => `'use strict';`}]});

  // Add a line to the end of our top-level .d.ts file.
  // This HACK for transitive typings is a workaround for
  // https://github.com/Microsoft/TypeScript/issues/5097
  //
  // This allows users to get our top-level dependencies like zone.d.ts
  // to appear when they compile against angular2.
  //
  // This carries the risk that the user brings their own copy of that file
  // (or any other symbols exported here) and they will get a compiler error
  // because of the duplicate definitions.
  // TODO(alexeagle): remove this when typescript releases a fix
  nodeTree = replace(nodeTree, {
    files: ['angular2/core.d.ts'],
    patterns: [{match: /$/, replacement: 'import "./manual_typings/globals-es6.d.ts";\r\n'}]
  });

  let internalDeclTree = everythingElseBarrelTrees.internalDeclTree;

  return {
    nodeTree,
    internalDeclTree,
    testingInternalDeclTree: everythingElseBarrelTrees.testingInternalDeclTree
  };
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
    "moduleResolution": "classic",
    "noEmitOnError": true,
    "rootDir": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "target": "es5"
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
