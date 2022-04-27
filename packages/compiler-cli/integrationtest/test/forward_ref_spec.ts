/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './init.js';

import * as fs from 'fs';
import * as path from 'path';

import {CUSTOM} from '../src/custom_token.js';
import {CompWithProviders} from '../src/features.js';
import {MainModule} from '../src/module.js';

import {createComponent, createModule} from './util.js';

describe('template codegen output', () => {
  it('should support forwardRef with useValue in components', () => {
    const compFixture = createComponent(CompWithProviders);
    expect(compFixture.componentInstance.ctxProp).toBe('strValue');
  });

  it('should support forwardRef with useValue in modules', () => {
    const modRef = createModule();
    expect(modRef.injector.get(CUSTOM).name).toBe('some name');
  });
});
