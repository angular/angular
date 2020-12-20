// tslint:disable:file-header

/**
 * Npm module for Unicode CLDR JSON data
 *
 * @license
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-npm/blob/master/LICENSE-MIT
 */

'use strict';

const JSON_EXTENSION = /^(.*)\.json$/;

const assert = require('assert');
const _fs = require('fs');
const _path = require('path');

function argsToArray(arg) {
  return [].slice.call(arg, 0);
}

function jsonFiles(dirName) {
  const fileList = _fs.readdirSync(_path.join(__dirname, 'cldr-data', dirName));

  return fileList.reduce(function(sum, file) {
    if (JSON_EXTENSION.test(file)) {
      return sum.concat(file.match(JSON_EXTENSION)[1]);
    }
  }, []);
}

function cldrData(path /*, ...*/) {
  assert(
      typeof path === 'string',
      'must include path (e.g., "main/en/numbers" or "supplemental/likelySubtags")');

  if (arguments.length > 1) {
    return argsToArray(arguments).reduce(function(sum, path) {
      sum.push(cldrData(path));
      return sum;
    }, []);
  }
  return require('./cldr-data/' + path);
}

function mainPathsFor(locales) {
  return locales.reduce(function(sum, locale) {
    const mainFiles = jsonFiles(_path.join('main', locale));
    mainFiles.forEach(function(mainFile) {
      sum.push(_path.join('main', locale, mainFile));
    });
    return sum;
  }, []);
}

function supplementalPaths() {
  const supplementalFiles = jsonFiles('supplemental');

  return supplementalFiles.map(function(supplementalFile) {
    return _path.join('supplemental', supplementalFile);
  });
}

Object.defineProperty(cldrData, 'availableLocales', {
  get: function() {
    return cldrData('availableLocales').availableLocales;
  }
});

cldrData.all = function() {
  const paths = supplementalPaths().concat(mainPathsFor(this.availableLocales));
  return cldrData.apply({}, paths);
};

cldrData.entireMainFor = function(locale /*, ...*/) {
  assert(typeof locale === 'string', 'must include locale (e.g., "en")');
  return cldrData.apply({}, mainPathsFor(argsToArray(arguments)));
};

cldrData.entireSupplemental = function() {
  return cldrData.apply({}, supplementalPaths());
};

module.exports = cldrData;
