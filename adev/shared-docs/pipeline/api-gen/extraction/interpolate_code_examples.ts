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

const examplesCache = new Map<string, Map<string, string>>(); // <file_path, <region, example>>

type FileType = 'ts' | 'js' | 'html';

type RegionToken = {name: string; startIdx: number};

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
    const example = getExample(path, region);
    if (!example) {
      throw new Error(`Missing code example ${path}#${region}`);
    }

    return '```typescript\n' + example + '\n```';
  });
}

function getExample(path: string, region: string): string {
  let fileExamples = examplesCache.get(path);

  if (!fileExamples) {
    const src = `${EXAMPLES_PATH}/${path}`;
    const fullPath = resolve(dirname(src), basename(src));
    const contents = readFileSync(fullPath, {encoding: 'utf8'});
    const fileType = path.split('.').pop() as FileType;

    fileExamples = extractExamplesFromContents(contents, fileType);
    examplesCache.set(path, fileExamples);
  }

  return fileExamples.get(region) || '';
}

/** Extract a `#docregion` example from file contents (represented as a string) by a provided `region`. */
/**
 *
 * @param contents
 * @param fileType
 * @returns
 */
function extractExamplesFromContents(contents: string, fileType: FileType): Map<string, string> {
  let markerBuffer = '';
  let regionBuffer = '';
  let startMarkerFound = false;

  const regionStack: RegionToken[] = [];
  const examples = new Map<string, string>();

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
      startMarkerFound = true;
      markerBuffer = '';

      // We need to skip the region checks in this case.
      continue;
    } else if (markerBuffer === REGION_END_MARKER) {
      markerBuffer = '';

      if (regionStack.length) {
        const {startIdx, name} = regionStack.pop()!;
        const endIdx = i - REGION_END_MARKER.length;
        let example = contents.substring(startIdx, endIdx);
        example = removeLeftoverCommentsFromExample(example, fileType);

        examples.set(name, example);
      }
    }

    // Build the region string
    if (startMarkerFound && !/\s/.test(char)) {
      regionBuffer += char;
    } else if (startMarkerFound && regionBuffer) {
      regionStack.push({
        name: regionBuffer,
        startIdx: i + 1,
      });

      regionBuffer = '';
      startMarkerFound = false;
    }
  }

  return examples;
}

function removeLeftoverCommentsFromExample(example: string, fileType: FileType): string {
  example = example.trim();

  switch (fileType) {
    case 'ts':
    case 'js':
      return example
        .replace(/\n?\/\/\s*$/, '') // We can have only a trailing TS comment leftover
        .replace(/\/\/\s*#(docregion|enddocregion)\s*\w*\n/g, '');
    case 'html':
      return example
        .replace(/(^\s*-->)|(<!--\s*$)/, '')
        .replace(/<!--\s*#(docregion|enddocregion)\s*\w*\s*-->\n/g, '');
    default:
      return example;
  }
}
