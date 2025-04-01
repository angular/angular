/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DebugElement} from '@angular/core';

let debugElement: DebugElement = undefined!;
let predicate: any;

debugElement.query(predicate);
