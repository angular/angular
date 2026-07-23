/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** The pad used around the copyright blocks. */
const PAD = '\n\n';
/** The standard copyright block used throughout Angular. */
const COPYRIGHT = `
@license
Copyright Google LLC All Rights Reserved.

Use of this source code is governed by an MIT-style license that can be
found in the LICENSE file at https://angular.dev/license
`;
/** Copyright comment for CSS and Javascript/Typescript files. */
const CSS_TS_COPYRIGHT = `/*${COPYRIGHT}*/${PAD}`;
/** Copyright comment for HTML files. */
const HTML_COPYRIGHT = `<!--${COPYRIGHT}-->${PAD}`;

/**
 * Append the copyright using the appropriate commenting structure based on the file extension.
 *
 * No copyright is appended if the type is unrecognized.
 */
export function appendCopyrightToFile(filename: string, content: string): string {
  const extension = filename.split('.').pop();
  switch (extension) {
    case 'html':
    case 'ng':
      return `${HTML_COPYRIGHT}${content}`;
    case 'js':
    case 'ts':
    case 'css':
    case 'scss':
      return `${CSS_TS_COPYRIGHT}${content}`;
    default:
      return content;
  }
}
