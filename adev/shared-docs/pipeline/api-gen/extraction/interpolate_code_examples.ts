/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from '@angular/compiler-cli';
import {readFileSync} from 'fs';
import {basename, dirname, resolve} from 'path';

export const EXAMPLES_PATH = 'packages/examples';
const REGION_START_MARKER = '#docregion';
const REGION_END_MARKER = '#enddocregion';

const examplesFilesCache = new Map<string, string>();

type FileType = 'ts' | 'js' | 'html';

/**
 * Interpolate code examples in the `DocEntry`-ies JSDocs content and raw comments in place.
 *
 * @param entries Target `DocEntry`-ies array that has its examples substituted with the actual TS code.
 * @param examplesFiles A set with all examples files sources.
 */
export function interpolateCodeExamples(entries: DocEntry[]): void {
  for (const entry of entries) {
    entry.rawComment = replaceExample(entry.rawComment);

    for (const jsdocTag of entry.jsdocTags) {
      jsdocTag.comment = replaceExample(jsdocTag.comment);
    }
  }
}

function replaceExample(text: string): string {
  const examplesTagRegex = /{@example (\S+) region=(['"])([^'"]+)\2\s*}/g;

  return text.replace(examplesTagRegex, (_: string, path: string, __: string, region: string) => {
    const contents = getExampleFileContents(path);
    const fileType = path.split('.').pop() as FileType;
    const example = extractExampleFromContents(contents, region, fileType);

    if (!example) {
      throw new Error(`Missing code example for ${path}#${region}`);
    }

    return '```typescript\n' + example + '\n```';
  });
}

function getExampleFileContents(path: string): string {
  let contents = examplesFilesCache.get(path);
  if (!contents) {
    const src = `${EXAMPLES_PATH}/${path}`;
    const fullPath = resolve(dirname(src), basename(src));
    contents = readFileSync(fullPath, {encoding: 'utf8'});
    examplesFilesCache.set(path, contents);
  }
  return contents;
}

function trimLeftoverCommentsFromExample(example: string, fileType: FileType): string {
  switch (fileType) {
    case 'ts':
    case 'js':
      // We can have only a trailing TS comment leftover
      return example.replace(/\/\/\s*$/, '');
    case 'html':
      return example.replace(/(^\s*-->)|(<!--\s*$)/, '');
    default:
      return example;
  }
}

/** Extract a `#docregion` example from file contents (represented as a string) by a provided `region`. */
function extractExampleFromContents(contents: string, region: string, fileType: FileType): string {
  let startIdx = -1;
  let endIdx = -1;

  let markerBuffer = '';
  let regionBuffer = '';
  let isInRegion = false;

  // Iterate over the contents string and determine the start and end indices.
  for (let i = 0; i < contents.length; i++) {
    const char = contents[i];

    // Build the marker string
    if (char === REGION_START_MARKER[0]) {
      markerBuffer = char;
    } else if (markerBuffer) {
      markerBuffer += char;
    }

    // Check if the marker corresponds to the start or the end region markers
    if (markerBuffer === REGION_START_MARKER) {
      isInRegion = true;
      markerBuffer = '';
      startIdx = -1;

      // We need to skip the region checks in this case.
      continue;
    } else if (markerBuffer === REGION_END_MARKER) {
      isInRegion = false;
      markerBuffer = '';

      // If the startIdx is set, this means that
      // we've successfully found the region start marker
      // and we can break from the loop with the respective
      // end index.
      if (startIdx > -1) {
        endIdx = i - REGION_END_MARKER.length;
        break;
      }
    }

    // Build the region string
    if (isInRegion && !/\s/.test(char) && startIdx === -1) {
      regionBuffer += char;
    } else if (isInRegion) {
      // If the region string matches the argument,
      // we can safely set the start index.
      if (regionBuffer === region) {
        startIdx = i + 1;
      }
      regionBuffer = '';
    }
  }

  // If any of the indices are missing, we cannot determine the borders
  // or the region. Therefore, we return an empty string.
  if (startIdx === -1 || endIdx === -1) {
    return '';
  }

  const example = contents.substring(startIdx, endIdx);

  return trimLeftoverCommentsFromExample(example, fileType);
}
