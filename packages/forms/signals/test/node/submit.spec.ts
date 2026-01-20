/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Injector, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  disabled,
  form,
  hidden,
  readonly,
  required,
  requiredError,
  submit,
  validateAsync,
  ValidationError,
} from '../../public_api';

describe('submit', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = TestBed.inject(Injector);
  });

  it('fails fast on invalid form', async () => {
    const data = signal({first: '', last: ''});
    const f = form(
      data,
      (name) => {
        required(name.first);
      },
      {injector},
    );

    expect(
      await submit(f, {
        action: async (form) => {
          fail('Submit action should run not on invalid form');
        },
      }),
    ).toBe(false);

    expect(f.first().errors()).toEqual([requiredError({fieldTree: f.first})]);
  });

  describe('while pending', () => {
    it('should not block', async () => {
      const data = signal('');
      const {promise} = promiseWithResolvers();
      const f = form(
        data,
        (p) => {
          validateAsync(p, {
            params: ({value}) => value(),
            factory: (params) =>
              resource({
                params,
                loader: () => promise,
              }),
            onSuccess: () => {},
            onError: () => {},
          });
        },
        {injector},
      );

      expect(f().pending()).toBe(true);

      const submitSpy = jasmine.createSpy();
      expect(await submit(f, {action: submitSpy})).toBe(true);

      expect(f().pending()).toBe(true);
      expect(submitSpy).toHaveBeenCalled();
    });

    it('should retain submit errors after pending validation resolves', async () => {
      const appRef = TestBed.inject(ApplicationRef);
      const data = signal('foo');
      const {promise, resolve} = promiseWithResolvers<boolean>();
      const f = form(
        data,
        (p) => {
          validateAsync(p, {
            params: ({value}) => value(),
            factory: (params) =>
              resource({
                params,
                loader: () => promise,
              }),
            onSuccess: () => ({kind: 'async'}),
            onError: (error) => fail(error),
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      await submit(f, {action: async () => ({kind: 'submit'})});
      expect(f().errorSummary()).toEqual([jasmine.objectContaining({kind: 'submit'})]);

      resolve(true);
      await appRef.whenStable();
      expect(f().errorSummary()).toEqual([jasmine.objectContaining({kind: 'submit'})]);
    });

    it('should resolve pending validation on subfield', async () => {
      const appRef = TestBed.inject(ApplicationRef);
      const data = signal({first: 'foo', last: 'bar'});
      const {promise, resolve} = promiseWithResolvers<boolean>();
      const f = form(
        data,
        (p) => {
          validateAsync(p.first, {
            params: ({value}) => value(),
            factory: (params) =>
              resource({
                params,
                loader: () => promise,
              }),
            onSuccess: () => ({kind: 'async'}),
            onError: (error) => fail(error),
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      await submit(f, {action: async () => ({kind: 'submit'})});
      expect(f().errorSummary()).toEqual([jasmine.objectContaining({kind: 'submit'})]);

      resolve(true);
      await appRef.whenStable();
      expect(f().errorSummary()).toEqual([
        jasmine.objectContaining({kind: 'submit', fieldTree: f}),
        jasmine.objectContaining({kind: 'async', fieldTree: f.first}),
      ]);
    });

    it('should resolve pending validation after successful submit', async () => {
      const appRef = TestBed.inject(ApplicationRef);
      const data = signal('foo');
      const {promise, resolve} = promiseWithResolvers();
      const f = form(
        data,
        (p) => {
          validateAsync(p, {
            params: ({value}) => value(),
            factory: (params) =>
              resource({
                params,
                loader: () => promise,
              }),
            onSuccess: () => ({kind: 'async'}),
            onError: (error) => fail(error),
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      await submit(f, {action: async () => undefined});
      expect(f().errorSummary()).toEqual([]);

      resolve(true);
      await appRef.whenStable();
      expect(f().errorSummary()).toEqual([jasmine.objectContaining({kind: 'async'})]);
    });
  });

  it('maps error to a field', async () => {
    const data = signal({first: '', last: ''});
    const f = form(
      data,
      (name) => {
        // first name required if last name specified
        required(name.first, {when: ({valueOf}) => valueOf(name.last) !== ''});
      },
      {injector},
    );

    expect(
      await submit(f, {
        action: (form) => {
          return Promise.resolve({
            kind: 'lastName',
            fieldTree: form.last,
          });
        },
      }),
    ).toBe(false);

    expect(f.last().errors()).toEqual([{kind: 'lastName', fieldTree: f.last}]);
  });

  it('maps errors to multiple fields', async () => {
    const data = signal({first: '', last: ''});
    const f = form(data, {injector});

    expect(
      await submit(f, {
        action: (form) => {
          return Promise.resolve([
            {
              kind: 'firstName',
              fieldTree: form.first,
            },
            {
              kind: 'lastName',
              fieldTree: form.last,
            },
            {
              kind: 'lastName2',
              fieldTree: form.last,
            },
          ]);
        },
      }),
    ).toBe(false);

    expect(f.first().errors()).toEqual([{kind: 'firstName', fieldTree: f.first}]);
    expect(f.last().errors()).toEqual([
      {kind: 'lastName', fieldTree: f.last},
      {kind: 'lastName2', fieldTree: f.last},
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
      {injector},
    );

    const submitSpy = jasmine.createSpy('submit');

    expect(
      await submit(f, {
        action: (form) => {
          submitSpy(form().value());
          return Promise.resolve();
        },
      }),
    ).toBe(true);

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
      {injector},
    );

    expect(
      await submit(f, {
        action: () => {
          return Promise.resolve({kind: 'custom'});
        },
      }),
    ).toBe(false);

    expect(f().errors()).toEqual([{kind: 'custom', fieldTree: f}]);
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
      {injector},
    );
    expect(f().submitting()).toBe(false);

    const {promise, resolve} = promiseWithResolvers<ValidationError[]>();
    const result = submit(f, {action: () => promise});
    expect(f().submitting()).toBe(true);

    resolve([]);
    expect(await result).toBe(true);
  });

  it('marks descendants as submitting', async () => {
    const initialValue = {a: {b: 12}};
    const data = signal(initialValue);
    const f = form(data, {injector});
    expect(f.a.b().submitting()).toBe(false);

    const {promise, resolve} = promiseWithResolvers<ValidationError[]>();
    const result = submit(f, {action: () => promise});
    expect(f.a.b().submitting()).toBe(true);

    resolve([]);
    expect(await result).toBe(true);
  });

  it('marks the form as touched', async () => {
    const initialValue = {first: 'meow', last: 'wuf'};
    const data = signal(initialValue);
    const f = form(data, {injector});

    expect(f().touched()).toBe(false);

    expect(await submit(f, {action: async () => []})).toBe(true);

    expect(f().touched()).toBe(true);
  });

  it('marks descendants as touched', async () => {
    const initialValue = {a: {b: 12}};
    const data = signal(initialValue);
    const f = form(data, {injector});

    expect(f.a.b().touched()).toBe(false);

    expect(await submit(f, {action: async () => []})).toBe(true);

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
      {injector},
    );

    const submitSpy = jasmine.createSpy('submit');

    expect(
      await submit(f.first, {
        action: (form) => {
          submitSpy(form().value());
          return Promise.resolve({kind: 'lastName'});
        },
      }),
    ).toBe(false);

    expect(submitSpy).toHaveBeenCalledWith('meow');
  });

  it('recovers from errors thrown by submit action', async () => {
    const f = form(signal(0), {injector});
    expect(f().submitting()).toBe(false);

    const {promise, reject} = promiseWithResolvers<ValidationError[]>();
    const submitPromise = submit(f, {action: () => promise});
    expect(f().submitting()).toBe(true);

    const error = new Error('submit failed');
    reject(error);
    await expectAsync(submitPromise).toBeRejectedWith(error);
    expect(f().submitting()).toBe(false);
  });

  it('errors are cleared on edit', async () => {
    const data = signal({first: '', last: ''});
    const f = form(data, {injector});

    expect(
      await submit(f, {
        action: async (form) => {
          return [
            {kind: 'submit', fieldTree: f.first},
            {kind: 'submit', fieldTree: f.last},
          ];
        },
      }),
    ).toBe(false);

    expect(f.first().errors()).toEqual([{kind: 'submit', fieldTree: f.first}]);
    expect(f.last().errors()).toEqual([{kind: 'submit', fieldTree: f.last}]);

    f.first().value.set('Hello');

    expect(f.first().errors()).toEqual([]);
    expect(f.last().errors()).toEqual([{kind: 'submit', fieldTree: f.last}]);
  });

  it('does not mark disabled fields as touched', async () => {
    const data = signal({first: '', last: ''});
    const f = form(
      data,
      (name) => {
        // Disable first name when last name is empty.
        disabled(name.first, ({valueOf}) => valueOf(name.last) === '');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.first().disabled()).toBe(true);
    expect(f.first().touched()).toBe(false);
    expect(f.last().touched()).toBe(false);

    await submit(f, {action: async () => []});
    expect(f.first().touched()).toBe(false);
    expect(f.last().touched()).toBe(true);

    // Set last name to make first name enabled.
    f.last().value.set('Doe');
    expect(f.first().disabled()).toBe(false);
    expect(f.first().touched()).toBe(false);
  });

  it('does not mark hidden fields as touched', async () => {
    const data = signal({first: '', last: ''});
    const f = form(
      data,
      (name) => {
        // Hide first name when last name is empty.
        hidden(name.first, ({valueOf}) => valueOf(name.last) === '');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.first().hidden()).toBe(true);
    expect(f.first().touched()).toBe(false);
    expect(f.last().touched()).toBe(false);

    await submit(f, {action: async () => []});
    expect(f.first().touched()).toBe(false);
    expect(f.last().touched()).toBe(true);

    // Set last name to make first name visible.
    f.last().value.set('Doe');
    expect(f.first().hidden()).toBe(false);
    expect(f.first().touched()).toBe(false);
  });

  it('does not mark readonly fields as touched', async () => {
    const data = signal({first: '', last: ''});
    const f = form(
      data,
      (name) => {
        // Make first name readonly when last name is empty.
        readonly(name.first, ({valueOf}) => valueOf(name.last) === '');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.first().readonly()).toBe(true);
    expect(f.first().touched()).toBe(false);
    expect(f.last().touched()).toBe(false);

    await submit(f, {action: async () => []});
    expect(f.first().touched()).toBe(false);
    expect(f.last().touched()).toBe(true);

    // Set last name to make first name enabled.
    f.last().value.set('Doe');
    expect(f.first().readonly()).toBe(false);
    expect(f.first().touched()).toBe(false);
  });

  it('calls onInvalid when form is invalid', async () => {
    const data = signal({first: '', last: ''});
    const f = form(
      data,
      (name) => {
        required(name.first);
      },
      {injector},
    );

    const onInvalidSpy = jasmine.createSpy('onInvalid');

    expect(
      await submit(f, {
        action: async () => {
          fail('Submit action should run not on invalid form');
        },
        onInvalid: onInvalidSpy,
      }),
    ).toBe(false);

    expect(onInvalidSpy).toHaveBeenCalledWith(f);
  });

  it('runs action on invalid form with ignoreValidators: all', async () => {
    const data = signal({first: '', last: ''});
    const f = form(
      data,
      (name) => {
        required(name.first);
      },
      {injector},
    );

    const submitSpy = jasmine.createSpy('submit');
    expect(
      await submit(f, {
        action: submitSpy,
        ignoreValidators: 'all',
      }),
    ).toBe(true);

    expect(submitSpy).toHaveBeenCalled();
    expect(f.first().errors()).toEqual([requiredError({fieldTree: f.first})]);
  });

  it('fails with pending validators with ignoreValidators: none', async () => {
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
          onSuccess: () => {},
          onError: () => {},
        });
      },
      {injector},
    );

    const submitSpy = jasmine.createSpy('submit');
    const submitPromise = submit(f, {
      action: submitSpy,
      ignoreValidators: 'none',
    });

    expect(f().submitting()).toBe(false);
    expect(submitSpy).not.toHaveBeenCalled();
    expect(await submitPromise).toBe(false);

    // Resolve as valid
    resolvers.resolve(undefined);
  });

  it('falls back to form-level submit options', async () => {
    const data = signal({first: '', last: ''});
    const submitSpy = jasmine.createSpy('submit');
    const f = form(
      data,
      (name) => {
        required(name.first);
      },
      {injector, submission: {action: submitSpy}},
    );

    f.first().value.set('John');
    expect(await submit(f)).toBe(true);
    expect(submitSpy).toHaveBeenCalled();
  });

  it('throws when no submit options are provided', async () => {
    const data = signal({first: ''});
    const f = form(data, {injector});

    await expectAsync(submit(f)).toBeRejectedWithError(
      /Cannot submit form with no submit action\. Specify the action when creating the form, or as an additional argument to `submit\(\)`\./,
    );
  });

  it('overrides form-level submit options', async () => {
    const data = signal({first: ''});
    const defaultSpy = jasmine.createSpy('defaultSpy');
    const overrideSpy = jasmine.createSpy('overrideSpy');
    const f = form(data, {injector, submission: {action: defaultSpy}});

    expect(await submit(f, {action: overrideSpy})).toBe(true);

    expect(defaultSpy).not.toHaveBeenCalled();
    expect(overrideSpy).toHaveBeenCalled();
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
