/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '@angular/core';
import * as angular from '../src/angular1';
import {$INJECTOR, INJECTOR_KEY, UPGRADE_APP_TYPE_KEY} from '../src/constants';
import {downgradeInjectable} from '../src/downgrade_injectable';
import {UpgradeAppType} from '../src/util';

describe('downgradeInjectable', () => {
  const setupMockInjectors = (downgradedModule = '') => {
    const mockNg1Injector = jasmine.createSpyObj<angular.IInjectorService>(['get', 'has']);
    mockNg1Injector.get.and.callFake((key: string) => mockDependencies[key]);
    mockNg1Injector.has.and.callFake((key: string) => mockDependencies.hasOwnProperty(key));

    const mockNg2Injector = jasmine.createSpyObj<Injector>(['get']);
    mockNg2Injector.get.and.returnValue('service value');

    const mockDependencies: {[key: string]: any} = {
      [UPGRADE_APP_TYPE_KEY]: downgradedModule ? UpgradeAppType.Lite : UpgradeAppType.Static,
      [`${INJECTOR_KEY}${downgradedModule}`]: mockNg2Injector,
    };

    return {mockNg1Injector, mockNg2Injector};
  };

  it('should return an AngularJS annotated factory for the token', () => {
    const factory = downgradeInjectable('someToken');
    expect(factory).toEqual(jasmine.any(Function));
    expect((factory as any).$inject).toEqual([$INJECTOR]);

    const {mockNg1Injector, mockNg2Injector} = setupMockInjectors();
    expect(factory(mockNg1Injector)).toEqual('service value');
    expect(mockNg2Injector.get).toHaveBeenCalledWith('someToken');
  });

  it("should inject the specified module's injector when specifying a module name", () => {
    const factory = downgradeInjectable('someToken', 'someModule');
    expect(factory).toEqual(jasmine.any(Function));
    expect((factory as any).$inject).toEqual([$INJECTOR]);

    const {mockNg1Injector, mockNg2Injector} = setupMockInjectors('someModule');
    expect(factory(mockNg1Injector)).toEqual('service value');
    expect(mockNg2Injector.get).toHaveBeenCalledWith('someToken');
  });

  it("should mention the injectable's name in the error thrown when failing to retrieve injectable", () => {
    const factory = downgradeInjectable('someToken');
    expect(factory).toEqual(jasmine.any(Function));
    expect((factory as any).$inject).toEqual([$INJECTOR]);

    const {mockNg1Injector, mockNg2Injector} = setupMockInjectors();
    mockNg2Injector.get.and.throwError('Mock failure');
    expect(() => factory(mockNg1Injector)).toThrowError(
      /^Error while instantiating injectable 'someToken': Mock failure/,
    );
  });
});
