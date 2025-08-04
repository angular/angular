/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, required, submit} from '../../public_api';
import {ValidationError} from '../../src/api/validation_errors';

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

    expect(f.first().errors()).toEqual([ValidationError.required()]);
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
      return Promise.resolve([
        ValidationError.custom({
          kind: 'lastName',
          field: form.last,
        }),
      ]);
    });

    expect(f.last().errors()).toEqual([ValidationError.custom({kind: 'lastName'})]);
  });

  it('maps errors to multiple fields', async () => {
    const data = signal({first: '', last: ''});
    const f = form(data, {injector: TestBed.inject(Injector)});

    await submit(f, (form) => {
      return Promise.resolve([
        ValidationError.custom({
          kind: 'firstName',
          field: form.first,
        }),
        ValidationError.custom({
          kind: 'lastName',
          field: form.last,
        }),
        ValidationError.custom({
          kind: 'lastName2',
          field: form.last,
        }),
      ]);
    });

    expect(f.first().errors()).toEqual([ValidationError.custom({kind: 'firstName'})]);
    expect(f.last().errors()).toEqual([
      ValidationError.custom({kind: 'lastName'}),
      ValidationError.custom({kind: 'lastName2'}),
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
      return Promise.resolve([ValidationError.custom()]);
    });

    expect(f().errors()).toEqual([ValidationError.custom()]);
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
      return Promise.resolve([ValidationError.custom({kind: 'lastName'})]);
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
        ValidationError.custom({kind: 'submit', field: f.first}),
        ValidationError.custom({kind: 'submit', field: f.last}),
      ];
    });

    expect(f.first().errors()).toEqual([ValidationError.custom({kind: 'submit'})]);
    expect(f.last().errors()).toEqual([ValidationError.custom({kind: 'submit'})]);

    f.first().value.set('Hello');

    expect(f.first().errors()).toEqual([]);
    expect(f.last().errors()).toEqual([ValidationError.custom({kind: 'submit'})]);
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
