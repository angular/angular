/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../angular_builder.d.ts" />
'use strict';

import {MultiCopy} from './../multi_copy';
import destCopy from '../broccoli-dest-copy';
var Funnel = require('broccoli-funnel');
import mergeTrees from '../broccoli-merge-trees';
var path = require('path');
import renderLodashTemplate from '../broccoli-lodash';
var stew = require('broccoli-stew');
import ts2dart from '../broccoli-ts2dart';
import dartfmt from '../broccoli-dartfmt';
import replace from '../broccoli-replace';

var global_excludes = [
  'angular2/http*',
  'angular2/examples/*/ts/**/*',
  'angular2/src/http/**/*',
  'angular2/test/http/**/*',
  'examples/src/http/**/*',
  'examples/test/http/**/*',
  'examples/src/jsonp/**/*',
  'examples/test/jsonp/**/*',
  'upgrade/**/*'
];


/**
 * A funnel starting at modules, including the given filters, and moving into the root.
 * @param include Include glob filters.
 */
function modulesFunnel(include: string[], exclude?: string[]) {
  exclude = exclude || [];
  exclude = exclude.concat(global_excludes);
  return new Funnel('modules', {include, destDir: '/', exclude});
}

/**
 * Replaces $SCRIPT$ in .html files with actual <script> tags.
 */
function replaceScriptTagInHtml(placeholder: string, relativePath: string): string {
  var scriptTags = '';
  if (relativePath.match(/^benchmarks/)) {
    scriptTags += '<script src="url_params_to_form.js" type="text/javascript"></script>\n';
  }
  var scriptName = relativePath.replace(/\\/g, '/').replace(/.*\/([^/]+)\.html$/, '$1.dart');
  scriptTags += '<script src="' + scriptName + '" type="application/dart"></script>\n' +
                '<script src="packages/browser/dart.js" type="text/javascript"></script>';
  return scriptTags;
}

function stripModulePrefix(relativePath: string): string {
  if (!relativePath.match(/^modules\//)) {
    throw new Error('Expected path to root at modules/: ' + relativePath);
  }
  return relativePath.replace(/^modules\//, '');
}

function getSourceTree() {
  var tsInputTree = modulesFunnel(['**/*.js', '**/*.ts', '**/*.dart'], ['angular1_router/**/*']);
  var transpiled = ts2dart(tsInputTree, {
    generateLibraryName: true,
    generateSourceMap: false,
    translateBuiltins: true,
  });
  // Native sources, dart only examples, etc.
  var dartSrcs =
      modulesFunnel(['**/*.dart', '**/*.ng_meta.json', '**/*.aliases.json', '**/css/**']);
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
  var htmlSrcsTree = modulesFunnel(['*/src/**/*.html']);
  htmlSrcsTree = replace(
      htmlSrcsTree,
      {files: ['*/**'], patterns: [{match: '$SCRIPTS$', replacement: replaceScriptTagInHtml}]});

  // Copy a url_params_to_form.js for each benchmark html file.
  var urlParamsToFormTree = new MultiCopy('', {
    srcPath: 'tools/build/snippets/url_params_to_form.js',
    targetPatterns: ['modules/benchmarks*/src/*', 'modules/benchmarks*/src/*/*'],
  });
  urlParamsToFormTree = stew.rename(urlParamsToFormTree, stripModulePrefix);
  return mergeTrees([htmlSrcsTree, urlParamsToFormTree]);
}

function getExamplesJsonTree() {
  // Copy JSON files
  return modulesFunnel(['examples/**/*.json']);
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
    devDependencies: {}
  };
  // Generate pubspec.yaml from templates.
  var pubspecs = modulesFunnel(['**/pubspec.yaml']);
  // Then render the templates.
  return renderLodashTemplate(pubspecs, {context: {'packageJson': COMMON_PACKAGE_JSON}});
}

function getDocsTree() {
  // LICENSE files
  var licenses = new MultiCopy('', {
    srcPath: 'LICENSE',
    targetPatterns: ['modules/*'],
    exclude: ['*/angular2/src/http', '*/upgrade', '*/angular1_router']  // Not in dart.
  });
  licenses = stew.rename(licenses, stripModulePrefix);

  // Documentation.
  // Rename *.dart.md -> *.dart.
  var mdTree = stew.rename(modulesFunnel(['**/*.dart.md']),
                           relativePath => relativePath.replace(/\.dart\.md$/, '.md'));
  // Copy all assets, ignore .js. and .dart. (handled above).
  var docs = modulesFunnel(['**/*.md', '**/*.png', '**/*.html', '**/*.css', '**/*.scss'],
                           ['**/*.js.md', '**/*.dart.md', 'angular1_router/**/*']);

  var assets = modulesFunnel(['examples/**/*.json']);

  return mergeTrees([licenses, mdTree, docs, assets]);
}

module.exports = function makeDartTree(options: AngularBuilderOptions) {
  var dartSources = dartfmt(getSourceTree(), {dartSDK: options.dartSDK, logs: options.logs});
  var sourceTree = mergeTrees([dartSources, getHtmlSourcesTree(), getExamplesJsonTree()]);
  sourceTree = fixDartFolderLayout(sourceTree);

  var dartTree = mergeTrees([sourceTree, getTemplatedPubspecsTree(), getDocsTree()]);

  return destCopy(dartTree, options.outputPath);
};
