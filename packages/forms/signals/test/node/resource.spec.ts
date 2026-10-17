/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {
  ApplicationRef,
  assertNotInReactiveContext,
  effect,
  Injector,
  resource,
  resourceFromSnapshots,
  ResourceSnapshot,
  signal,
  type Signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {isNode, timeout, useAutoTick, waitFor} from '@angular/private/testing';

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
  useAutoTick();

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
      const RES = createManagedMetadataKey((_state, params: Signal<{x: string} | undefined>) =>
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
        const RES = createManagedMetadataKey((_state, params: Signal<{x: string} | undefined>) =>
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
    const RES = createManagedMetadataKey((_state, params: Signal<string | undefined>) =>
      resource({params, loader: async () => 'hi'}),
    );

    const f = form(signal(''), {injector: TestBed.inject(Injector)});

    expect(f().metadata(RES)).toBe(undefined);
  });

  it('should support debounce in validateHttp', async () => {
    const usernameForm = form(
      signal('unique-user'),
      (p) => {
        validateHttp(p, {
          request: ({value}) => `/api/check?username=${value()}`,
          debounce: 50, // Short debounce
          onSuccess: (available: boolean) => (available ? undefined : {kind: 'username-taken'}),
          onError: () => null,
        });
      },
      {injector},
    );

    TestBed.tick();
    const req1 = backend.expectOne('/api/check?username=unique-user');
    req1.flush(true);
    await appRef.whenStable();
    expect(usernameForm().valid()).toBe(true);
    usernameForm().value.set('taken-user');
    TestBed.tick();

    // Should not have triggered a new request yet
    backend.expectNone('/api/check?username=taken-user');

    // Wait for debounce
    await timeout(80);
    TestBed.tick();
    const req2 = backend.expectOne('/api/check?username=taken-user');
    req2.flush(false);
    await appRef.whenStable();

    expect(usernameForm().valid()).toBe(false);
  });

  describe('validateAsync with debounce', () => {
    it('should allow effects and snapshots to read params while debounce is pending', async () => {
      const consumeParams = jasmine.createSpy('consumeParams');
      const {promise: debouncePromise, resolve: resolveDebounce} = Promise.withResolvers<void>();
      const model = signal('initial');
      const validationForm = form(
        model,
        (path) => {
          validateAsync(path, {
            params: ({value}) => value(),
            debounce: async () => debouncePromise,
            factory: (params) => {
              expect(params()).toBe('initial');
              effect(() => consumeParams(params()));
              return resourceFromSnapshots(() => ({status: 'resolved', value: params()}));
            },
            onSuccess: (value) => (value === 'updated' ? {kind: 'custom'} : undefined),
            onError: () => undefined,
          });
        },
        {injector},
      );

      await appRef.whenStable();
      expect(consumeParams).toHaveBeenCalledOnceWith('initial');
      expect(validationForm().valid()).toBe(true);

      model.set('intermediate');
      await appRef.whenStable();
      expect(consumeParams).toHaveBeenCalledOnceWith('initial');
      expect(validationForm().pending()).toBe(true);
      expect(validationForm().valid()).toBe(false);

      model.set('updated');
      await appRef.whenStable();
      expect(consumeParams).toHaveBeenCalledOnceWith('initial');

      resolveDebounce();
      await waitFor(() => {
        throwUnless(consumeParams).toHaveBeenCalledTimes(2);
      });
      await appRef.whenStable();

      expect(consumeParams.calls.allArgs()).toEqual([['initial'], ['updated']]);
      expect(validationForm().pending()).toBe(false);
      expect(validationForm().errors()).toEqual([{kind: 'custom', fieldTree: validationForm}]);
    });

    it('should propagate factory snapshots after debounce settles', async () => {
      const {promise: debouncePromise, resolve: resolveDebounce} = Promise.withResolvers<void>();
      const snapshot = signal<ResourceSnapshot<string | undefined>>({
        status: 'idle',
        value: undefined,
      });
      const validationForm = form(
        signal('initial'),
        (path) => {
          validateAsync(path, {
            params: ({value}) => value(),
            debounce: () => debouncePromise,
            factory: () => resourceFromSnapshots(snapshot),
            onSuccess: (value) => ({kind: value}),
            onError: () => ({kind: 'error'}),
          });
        },
        {injector},
      );

      await appRef.whenStable();
      expect(validationForm().valid()).toBe(true);

      snapshot.set({status: 'loading', value: undefined});
      await appRef.whenStable();
      expect(validationForm().pending()).toBe(true);

      snapshot.set({status: 'resolved', value: 'old'});
      await appRef.whenStable();
      expect(validationForm().errors()).toEqual([{kind: 'old', fieldTree: validationForm}]);

      validationForm().value.set('updated');
      await appRef.whenStable();
      expect(validationForm().pending()).toBe(true);
      expect(validationForm().errors()).toEqual([]);

      snapshot.set({status: 'error', error: new Error('stale request failed')});
      await appRef.whenStable();
      expect(validationForm().pending()).toBe(true);
      expect(validationForm().errors()).toEqual([]);

      resolveDebounce();
      await waitFor(() => {
        throwUnless(validationForm().pending()).toBe(false);
      });
      await appRef.whenStable();
      expect(validationForm().pending()).toBe(false);
      expect(validationForm().errors()).toEqual([{kind: 'error', fieldTree: validationForm}]);

      snapshot.set({status: 'reloading', value: 'old'});
      await appRef.whenStable();
      expect(validationForm().pending()).toBe(true);

      snapshot.set({status: 'local', value: 'new'});
      await appRef.whenStable();
      expect(validationForm().pending()).toBe(false);
      expect(validationForm().errors()).toEqual([{kind: 'new', fieldTree: validationForm}]);

      expect(() => validationForm().reloadValidation()).not.toThrow();
    });

    it('should report params errors without throwing in factory effects and recover', async () => {
      const {promise: debouncePromise, resolve: resolveDebounce} = Promise.withResolvers<void>();
      const error = new Error('params failed');
      const onError = jasmine.createSpy('onError').and.returnValue({kind: 'params'});
      const consumeParams = jasmine.createSpy('consumeParams');
      const validationForm = form(
        signal('initial'),
        (path) => {
          validateAsync(path, {
            params: ({value}) => {
              if (value() === 'error') {
                throw error;
              }
              return value();
            },
            debounce: () => debouncePromise,
            factory: (params) => {
              effect(() => consumeParams(params()));
              return resourceFromSnapshots(() => ({status: 'resolved', value: params()}));
            },
            onSuccess: () => undefined,
            onError,
          });
        },
        {injector},
      );

      await appRef.whenStable();
      expect(validationForm().valid()).toBe(true);

      validationForm().value.set('error');
      await appRef.whenStable();
      expect(validationForm().errors()).toEqual([{kind: 'params', fieldTree: validationForm}]);
      expect(onError.calls.mostRecent().args[0]).toBe(error);
      expect(consumeParams.calls.mostRecent().args).toEqual([undefined]);

      validationForm().value.set('recovered');
      await appRef.whenStable();
      resolveDebounce();
      await waitFor(() => {
        throwUnless(consumeParams.calls.mostRecent().args).toEqual(['recovered']);
      });
      await appRef.whenStable();
      expect(validationForm().valid()).toBe(true);
      expect(consumeParams.calls.mostRecent().args).toEqual(['recovered']);
    });

    it('should reload the factory resource only after debounce settles', async () => {
      const {promise: debouncePromise, resolve: resolveDebounce} = Promise.withResolvers<void>();
      const loader = jasmine
        .createSpy('loader')
        .and.callFake(async ({params}: {params: string}) => params);
      const validationForm = form(
        signal('initial'),
        (path) => {
          validateAsync(path, {
            params: ({value}) => value(),
            debounce: () => debouncePromise,
            factory: (params) => resource({params, loader}),
            onSuccess: () => undefined,
            onError: () => undefined,
          });
        },
        {injector},
      );

      await appRef.whenStable();
      expect(validationForm().valid()).toBe(true);
      expect(loader).toHaveBeenCalledTimes(1);

      validationForm().reloadValidation();
      await appRef.whenStable();
      expect(loader).toHaveBeenCalledTimes(2);

      validationForm().value.set('updated');
      await appRef.whenStable();
      validationForm().reloadValidation();
      await appRef.whenStable();
      expect(loader).toHaveBeenCalledTimes(2);
      expect(validationForm().pending()).toBe(true);

      resolveDebounce();
      await waitFor(() => {
        throwUnless(loader).toHaveBeenCalledTimes(3);
      });
      await appRef.whenStable();
      expect(loader).toHaveBeenCalledTimes(3);
      expect(loader.calls.mostRecent().args[0].params).toBe('updated');
      expect(validationForm().valid()).toBe(true);
    });
  });

  describe('reloadValidation', () => {
    it('should trigger a reload of async http validation', async () => {
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

      expect(usernameForm().pending()).toBe(true);

      req1.flush(true);
      await appRef.whenStable();

      expect(usernameForm().valid()).toBe(true);
      expect(usernameForm().pending()).toBe(false);

      // Trigger reload
      usernameForm().reloadValidation();

      // Expect a new request to be made even though the value hasn't changed
      TestBed.tick();
      const req2 = backend.expectOne('/api/check?username=unique-user');

      expect(usernameForm().pending()).toBe(true);
      expect(usernameForm().valid()).toBe(false);

      req2.flush(false);
      await appRef.whenStable();

      expect(usernameForm().invalid()).toBe(true);
      expect(usernameForm().pending()).toBe(false);
    });
  });

  it('should allow accessing basic field state properties during creation without reading them', () => {
    let success = false;

    const RES = createManagedMetadataKey((state, _params: Signal<string | undefined>) => {
      // We shouldn't be captured in the reactive context of node creation here.
      assertNotInReactiveContext(createManagedMetadataKey);

      state.value();
      state.disabled();

      success = true;
    });

    form(
      signal(''),
      (p) => {
        metadata(p, RES, () => 'trigger');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(success).toBeTrue();
  });

  it('should not throw NG0992 when using validateAsync on parent and lazily-created child', () => {
    const model = signal({child: ''});
    const injector = TestBed.inject(Injector);
    function createForm() {
      form(
        model,
        (p) => {
          validateAsync(p, {
            params: () => 1,
            factory: () => resource({loader: async () => []}),
            onSuccess: () => null,
            onError: () => null,
          });

          validateAsync(p.child, {
            params: () => 1,
            factory: () => resource({loader: async () => []}),
            onSuccess: () => null,
            onError: () => null,
          });
        },
        {injector},
      );
    }

    expect(() => createForm()).not.toThrow();
  });
});
