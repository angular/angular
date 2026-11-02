/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {schema} from '../../src/api/structure';
import {normalizeFormArgs} from '../../src/util/normalize_form_args';

describe('normalizeFormArgs', () => {
  it('should extract model when only model is provided', () => {
    const s = signal('hello');
    const [model, formSchema, options] = normalizeFormArgs([s]);

    expect(model).toBe(s);
    expect(formSchema).toBeUndefined();
    expect(options).toBeUndefined();
  });

  it('should trim trailing undefined arguments', () => {
    const s = signal('hello');
    const [model, formSchema, options] = normalizeFormArgs([s, undefined]);

    expect(model).toBe(s);
    expect(formSchema).toBeUndefined();
    expect(options).toBeUndefined();
  });

  it('should trim multiple trailing undefined arguments', () => {
    const s = signal('hello');
    const [model, formSchema, options] = normalizeFormArgs([s, undefined, undefined]);

    expect(model).toBe(s);
    expect(formSchema).toBeUndefined();
    expect(options).toBeUndefined();
  });

  it('should extract schema function when 2 arguments are provided', () => {
    const s = signal('hello');
    const schemaFn = () => {};
    const [model, formSchema, options] = normalizeFormArgs([s, schemaFn]);

    expect(model).toBe(s);
    expect(formSchema).toBe(schemaFn);
    expect(options).toBeUndefined();
  });

  it('should extract SchemaImpl when 2 arguments are provided', () => {
    const s = signal('hello');
    const compiledSchema = schema(() => {});
    const [model, formSchema, options] = normalizeFormArgs([s, compiledSchema]);

    expect(model).toBe(s);
    expect(formSchema).toBe(compiledSchema);
    expect(options).toBeUndefined();
  });

  it('should extract options when 2 arguments are provided and second argument is options', () => {
    const s = signal('hello');
    const opts = {name: 'myForm'};
    const [model, formSchema, options] = normalizeFormArgs([s, opts]);

    expect(model).toBe(s);
    expect(formSchema).toBeUndefined();
    expect(options).toBe(opts);
  });

  it('should extract schema when 3 arguments are provided with trailing undefined', () => {
    const s = signal('hello');
    const schemaFn = () => {};
    const [model, formSchema, options] = normalizeFormArgs([s, schemaFn, undefined]);

    expect(model).toBe(s);
    expect(formSchema).toBe(schemaFn);
    expect(options).toBeUndefined();
  });

  it('should extract options when 3 arguments are provided with trailing undefined', () => {
    const s = signal('hello');
    const opts = {name: 'myForm'};
    const [model, formSchema, options] = normalizeFormArgs([s, opts, undefined]);

    expect(model).toBe(s);
    expect(formSchema).toBeUndefined();
    expect(options).toBe(opts);
  });

  it('should extract schema and options when 3 arguments are provided', () => {
    const s = signal('hello');
    const schemaFn = () => {};
    const opts = {name: 'myForm'};
    const [model, formSchema, options] = normalizeFormArgs([s, schemaFn, opts]);

    expect(model).toBe(s);
    expect(formSchema).toBe(schemaFn);
    expect(options).toBe(opts);
  });

  it('should extract options when 2nd argument is undefined and 3rd argument is options', () => {
    const s = signal('hello');
    const opts = {name: 'myForm'};
    const [model, formSchema, options] = normalizeFormArgs([s, undefined, opts]);

    expect(model).toBe(s);
    expect(formSchema).toBeUndefined();
    expect(options).toBe(opts);
  });
});
