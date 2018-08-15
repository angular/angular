/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Declare the AMD dependency on "module" because otherwise the generated AMD module will
// try to reference "module.id" from the globals, while we want the one from RequireJS.
/// <amd-dependency path="module" name="module"/>

// We use the "node" type here because "module.id" is part of "CommonJS" and Bazel compiles
// with "umd" module resolution which means that "module.id" is not a defined global variable.
/// <reference types="node" />

import {Component} from '@angular/core';

@Component(
    {selector: 'my-cmp', templateUrl: 'tpl.html', styleUrls: ['style.css'], moduleId: module.id})
export class MyCmp {
}
