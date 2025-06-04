/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {ApplicationRef, Injector, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {isNode} from '@angular/private/testing';
import {validateAsync, validateHttp} from '../src/api/async';
import {define} from '../src/api/data';
import {validate} from '../src/api/logic';
import {applyEach, form} from '../src/api/structure';
import {SchemaOrSchemaFn} from '../src/api/types';

interface Cat {
  name: string;
}

describe('resources', () => {
  let appRef: ApplicationRef;
  let backend: HttpTestingController;
  let injector: Injector;

  beforeEach(() => {
    globalThis['ngServerMode'] = isNode;
  });

  afterEach(() => {
    globalThis['ngServerMode'] = undefined;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting()]});
    appRef = TestBed.inject(ApplicationRef);
    backend = TestBed.inject(HttpTestingController);
    injector = TestBed.inject(Injector);
  });

  it('Takes a simple resource which reacts to data changes', async () => {
    const s: SchemaOrSchemaFn<Cat> = function (p) {
      const res = define(p.name, ({value}) => {
        return resource({
          request: () => ({x: value()}),
          loader: async ({request}) => `got: ${request.x}`,
        });
      });

      validate(p.name, ({state}) => {
        const remote = state.data(res)!;
        if (remote.hasValue()) {
          return {kind: 'whatever', message: remote.value()!.toString()};
        } else {
          return undefined;
        }
      });
    };

    const cat = signal({name: 'cat'});

    const f = form(cat, s, {injector});

    await appRef.whenStable();
    expect(f.name().errors()).toEqual([{kind: 'whatever', message: 'got: cat'}]);

    f.name().value.set('dog');
    await appRef.whenStable();
    expect(f.name().errors()).toEqual([{kind: 'whatever', message: 'got: dog'}]);
  });

  it('should create a resource per entry in an array', async () => {
    const s: SchemaOrSchemaFn<Cat[]> = function (p) {
      applyEach(p, (p) => {
        const res = define(p.name, ({value}) => {
          return resource({
            request: () => ({x: value()}),
            loader: async ({request}) => `got: ${request.x}`,
          });
        });

        validate(p.name, ({state}) => {
          const remote = state.data(res)!;
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

    await appRef.whenStable();
    expect(f[0].name().errors()).toEqual([{kind: 'whatever', message: 'got: cat'}]);
    expect(f[1].name().errors()).toEqual([{kind: 'whatever', message: 'got: dog'}]);

    f[0].name().value.set('bunny');
    await appRef.whenStable();
    expect(f[0].name().errors()).toEqual([{kind: 'whatever', message: 'got: bunny'}]);
    expect(f[1].name().errors()).toEqual([{kind: 'whatever', message: 'got: dog'}]);
  });

  it('should support tree validation for resources', async () => {
    const s: SchemaOrSchemaFn<Cat[]> = function (p) {
      validateAsync(p, {
        request: ({value}) => value(),
        factory: (request) =>
          resource({
            request,
            loader: async ({request}) => {
              return request as Cat[];
            },
          }),
        errors: (cats, {fieldOf}) => {
          return cats.map((cat, index) => ({
            kind: 'meows_too_much',
            name: cat.name,
            field: fieldOf(p)[index],
          }));
        },
      });
    };

    const cats = signal([{name: 'Fluffy'}, {name: 'Ziggy'}]);
    const f = form(cats, s, {injector});

    await appRef.whenStable();
    expect(f[0]().errors()).toEqual([
      jasmine.objectContaining({kind: 'meows_too_much', name: 'Fluffy'}),
    ]);
    expect(f[1]().errors()).toEqual([
      jasmine.objectContaining({kind: 'meows_too_much', name: 'Ziggy'}),
    ]);
  });

  it('should support tree validation for resources', async () => {
    const s: SchemaOrSchemaFn<Cat[]> = function (p) {
      validateAsync(p, {
        request: ({value}) => value(),
        factory: (request) =>
          resource({
            request,
            loader: async ({request}) => {
              return request as Cat[];
            },
          }),
        errors: (cats, {fieldOf}) => {
          return {kind: 'meows_too_much', name: cats[0].name, field: fieldOf(p)[0]};
        },
      });
    };

    const cats = signal([{name: 'Fluffy'}, {name: 'Ziggy'}]);
    const f = form(cats, s, {injector});

    await appRef.whenStable();
    expect(f[0]().errors()).toEqual([
      jasmine.objectContaining({kind: 'meows_too_much', name: 'Fluffy'}),
    ]);
    expect(f[1]().errors()).toEqual([]);
  });

  it('should support shorthand http validation', async () => {
    const usernameForm = form(
      signal('unique-user'),
      (p) => {
        validateHttp(p, {
          request: ({value}) => `/api/check?username=${value()}`,
          errors: (available: boolean) => (available ? undefined : {kind: 'username-taken'}),
        });
      },
      {injector},
    );

    TestBed.tick();
    const req1 = backend.expectOne('/api/check?username=unique-user');

    expect(usernameForm().valid()).toBe(false);
    expect(usernameForm().invalid()).toBe(false);
    expect(usernameForm().pending()).toBe(true);

    req1.flush(true);
    await appRef.whenStable();

    expect(usernameForm().valid()).toBe(true);
    expect(usernameForm().invalid()).toBe(false);
    expect(usernameForm().pending()).toBe(false);
    expect(true).toBe(true);

    usernameForm().value.set('taken-user');
    TestBed.tick();
    const req2 = backend.expectOne('/api/check?username=taken-user');

    expect(usernameForm().valid()).toBe(false);
    expect(usernameForm().invalid()).toBe(false);
    expect(usernameForm().pending()).toBe(true);

    req2.flush(false);
    await appRef.whenStable();

    expect(usernameForm().valid()).toBe(false);
    expect(usernameForm().invalid()).toBe(true);
    expect(usernameForm().pending()).toBe(false);
  });
});
