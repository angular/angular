'use strict';

import destCopy from '../broccoli-dest-copy';
import compileWithTypescript, { INTERNAL_TYPINGS_PATH }
from '../broccoli-typescript';
var Funnel = require('broccoli-funnel');
import mergeTrees from '../broccoli-merge-trees';
var path = require('path');
import renderLodashTemplate from '../broccoli-lodash';
import replace from '../broccoli-replace';
var stew = require('broccoli-stew');

var projectRootDir = path.normalize(path.join(__dirname, '..', '..', '..', '..'));

var makeAngular2Pipeline = require('./node_pipeline/angular2_pipeline');
var makeBenchmarksExternalPipeline = require('./node_pipeline/benchmarks_external_pipeline');
var makeBenchmarksPipeline = require('./node_pipeline/benchmarks_pipeline');
var makeBenchpressPipeline = require('./node_pipeline/benchpress_pipeline');
var makePlaygroundPipeline = require('./node_pipeline/playground_pipeline');

// TODO: parse projects string
module.exports = function makeNodeTree(projects, destinationPath) {

  let {nodeTree, internalDeclTree, testingInternalDeclTree} = makeAngular2Pipeline();

  let benchmarksExternalProjectPipeline =
      makeBenchmarksExternalPipeline(projects, destinationPath, testingInternalDeclTree, internalDeclTree);
  let benchmarkProjectPipeline =
      makeBenchmarksPipeline(destinationPath, internalDeclTree, testingInternalDeclTree);
  let benchpressProjectPipeline = makeBenchpressPipeline(projects, destinationPath, internalDeclTree);
  let playgroundProjectPipeline = makePlaygroundPipeline(projects, destinationPath);

  return destCopy(mergeTrees([
                    nodeTree,
                    benchmarksExternalProjectPipeline,
                    benchmarkProjectPipeline,
                    benchpressProjectPipeline,
                    playgroundProjectPipeline
                  ]),
                  destinationPath);
};
