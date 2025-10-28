/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {apply, form, required, schema} from '@angular/forms/signals';

describe('structure APIs', () => {
  describe('apply', () => {
    it('should maintain order when applying to child of root path', () => {
      const s = schema<{a: string}>((p) => {
        required(p.a, {message: 'before'});
        apply(p.a, (prop) => {
          required(prop, {message: 'apply'});
        });
        required(p.a, {message: 'after'});
      });

      const data = signal({a: ''});
      const f = form(data, s, {injector: TestBed.inject(Injector)});

      expect(f.a().errors()).toEqual([
        jasmine.objectContaining({message: 'before'}),
        jasmine.objectContaining({message: 'apply'}),
        jasmine.objectContaining({message: 'after'}),
      ]);
    });

    it('should maintain order when applying to root path', () => {
      const s = schema<{a: {b: string}}>((p) => {
        required(p.a.b, {message: 'before'});
        apply(p, (prop) => {
          required(prop.a.b, {message: 'apply'});
        });
        required(p.a.b, {message: 'after'});
      });

      const data = signal({a: {b: ''}});
      const f = form(data, s, {injector: TestBed.inject(Injector)});

      expect(f.a.b().errors()).toEqual([
        jasmine.objectContaining({message: 'before'}),
        jasmine.objectContaining({message: 'apply'}),
        jasmine.objectContaining({message: 'after'}),
      ]);
    });
  });
});
