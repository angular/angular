/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {writeFileSync} from 'fs';
import {generateStackblitzExample} from './builder.mjs';

const [exampleDir, tmpDir, templateDir, outputFilePath] = process.argv.slice(2);
const htmlOutputContent = await generateStackblitzExample(exampleDir, tmpDir, templateDir);

writeFileSync(outputFilePath, htmlOutputContent, {encoding: 'utf8'});
