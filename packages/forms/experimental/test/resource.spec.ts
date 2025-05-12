import {resource, signal, ApplicationRef, Injector, inject, DestroyRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {define} from '../src/api/data';
import {applyEach, form} from '../src/api/structure';
import {Schema} from '../src/api/types';
import {validate} from '../src/api/logic';
import {validateAsync} from '../src/api/async';

interface Cat {
  name: string;
}

describe('resources', () => {
  it('Takes a simple resource which reacts to data changes', async () => {
    const injector = TestBed.inject(Injector);

    const s: Schema<Cat> = function (p) {
      const res = define(p.name, ({value}) => {
        return resource({
          request: () => ({x: value()}),
          loader: async ({request}) => `got: ${request.x}`,
        });
      });

      validate(p.name, ({data}) => {
        const remote = data(res);
        if (remote.hasValue()) {
          return {kind: 'whatever', message: remote.value()!.toString()};
        } else {
          return undefined;
        }
      });
    };

    const cat = signal({name: 'cat'});

    const f = form(cat, s, {injector});

    await TestBed.inject(ApplicationRef).whenStable();
    expect(f.name.$state.errors()).toEqual([{kind: 'whatever', message: 'got: cat'}]);

    f.name.$state.value.set('dog');
    await TestBed.inject(ApplicationRef).whenStable();
    expect(f.name.$state.errors()).toEqual([{kind: 'whatever', message: 'got: dog'}]);
  });

  it('should create a resource per entry in an array', async () => {
    const injector = TestBed.inject(Injector);

    const s: Schema<Cat[]> = function (p) {
      applyEach(p, (p) => {
        const res = define(p.name, ({value}) => {
          return resource({
            request: () => ({x: value()}),
            loader: async ({request}) => `got: ${request.x}`,
          });
        });

        validate(p.name, ({data}) => {
          const remote = data(res);
          if (remote.hasValue()) {
            return {kind: 'whatever', message: remote.value()!.toString()};
          } else {
            return undefined;
          }
        });
      });
    };

    const cat = signal([{name: 'cat'}, {name: 'dog'}]);

    const f = form(cat, s, {injector});

    await TestBed.inject(ApplicationRef).whenStable();
    expect(f[0].name.$state.errors()).toEqual([{kind: 'whatever', message: 'got: cat'}]);
    expect(f[1].name.$state.errors()).toEqual([{kind: 'whatever', message: 'got: dog'}]);

    f[0].name.$state.value.set('bunny');
    await TestBed.inject(ApplicationRef).whenStable();
    expect(f[0].name.$state.errors()).toEqual([{kind: 'whatever', message: 'got: bunny'}]);
    expect(f[1].name.$state.errors()).toEqual([{kind: 'whatever', message: 'got: dog'}]);
  });

  it('should support tree validation for resources', async () => {
    const injector = TestBed.inject(Injector);

    const s: Schema<Cat[]> = function (p) {
      validateAsync(p, {
        request: ({value}) => value(),
        factory: (request) =>
          resource({
            request,
            loader: async ({request}) => {
              return request as Cat[];
            },
          }),
        error: (cats, {resolve}) => {
          return cats.map((cat, index) => ({
            kind: 'meows_too_much',
            name: cat.name,
            field: resolve(p)[index],
          }));
        },
      });
    };

    const cats = signal([{name: 'Fluffy'}, {name: 'Ziggy'}]);
    const f = form(cats, s, {injector});

    await TestBed.inject(ApplicationRef).whenStable();
    expect(f[0].$state.errors()).toEqual([
      jasmine.objectContaining({kind: 'meows_too_much', name: 'Fluffy'}),
    ]);
    expect(f[1].$state.errors()).toEqual([
      jasmine.objectContaining({kind: 'meows_too_much', name: 'Ziggy'}),
    ]);
  });

  it('should support tree validation for resources', async () => {
    const injector = TestBed.inject(Injector);

    const s: Schema<Cat[]> = function (p) {
      validateAsync(p, {
        request: ({value}) => value(),
        factory: (request) =>
          resource({
            request,
            loader: async ({request}) => {
              return request as Cat[];
            },
          }),
        error: (cats, {resolve}) => {
          return {kind: 'meows_too_much', name: cats[0].name, field: resolve(p)[0]};
        },
      });
    };

    const cats = signal([{name: 'Fluffy'}, {name: 'Ziggy'}]);
    const f = form(cats, s, {injector});

    await TestBed.inject(ApplicationRef).whenStable();
    expect(f[0].$state.errors()).toEqual([
      jasmine.objectContaining({kind: 'meows_too_much', name: 'Fluffy'}),
    ]);
    expect(f[1].$state.errors()).toEqual([]);
  });
});
