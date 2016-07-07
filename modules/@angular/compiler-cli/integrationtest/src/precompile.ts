/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ANALYZE_FOR_PRECOMPILE, Component, ComponentFactoryResolver, Inject, OpaqueToken} from '@angular/core';

import {BasicComp} from './basic';

@Component({selector: 'cmp-precompile', template: '', precompile: [BasicComp]})
export class CompWithPrecompile {
  constructor(public cfr: ComponentFactoryResolver) {}
}

export const SOME_TOKEN = new OpaqueToken('someToken');

export function provideValueWithPrecompile(value: any) {
  return [
    {provide: SOME_TOKEN, useValue: value},
    {provide: ANALYZE_FOR_PRECOMPILE, useValue: value, multi: true},
  ];
}

@Component({
  selector: 'comp-precompile-provider',
  template: '',
  providers: [provideValueWithPrecompile([{a: 'b', component: BasicComp}])]
})
export class CompWithAnalyzePrecompileProvider {
  constructor(public cfr: ComponentFactoryResolver, @Inject(SOME_TOKEN) public providedValue: any) {
  }
}
