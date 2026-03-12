/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import parserTypescript from 'prettier/plugins/typescript';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettier from 'prettier/standalone';

export async function formatJs(code: string): Promise<string> {
  return (
    prettier
      .format(code, {
        parser: 'typescript',
        plugins: [parserTypescript, prettierPluginEstree],
        singleQuote: true,
      })
      // Make sure to trim the formatted code as shiki will add a new line if there are some remaining trailing spaces
      .then((formattedCode) => formattedCode.trim())
  );
}
