/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * The golden markdown format: a virtual filesystem encoded as a sequence of `# /path/to/file.ts`
 * headings, each followed by a fenced block holding that file's content.
 *
 * Kept apart from `test/utils.ts` so that tools which only need to read a golden — rather than
 * run the pipeline that produces one — do not pull in the compiler.
 */

import * as fs from 'node:fs/promises';
import * as path from 'path';

export interface TestFile {
  path: string;
  content: string;
}

/**
 * Parse a markdown test case file into an array of test files
 *
 * Format:
 * ```markdown
 * # /path/to/file.ts
 * ```ts
 * // file content here
 * ```
 * ```
 */
export async function parseMarkdownTestCase(mdPath: string): Promise<TestFile[]> {
  const content = await fs.readFile(mdPath, 'utf-8');
  return parseMarkdownContent(content);
}

/**
 * Parse markdown content into test files
 */
export function parseMarkdownContent(content: string): TestFile[] {
  const files: TestFile[] = [];

  // Regex to match: # /path/to/file.ext\n```lang\n...content...\n```
  const fileRegex = /^# (.+)\n\s*```\w*\n([\s\S]*?)```/gm;

  let match;
  while ((match = fileRegex.exec(content)) !== null) {
    files.push({
      path: match[1].trim(),
      content: match[2].trimEnd(),
    });
  }

  return files;
}

/**
 * Write test files to a markdown format string
 */
export function writeMarkdownTestCase(files: TestFile[]): string {
  return files
    .slice()
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((f) => {
      const ext = path.extname(f.path).slice(1) || 'text';
      const lang = ext === 'ts' ? 'ts' : ext === 'json' ? 'json' : ext;
      return `# ${f.path}\n\`\`\`${lang}\n${f.content}\n\`\`\``;
    })
    .join('\n\n');
}
