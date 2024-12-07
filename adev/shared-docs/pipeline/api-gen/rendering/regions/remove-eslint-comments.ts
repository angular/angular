/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export type FileType =
  | 'ts'
  | 'js'
  | 'mjs'
  | 'es6'
  | 'html'
  | 'svg'
  | 'css'
  | 'conf'
  | 'yaml'
  | 'yml'
  | 'sh'
  | 'jade'
  | 'pug'
  | 'json'
  | 'json.annotated';

export function removeEslintComments(input: string, fileType: FileType) {
  if (!input || (fileType !== 'ts' && fileType !== 'js' && fileType !== 'html')) {
    return input;
  }

  const regexForFileType = regexesForFileTypes[fileType];

  return input.replace(regexForFileType, '');
}

const jsRegexes = [
  /\/\/ *eslint-disable(?:-next-line)?(?: .*)?(?:\n *|$)/,
  /\n? *\/\/ *eslint-(?:disable-line|enable)(?: .*)?(?=\n|$)/,
  /\/\*\s*eslint-disable(?:-next-line)?(?: [\s\S]*?)?\*\/ *(?:\n *)?/,
  /\n? *\/\*\s*eslint-(?:disable-line|enable)(?: [\s\S]*?)?\*\//,
];

const htmlRegexes = [
  /<!--\s*eslint-disable(?:-next-line)?(?: [\s\S]*?)?--> *(?:\n *)?/,
  /\n? *<!--\s*eslint-(?:disable-line|enable)(?: [\s\S]*?)?-->/,
];

const joinRegexes = (regexes: any) =>
  new RegExp(regexes.map((regex: any) => `(?:${regex.source})`).join('|'), 'g');
const htmlRegex = joinRegexes(htmlRegexes);
// Note: the js regex needs to also include the html ones to account for inline templates in @Components
const jsRegex = joinRegexes([...jsRegexes, ...htmlRegexes]);

const regexesForFileTypes = {
  js: jsRegex,
  ts: jsRegex,
  html: htmlRegex,
};
