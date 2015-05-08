/// <reference path="../../typings/node/node.d.ts" />
'use strict';

import {MultiCopy} from './../multi_copy';
import destCopy from '../broccoli-dest-copy';
var Funnel = require('broccoli-funnel');
var glob = require('glob');
var mergeTrees = require('broccoli-merge-trees');
var path = require('path');
var renderLodashTemplate = require('broccoli-lodash');
var replace = require('broccoli-replace');
var stew = require('broccoli-stew');
import ts2dart from '../broccoli-ts2dart';

/**
 * A funnel starting at modules, including the given filters, and moving into the root.
 * @param include Include glob filters.
 */
function modulesFunnel(include: string[], exclude?: string[]) {
  return new Funnel('modules', {include, destDir: '/', exclude});
}

/**
 * Replaces $SCRIPT$ in .html files with actual <script> tags.
 */
function replaceScriptTagInHtml(content: string, relativePath: string): string {
  var scriptTags = '';
  if (relativePath.match(/^benchmarks/)) {
    scriptTags += '<script src="url_params_to_form.js" type="text/javascript"></script>\n';
  }
  var scriptName = relativePath.replace(/.*\/([^/]+)\.html$/, '$1.dart');
  scriptTags += '<script src="' + scriptName + '" type="application/dart"></script>\n' +
                '<script src="packages/browser/dart.js" type="text/javascript"></script>';
  return content.replace('$SCRIPTS$', scriptTags);
}

function stripModulePrefix(relativePath: string): string {
  if (!relativePath.match(/^modules\//)) {
    throw new Error('Expected path to root at modules/: ' + relativePath);
  }
  return relativePath.replace(/^modules\//, '');
}

function getSourceTree() {
  // Transpile everything in 'modules' except for rtts_assertions.
  var tsInputTree = modulesFunnel(['**/*.js', '**/*.ts', '**/*.dart'], ['rtts_assert/**/*']);
  var transpiled = ts2dart(tsInputTree, {generateLibraryName: true, generateSourceMap: false});
  // Native sources, dart only examples, etc.
  var dartSrcs = modulesFunnel(['**/*.dart', '**/*.ng_meta.json', '**/css/**']);
  return mergeTrees([transpiled, dartSrcs]);
}

function fixDartFolderLayout(sourceTree) {
  // Move around files to match Dart's layout expectations.
  return stew.rename(sourceTree, function(relativePath) {
    // If a file matches the `pattern`, insert the given `insertion` as the second path part.
    var replacements = [
      {pattern: /^benchmarks\/test\//, insertion: ''},
      {pattern: /^benchmarks\//, insertion: 'web'},
      {pattern: /^benchmarks_external\/test\//, insertion: ''},
      {pattern: /^benchmarks_external\//, insertion: 'web'},
      {pattern: /^examples\/test\//, insertion: ''},
      {pattern: /^examples\//, insertion: 'web/'},
      {pattern: /^[^\/]*\/test\//, insertion: ''},
      {pattern: /^./, insertion: 'lib'},  // catch all.
    ];

    for (var i = 0; i < replacements.length; i++) {
      var repl = replacements[i];
      if (relativePath.match(repl.pattern)) {
        var parts = relativePath.split('/');
        parts.splice(1, 0, repl.insertion);
        return path.join.apply(path, parts);
      }
    }
    throw new Error('Failed to match any path: ' + relativePath);
  });
}

function getHtmlSourcesTree() {
  // Replace $SCRIPT$ markers in HTML files.
  var htmlSrcsTree = stew.map(modulesFunnel(['*/src/**/*.html']), replaceScriptTagInHtml);
  // Copy a url_params_to_form.js for each benchmark html file.
  var urlParamsToFormTree = new MultiCopy('', {
    srcPath: 'tools/build/snippets/url_params_to_form.js',
    targetPatterns: ['modules/benchmarks*/src/*', 'modules/benchmarks*/src/*/*'],
  });
  urlParamsToFormTree = stew.rename(urlParamsToFormTree, stripModulePrefix);
  return mergeTrees([htmlSrcsTree, urlParamsToFormTree]);
}


function getTemplatedPubspecsTree() {
  // The JSON structure for templating pubspec.yaml files.
  var BASE_PACKAGE_JSON = require('../../../../package.json');
  var COMMON_PACKAGE_JSON = {
    version: BASE_PACKAGE_JSON.version,
    homepage: BASE_PACKAGE_JSON.homepage,
    bugs: BASE_PACKAGE_JSON.bugs,
    license: BASE_PACKAGE_JSON.license,
    contributors: BASE_PACKAGE_JSON.contributors,
    dependencies: BASE_PACKAGE_JSON.dependencies,
    devDependencies: {
      "yargs": BASE_PACKAGE_JSON.devDependencies['yargs'],
      "gulp-sourcemaps": BASE_PACKAGE_JSON.devDependencies['gulp-sourcemaps'],
      "gulp-traceur": BASE_PACKAGE_JSON.devDependencies['gulp-traceur'],
      "gulp": BASE_PACKAGE_JSON.devDependencies['gulp'],
      "gulp-rename": BASE_PACKAGE_JSON.devDependencies['gulp-rename'],
      "through2": BASE_PACKAGE_JSON.devDependencies['through2']
    }
  };
  // Generate pubspec.yaml from templates.
  // Lodash insists on dropping one level of extension, so first artificially rename the yaml
  // files to .yaml.template.
  var pubspecs = stew.rename(modulesFunnel(['**/pubspec.yaml']), '.yaml', '.yaml.template');
  // Then render the templates.
  return renderLodashTemplate(
      pubspecs,
      {files: ['**/pubspec.yaml.template'], context: {'packageJson': COMMON_PACKAGE_JSON}});
}

function getDocsTree() {
  // LICENSE files
  var licenses = new MultiCopy('', {
    srcPath: 'LICENSE',
    targetPatterns: ['modules/*'],
    exclude: ['*/rtts_assert'],  // Not in dart.
  });
  licenses = stew.rename(licenses, stripModulePrefix);

  // Documentation.
  // Rename *.dart.md -> *.dart.
  var mdTree = stew.rename(modulesFunnel(['**/*.dart.md']),
                           relativePath => relativePath.replace(/\.dart\.md$/, '.md'));
  // Copy all assets, ignore .js. and .dart. (handled above).
  var docs = modulesFunnel(['**/*.md', '**/*.png', '**/*.html', '**/*.css', '**/*.scss'],
                           ['**/*.js.md', '**/*.dart.md']);
  return mergeTrees([licenses, mdTree, docs]);
}

module.exports = function makeDartTree(destinationPath) {
  var sourceTree = mergeTrees([getSourceTree(), getHtmlSourcesTree()]);
  sourceTree = fixDartFolderLayout(sourceTree);

  var dartTree = mergeTrees([sourceTree, getTemplatedPubspecsTree(), getDocsTree()]);

  // TODO(iminar): tree differ seems to have issues with trees created by mergeTrees, investigate!
  //   ENOENT error is thrown while doing fs.readdirSync on inputRoot
  //   in the meantime, we just do noop mv to create a new tree
  dartTree = stew.mv(dartTree, '');

  return destCopy(dartTree, destinationPath);
};
