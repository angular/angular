/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injector, signal, WritableSignal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {applyEach, FieldContext, FieldPath, form, validate} from '../public_api';

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

    f().errors();
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
      expect(ctx.field.name().value()).toEqual('pirojok-the-cat');
      expect(ctx.field.age().value()).toEqual(5);
    });
  });

  it('key', () => {
    const keys: string[] = [];
    const recordKey = ({key}: FieldContext<unknown>) => {
      try {
        keys.push(key());
      } catch (e) {
        keys.push((e as Error).message);
      }
      return undefined;
    };
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        validate(p, recordKey);
        validate(p.name, recordKey);
        validate(p.age, recordKey);
      },
      {injector: TestBed.inject(Injector)},
    );
    f().valid();
    expect(keys).toEqual([
      'RuntimeError: the top-level field in the form has no parent',
      'name',
      'age',
    ]);
  });

  it('index', () => {
    const indices: (string | number)[] = [];
    const recordIndex = ({index}: FieldContext<unknown>) => {
      try {
        indices.push(index());
      } catch (e) {
        indices.push((e as Error).message);
      }
      return undefined;
    };
    const pets = signal({
      cats: [
        {name: 'pirojok-the-cat', age: 5},
        {name: 'mielo', age: 10},
      ],
      owner: 'joe',
    });
    const f = form(
      pets,
      (p) => {
        validate(p, recordIndex);
        applyEach(p.cats, (cat) => {
          validate(cat, recordIndex);
        });
        validate(p.owner, recordIndex);
      },
      {injector: TestBed.inject(Injector)},
    );
    f().valid();
    expect(indices).toEqual([
      'RuntimeError: the top-level field in the form has no parent',
      0,
      1,
      'RuntimeError: cannot access index, parent field is not an array',
    ]);
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
      expect(ctx.fieldOf(p.name)().value()).toEqual('pirojok-the-cat');
      expect(ctx.fieldOf(p.age)().value()).toEqual(5);
    });
  });
});
