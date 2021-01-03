/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ANALYZE_FOR_ENTRY_COMPONENTS, Component, ComponentFactoryResolver, Inject, InjectionToken} from '@angular/core';

import {BasicComp} from './basic';

@Component({
  selector: 'cmp-entryComponents',
  template: '<p i18n>Welcome</p>',
  entryComponents: [BasicComp]
})
export class CompWithEntryComponents {
  constructor(public cfr: ComponentFactoryResolver) {}
}

export const SOME_TOKEN = new InjectionToken('someToken');

export function provideValueWithEntryComponents(value: any) {
  return [
    {provide: SOME_TOKEN, useValue: value},
    {provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: value, multi: true},
  ];
}

@Component({
  selector: 'comp-entryComponents-provider',
  template: '',
  providers: [provideValueWithEntryComponents([{a: 'b', component: BasicComp}])]
})
export class CompWithAnalyzeEntryComponentsProvider {
  constructor(public cfr: ComponentFactoryResolver, @Inject(SOME_TOKEN) public providedValue: any) {
  }
}
