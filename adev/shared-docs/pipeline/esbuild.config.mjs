/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export default {
  // Neceesary because mermaid related scripts rely on cjs based requires.
  banner: {
    'js': `
import {createRequire as __cjsCompatRequire} from 'module';
const require = __cjsCompatRequire(import.meta.url);`,
  },
  tsconfig: import.meta.dirname + '/../tsconfig.json',
  resolveExtensions: ['.js', '.mjs'],
};
