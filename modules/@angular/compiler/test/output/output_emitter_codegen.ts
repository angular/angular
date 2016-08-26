/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'reflect-metadata';

import {writeFileSync} from 'fs';

import {emit as typedEmit} from './output_emitter_codegen_typed';
import {emit as untypedEmit} from './output_emitter_codegen_untyped';

// Usage:
// node path/to/output_emitter_codegen [typed output file] [untyped output file]
function main(argv: string[]) {
  const [typed, untyped] = argv;
  writeFileSync(typed, typedEmit());
  writeFileSync(untyped, untypedEmit());
}

if (require.main === module) {
  main(process.argv.slice(2));
}
