import {
  ApplicationRef,
  Injector,
  Resource,
  resource,
  ResourceStatus,
  runInInjectionContext,
  signal,
} from '@angular/core';
import {
  Schema,
  FieldPath,
  FieldContext,
  validate,
  ProtoResource,
  ResourceContructor,
  form,
} from '../../public_api';
import {TestBed} from '@angular/core/testing';
import {FieldPathNode} from '../../src/path_node';
import {declare} from '../../src/field_node';

interface Cat {
  name: string;
}

/**
 * Where can we have declare resource?
 * - In a form
 * - In a schema?
 *
 * When we create resources?
 * - When we create a form
 * - When we add an array item with async validation
 * When we destroy resources?
 * - When we remove an array item
 * - When we destroy the form
 */

// TODO(subschemas):
describe('Resource', () => {
  it('Takes a simple resource which reacts to data changes', async () => {
    const s: Schema<Cat> = function (p) {
      const res = declare(p, ({value}) => {
        return resource({
          request: () => ({x: value().name}),
          loader: async ({request}) => `got: ${request.x}`,
        });
      });

      validate(p.name, ({resolveData}) => {
        return {kind: 'whatever', message: resolveData(res).value()!.toString()};
      });
    };

    const cat = signal({name: 'cat'});

    const f = TestBed.runInInjectionContext(() => {
      return form(cat, s);
    });

    await TestBed.inject(ApplicationRef).whenStable();
    expect(f.name.$state.errors()).toEqual([{kind: 'whatever', message: 'got: cat'}]);

    f.name.$state.value.set('dog');
    await TestBed.inject(ApplicationRef).whenStable();
    expect(f.name.$state.errors()).toEqual([{kind: 'whatever', message: 'got: dog'}]);
  });

  it('Allows to use resolve', async () => {
    const s: Schema<Cat> = function (p) {
      const res = declare(p, ({resolve}) => {
        return resource({
          request: () => ({x: resolve(p.name).$state.value()}),
          loader: async ({request}) => `got: ${request.x}`,
        });
      });

      validate(p.name, ({resolveData}) => {
        return {kind: 'whatever', message: resolveData(res).value()!.toString()};
      });
    };

    const cat = signal({name: 'cat'});

    const f = TestBed.runInInjectionContext(() => {
      return form(cat, s);
    });

    await TestBed.inject(ApplicationRef).whenStable();
    expect(f.name.$state.errors()).toEqual([{kind: 'whatever', message: 'got: cat'}]);

    f.name.$state.value.set('dog');
    await TestBed.inject(ApplicationRef).whenStable();
    expect(f.name.$state.errors()).toEqual([{kind: 'whatever', message: 'got: dog'}]);
  });
});

/**
validateAsync(validationFn,) {
  declare()
  validate(() => {
    ...
    validationFn();
  })
}
**/
