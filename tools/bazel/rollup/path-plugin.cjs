/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const {existsSync, statSync} = require('node:fs');
const {join} = require('node:path');
const {parseTsconfig, createPathsMatcher} = require('get-tsconfig');

function pathPlugin({tsconfigPath}) {
  if (tsconfigPath === undefined) {
    throw Error('A path tsconfig file must be provided.');
  }
  const fullTsconfigPath = join(process.cwd(), tsconfigPath);
  const tsconfig = parseTsconfig(fullTsconfigPath);
  const pathMappingMatcher = createPathsMatcher({config: tsconfig, path: fullTsconfigPath});
  return {
    name: 'paths',
    resolveId: (source) => {
      /**
       * A list containing all of the potential paths which match the provided source based
       * on the paths field from the tsconfig.
       */
      const matchedSources = pathMappingMatcher(source);
      if (matchedSources.length == 0) {
        return null;
      }
      // We need to check each matched source to see if it loads at the path directly, or is
      // a directory with an index.js file to import.
      for (let matchedSource of matchedSources) {
        const indexPath = join(matchedSource, 'index.js');
        if (existsSync(indexPath) && statSync(indexPath).isFile) {
          return {id: indexPath};
        }
        const filePath = matchedSource + '.js';
        if (existsSync(filePath) && statSync(filePath).isFile) {
          return {id: filePath};
        }
      }

      throw Error(`Cannot find ${source}\nLocations checked:\n-${matchedSources.join('\n')}`);
    },
  };
}

module.exports = {pathPlugin};
