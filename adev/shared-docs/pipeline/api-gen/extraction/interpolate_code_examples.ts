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

// It's assumed that all markers start with #.
const REGION_START_MARKER = '#docregion';
const REGION_END_MARKER = '#enddocregion';

// Used only for clean up
const TS_COMMENT_REGION_REGEX = /[ \t]*\/\/[ \t]*#(docregion|enddocregion)[ \t]*[\w-]*(\n|$)/g;
const HTML_COMMENT_REGION_REGEX =
  /[ \t]*<!--[ \t]*#(docregion|enddocregion)[ \t]*[\w-]*[ \t]*-->(\n|$)/g;

const examplesCache = new Map<string, Map<string, string>>(); // <file_path, <region, example>>

type FileType = 'ts' | 'js' | 'html';

type RegionStartToken = {name: string; startIdx: number};

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

/**
 * Extract a `#docregion` example from file contents (represented as a string) by a provided `region`.
 *
 * @param contents File contents represented as a string
 * @param fileType File type
 * @returns A map with all available examples in a given file contents
 */
function extractExamplesFromContents(contents: string, fileType: FileType): Map<string, string> {
  let markerBuffer = '';
  let paramBuffer = '';
  let markerFound = false;

  const regionStack: RegionStartToken[] = [];
  const examples = new Map<string, string>();

  // Iterate over the contents string and determine the start and end indices.
  for (let i = 0; i < contents.length; i++) {
    const char = contents[i];

    // Build the marker string.
    if (char === REGION_START_MARKER[0]) {
      markerBuffer = char;
    } else if (markerBuffer && !markerFound) {
      if (!/\s/.test(char)) {
        markerBuffer += char;
      } else {
        markerFound = true;
      }
    }

    if (markerFound && !/\s/.test(char)) {
      // Build param string.
      paramBuffer += char;
    } else if (markerFound && char === '\n') {
      // Resolve found marker.
      switch (markerBuffer) {
        case REGION_START_MARKER:
          // Push the current index to the stack, if a start marker.
          regionStack.push({
            name: paramBuffer,
            startIdx: i + 1,
          });
          break;
        case REGION_END_MARKER:
          if (regionStack.length) {
            // Check whether the end marker has a parameter or not.
            // If not, pop from the stack (it corresponds to the last inserted token).
            // If yes, pull the corresponding token index.
            let tokenIdx = paramBuffer ? regionStack.findIndex((t) => t.name === paramBuffer) : -1;
            let token: RegionStartToken;

            if (tokenIdx > -1) {
              token = regionStack.splice(tokenIdx, 1)[0];
            } else {
              token = regionStack.pop()!;
            }

            // Caclculate the end index (should represent the start of the marker).
            const endIdx =
              i - REGION_END_MARKER.length - (paramBuffer ? paramBuffer.length + 1 : 0);

            let example = contents.substring(token.startIdx, endIdx);
            example = removeLeftoverCommentsFromExample(example, fileType);

            // A code example can be composed by multiple regions;
            // hence, we check for an existing one.
            const existing = examples.get(token.name) || '';
            examples.set(token.name, existing + example);
          }
          break;
      }

      markerFound = false;
      markerBuffer = '';
      paramBuffer = '';
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
        .replace(TS_COMMENT_REGION_REGEX, '');
    case 'html':
      return example.replace(/(^\s*-->)|(<!--\s*$)/, '').replace(HTML_COMMENT_REGION_REGEX, '');
    default:
      return example;
  }
}
