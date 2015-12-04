'use strict';

import destCopy from '../broccoli-dest-copy';
import compileWithTypescript from '../broccoli-typescript';
var Funnel = require('broccoli-funnel');
import mergeTrees from '../broccoli-merge-trees';
var path = require('path');
import renderLodashTemplate from '../broccoli-lodash';
import replace from '../broccoli-replace';
var stew = require('broccoli-stew');

var projectRootDir = path.normalize(path.join(__dirname, '..', '..', '..', '..'));


module.exports = function makeNodeTree(projects, destinationPath) {
  // list of npm packages that this build will create
  var outputPackages = ['angular2', 'benchpress'];

  var modulesTree = new Funnel('modules', {
    include: ['angular2/**', 'benchpress/**', '**/e2e_test/**'],
    exclude: [
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

      'angular2/test/upgrade/**/*.ts',

      'angular1_router/**',
      'angular2/examples/**/!(*_spec.ts)',
    ]
  });

  var typescriptTree = compileWithTypescript(modulesTree, {
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    declaration: true,
    stripInternal: true,
    module: 'commonjs',
    moduleResolution: 'classic',
    noEmitOnError: true,
    rootDir: '.',
    rootFilePaths:
        ['angular2/manual_typings/globals.d.ts', 'angular2/typings/es6-shim/es6-shim.d.ts'],
    inlineSourceMap: true,
    inlineSources: true,
    target: 'es5'
  });

  // Now we add the LICENSE file into all the folders that will become npm packages
  outputPackages.forEach(function(destDir) {
    var license = new Funnel('.', {files: ['LICENSE'], destDir: destDir});
    typescriptTree = mergeTrees([typescriptTree, license]);
  });

  // Get all docs and related assets and prepare them for js build
  var docs = new Funnel(modulesTree, {include: ['**/*.md', '**/*.png'], exclude: ['**/*.dart.md']});
  docs = stew.rename(docs, 'README.js.md', 'README.md');

  // Generate shared package.json info
  var BASE_PACKAGE_JSON = require(path.join(projectRootDir, 'package.json'));
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

  var packageJsons = new Funnel(modulesTree, {include: ['**/package.json']});
  packageJsons =
      renderLodashTemplate(packageJsons, {context: {'packageJson': COMMON_PACKAGE_JSON}});

  var typingsTree = new Funnel(
      'modules',
      {include: ['angular2/typings/**/*.d.ts', 'angular2/manual_typings/*.d.ts'], destDir: '/'});
  var nodeTree = mergeTrees([typescriptTree, docs, packageJsons, typingsTree]);

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
    files: ['angular2/core.d.ts', 'angular2/angular2.d.ts'],
    patterns: [{match: /$/, replacement: 'import "./manual_typings/globals-es6.d.ts";\r\n'}]
  });

  return destCopy(nodeTree, destinationPath);
};
