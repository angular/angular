/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {ApplicationRef, Injector, resource, signal, type Signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {isNode} from '@angular/private/testing';

import {
  applyEach,
  applyWhen,
  createManagedMetadataKey,
  form,
  metadata,
  required,
  schema,
  SchemaOrSchemaFn,
  validate,
  validateAsync,
  validateHttp,
} from '../../public_api';

interface Cat {
  name: string;
}

interface Address {
  street: string;
  city: string;
  zip: string;
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
      const RES = createManagedMetadataKey((params: Signal<{x: string} | undefined>) =>
        resource({
          params,
          loader: async ({params}) => `got: ${params.x}`,
        }),
      );
      metadata(p.name, RES, ({value}) => ({x: value()}));

      validate(p.name, ({state}) => {
        const remote = state.metadata(RES)!;
        if (remote.hasValue()) {
          return {message: remote.value(), kind: 'custom'};
        } else {
          return undefined;
        }
      });
    };

    const cat = signal({name: 'cat'});

    const f = form(cat, s, {injector});

    await appRef.whenStable();
    expect(f.name().errors()).toEqual([
      {
        message: 'got: cat',
        fieldTree: f.name,
        kind: 'custom',
      },
    ]);

    f.name().value.set('dog');
    await appRef.whenStable();
    expect(f.name().errors()).toEqual([
      {
        message: 'got: dog',
        fieldTree: f.name,
        kind: 'custom',
      },
    ]);
  });

  it('should create a resource per entry in an array', async () => {
    const s: SchemaOrSchemaFn<Cat[]> = function (p) {
      applyEach(p, (p) => {
        const RES = createManagedMetadataKey((params: Signal<{x: string} | undefined>) =>
          resource({
            params,
            loader: async ({params}) => `got: ${params.x}`,
          }),
        );
        metadata(p.name, RES, ({value}) => ({x: value()}));

        validate(p.name, ({state}) => {
          const remote = state.metadata(RES)!;
          if (remote.hasValue()) {
            return {message: remote.value(), kind: 'custom'};
          } else {
            return undefined;
          }
        });
      });
    };

    const cat = signal([{name: 'cat'}, {name: 'dog'}]);

    const f = form(cat, s, {injector});

    await appRef.whenStable();
    expect(f[0].name().errors()).toEqual([
      {
        message: 'got: cat',
        fieldTree: f[0].name,
        kind: 'custom',
      },
    ]);
    expect(f[1].name().errors()).toEqual([
      {
        message: 'got: dog',
        fieldTree: f[1].name,
        kind: 'custom',
      },
    ]);

    f[0].name().value.set('bunny');
    await appRef.whenStable();
    expect(f[0].name().errors()).toEqual([
      {
        message: 'got: bunny',
        fieldTree: f[0].name,
        kind: 'custom',
      },
    ]);
    expect(f[1].name().errors()).toEqual([
      {
        message: 'got: dog',
        fieldTree: f[1].name,
        kind: 'custom',
      },
    ]);
  });

  it('should support tree validation for resources (multiple errors)', async () => {
    const s: SchemaOrSchemaFn<Cat[]> = function (p) {
      validateAsync(p, {
        params: ({value}) => value(),
        factory: (params) =>
          resource({
            params,
            loader: async ({params}) => {
              return params as Cat[];
            },
          }),
        onSuccess: (cats, {fieldTreeOf}) => {
          return cats.map((cat, index) => ({
            kind: 'meows_too_much',
            name: cat.name,
            fieldTree: fieldTreeOf(p)[index],
          }));
        },
        onError: () => null,
      });
    };

    const cats = signal([{name: 'Fluffy'}, {name: 'Ziggy'}]);
    const f = form(cats, s, {injector});

    await appRef.whenStable();
    expect(f[0]().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'meows_too_much',
        name: 'Fluffy',
        fieldTree: f[0],
      }),
    ]);
    expect(f[1]().errors()).toEqual([
      jasmine.objectContaining({kind: 'meows_too_much', name: 'Ziggy', fieldTree: f[1]}),
    ]);
  });

  it('should support tree validation for resources', async () => {
    const s: SchemaOrSchemaFn<Cat[]> = function (p) {
      validateAsync(p, {
        params: ({value}) => value(),
        factory: (params) =>
          resource({
            params,
            loader: async ({params}) => {
              return params as Cat[];
            },
          }),
        onSuccess: (cats, {fieldTreeOf}) => {
          return {
            kind: 'meows_too_much',
            name: cats[0].name,
            fieldTree: fieldTreeOf(p)[0],
          };
        },
        onError: () => null,
      });
    };

    const cats = signal([{name: 'Fluffy'}, {name: 'Ziggy'}]);
    const f = form(cats, s, {injector});

    await appRef.whenStable();
    expect(f[0]().errors()).toEqual([
      {kind: 'meows_too_much', name: 'Fluffy', fieldTree: f[0]} as any,
    ]);
    expect(f[1]().errors()).toEqual([]);
  });

  it('should support shorthand http validation', async () => {
    const usernameForm = form(
      signal('unique-user'),
      (p) => {
        validateHttp(p, {
          request: ({value}) => `/api/check?username=${value()}`,
          onSuccess: (available: boolean) => (available ? undefined : {kind: 'username-taken'}),
          onError: () => null,
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

  it('should only run async validation when synchronously valid', async () => {
    const addressModel = signal<Address>({street: '', city: '', zip: ''});
    const addressSchema = schema<Address>((address) => {
      required(address.street);
      validateHttp(address, {
        request: ({value}) => ({url: '/checkaddress', params: {...value()}}),
        onSuccess: (message: string, {fieldTreeOf}) => ({
          message,
          fieldTree: fieldTreeOf(address.street),
          kind: '',
        }),
        onError: () => null,
      });
    });
    const addressForm = form(addressModel, addressSchema, {injector});

    TestBed.tick();
    backend.expectNone(() => true);

    addressForm.street().value.set('123 Main St');

    TestBed.tick();
    const req = backend.expectOne('/checkaddress?street=123%20Main%20St&city=&zip=');
    req.flush('Invalid!');
    await appRef.whenStable();

    expect(addressForm.street().errors()).toEqual([
      {message: 'Invalid!', fieldTree: addressForm.street, kind: ''},
    ]);
  });

  it('should call onError handler when http validation fails', async () => {
    const addressModel = signal<Address>({street: '123 Main St', city: '', zip: ''});
    const addressSchema = schema<Address>((address) => {
      required(address.street);
      validateHttp(address, {
        request: ({value}) => ({url: '/checkaddress', params: {...value()}}),
        onSuccess: () => undefined,
        onError: () => [
          {kind: 'address-api-failed', message: 'API is down', fieldTree: addressForm},
        ],
      });
    });

    const addressForm = form(addressModel, addressSchema, {injector});
    TestBed.tick();

    const req = backend.expectOne('/checkaddress?street=123%20Main%20St&city=&zip=');
    req.flush(null, {status: 500, statusText: 'Server Error'});

    await appRef.whenStable();

    expect(addressForm().pending()).toBe(false);
    expect(addressForm().invalid()).toBe(true);
    expect(addressForm().errors()).toEqual([
      {
        kind: 'address-api-failed',
        message: 'API is down',
        fieldTree: addressForm,
      },
    ]);
  });

  it('should allow double application of async validation schema with mutually exclusive predicate', async () => {
    const toggle = signal(true);
    const s = schema((p) => {
      validateHttp(p, {
        request: ({value}) => `/api/check?username=${value()}`,
        onSuccess: (available: boolean) => (available ? undefined : {kind: 'username-taken'}),
        onError: () => null,
      });
    });
    const usernameForm = form(
      signal('unique-user'),
      (p) => {
        applyWhen(p, () => toggle(), s);
        applyWhen(p, () => !toggle(), s);
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

    toggle.update((v) => !v);

    // Toggling doesn't actually change the parameters, so we don't got back to pending.
    expect(usernameForm().pending()).toBe(false);

    TestBed.tick();
    backend.expectNone('/api/check?username=unique-user');

    usernameForm().value.set('new-user');

    // Now that we've changed the parameters, go back to pending.
    expect(usernameForm().pending()).toBe(true);

    TestBed.tick();
    const req3 = backend.expectOne('/api/check?username=new-user');
    req3.flush(true);
    await appRef.whenStable();
  });

  it('should not allow accessing resource metadata on a field that does not define its params', () => {
    const RES = createManagedMetadataKey((params: Signal<string | undefined>) =>
      resource({params, loader: async () => 'hi'}),
    );

    const f = form(signal(''), {injector: TestBed.inject(Injector)});

    expect(f().metadata(RES)).toBe(undefined);
  });
});
