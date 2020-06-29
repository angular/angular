#!/usr/bin/env node

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const vlq = require('vlq');
const fs = require('fs');
const path = require('path');

module.exports = function getMappings(bundlePath) {
  const sourceMap = JSON.parse(getFile(`${bundlePath}.map`));
  const sourcesContent = sourceMap.sourcesContent.map(file => file.split('\n'));
  const bundleLines = getFile(bundlePath).split('\n');

  let sourceLines = sourcesContent[0];
  let sourceFileIndex = 0;
  let sourceLineIndex = 0;
  let sourceColIndex = 0;

  return decodeLines(sourceMap).reduce((matchData, mapLine, genLineIndex) => {
    mapLine.forEach((segment, index) => {
      if (segment.length) {
        const [genColDiff, sourceFileDiff, sourceLineDiff, sourceColDiff] = segment;

        // if source file changes, grab new file from sourcesContent
        if (sourceFileDiff !== 0) {
          sourceFileIndex += sourceFileDiff;
          sourceLines = sourcesContent[sourceFileIndex];
        }

        const genText = bundleLines[genLineIndex].trim();
        const sourceText = sourceLines[sourceLineIndex + sourceLineDiff].trim();

        // only record mappings that are long enough to be meaningful
        if (index === 0 && genText.length > 15 && sourceText.length > 15) {
          matchData.push({
            genLineIndex,
            sourceLineIndex,
            sourceFile: sourceMap.sources[sourceFileIndex],
            genText,
            sourceText
          });
        }

        sourceLineIndex += sourceLineDiff;
        sourceColIndex += sourceColDiff;
      }
    });

    return matchData;
  }, []);
};

function getFile(filePath) {
  return fs.readFileSync(path.resolve(process.cwd(), filePath), 'UTF-8');
}

function decodeLines(sourceMap) {
  return sourceMap.mappings.split(';').map(line => {
    return line.split(',').map(seg => vlq.decode(seg));
  });
}
