/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface IPropertySpyHelpers<T, P extends keyof T> {
  getSpy: jasmine.Spy;
  setSpy: jasmine.Spy;

  installSpies(): void;
  uninstallSpies(): void;
  setMockValue(value: T[P]): void;
}

export const mockProperty =
    <T, P extends keyof T>(ctx: T, prop: P): IPropertySpyHelpers<T, P>['setMockValue'] => {
      const {setMockValue, installSpies, uninstallSpies} = spyProperty(ctx, prop);

      beforeEach(installSpies);
      afterEach(uninstallSpies);

      return setMockValue;
    };

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
