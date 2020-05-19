/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {setUpLocationSync} from '@angular/router/upgrade';
import {UpgradeModule} from '@angular/upgrade/static';

describe('setUpLocationSync', () => {
  let upgradeModule: UpgradeModule;
  let RouterMock: any;
  let LocationMock: any;

  beforeEach(() => {
    RouterMock = jasmine.createSpyObj('Router', ['navigateByUrl']);
    LocationMock = jasmine.createSpyObj('Location', ['normalize']);

    TestBed.configureTestingModule({
      providers: [
        UpgradeModule, {provide: Router, useValue: RouterMock},
        {provide: Location, useValue: LocationMock}
      ],
    });

    upgradeModule = TestBed.inject(UpgradeModule);
    upgradeModule.$injector = {
      get: jasmine.createSpy('$injector.get').and.returnValue({'$on': () => undefined})
    };
  });

  it('should throw an error if the UpgradeModule.bootstrap has not been called', () => {
    upgradeModule.$injector = null;

    expect(() => setUpLocationSync(upgradeModule)).toThrowError(`
        RouterUpgradeInitializer can be used only after UpgradeModule.bootstrap has been called.
        Remove RouterUpgradeInitializer and call setUpLocationSync after UpgradeModule.bootstrap.
      `);
  });

  it('should get the $rootScope from AngularJS and set an $on watch on $locationChangeStart',
     () => {
       const $rootScope = jasmine.createSpyObj('$rootScope', ['$on']);

       upgradeModule.$injector.get.and.callFake(
           (name: string) => (name === '$rootScope') && $rootScope);

       setUpLocationSync(upgradeModule);

       expect($rootScope.$on).toHaveBeenCalledTimes(1);
       expect($rootScope.$on).toHaveBeenCalledWith('$locationChangeStart', jasmine.any(Function));
     });

  it('should navigate by url every time $locationChangeStart is broadcasted', () => {
    const url = 'https://google.com';
    const pathname = '/custom/route';
    const normalizedPathname = 'foo';
    const query = '?query=1&query2=3';
    const hash = '#new/hash';
    const $rootScope = jasmine.createSpyObj('$rootScope', ['$on']);

    upgradeModule.$injector.get.and.returnValue($rootScope);
    LocationMock.normalize.and.returnValue(normalizedPathname);

    setUpLocationSync(upgradeModule);

    const callback = $rootScope.$on.calls.argsFor(0)[1];
    callback({}, url + pathname + query + hash, '');

    expect(LocationMock.normalize).toHaveBeenCalledTimes(1);
    expect(LocationMock.normalize).toHaveBeenCalledWith(pathname);

    expect(RouterMock.navigateByUrl).toHaveBeenCalledTimes(1);
    expect(RouterMock.navigateByUrl).toHaveBeenCalledWith(normalizedPathname + query + hash);
  });

  it('should allow configuration to work with hash-based routing', () => {
    const url = 'https://google.com';
    const pathname = '/custom/route';
    const normalizedPathname = 'foo';
    const query = '?query=1&query2=3';
    const hash = '#new/hash';
    const combinedUrl = url + '#' + pathname + query + hash;
    const $rootScope = jasmine.createSpyObj('$rootScope', ['$on']);

    upgradeModule.$injector.get.and.returnValue($rootScope);
    LocationMock.normalize.and.returnValue(normalizedPathname);

    setUpLocationSync(upgradeModule, 'hash');

    const callback = $rootScope.$on.calls.argsFor(0)[1];
    callback({}, combinedUrl, '');

    expect(LocationMock.normalize).toHaveBeenCalledTimes(1);
    expect(LocationMock.normalize).toHaveBeenCalledWith(pathname);

    expect(RouterMock.navigateByUrl).toHaveBeenCalledTimes(1);
    expect(RouterMock.navigateByUrl).toHaveBeenCalledWith(normalizedPathname + query + hash);
  });

  it('should work correctly on browsers that do not start pathname with `/`', () => {
    const anchorProto = HTMLAnchorElement.prototype;
    const originalDescriptor = Object.getOwnPropertyDescriptor(anchorProto, 'pathname');
    Object.defineProperty(anchorProto, 'pathname', {get: () => 'foo/bar'});

    try {
      const $rootScope = jasmine.createSpyObj('$rootScope', ['$on']);
      upgradeModule.$injector.get.and.returnValue($rootScope);

      setUpLocationSync(upgradeModule);

      const callback = $rootScope.$on.calls.argsFor(0)[1];
      callback({}, '', '');

      expect(LocationMock.normalize).toHaveBeenCalledWith('/foo/bar');
    } finally {
      Object.defineProperty(anchorProto, 'pathname', originalDescriptor!);
    }
  });
});
