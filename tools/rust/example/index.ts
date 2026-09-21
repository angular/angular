/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {fileURLToPath} from 'url';
import init, {say_hello} from './hello_world_wasm/hello_world_wasm.js';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// Execute WebAssembly initialization natively before passing exports
const wasmPath = path.join(_dirname, 'hello_world_wasm/hello_world_wasm_bg.wasm');
const wasmBuffer = await fs.readFile(wasmPath);
await init(wasmBuffer);

export {say_hello as sayHello};
