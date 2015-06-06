"use strict";

var fs = require('fs');
var path = require('path');

var NPM_SHRINKWRAP_FILE = 'npm-shrinkwrap.json';
var NPM_SHRINKWRAP_CACHED_FILE = 'node_modules/npm-shrinkwrap.cached.json';
var FS_OPTS = {encoding: 'utf-8'};
var PROJECT_ROOT = path.join(__dirname, '../../');


function checkNodeModules(logOutput, purgeIfStale) {
  var nodeModulesOK = _checkCache(NPM_SHRINKWRAP_FILE, NPM_SHRINKWRAP_CACHED_FILE);

  if (nodeModulesOK) {
    if (logOutput) console.log(':-) npm dependencies are looking good!');
  } else {
    if (logOutput) console.error(':-( npm dependencies are stale or in an in unknown state!');
    if (purgeIfStale) {
      if (logOutput) console.log('    purging...');

      var nodeModulesPath = path.join(PROJECT_ROOT, 'node_modules');

      if (fs.existsSync(nodeModulesPath)) {
        // lazy-load fs-extra
        var fse = require('fs-extra');
        fse.removeSync(nodeModulesPath);
      }
    }
  }

  return nodeModulesOK;
}


function _checkCache(markerFile, cacheMarkerFile) {
  var absoluteMarkerFilePath = path.join(PROJECT_ROOT, markerFile);
  var absoluteCacheMarkerFilePath = path.join(PROJECT_ROOT, cacheMarkerFile);


  if (!fs.existsSync(absoluteCacheMarkerFilePath)) return false;

  var markerContent = fs.readFileSync(absoluteMarkerFilePath, FS_OPTS);
  var cacheMarkerContent = fs.readFileSync(absoluteCacheMarkerFilePath, FS_OPTS);

  return markerContent == cacheMarkerContent;
}


module.exports = checkNodeModules;
