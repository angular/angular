/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {APP_ID} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {CssVarNamespacer} from '../../src/dom/css_var_namespacer';
import {provideCssVarNamespacing} from '../../src/dom/dom_renderer';

describe('CssVarNamespacer', () => {
  it('should namespace variables when `CSS_VAR_NAMESPACE` is provided', () => {
    TestBed.configureTestingModule({
      providers: [CssVarNamespacer, provideCssVarNamespacing('test-app')],
    });

    const namespacer = TestBed.inject(CssVarNamespacer);

    expect(namespacer.namespace('--my-var')).toBe('--test-app_my-var');
  });

  it('should fallback to `APP_ID` with an underscore when no namespace is provided to `provideCssVarNamespacing`', () => {
    TestBed.configureTestingModule({
      providers: [
        CssVarNamespacer,
        {provide: APP_ID, useValue: 'custom-app'},
        provideCssVarNamespacing(),
      ],
    });

    const namespacer = TestBed.inject(CssVarNamespacer);

    expect(namespacer.namespace('--my-var')).toBe('--custom-app_my-var');
  });

  it('should not namespace variables when `CSS_VAR_NAMESPACE` is not provided', () => {
    TestBed.configureTestingModule({
      providers: [CssVarNamespacer],
    });

    const namespacer = TestBed.inject(CssVarNamespacer);

    expect(namespacer.namespace('--my-var')).toBe('--my-var');
  });

  it('throws an error when a variable is passed in without the leading `--`', () => {
    TestBed.configureTestingModule({
      providers: [CssVarNamespacer],
    });

    const namespacer = TestBed.inject(CssVarNamespacer);

    expect(() => namespacer.namespace('my-var')).toThrowError(/must start with '--'/);
  });
});
