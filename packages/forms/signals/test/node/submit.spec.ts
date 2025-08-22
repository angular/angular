/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  customError,
  form,
  required,
  requiredError,
  submit,
  validateAsync,
  ValidationError,
} from '../../public_api';

describe('submit', () => {
  it('fails fast on invalid form', async () => {
    const data = signal({first: '', last: ''});
    const f = form(
      data,
      (name) => {
        required(name.first);
      },
      {injector: TestBed.inject(Injector)},
    );

    await submit(f, async (form) => {
      fail('Submit action should run not on invalid form');
    });

    expect(f.first().errors()).toEqual([requiredError({field: f.first})]);
  });

  it('should not block on pending async validators', async () => {
    const data = signal('');
    const resolvers = promiseWithResolvers();
    const f = form(
      data,
      (p) => {
        validateAsync(p, {
          params: ({value}) => value(),
          factory: (params) =>
            resource({
              params,
              loader: () => resolvers.promise,
            }),
          errors: () => {},
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().pending()).toBe(true);

    const submitSpy = jasmine.createSpy();
    await submit(f, submitSpy);

    expect(f().pending()).toBe(true);
    expect(submitSpy).toHaveBeenCalled();
  });

  it('maps error to a field', async () => {
    const data = signal({first: '', last: ''});
    const f = form(
      data,
      (name) => {
        // first name required if last name specified
        required(name.first, {when: ({valueOf}) => valueOf(name.last) !== ''});
      },
      {injector: TestBed.inject(Injector)},
    );

    await submit(f, (form) => {
      return Promise.resolve(
        customError({
          kind: 'lastName',
          field: form.last,
        }),
      );
    });

    expect(f.last().errors()).toEqual([customError({kind: 'lastName', field: f.last})]);
  });

  it('maps errors to multiple fields', async () => {
    const data = signal({first: '', last: ''});
    const f = form(data, {injector: TestBed.inject(Injector)});

    await submit(f, (form) => {
      return Promise.resolve([
        customError({
          kind: 'firstName',
          field: form.first,
        }),
        customError({
          kind: 'lastName',
          field: form.last,
        }),
        customError({
          kind: 'lastName2',
          field: form.last,
        }),
      ]);
    });

    expect(f.first().errors()).toEqual([customError({kind: 'firstName', field: f.first})]);
    expect(f.last().errors()).toEqual([
      customError({kind: 'lastName', field: f.last}),
      customError({kind: 'lastName2', field: f.last}),
    ]);
  });

  it('can read value from field state', async () => {
    const initialValue = {first: 'meow', last: 'wuf'};
    const data = signal(initialValue);
    const f = form(
      data,
      (name) => {
        // first name required if last name specified
        required(name.first, {when: ({valueOf}) => valueOf(name.last) !== ''});
      },
      {injector: TestBed.inject(Injector)},
    );

    const submitSpy = jasmine.createSpy('submit');

    await submit(f, (form) => {
      submitSpy(form().value());
      return Promise.resolve();
    });

    expect(submitSpy).toHaveBeenCalledWith(initialValue);
  });

  it('maps untargeted errors to form root', async () => {
    const data = signal({first: '', last: ''});
    const f = form(
      data,
      (name) => {
        // first name required if last name specified
        required(name.first, {when: ({valueOf}) => valueOf(name.last) !== ''});
      },
      {injector: TestBed.inject(Injector)},
    );

    await submit(f, () => {
      return Promise.resolve(customError());
    });

    expect(f().errors()).toEqual([customError({field: f})]);
  });

  it('marks the form as submitting', async () => {
    const initialValue = {first: 'meow', last: 'wuf'};
    const data = signal(initialValue);
    const f = form(
      data,
      (name) => {
        // first name required if last name specified
        required(name.first, {when: ({valueOf}) => valueOf(name.last) !== ''});
      },
      {injector: TestBed.inject(Injector)},
    );
    expect(f().submitting()).toBe(false);

    const {promise, resolve} = promiseWithResolvers<ValidationError[]>();
    const result = submit(f, () => promise);
    expect(f().submitting()).toBe(true);

    resolve([]);
    await result;
  });

  it('marks descendants as submitting', async () => {
    const initialValue = {a: {b: 12}};
    const data = signal(initialValue);
    const f = form(data, {injector: TestBed.inject(Injector)});
    expect(f.a.b().submitting()).toBe(false);

    const {promise, resolve} = promiseWithResolvers<ValidationError[]>();
    const result = submit(f, () => promise);
    expect(f.a.b().submitting()).toBe(true);

    resolve([]);
    await result;
  });

  it('marks the form as touched', async () => {
    const initialValue = {first: 'meow', last: 'wuf'};
    const data = signal(initialValue);
    const f = form(data, {injector: TestBed.inject(Injector)});

    expect(f().touched()).toBe(false);

    await submit(f, async () => []);

    expect(f().touched()).toBe(true);
  });

  it('marks descendants as touched', async () => {
    const initialValue = {a: {b: 12}};
    const data = signal(initialValue);
    const f = form(data, {injector: TestBed.inject(Injector)});

    expect(f.a.b().touched()).toBe(false);

    await submit(f, async () => []);

    expect(f.a.b().touched()).toBe(true);
  });

  it('works on child fields', async () => {
    const initialValue = {first: 'meow', last: 'wuf'};
    const data = signal(initialValue);
    const f = form(
      data,
      (name) => {
        // first name required if last name specified
        required(name.first, {
          when: ({valueOf}) => valueOf(name.last) !== '',
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    const submitSpy = jasmine.createSpy('submit');

    await submit(f.first, (form) => {
      submitSpy(form().value());
      return Promise.resolve(customError({kind: 'lastName'}));
    });

    expect(submitSpy).toHaveBeenCalledWith('meow');
  });

  it('recovers from errors thrown by submit action', async () => {
    const f = form(signal(0), {injector: TestBed.inject(Injector)});
    expect(f().submitting()).toBe(false);

    const {promise, reject} = promiseWithResolvers<ValidationError[]>();
    const submitPromise = submit(f, () => promise);
    expect(f().submitting()).toBe(true);

    const error = new Error('submit failed');
    reject(error);
    await expectAsync(submitPromise).toBeRejectedWith(error);
    expect(f().submitting()).toBe(false);
  });

  it('errors are cleared on edit', async () => {
    const data = signal({first: '', last: ''});
    const f = form(data, {injector: TestBed.inject(Injector)});

    await submit(f, async (form) => {
      return [
        customError({kind: 'submit', field: f.first}),
        customError({kind: 'submit', field: f.last}),
      ];
    });

    expect(f.first().errors()).toEqual([customError({kind: 'submit', field: f.first})]);
    expect(f.last().errors()).toEqual([customError({kind: 'submit', field: f.last})]);

    f.first().value.set('Hello');

    expect(f.first().errors()).toEqual([]);
    expect(f.last().errors()).toEqual([customError({kind: 'submit', field: f.last})]);
  });
});

/**
 * Replace with `Promise.withResolvers()` once it's available.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers.
 */
function promiseWithResolvers<T>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
} {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {promise, resolve, reject};
}
