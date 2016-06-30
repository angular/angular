/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './init';
import {BasicComp} from '../src/basic';
import {CompWithPrecompile} from '../src/precompile';
import {createComponent} from './util';

describe('content projection', () => {
  it('should support basic content projection', () => {
    var compFixture = createComponent(CompWithPrecompile);
    var cf = compFixture.componentInstance.cfr.resolveComponentFactory(BasicComp);
    expect(cf.componentType).toBe(BasicComp);
  });
});
