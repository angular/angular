/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './init';

import {BasicComp} from '../src/basic';
import {CompWithAnalyzePrecompileProvider, CompWithPrecompile} from '../src/precompile';

import {createComponent} from './util';

describe('content projection', () => {
  it('should support precompile in components', () => {
    var compFixture = createComponent(CompWithPrecompile);
    var cf = compFixture.componentInstance.cfr.resolveComponentFactory(BasicComp);
    expect(cf.componentType).toBe(BasicComp);
  });

  it('should support precompile via the ANALYZE_FOR_PRECOMPILE provider and function providers in components',
     () => {
       const compFixture = createComponent(CompWithAnalyzePrecompileProvider);
       const cf = compFixture.componentInstance.cfr.resolveComponentFactory(BasicComp);
       expect(cf.componentType).toBe(BasicComp);
       // check that the function call that created the provider for ANALYZE_FOR_PRECOMPILE worked.
       expect(compFixture.componentInstance.providedValue).toEqual([
         {a: 'b', component: BasicComp}
       ]);
     });
});
