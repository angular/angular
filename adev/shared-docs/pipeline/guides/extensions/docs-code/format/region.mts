/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CodeToken} from './index.mjs';
import {regionParser} from '../regions/region-parser.mjs';
import {FileType} from '../sanitizers/eslint.mjs';

/**
 * Updates the provided token to include the extracted region as the visible lines for the token.
 */
export function extractRegions(token: CodeToken) {
  const fileType: FileType | undefined = token.path?.split('.').pop() as FileType;
  const parsedRegions = regionParser(token.code, fileType);
  // The code in the token is always replaced with the version of the code with region markers removed.
  token.code = parsedRegions.contents;

  if (token.visibleRegion) {
    const region = parsedRegions.regionMap[token.visibleRegion];
    if (!region) {
      throw new Error(`Cannot find ${token.visibleRegion} in ${token.path}!`);
    }
    token.visibleLines = `[${region.ranges.map(
      (range) => `[${range.from}, ${range.to ?? parsedRegions.totalLinesCount + 1}]`,
    )}]`;
  }
}
