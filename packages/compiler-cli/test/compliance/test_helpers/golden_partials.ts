/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const headerStart =
  '/****************************************************************************************************\n' +
  ' * PARTIAL FILE: ';

const headerEnd =
  '\n ****************************************************************************************************/\n';

/**
 * Render the partially compiled files into a single golden partial output string.
 *
 * @param files The partially compiled files to be rendered.
 */
export function renderGoldenPartial(files: PartiallyCompiledFile[]): string {
  return files.map((file) => `${headerStart + file.path + headerEnd}${file.content}`).join('\n');
}

/**
 * Parse the `partialContent` into a set of partially compiled files.
 *
 * The `partialContent` is a single string that can contains multiple files.
 * Each file is delimited by a header comment that also contains its original path.
 *
 * @param partialContent The partial content to parse.
 */
export function parseGoldenPartial(partialContent: string): PartiallyCompiledFile[] {
  const files: PartiallyCompiledFile[] = [];
  const partials = partialContent.split(headerStart);
  for (const partial of partials) {
    const [path, content] = partial.split(headerEnd);
    if (path) {
      files.push({path, content});
    }
  }
  return files;
}

/**
 * Represents the path and contents of a partially compiled file.
 */
export interface PartiallyCompiledFile {
  path: string;
  content: string;
}
