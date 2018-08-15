/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** An object with helpers for mocking/spying on an object's property. */
export interface IPropertySpyHelpers<T, P extends keyof T> {
  /**
   * A `jasmine.Spy` for `get` operations on the property (i.e. reading the current property value).
   * (This is useful in case one needs to make assertions against property reads.)
   */
  getSpy: jasmine.Spy;

  /**
   * A `jasmine.Spy` for `set` operations on the property (i.e. setting a new property value).
   * (This is useful in case one needs to make assertions against property writes.)
   */
  setSpy: jasmine.Spy;

  /** Install the getter/setter spies for the property. */
  installSpies(): void;

  /**
   * Uninstall the property spies and restore the original value (from before installing the
   * spies), including the property descriptor.
   */
  uninstallSpies(): void;

  /** Update the current value of the mocked property. */
  setMockValue(value: T[P]): void;
}

/**
 * Set up mocking an object's property (using spies) and return a function for updating the mocked
 * property's value during tests.
 *
 * This is, essentially, a wrapper around `spyProperty()` which additionally takes care of
 * installing the spies before each test (via `beforeEach()`) and uninstalling them after each test
 * (via `afterEach()`).
 *
 * Example usage:
 *
 * ```ts
 * describe('something', () => {
 *   // Assuming `window.foo` is an object...
 *   const mockWindowFooBar = mockProperty(window.foo, 'bar');
 *
 *   it('should do this', () => {
 *     mockWindowFooBar('baz');
 *     expect(window.foo.bar).toBe('baz');
 *
 *     mockWindowFooBar('qux');
 *     expect(window.foo.bar).toBe('qux');
 *   });
 * });
 * ```
 *
 * @param ctx The object whose property needs to be spied on.
 * @param prop The name of the property to spy on.
 *
 * @return A function for updating the current value of the mocked property.
 */
export const mockProperty =
    <T, P extends keyof T>(ctx: T, prop: P): IPropertySpyHelpers<T, P>['setMockValue'] => {
      const {setMockValue, installSpies, uninstallSpies} = spyProperty(ctx, prop);

      beforeEach(installSpies);
      afterEach(uninstallSpies);

      return setMockValue;
    };

/**
 * Return utility functions to help mock and spy on an object's property.
 *
 * It supports spying on properties that are either defined on the object instance itself or on its
 * prototype. It also supports spying on non-writable properties (as long as they are configurable).
 *
 * NOTE: Unlike `jasmine`'s spying utilities, spies are not automatically installed/uninstalled, so
 *       the caller is responsible for manually taking care of that (by calling
 *       `installSpies()`/`uninstallSpies()` as necessary).
 *
 * @param ctx The object whose property needs to be spied on.
 * @param prop The name of the property to spy on.
 *
 * @return An object with helpers for mocking/spying on an object's property.
 */
export const spyProperty = <T, P extends keyof T>(ctx: T, prop: P): IPropertySpyHelpers<T, P> => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(ctx, prop);

  let value = ctx[prop];
  const setMockValue = (mockValue: typeof value) => value = mockValue;
  const setSpy = jasmine.createSpy(`set ${prop}`).and.callFake(setMockValue);
  const getSpy = jasmine.createSpy(`get ${prop}`).and.callFake(() => value);

  const installSpies = () => {
    value = ctx[prop];
    Object.defineProperty(ctx, prop, {
      configurable: true,
      enumerable: originalDescriptor ? originalDescriptor.enumerable : true,
      get: getSpy,
      set: setSpy,
    });
  };
  const uninstallSpies = () =>
      originalDescriptor ? Object.defineProperty(ctx, prop, originalDescriptor) : delete ctx[prop];

  return {installSpies, uninstallSpies, setMockValue, getSpy, setSpy};
};
