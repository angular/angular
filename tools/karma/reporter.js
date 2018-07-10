/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

const DotsColorReporter = require('karma/lib/reporters/dots_color');
const {SourceMapConsumer} = require('source-map');
const {resolve} = require('url');

// Based on `karma/lib/reporter.js` (v2.0.4):
// https://github.com/karma-runner/karma/blob/v2.0.4/lib/reporter.js
function createErrorFormatter(config, emitter, SourceMapConsumer) {
  const basePath = config.basePath;
  const urlRoot = (config.urlRoot === '/') ? '' : (config.urlRoot || '');
  const urlRegexp = new RegExp(
      '(?:https?:\\/\\/' + config.hostname + '(?:\\:' + config.port + ')?' +
          ')?\\/?' + urlRoot + '\\/?' +
          '(base/|absolute)' +  // prefix, including slash for base/ to create relative paths.
          '((?:[A-z]\\:)?[^\\?\\s\\:]*)' +  // path
          '(\\?\\w*)?' +                    // sha
          '(\\:(\\d+))?' +                  // line
          '(\\:(\\d+))?' +                  // column
          '',
      'g');
  const sourceMapConsumerCache = new WeakMap();
  let lastServedFiles = [];

  // Helpers
  const findFile = path => lastServedFiles.find(f => f.path === path);
  const formatPathMapping = (path, line, column) =>
      path + (line ? `:${line}` : '') + (column ? `:${column}` : '');
  const isString = input => typeof input === 'string';
  const getSourceMapConsumer = sourceMap => {
    if (!sourceMapConsumerCache.has(sourceMap)) {
      sourceMapConsumerCache.set(sourceMap, new SourceMapConsumer(sourceMap));
    }
    return sourceMapConsumerCache.get(sourceMap);
  };

  emitter.on('file_list_modified', files => lastServedFiles = files.served);

  return (input, indentation) => {
    if (!isString(indentation)) indentation = '';
    if (!input) input = '';
    if (isString(input.message)) input = input.message;
    if (!isString(input)) input = JSON.stringify(input, null, indentation);

    let msg = input.replace(urlRegexp, (_, prefix, path, __, ___, line, ____, column) => {
      const normalizedPath = (prefix === 'base/') ? `${basePath}/${path}` : path;
      const file = findFile(normalizedPath);

      if (file && file.sourceMap && line) {
        line = +line;
        column = +column || 0;
        const bias =
            column ? SourceMapConsumer.GREATEST_LOWER_BOUND : SourceMapConsumer.LEAST_UPPER_BOUND;

        try {
          const original =
              getSourceMapConsumer(file.sourceMap).originalPositionFor({line, column, bias});
          return formatPathMapping(
              `${resolve(path, original.source)}`, original.line, original.column);
        } catch (e) {
          console.warn(`SourceMap position not found for trace: ${input}`);
        }
      }

      return formatPathMapping(path, line, column) || prefix;
    });

    // Indent every line.
    if (indentation) {
      msg = indentation + msg.replace(/\n/g, `\n${indentation}`);
    }

    return config.formatError ? config.formatError(msg) : `${msg}\n`;
  };
}


InternalAngularReporter.$inject = ['config', 'emitter'];
function InternalAngularReporter(config, emitter) {
  var formatter = createErrorFormatter(config, emitter, SourceMapConsumer);
  DotsColorReporter.call(this, formatter, false, config.colors, config.browserConsoleLogOptions);
}


module.exports = {
  'reporter:internal-angular': ['type', InternalAngularReporter],
};
