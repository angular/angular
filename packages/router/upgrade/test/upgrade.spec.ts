/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location} from '@angular/common';
import {$locationShim, UrlCodec} from '@angular/common/upgrade';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {Router, RouterModule} from '../../index';
import {setUpLocationSync} from '../../upgrade';
import {UpgradeModule} from '@angular/upgrade/static';

import {LocationUpgradeTestModule} from './upgrade_location_test_module';

export function injectorFactory() {
  const rootScopeMock = new $rootScopeMock();
  const rootElementMock = {on: () => undefined};
  return function $injectorGet(provider: string) {
    if (provider === '$rootScope') {
      return rootScopeMock;
    } else if (provider === '$rootElement') {
      return rootElementMock;
    } else {
      throw new Error(`Unsupported injectable mock: ${provider}`);
    }
  };
}

export class $rootScopeMock {
  private watchers: any[] = [];
  private events: {[k: string]: any[]} = {};

  $watch(fn: any) {
    this.watchers.push(fn);
  }

  $broadcast(evt: string, ...args: any[]) {
    if (this.events[evt]) {
      this.events[evt].forEach((fn) => {
        fn.apply(fn, [/** angular.IAngularEvent*/ {}, ...args]);
      });
    }
    return {
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };
  }

  $on(evt: string, fn: any) {
    this.events[evt] ??= [];
    this.events[evt].push(fn);
  }

  $evalAsync(fn: any) {
    fn();
  }

  $digest() {
    this.watchers.forEach((fn) => fn());
  }
}

describe('setUpLocationSync', () => {
  let upgradeModule: UpgradeModule;
  let router: any;
  let location: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([
          {path: '1', children: []},
          {path: '2', children: []},
        ]),
        UpgradeModule,
        LocationUpgradeTestModule.config(),
      ],
    });

    upgradeModule = TestBed.inject(UpgradeModule);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    spyOn(router, 'navigateByUrl').and.callThrough();
    spyOn(location, 'normalize').and.callThrough();
    upgradeModule.$injector = {get: injectorFactory()};
  });

  it('should throw an error if the UpgradeModule.bootstrap has not been called', () => {
    upgradeModule.$injector = null;

    expect(() => setUpLocationSync(upgradeModule)).toThrowError(`
        RouterUpgradeInitializer can be used only after UpgradeModule.bootstrap has been called.
        Remove RouterUpgradeInitializer and call setUpLocationSync after UpgradeModule.bootstrap.
      `);
  });

  it('should get the $rootScope from AngularJS and set an $on watch on $locationChangeStart', () => {
    const $rootScope = upgradeModule.$injector.get('$rootScope');
    spyOn($rootScope, '$on');

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
    const $rootScope = upgradeModule.$injector.get('$rootScope');
    spyOn($rootScope, '$on');

    location.normalize.and.returnValue(normalizedPathname);

    setUpLocationSync(upgradeModule);

    const callback = $rootScope.$on.calls.argsFor(0)[1];
    callback({}, url + pathname + query + hash, '');

    expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith(normalizedPathname + query + hash);
  });

  it('should allow configuration to work with hash-based routing', () => {
    const url = 'https://google.com';
    const pathname = '/custom/route';
    const normalizedPathname = 'foo';
    const query = '?query=1&query2=3';
    const hash = '#new/hash';
    const combinedUrl = url + '#' + pathname + query + hash;
    const $rootScope = upgradeModule.$injector.get('$rootScope');
    spyOn($rootScope, '$on');
    location.normalize.and.returnValue(normalizedPathname);

    setUpLocationSync(upgradeModule, 'hash');

    const callback = $rootScope.$on.calls.argsFor(0)[1];
    callback({}, combinedUrl, '');

    expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith(normalizedPathname + query + hash);
  });

  it('should work correctly on browsers that do not start pathname with `/`', () => {
    const anchorProto = HTMLAnchorElement.prototype;
    const originalDescriptor = Object.getOwnPropertyDescriptor(anchorProto, 'pathname');
    Object.defineProperty(anchorProto, 'pathname', {get: () => 'foo/bar'});

    try {
      const $rootScope = upgradeModule.$injector.get('$rootScope');
      spyOn($rootScope, '$on');

      setUpLocationSync(upgradeModule);

      const callback = $rootScope.$on.calls.argsFor(0)[1];
      callback({}, '', '');

      expect(location.normalize).toHaveBeenCalledWith('/foo/bar');
    } finally {
      Object.defineProperty(anchorProto, 'pathname', originalDescriptor!);
    }
  });

  it('should not duplicate navigations triggered by Angular router', fakeAsync(() => {
    spyOn(TestBed.inject(UrlCodec), 'parse').and.returnValue({
      pathname: '',
      href: '',
      protocol: '',
      host: '',
      search: '',
      hash: '',
      hostname: '',
      port: '',
    });
    const $rootScope = upgradeModule.$injector.get('$rootScope');
    spyOn($rootScope, '$broadcast').and.callThrough();
    setUpLocationSync(upgradeModule);
    // Inject location shim so its urlChangeListener subscribes
    TestBed.inject($locationShim);

    router.navigateByUrl('/1');
    location.normalize.and.returnValue('/1');
    flush();
    expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
    expect($rootScope.$broadcast.calls.argsFor(0)[0]).toEqual('$locationChangeStart');
    expect($rootScope.$broadcast.calls.argsFor(1)[0]).toEqual('$locationChangeSuccess');
    $rootScope.$broadcast.calls.reset();
    router.navigateByUrl.calls.reset();

    location.go('/2');
    location.normalize.and.returnValue('/2');
    flush();
    expect($rootScope.$broadcast.calls.argsFor(0)[0]).toEqual('$locationChangeStart');
    expect($rootScope.$broadcast.calls.argsFor(1)[0]).toEqual('$locationChangeSuccess');
    expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
  }));
});
