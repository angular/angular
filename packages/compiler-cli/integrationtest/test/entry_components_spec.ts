/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './init';

import {BasicComp} from '../src/basic';
import {CompWithAnalyzeEntryComponentsProvider, CompWithEntryComponents} from '../src/entry_components';

import {createComponent} from './util';

describe('content projection', () => {
  it('should support entryComponents in components', () => {
    const compFixture = createComponent(CompWithEntryComponents);
    const cf = compFixture.componentInstance.cfr.resolveComponentFactory(BasicComp);
    expect(cf.componentType).toBe(BasicComp);
  });

  it('should support entryComponents via the ANALYZE_FOR_ENTRY_COMPONENTS provider and function providers in components',
     () => {
       const compFixture = createComponent(CompWithAnalyzeEntryComponentsProvider);
       const cf = compFixture.componentInstance.cfr.resolveComponentFactory(BasicComp);
       expect(cf.componentType).toBe(BasicComp);
       // check that the function call that created the provider for ANALYZE_FOR_ENTRY_COMPONENTS
       // worked.
       expect(compFixture.componentInstance.providedValue).toEqual([
         {a: 'b', component: BasicComp}
       ]);
     });
});
