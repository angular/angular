/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ComponentFactoryResolver, Inject, OpaqueToken} from '@angular/core';

@Component({selector: 'cmp', template: ''})
export class SomeComp {
}

@Component({selector: 'cmp-precompile', template: '', precompile: [SomeComp]})
export class CompWithPrecompile {
  constructor(public cfr: ComponentFactoryResolver) {}
}
