/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FieldContext, FieldPath, form, validate} from '@angular/forms/experimental';
import {signal, WritableSignal} from '@angular/core';
import {TestBed} from '@angular/core/testing';

function testContext<T>(
  s: WritableSignal<T>,
  callback: (ctx: FieldContext<T>, p: FieldPath<T>) => void,
) {
  const isCalled = jasmine.createSpy();

  TestBed.runInInjectionContext(() => {
    const f = form(s, (p) => {
      validate(p, (ctx) => {
        callback(ctx, p);
        isCalled();
        return undefined;
      });
    });

    f.$state.errors();
  });

  expect(isCalled).toHaveBeenCalled();
}

describe('Field Context', () => {
  it('value', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    testContext(cat, (ctx) => {
      expect(ctx.value().name).toEqual('pirojok-the-cat');
    });
  });

  it('state', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    testContext(cat, (ctx) => {
      expect(ctx.state.value().name).toEqual('pirojok-the-cat');
    });
  });

  it('field', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    testContext(cat, (ctx) => {
      expect(ctx.field.name.$state.value()).toEqual('pirojok-the-cat');
      expect(ctx.field.age.$state.value()).toEqual(5);
    });
  });

  it('valueOf', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    testContext(cat, (ctx, p) => {
      expect(ctx.valueOf(p.name)).toEqual('pirojok-the-cat');
      expect(ctx.valueOf(p.age)).toEqual(5);
    });
  });

  it('stateOf', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    testContext(cat, (ctx, p) => {
      expect(ctx.stateOf(p.name).value()).toEqual('pirojok-the-cat');
      expect(ctx.stateOf(p.age).value()).toEqual(5);
    });
  });

  it('fieldOf', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    testContext(cat, (ctx, p) => {
      expect(ctx.fieldOf(p.name).$state.value()).toEqual('pirojok-the-cat');
      expect(ctx.fieldOf(p.age).$state.value()).toEqual(5);
    });
  });
});
