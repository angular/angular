/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {schema} from '../../public_api';
import {normalizeFormArgs} from '../../src/util/normalize_form_args';

describe('normalizeFormArgs', () => {
  const model = signal('hello');
  const schemaFn = () => {};
  const schemaInstance = schema(() => {});
  const options = {name: 'myForm'};

  it('normalizes single model argument', () => {
    const [m, s, o] = normalizeFormArgs([model]);
    expect(m).toBe(model);
    expect(s).toBeUndefined();
    expect(o).toBeUndefined();
  });

  it('normalizes model and schema function', () => {
    const [m, s, o] = normalizeFormArgs([model, schemaFn]);
    expect(m).toBe(model);
    expect(s).toBe(schemaFn);
    expect(o).toBeUndefined();
  });

  it('normalizes model and Schema instance', () => {
    const [m, s, o] = normalizeFormArgs([model, schemaInstance]);
    expect(m).toBe(model);
    expect(s).toBe(schemaInstance);
    expect(o).toBeUndefined();
  });

  it('normalizes model and options as second argument', () => {
    const [m, s, o] = normalizeFormArgs([model, options]);
    expect(m).toBe(model);
    expect(s).toBeUndefined();
    expect(o).toEqual(options);
  });

  it('normalizes model, schema function, and options', () => {
    const [m, s, o] = normalizeFormArgs([model, schemaFn, options]);
    expect(m).toBe(model);
    expect(s).toBe(schemaFn);
    expect(o).toEqual(options);
  });

  it('normalizes model, Schema instance, and options', () => {
    const [m, s, o] = normalizeFormArgs([model, schemaInstance, options]);
    expect(m).toBe(model);
    expect(s).toBe(schemaInstance);
    expect(o).toEqual(options);
  });

  it('normalizes when options is 2nd argument and 3rd is undefined', () => {
    const [m, s, o] = normalizeFormArgs([model, options, undefined]);
    expect(m).toBe(model);
    expect(s).toBeUndefined();
    expect(o).toEqual(options);
  });

  it('normalizes when 2nd argument is undefined and 3rd is options', () => {
    const [m, s, o] = normalizeFormArgs([model, undefined, options]);
    expect(m).toBe(model);
    expect(s).toBeUndefined();
    expect(o).toEqual(options);
  });

  it('normalizes when schema function is 2nd argument and 3rd is undefined', () => {
    const [m, s, o] = normalizeFormArgs([model, schemaFn, undefined]);
    expect(m).toBe(model);
    expect(s).toBe(schemaFn);
    expect(o).toBeUndefined();
  });

  it('normalizes when both 2nd and 3rd arguments are undefined', () => {
    const [m, s, o] = normalizeFormArgs([model, undefined, undefined]);
    expect(m).toBe(model);
    expect(s).toBeUndefined();
    expect(o).toBeUndefined();
  });

  it('merges options when both 2nd and 3rd arguments are options objects', () => {
    const options1 = {name: 'first'};
    const options2 = {name: 'second'};
    const [m, s, o] = normalizeFormArgs([model, options1, options2]);
    expect(m).toBe(model);
    expect(s).toBeUndefined();
    expect(o).toEqual({name: 'second'});
  });
});
