/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, PathLocationStrategy} from '@angular/common';
import {inject, TestBed} from '@angular/core/testing';
import {UpgradeModule} from '@angular/upgrade/static';

import {$locationShim} from '../src/location_shim';

import {LocationUpgradeTestModule} from './upgrade_location_test_module';

export class MockUpgradeModule {
  $injector = {
    get(key: string) {
      if (key === '$rootScope') {
        return new $rootScopeMock();
      } else {
        throw new Error(`Unsupported mock service requested: ${key}`);
      }
    }
  };
}

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
  runWatchers() {
    this.watchers.forEach(fn => fn());
  }

  $watch(fn: any) {
    this.watchers.push(fn);
  }

  $broadcast(evt: string, ...args: any[]) {
    if (this.events[evt]) {
      this.events[evt].forEach(fn => {
        fn.apply(fn, args);
      });
    }
    return {
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      }
    };
  }

  $on(evt: string, fn: any) {
    if (!this.events[evt]) {
      this.events[evt] = [];
    }
    this.events[evt].push(fn);
  }

  $evalAsync(fn: any) {
    fn();
  }
}

describe('LocationProvider', () => {
  let upgradeModule: UpgradeModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LocationUpgradeTestModule.config(),
      ],
      providers: [UpgradeModule],
    });

    upgradeModule = TestBed.inject(UpgradeModule);
    upgradeModule.$injector = {get: injectorFactory()};
  });

  it('should instantiate LocationProvider', inject([$locationShim], ($location: $locationShim) => {
       expect($location).toBeDefined();
       expect($location instanceof $locationShim).toBe(true);
     }));
});


describe('LocationHtml5Url', function() {
  let $location: $locationShim;
  let upgradeModule: UpgradeModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        LocationUpgradeTestModule.config(
            {useHash: false, appBaseHref: '/pre', startUrl: 'http://server'}),
      ],
      providers: [UpgradeModule],

    });
    upgradeModule = TestBed.inject(UpgradeModule);
    upgradeModule.$injector = {get: injectorFactory()};
  });

  beforeEach(inject([$locationShim], (loc: $locationShim) => {
    $location = loc;
  }));


  it('should set the URL', () => {
    $location.url('');
    expect($location.absUrl()).toBe('http://server/pre/');
    $location.url('/test');
    expect($location.absUrl()).toBe('http://server/pre/test');
    $location.url('test');
    expect($location.absUrl()).toBe('http://server/pre/test');
    $location.url('/somewhere?something=1#hash_here');
    expect($location.absUrl()).toBe('http://server/pre/somewhere?something=1#hash_here');
  });

  it('should rewrite regular URL', () => {
    expect(parseLinkAndReturn($location, 'http://other')).toEqual(undefined);
    expect(parseLinkAndReturn($location, 'http://server/pre')).toEqual('http://server/pre/');
    expect(parseLinkAndReturn($location, 'http://server/pre/')).toEqual('http://server/pre/');
    expect(parseLinkAndReturn($location, 'http://server/pre/otherPath'))
        .toEqual('http://server/pre/otherPath');
    // Note: relies on the previous state!
    expect(parseLinkAndReturn($location, 'someIgnoredAbsoluteHref', '#test'))
        .toEqual('http://server/pre/otherPath#test');
  });

  it('should rewrite index URL', () => {
    // Reset hostname url and hostname
    $location.$$parseLinkUrl('http://server/pre/index.html');
    expect($location.absUrl()).toEqual('http://server/pre/');

    expect(parseLinkAndReturn($location, 'http://server/pre')).toEqual('http://server/pre/');
    expect(parseLinkAndReturn($location, 'http://server/pre/')).toEqual('http://server/pre/');
    expect(parseLinkAndReturn($location, 'http://server/pre/otherPath'))
        .toEqual('http://server/pre/otherPath');
    // Note: relies on the previous state!
    expect(parseLinkAndReturn($location, 'someIgnoredAbsoluteHref', '#test'))
        .toEqual('http://server/pre/otherPath#test');
  });

  it('should complain if the path starts with double slashes', function() {
    expect(function() {
      parseLinkAndReturn($location, 'http://server/pre///other/path');
    }).toThrow();

    expect(function() {
      parseLinkAndReturn($location, 'http://server/pre/\\\\other/path');
    }).toThrow();

    expect(function() {
      parseLinkAndReturn($location, 'http://server/pre//\\//other/path');
    }).toThrow();
  });

  it('should support state', function() {
    expect($location.state({a: 2}).state()).toEqual({a: 2});
  });
});


describe('NewUrl', function() {
  let $location: $locationShim;
  let upgradeModule: UpgradeModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        LocationUpgradeTestModule.config({useHash: false, startUrl: 'http://www.domain.com:9877'}),
      ],
      providers: [UpgradeModule],
    });

    upgradeModule = TestBed.inject(UpgradeModule);
    upgradeModule.$injector = {get: injectorFactory()};
  });

  beforeEach(inject([$locationShim], (loc: $locationShim) => {
    $location = loc;
  }));

  // Sets the default most of these tests rely on
  function setupUrl(url = '/path/b?search=a&b=c&d#hash') {
    $location.url(url);
  }

  it('should provide common getters', function() {
    setupUrl();
    expect($location.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d#hash');
    expect($location.protocol()).toBe('http');
    expect($location.host()).toBe('www.domain.com');
    expect($location.port()).toBe(9877);
    expect($location.path()).toBe('/path/b');
    expect($location.search()).toEqual({search: 'a', b: 'c', d: true});
    expect($location.hash()).toBe('hash');
    expect($location.url()).toBe('/path/b?search=a&b=c&d#hash');
  });


  it('path() should change path', function() {
    setupUrl();
    $location.path('/new/path');
    expect($location.path()).toBe('/new/path');
    expect($location.absUrl()).toBe('http://www.domain.com:9877/new/path?search=a&b=c&d#hash');
  });

  it('path() should not break on numeric values', function() {
    setupUrl();
    $location.path(1);
    expect($location.path()).toBe('/1');
    expect($location.absUrl()).toBe('http://www.domain.com:9877/1?search=a&b=c&d#hash');
  });

  it('path() should allow using 0 as path', function() {
    setupUrl();
    $location.path(0);
    expect($location.path()).toBe('/0');
    expect($location.absUrl()).toBe('http://www.domain.com:9877/0?search=a&b=c&d#hash');
  });

  it('path() should set to empty path on null value', function() {
    setupUrl();
    $location.path('/foo');
    expect($location.path()).toBe('/foo');
    $location.path(null);
    expect($location.path()).toBe('/');
  });

  it('search() should accept string', function() {
    setupUrl();
    $location.search('x=y&c');
    expect($location.search()).toEqual({x: 'y', c: true});
    expect($location.absUrl()).toBe('http://www.domain.com:9877/path/b?x=y&c#hash');
  });


  it('search() should accept object', function() {
    setupUrl();
    $location.search({one: 1, two: true});
    expect($location.search()).toEqual({one: 1, two: true});
    expect($location.absUrl()).toBe('http://www.domain.com:9877/path/b?one=1&two#hash');
  });


  it('search() should copy object', function() {
    setupUrl();
    let obj = {one: 1, two: true, three: null};
    $location.search(obj);
    expect(obj).toEqual({one: 1, two: true, three: null});
    obj.one = 100;  // changed value
    expect($location.search()).toEqual({one: 1, two: true});
    expect($location.absUrl()).toBe('http://www.domain.com:9877/path/b?one=1&two#hash');
  });


  it('search() should change single parameter', function() {
    setupUrl();
    $location.search({id: 'old', preserved: true});
    $location.search('id', 'new');

    expect($location.search()).toEqual({id: 'new', preserved: true});
  });


  it('search() should remove single parameter', function() {
    setupUrl();
    $location.search({id: 'old', preserved: true});
    $location.search('id', null);

    expect($location.search()).toEqual({preserved: true});
  });


  it('search() should remove multiple parameters', function() {
    setupUrl();
    $location.search({one: 1, two: true});
    expect($location.search()).toEqual({one: 1, two: true});
    $location.search({one: null, two: null});
    expect($location.search()).toEqual({});
    expect($location.absUrl()).toBe('http://www.domain.com:9877/path/b#hash');
  });


  it('search() should accept numeric keys', function() {
    setupUrl();
    $location.search({1: 'one', 2: 'two'});
    expect($location.search()).toEqual({'1': 'one', '2': 'two'});
    expect($location.absUrl()).toBe('http://www.domain.com:9877/path/b?1=one&2=two#hash');
  });


  it('search() should handle multiple value', function() {
    setupUrl();
    $location.search('a&b');
    expect($location.search()).toEqual({a: true, b: true});

    $location.search('a', null);

    expect($location.search()).toEqual({b: true});

    $location.search('b', undefined);
    expect($location.search()).toEqual({});
  });


  it('search() should handle single value', function() {
    setupUrl();
    $location.search('ignore');
    expect($location.search()).toEqual({ignore: true});
    $location.search(1);
    expect($location.search()).toEqual({1: true});
  });

  it('search() should throw error an incorrect argument', function() {
    expect(() => {
      $location.search((null as any));
    }).toThrowError('LocationProvider.search(): First argument must be a string or an object.');
    expect(function() {
      $location.search((undefined as any));
    }).toThrowError('LocationProvider.search(): First argument must be a string or an object.');
  });

  it('hash() should change hash fragment', function() {
    setupUrl();
    $location.hash('new-hash');
    expect($location.hash()).toBe('new-hash');
    expect($location.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d#new-hash');
  });


  it('hash() should accept numeric parameter', function() {
    setupUrl();
    $location.hash(5);
    expect($location.hash()).toBe('5');
    expect($location.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d#5');
  });

  it('hash() should allow using 0', function() {
    setupUrl();
    $location.hash(0);
    expect($location.hash()).toBe('0');
    expect($location.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d#0');
  });

  it('hash() should accept null parameter', function() {
    setupUrl();
    $location.hash(null);
    expect($location.hash()).toBe('');
    expect($location.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d');
  });


  it('url() should change the path, search and hash', function() {
    setupUrl();
    $location.url('/some/path?a=b&c=d#hhh');
    expect($location.url()).toBe('/some/path?a=b&c=d#hhh');
    expect($location.absUrl()).toBe('http://www.domain.com:9877/some/path?a=b&c=d#hhh');
    expect($location.path()).toBe('/some/path');
    expect($location.search()).toEqual({a: 'b', c: 'd'});
    expect($location.hash()).toBe('hhh');
  });


  it('url() should change only hash when no search and path specified', function() {
    setupUrl();
    $location.url('#some-hash');

    expect($location.hash()).toBe('some-hash');
    expect($location.url()).toBe('/path/b?search=a&b=c&d#some-hash');
    expect($location.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d#some-hash');
  });


  it('url() should change only search and hash when no path specified', function() {
    setupUrl();
    $location.url('?a=b');

    expect($location.search()).toEqual({a: 'b'});
    expect($location.hash()).toBe('');
    expect($location.path()).toBe('/path/b');
  });


  it('url() should reset search and hash when only path specified', function() {
    setupUrl();
    $location.url('/new/path');

    expect($location.path()).toBe('/new/path');
    expect($location.search()).toEqual({});
    expect($location.hash()).toBe('');
  });

  it('url() should change path when empty string specified', function() {
    setupUrl();
    $location.url('');

    expect($location.path()).toBe('/');
    expect($location.search()).toEqual({});
    expect($location.hash()).toBe('');
  });

  it('replace should set $$replace flag and return itself', function() {
    expect(($location as any).$$replace).toBe(false);

    $location.replace();
    expect(($location as any).$$replace).toBe(true);
    expect($location.replace()).toBe($location);
  });

  describe('encoding', function() {
    it('should encode special characters', function() {
      $location.path('/a <>#');
      $location.search({'i j': '<>#'});
      $location.hash('<>#');

      expect($location.path()).toBe('/a <>#');
      expect($location.search()).toEqual({'i j': '<>#'});
      expect($location.hash()).toBe('<>#');
      expect($location.absUrl())
          .toBe('http://www.domain.com:9877/a%20%3C%3E%23?i%20j=%3C%3E%23#%3C%3E%23');
    });

    it('should not encode !$:@', function() {
      $location.path('/!$:@');
      $location.search('');
      $location.hash('!$:@');

      expect($location.absUrl()).toBe('http://www.domain.com:9877/!$:@#!$:@');
    });

    it('should decode special characters', function() {
      $location.$$parse('http://www.domain.com:9877/a%20%3C%3E%23?i%20j=%3C%3E%23#x%20%3C%3E%23');
      expect($location.path()).toBe('/a <>#');
      expect($location.search()).toEqual({'i j': '<>#'});
      expect($location.hash()).toBe('x <>#');
    });

    it('should not decode encoded forward slashes in the path', function() {
      $location.$$parse('http://www.domain.com:9877/a/ng2;path=%2Fsome%2Fpath');
      expect($location.path()).toBe('/a/ng2;path=%2Fsome%2Fpath');
      expect($location.search()).toEqual({});
      expect($location.hash()).toBe('');
      expect($location.url()).toBe('/a/ng2;path=%2Fsome%2Fpath');
      expect($location.absUrl()).toBe('http://www.domain.com:9877/a/ng2;path=%2Fsome%2Fpath');
    });

    it('should decode pluses as spaces in urls', function() {
      $location.$$parse('http://www.domain.com:9877/?a+b=c+d');
      expect($location.search()).toEqual({'a b': 'c d'});
    });

    it('should retain pluses when setting search queries', function() {
      $location.search({'a+b': 'c+d'});
      expect($location.search()).toEqual({'a+b': 'c+d'});
    });
  });

  it('should not preserve old properties when parsing new url', function() {
    $location.$$parse('http://www.domain.com:9877/a');

    expect($location.path()).toBe('/a');
    expect($location.search()).toEqual({});
    expect($location.hash()).toBe('');
    expect($location.absUrl()).toBe('http://www.domain.com:9877/a');
  });
});

describe('New URL Parsing', () => {
  let $location: $locationShim;
  let upgradeModule: UpgradeModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        LocationUpgradeTestModule.config(
            {useHash: false, appBaseHref: '/base', startUrl: 'http://server'}),
      ],
      providers: [UpgradeModule],
    });

    upgradeModule = TestBed.inject(UpgradeModule);
    upgradeModule.$injector = {get: injectorFactory()};
  });

  beforeEach(inject([$locationShim], (loc: $locationShim) => {
    $location = loc;
  }));

  it('should prepend path with basePath', function() {
    $location.$$parse('http://server/base/abc?a');
    expect($location.path()).toBe('/abc');
    expect($location.search()).toEqual({a: true});

    $location.path('/new/path');
    expect($location.absUrl()).toBe('http://server/base/new/path?a');
  });
});

describe('New URL Parsing', () => {
  let $location: $locationShim;
  let upgradeModule: UpgradeModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        LocationUpgradeTestModule.config({useHash: false, startUrl: 'http://host.com/'}),
      ],
      providers: [UpgradeModule],
    });

    upgradeModule = TestBed.inject(UpgradeModule);
    upgradeModule.$injector = {get: injectorFactory()};
  });

  beforeEach(inject([$locationShim], (loc: $locationShim) => {
    $location = loc;
  }));

  it('should parse new url', function() {
    $location.$$parse('http://host.com/base');
    expect($location.path()).toBe('/base');
  });

  it('should parse new url with #', function() {
    $location.$$parse('http://host.com/base#');
    expect($location.path()).toBe('/base');
  });

  it('should prefix path with forward-slash', function() {
    $location.path('b');

    expect($location.path()).toBe('/b');
    expect($location.absUrl()).toBe('http://host.com/b');
  });

  it('should set path to forward-slash when empty', function() {
    $location.$$parse('http://host.com/');
    expect($location.path()).toBe('/');
    expect($location.absUrl()).toBe('http://host.com/');
  });

  it('setters should return Url object to allow chaining', function() {
    expect($location.path('/any')).toBe($location);
    expect($location.search('')).toBe($location);
    expect($location.hash('aaa')).toBe($location);
    expect($location.url('/some')).toBe($location);
  });

  it('should throw error when invalid server url given', function() {
    expect(function() {
      $location.$$parse('http://other.server.org/path#/path');
    })
        .toThrowError(
            'Invalid url "http://other.server.org/path#/path", missing path prefix "http://host.com/".');
  });


  describe('state', function() {
    let mock$rootScope: $rootScopeMock;

    beforeEach(inject([UpgradeModule], (ngUpgrade: UpgradeModule) => {
      mock$rootScope = ngUpgrade.$injector.get('$rootScope');
    }));

    it('should set $$state and return itself', function() {
      expect(($location as any).$$state).toEqual(null);

      let returned = $location.state({a: 2});
      expect(($location as any).$$state).toEqual({a: 2});
      expect(returned).toBe($location);
    });

    it('should set state', function() {
      $location.state({a: 2});
      expect($location.state()).toEqual({a: 2});
    });

    it('should allow to set both URL and state', function() {
      $location.url('/foo').state({a: 2});
      expect($location.url()).toEqual('/foo');
      expect($location.state()).toEqual({a: 2});
    });

    it('should allow to mix state and various URL functions', function() {
      $location.path('/foo').hash('abcd').state({a: 2}).search('bar', 'baz');
      expect($location.path()).toEqual('/foo');
      expect($location.state()).toEqual({a: 2});
      expect($location.search() && $location.search().bar).toBe('baz');
      expect($location.hash()).toEqual('abcd');
    });

    it('should always have the same value by reference until the value is changed', function() {
      expect(($location as any).$$state).toEqual(null);
      expect($location.state()).toEqual(null);

      const stateValue = {foo: 'bar'};

      $location.state(stateValue);
      expect($location.state()).toBe(stateValue);
      mock$rootScope.runWatchers();

      const testState = $location.state();

      // $location.state() should equal by reference
      expect($location.state()).toEqual(stateValue);
      expect($location.state()).toBe(testState);

      mock$rootScope.runWatchers();
      expect($location.state()).toBe(testState);
      mock$rootScope.runWatchers();
      expect($location.state()).toBe(testState);

      // Confirm updating other values doesn't change the value of `state`
      $location.path('/new');

      expect($location.state()).toBe(testState);
      mock$rootScope.runWatchers();

      // After watchers have been run, location should be updated and `state` should change
      expect($location.state()).toBe(null);
    });
  });
});

describe('$location.onChange()', () => {
  let $location: $locationShim;
  let upgradeModule: UpgradeModule;
  let mock$rootScope: $rootScopeMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        LocationUpgradeTestModule.config({useHash: false, startUrl: 'http://host.com/'}),
      ],
      providers: [UpgradeModule],
    });

    upgradeModule = TestBed.inject(UpgradeModule);
    upgradeModule.$injector = {get: injectorFactory()};
    mock$rootScope = upgradeModule.$injector.get('$rootScope');
  });

  beforeEach(inject([$locationShim], (loc: $locationShim) => {
    $location = loc;
  }));

  it('should have onChange method', () => {
    expect(typeof $location.onChange).toBe('function');
  });

  it('should add registered functions to changeListeners', () => {
    function changeListener(url: string, state: unknown) {
      return undefined;
    }
    function errorHandler(e: Error) {}

    expect(($location as any).$$changeListeners.length).toBe(0);

    $location.onChange(changeListener, errorHandler);

    expect(($location as any).$$changeListeners.length).toBe(1);
    expect(($location as any).$$changeListeners[0][0]).toEqual(changeListener);
    expect(($location as any).$$changeListeners[0][1]).toEqual(errorHandler);
  });

  it('should call changeListeners when URL is updated', () => {
    const onChangeVals =
        {url: 'url', state: 'state' as unknown, oldUrl: 'oldUrl', oldState: 'oldState' as unknown};

    function changeListener(url: string, state: unknown, oldUrl: string, oldState: unknown) {
      onChangeVals.url = url;
      onChangeVals.state = state;
      onChangeVals.oldUrl = oldUrl;
      onChangeVals.oldState = oldState;
    }

    $location.onChange(changeListener);

    const newState = {foo: 'bar'};
    $location.state(newState);
    $location.path('/newUrl');
    mock$rootScope.runWatchers();

    expect(onChangeVals.url).toBe('/newUrl');
    expect(onChangeVals.state).toEqual(newState);
    expect(onChangeVals.oldUrl).toBe('http://host.com');
    expect(onChangeVals.oldState).toBe(null);
  });

  it('should call changeListeners after $locationChangeSuccess', () => {
    let changeListenerCalled = false;
    let locationChangeSuccessEmitted = false;

    function changeListener(url: string, state: unknown, oldUrl: string, oldState: unknown) {
      changeListenerCalled = true;
    }

    $location.onChange(changeListener);

    mock$rootScope.$on('$locationChangeSuccess', () => {
      // Ensure that the changeListener hasn't been called yet
      expect(changeListenerCalled).toBe(false);
      locationChangeSuccessEmitted = true;
    });

    // Update state and run watchers
    const stateValue = {foo: 'bar'};
    $location.state(stateValue);
    mock$rootScope.runWatchers();

    // Ensure that change listeners are called and location events are emitted
    expect(changeListenerCalled).toBe(true);
    expect(locationChangeSuccessEmitted).toBe(true);
  });

  it('should call forward errors to error handler', () => {
    let error!: Error;

    function changeListener(url: string, state: unknown, oldUrl: string, oldState: unknown) {
      throw new Error('Handle error');
    }
    function errorHandler(e: Error) {
      error = e;
    }

    $location.onChange(changeListener, errorHandler);

    $location.url('/newUrl');
    mock$rootScope.runWatchers();
    expect(error.message).toBe('Handle error');
  });
});

function parseLinkAndReturn(location: $locationShim, toUrl: string, relHref?: string) {
  const resetUrl = location.$$parseLinkUrl(toUrl, relHref);
  return resetUrl && location.absUrl() || undefined;
}
