/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, LocationStrategy, PathLocationStrategy, PlatformLocation} from '@angular/common';
import {MockPlatformLocation} from '@angular/common/testing';
import {LocationUpgradeModule, LocationUpgradeService} from '@angular/common/upgrade';
import {TestBed, inject} from '@angular/core/testing';
import {UpgradeModule} from '@angular/upgrade/static';

import {LocationUpgradeTestModule} from './upgrade_location_test_module';

describe('LocationUpgradeService', () => {
  let upgradeModule: UpgradeModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LocationUpgradeTestModule.config(),
      ],
      providers: [UpgradeModule],
    });

    upgradeModule = TestBed.get(UpgradeModule);
    upgradeModule.$injector = {
      get: jasmine.createSpy('$injector.get').and.returnValue({'$on': () => undefined})
    };
  });

  it('should instantiate LocationUpgradeService',
     inject([LocationUpgradeService], (location: LocationUpgradeService) => {
       expect(location).toBeDefined();
       expect(location instanceof LocationUpgradeService).toBe(true);
       expect((location as any).locationStrategy instanceof PathLocationStrategy).toBe(true);
     }));

});


describe('LocationHtml5Url', function() {
  let location: LocationUpgradeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        LocationUpgradeTestModule.config(
            {useHash: false, appBaseHref: '/pre', startUrl: 'http://server'}),
      ],
      providers: [UpgradeModule],
    });
  });

  beforeEach(
      inject([LocationUpgradeService], (loc: LocationUpgradeService) => { location = loc; }));


  it('should set the URL', () => {
    location.url('');
    expect(location.absUrl()).toBe('http://server/pre/');
    location.url('/test');
    expect(location.absUrl()).toBe('http://server/pre/test');
    location.url('test');
    expect(location.absUrl()).toBe('http://server/pre/test');
    location.url('/somewhere?something=1#hash_here');
    expect(location.absUrl()).toBe('http://server/pre/somewhere?something=1#hash_here');
  });

  it('should rewrite regular URL', () => {
    expect(parseLinkAndReturn(location, 'http://other')).toEqual(undefined);
    expect(parseLinkAndReturn(location, 'http://server/pre')).toEqual('http://server/pre/');
    expect(parseLinkAndReturn(location, 'http://server/pre/')).toEqual('http://server/pre/');
    expect(parseLinkAndReturn(location, 'http://server/pre/otherPath'))
        .toEqual('http://server/pre/otherPath');
    // Note: relies on the previous state!
    expect(parseLinkAndReturn(location, 'someIgnoredAbsoluteHref', '#test'))
        .toEqual('http://server/pre/otherPath#test');
  });

  it('should rewrite index URL', () => {
    // Reset hostname url and hostname
    location.$$parseLinkUrl('http://server/pre/index.html');
    expect(location.absUrl()).toEqual('http://server/pre/');

    expect(parseLinkAndReturn(location, 'http://server/pre')).toEqual('http://server/pre/');
    expect(parseLinkAndReturn(location, 'http://server/pre/')).toEqual('http://server/pre/');
    expect(parseLinkAndReturn(location, 'http://server/pre/otherPath'))
        .toEqual('http://server/pre/otherPath');
    // Note: relies on the previous state!
    expect(parseLinkAndReturn(location, 'someIgnoredAbsoluteHref', '#test'))
        .toEqual('http://server/pre/otherPath#test');
  });

  it('should rewrite umlaut URL', () => {
    // Reset hostname url and hostname
    location.url('/');
    (location as any).platformLocation.hostname = 'särver';
    expect(location.absUrl()).toEqual('http://särver/pre/');

    expect(parseLinkAndReturn(location, 'http://other')).toEqual(undefined);
    expect(parseLinkAndReturn(location, 'http://särver/pre')).toEqual('http://särver/pre/');
    expect(parseLinkAndReturn(location, 'http://särver/pre/')).toEqual('http://särver/pre/');
    expect(parseLinkAndReturn(location, 'http://särver/pre/otherPath'))
        .toEqual('http://särver/pre/otherPath');
    // Note: relies on the previous state!
    expect(parseLinkAndReturn(location, 'someIgnoredAbsoluteHref', '#test'))
        .toEqual('http://särver/pre/otherPath#test');
  });

  it('should complain if the path starts with double slashes', function() {
    expect(function() {
      parseLinkAndReturn(location, 'http://server/pre///other/path');
    }).toThrow();

    expect(function() {
      parseLinkAndReturn(location, 'http://server/pre/\\\\other/path');
    }).toThrow();

    expect(function() {
      parseLinkAndReturn(location, 'http://server/pre//\\//other/path');
    }).toThrow();
  });

  // it('should complain if no base tag present', function() {
  //   module(function($locationProvider) { $locationProvider.html5Mode(true); });

  //   inject(function($browser, $injector) {
  //     $browser.$$baseHref = undefined;
  //     expect(function() { $injector.get('$location'); })
  //         .toThrowMinErr(
  //             '$location', 'nobase',
  //             '$location in HTML5 mode requires a <base> tag to be present!');
  //   });
  // });


  // it('should not complain if baseOptOut set to true in html5Mode', function() {
  //   module(function($locationProvider) {
  //     $locationProvider.html5Mode({enabled: true, requireBase: false});
  //   });

  //   inject(function($browser, $injector) {
  //     $browser.$$baseHref = undefined;
  //     expect(function() { $injector.get('$location'); })
  //         .not.toThrowMinErr(
  //             '$location', 'nobase',
  //             '$location in HTML5 mode requires a <base> tag to be present!');
  //   });
  // });

  it('should support state',
     function() { expect(location.state({a: 2}).state()).toEqual({a: 2}); });
});


describe('NewUrl', function() {
  var location: LocationUpgradeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        LocationUpgradeTestModule.config({useHash: false, startUrl: 'http://www.domain.com:9877'}),
      ],
      providers: [UpgradeModule],
    });
  });

  beforeEach(
      inject([LocationUpgradeService], (loc: LocationUpgradeService) => { location = loc; }));

  // Sets the default most of these tests rely on
  function setupUrl(url = 'http://www.domain.com:9877/path/b?search=a&b=c&d#hash') {
    location.url(url);
  }

  it('should provide common getters', function() {
    setupUrl();
    expect(location.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d#hash');
    expect(location.protocol()).toBe('http');
    expect(location.host()).toBe('www.domain.com');
    expect(location.port()).toBe(9877);
    expect(location.path()).toBe('/path/b');
    expect(location.search()).toEqual({search: 'a', b: 'c', d: true});
    expect(location.hash()).toBe('hash');
    expect(location.url()).toBe('/path/b?search=a&b=c&d#hash');
  });


  it('path() should change path', function() {
    setupUrl();
    location.path('/new/path');
    expect(location.path()).toBe('/new/path');
    expect(location.absUrl()).toBe('http://www.domain.com:9877/new/path?search=a&b=c&d#hash');
  });

  it('path() should not break on numeric values', function() {
    setupUrl();
    location.path(1);
    expect(location.path()).toBe('/1');
    expect(location.absUrl()).toBe('http://www.domain.com:9877/1?search=a&b=c&d#hash');
  });

  it('path() should allow using 0 as path', function() {
    setupUrl();
    location.path(0);
    expect(location.path()).toBe('/0');
    expect(location.absUrl()).toBe('http://www.domain.com:9877/0?search=a&b=c&d#hash');
  });

  it('path() should set to empty path on null value', function() {
    setupUrl();
    location.path('/foo');
    expect(location.path()).toBe('/foo');
    location.path(null);
    expect(location.path()).toBe('/');
  });

  it('search() should accept string', function() {
    setupUrl();
    location.search('x=y&c');
    expect(location.search()).toEqual({x: 'y', c: true});
    expect(location.absUrl()).toBe('http://www.domain.com:9877/path/b?x=y&c#hash');
  });


  it('search() should accept object', function() {
    setupUrl();
    location.search({one: 1, two: true});
    expect(location.search()).toEqual({one: '1', two: true});
    expect(location.absUrl()).toBe('http://www.domain.com:9877/path/b?one=1&two#hash');
  });


  it('search() should copy object', function() {
    setupUrl();
    var obj = {one: 1, two: true, three: null};
    location.search(obj);
    expect(obj).toEqual({one: 1, two: true, three: null});
    obj.one = 100;  // changed value
    expect(location.search()).toEqual({one: '1', two: true});
    expect(location.absUrl()).toBe('http://www.domain.com:9877/path/b?one=1&two#hash');
  });


  it('search() should change single parameter', function() {
    setupUrl();
    location.search({id: 'old', preserved: true});
    location.search('id', 'new');

    expect(location.search()).toEqual({id: 'new', preserved: true});
  });


  it('search() should remove single parameter', function() {
    setupUrl();
    location.search({id: 'old', preserved: true});
    location.search('id', null);

    expect(location.search()).toEqual({preserved: true});
  });


  it('search() should remove multiple parameters', function() {
    setupUrl();
    location.search({one: 1, two: true});
    expect(location.search()).toEqual({one: '1', two: true});
    location.search({one: null, two: null});
    expect(location.search()).toEqual({});
    expect(location.absUrl()).toBe('http://www.domain.com:9877/path/b#hash');
  });


  it('search() should accept numeric keys', function() {
    setupUrl();
    location.search({1: 'one', 2: 'two'});
    expect(location.search()).toEqual({'1': 'one', '2': 'two'});
    expect(location.absUrl()).toBe('http://www.domain.com:9877/path/b?1=one&2=two#hash');
  });


  it('search() should handle multiple value', function() {
    setupUrl();
    location.search('a&b');
    expect(location.search()).toEqual({a: true, b: true});

    location.search('a', null);

    expect(location.search()).toEqual({b: true});

    location.search('b', undefined);
    expect(location.search()).toEqual({});
  });


  it('search() should handle single value', function() {
    setupUrl();
    location.search('ignore');
    expect(location.search()).toEqual({ignore: true});
    location.search(1);
    expect(location.search()).toEqual({1: true});
  });


  // it('search() should throw error an incorrect argument', function() {
  //   expect(function() { location.search(null); })
  //       .toThrowMinErr(
  //           '$location', 'isrcharg',
  //           'The first argument of the `$location#search()` call must be a string or an
  //           object.');
  //   expect(function() { location.search(undefined); })
  //       .toThrowMinErr(
  //           '$location', 'isrcharg',
  //           'The first argument of the `$location#search()` call must be a string or an
  //           object.');
  // });


  it('hash() should change hash fragment', function() {
    setupUrl();
    location.hash('new-hash');
    expect(location.hash()).toBe('new-hash');
    expect(location.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d#new-hash');
  });


  it('hash() should accept numeric parameter', function() {
    setupUrl();
    location.hash(5);
    expect(location.hash()).toBe('5');
    expect(location.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d#5');
  });

  it('hash() should allow using 0', function() {
    setupUrl();
    location.hash(0);
    expect(location.hash()).toBe('0');
    expect(location.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d#0');
  });

  it('hash() should accept null parameter', function() {
    setupUrl();
    location.hash(null);
    expect(location.hash()).toBe('');
    expect(location.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d');
  });


  it('url() should change the path, search and hash', function() {
    setupUrl();
    location.url('/some/path?a=b&c=d#hhh');
    expect(location.url()).toBe('/some/path?a=b&c=d#hhh');
    expect(location.absUrl()).toBe('http://www.domain.com:9877/some/path?a=b&c=d#hhh');
    expect(location.path()).toBe('/some/path');
    expect(location.search()).toEqual({a: 'b', c: 'd'});
    expect(location.hash()).toBe('hhh');
  });


  it('url() should change only hash when no search and path specified', function() {
    setupUrl();
    location.url('#some-hash');

    expect(location.hash()).toBe('some-hash');
    expect(location.url()).toBe('/path/b?search=a&b=c&d#some-hash');
    expect(location.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d#some-hash');
  });


  it('url() should change only search and hash when no path specified', function() {
    setupUrl();
    location.url('?a=b');

    expect(location.search()).toEqual({a: 'b'});
    expect(location.hash()).toBe('');
    expect(location.path()).toBe('/path/b');
  });


  it('url() should reset search and hash when only path specified', function() {
    setupUrl();
    location.url('/new/path');

    expect(location.path()).toBe('/new/path');
    expect(location.search()).toEqual({});
    expect(location.hash()).toBe('');
  });

  it('url() should change path when empty string specified', function() {
    setupUrl();
    location.url('');

    expect(location.path()).toBe('/');
    expect(location.search()).toEqual({});
    expect(location.hash()).toBe('');
  });


  // it('replace should set $$replace flag and return itself', function() {
  //   expect(location.$$replace).toBe(false);

  //   location.replace();
  //   expect(location.$$replace).toBe(true);
  //   expect(location.replace()).toBe(location);
  // });

  describe('encoding', function() {

    it('should encode special characters', function() {
      location.path('/a <>#');
      location.search({'i j': '<>#'});
      location.hash('<>#');

      expect(location.path()).toBe('/a <>#');
      expect(location.search()).toEqual({'i j': '<>#'});
      expect(location.hash()).toBe('<>#');
      expect(location.absUrl())
          .toBe('http://www.domain.com:9877/a%20%3C%3E%23?i%20j=%3C%3E%23#%3C%3E%23');
    });

    it('should not encode !$:@', function() {
      location.path('/!$:@');
      location.search('');
      location.hash('!$:@');

      expect(location.absUrl()).toBe('http://www.domain.com:9877/!$:@#!$:@');
    });


    // it('should decode special characters', function() {
    //   var locationUrl = new LocationHtml5Url('http://host.com/', 'http://host.com/');
    //   locationUrl.$$parse('http://host.com/a%20%3C%3E%23?i%20j=%3C%3E%23#x%20%3C%3E%23');
    //   expect(locationUrl.path()).toBe('/a <>#');
    //   expect(locationUrl.search()).toEqual({'i j': '<>#'});
    //   expect(locationUrl.hash()).toBe('x <>#');
    // });


    // it('should not decode encoded forward slashes in the path', function() {
    //   var locationUrl = new LocationHtml5Url('http://host.com/base/', 'http://host.com/base/');
    //   locationUrl.$$parse('http://host.com/base/a/ng2;path=%2Fsome%2Fpath');
    //   expect(locationUrl.path()).toBe('/a/ng2;path=%2Fsome%2Fpath');
    //   expect(locationUrl.search()).toEqual({});
    //   expect(locationUrl.hash()).toBe('');
    //   expect(locationUrl.url()).toBe('/a/ng2;path=%2Fsome%2Fpath');
    //   expect(locationUrl.absUrl()).toBe('http://host.com/base/a/ng2;path=%2Fsome%2Fpath');
    // });

    // it('should decode pluses as spaces in urls', function() {
    //   var locationUrl = new LocationHtml5Url('http://host.com/', 'http://host.com/');
    //   locationUrl.$$parse('http://host.com/?a+b=c+d');
    //   expect(locationUrl.search()).toEqual({'a b': 'c d'});
    // });

    it('should retain pluses when setting search queries', function() {
      location.search({'a+b': 'c+d'});
      expect(location.search()).toEqual({'a+b': 'c+d'});
    });

  });

  it('should not preserve old properties when parsing new url', function() {
    location.$$parse('http://www.domain.com:9877/a');

    expect(location.path()).toBe('/a');
    expect(location.search()).toEqual({});
    expect(location.hash()).toBe('');
    expect(location.absUrl()).toBe('http://www.domain.com:9877/a');
  });
});

describe('New URL Parsing', () => {
  let location: LocationUpgradeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        LocationUpgradeTestModule.config(
            {useHash: false, appBaseHref: '/base', startUrl: 'http://server'}),
      ],
      providers: [UpgradeModule],
    });
  });

  beforeEach(
      inject([LocationUpgradeService], (loc: LocationUpgradeService) => { location = loc; }));

  it('should prepend path with basePath', function() {
    location.$$parse('http://server/base/abc?a');
    expect(location.path()).toBe('/abc');
    expect(location.search()).toEqual({a: true});

    location.path('/new/path');
    expect(location.absUrl()).toBe('http://server/base/new/path?a');
  });

});

describe('New URL Parsing', () => {
  let location: LocationUpgradeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        LocationUpgradeTestModule.config({useHash: false, startUrl: 'http://host.com/'}),
      ],
      providers: [UpgradeModule],
    });
  });

  beforeEach(
      inject([LocationUpgradeService], (loc: LocationUpgradeService) => { location = loc; }));

  it('should parse new url', function() {
    location.$$parse('http://host.com/base');
    expect(location.path()).toBe('/base');
  });

  it('should parse new url with #', function() {
    location.$$parse('http://host.com/base#');
    expect(location.path()).toBe('/base');
  });

  it('should prefix path with forward-slash', function() {
    location.path('b');

    expect(location.path()).toBe('/b');
    expect(location.absUrl()).toBe('http://host.com/b');
  });

  it('should set path to forward-slash when empty', function() {
    location.$$parse('http://host.com/');
    expect(location.path()).toBe('/');
    expect(location.absUrl()).toBe('http://host.com/');
  });

  it('setters should return Url object to allow chaining', function() {
    expect(location.path('/any')).toBe(location);
    expect(location.search('')).toBe(location);
    expect(location.hash('aaa')).toBe(location);
    expect(location.url('/some')).toBe(location);
  });

  it('should throw error when invalid server url given', function() {

    expect(function() { location.$$parse('http://other.server.org/path#/path'); })
        .toThrowError(
            'Invalid url "http://other.server.org/path#/path", missing path prefix "http://host.com".');
  });


  describe('state', function() {
    it('should set $$state and return itself', function() {
      expect(location.$$state).toEqual(undefined);

      var returned = location.state({a: 2});
      expect(location.$$state).toEqual({a: 2});
      expect(returned).toBe(location);
    });

    it('should set state', function() {
      location.state({a: 2});
      expect(location.state()).toEqual({a: 2});
    });

    it('should allow to set both URL and state', function() {
      location.url('/foo').state({a: 2});
      expect(location.url()).toEqual('/foo');
      expect(location.state()).toEqual({a: 2});
    });

    // TODO(jasonaden): This test needs to pass. Need to collect URL updates
    // rather than eagerly apply them. This was natural in AngularJS due to
    // the $digest cycle picking up changes and applying them all at once.
    xit('should allow to mix state and various URL functions', function() {
      location.path('/foo').hash('abcd').state({a: 2}).search('bar', 'baz');
      expect(location.path()).toEqual('/foo');
      expect(location.state()).toEqual({a: 2});
      expect(location.search() && location.search().bar).toBe('baz');
      expect(location.hash()).toEqual('abcd');
    });

  });


});



// it('should not rewrite when hashbang url is not given', function() {
//   initService({html5Mode: true, hashPrefix: '!', supportHistory: true});
//   inject(
//       initBrowser({url: 'http://domain.com/base/a/b', basePath: '/base'}),
//       function($rootScope, $location, $browser) {
//         expect($browser.url()).toBe('http://domain.com/base/a/b');
//       });
// });



describe('LocationHashbangUrl', function() {

  let location: LocationUpgradeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        LocationUpgradeTestModule.config(
            {useHash: true, appBaseHref: '/pre', startUrl: 'http://server'}),
      ],
      providers: [UpgradeModule],
    });
  });

  beforeEach(
      inject([LocationUpgradeService], (loc: LocationUpgradeService) => { location = loc; }));

  it('should rewrite URL', () => {
    expect(parseLinkAndReturn(location, 'http://other')).toEqual(undefined);
    expect(parseLinkAndReturn(location, 'http://server/pre')).toEqual('http://server/pre/');
    expect(parseLinkAndReturn(location, 'http://server/pre/')).toEqual('http://server/pre/');
    expect(parseLinkAndReturn(location, 'http://server/pre/#otherPath'))
        .toEqual('http://server/pre/#/otherPath');
    // eslint-disable-next-line no-script-url
    expect(parseLinkAndReturn(location, 'javascript:void(0)')).toEqual(undefined);

  });

  //   it('should not set hash if one was not originally specified', function() {
  //     locationUrl =
  //         new LocationHashbangUrl('http://server/pre/index.html', 'http://server/pre/', '#');

  //     locationUrl.$$parse('http://server/pre/index.html');
  //     expect(locationUrl.url()).toBe('');
  //     expect(locationUrl.absUrl()).toBe('http://server/pre/index.html');
  //   });

  //   it('should parse hash if one was specified', function() {
  //     locationUrl =
  //         new LocationHashbangUrl('http://server/pre/index.html', 'http://server/pre/', '#');

  //     locationUrl.$$parse('http://server/pre/index.html#/foo/bar');
  //     expect(locationUrl.url()).toBe('/foo/bar');
  //     expect(locationUrl.absUrl()).toBe('http://server/pre/index.html#/foo/bar');
  //   });


  //   it('should prefix hash url with / if one was originally missing', function() {
  //     locationUrl =
  //         new LocationHashbangUrl('http://server/pre/index.html', 'http://server/pre/', '#');

  //     locationUrl.$$parse('http://server/pre/index.html#not-starting-with-slash');
  //     expect(locationUrl.url()).toBe('/not-starting-with-slash');
  //     expect(locationUrl.absUrl()).toBe('http://server/pre/index.html#/not-starting-with-slash');
  //   });


  //   it('should not strip stuff from path just because it looks like Windows drive when it\'s
  //   not',
  //      function() {
  //        locationUrl =
  //            new LocationHashbangUrl('http://server/pre/index.html', 'http://server/pre/', '#');

  //        locationUrl.$$parse('http://server/pre/index.html#http%3A%2F%2Fexample.com%2F');
  //        expect(locationUrl.url()).toBe('/http://example.com/');
  //        expect(locationUrl.absUrl()).toBe('http://server/pre/index.html#/http://example.com/');
  //      });

  //   it('should throw on url(urlString, stateObject)',
  //      function() { expectThrowOnStateChange(locationUrl); });

  //   it('should allow navigating outside the original base URL', function() {
  //     locationUrl =
  //         new LocationHashbangUrl('http://server/pre/index.html', 'http://server/pre/', '#');

  //     locationUrl.$$parse('http://server/next/index.html');
  //     expect(locationUrl.url()).toBe('');
  //     expect(locationUrl.absUrl()).toBe('http://server/next/index.html');
  //   });
});


// describe('LocationHashbangInHtml5Url', function() {
//   /* global LocationHashbangInHtml5Url: false */
//   var locationUrl, locationIndexUrl;

//   beforeEach(function() {
//     locationUrl = new LocationHashbangInHtml5Url('http://server/pre/', 'http://server/pre/',
//     '#!');
//     locationIndexUrl =
//         new LocationHashbangInHtml5Url('http://server/pre/index.html', 'http://server/pre/',
//         '#!');
//   });

//   it('should rewrite URL', function() {
//     expect(parseLinkAndReturn(locationUrl, 'http://other')).toEqual(undefined);
//     expect(parseLinkAndReturn(locationUrl,
//     'http://server/pre')).toEqual('http://server/pre/#!');
//     expect(parseLinkAndReturn(locationUrl,
//     'http://server/pre/')).toEqual('http://server/pre/#!');
//     expect(parseLinkAndReturn(locationUrl, 'http://server/pre/otherPath'))
//         .toEqual('http://server/pre/#!/otherPath');
//     // Note: relies on the previous state!
//     expect(parseLinkAndReturn(locationUrl, 'someIgnoredAbsoluteHref', '#test'))
//         .toEqual('http://server/pre/#!/otherPath#test');

//     expect(parseLinkAndReturn(locationIndexUrl, 'http://server/pre'))
//         .toEqual('http://server/pre/index.html#!');
//     expect(parseLinkAndReturn(locationIndexUrl, 'http://server/pre/')).toEqual(undefined);
//     expect(parseLinkAndReturn(locationIndexUrl, 'http://server/pre/otherPath'))
//         .toEqual('http://server/pre/index.html#!/otherPath');
//     // Note: relies on the previous state!
//     expect(parseLinkAndReturn(locationIndexUrl, 'someIgnoredAbsoluteHref', '#test'))
//         .toEqual('http://server/pre/index.html#!/otherPath#test');
//   });

//   it('should throw on url(urlString, stateObject)',
//      function() { expectThrowOnStateChange(locationUrl); });

//   it('should not throw when base path is another domain', function() {
//     initService({html5Mode: true, hashPrefix: '!', supportHistory: true});
//     inject(
//         initBrowser({url: 'http://domain.com/base/', basePath:
//         'http://otherdomain.com/base/'}),
//         function($location) { expect(function() { $location.absUrl(); }).not.toThrow(); });
//   });
// });

function parseLinkAndReturn(location: LocationUpgradeService, toUrl: string, relHref?: string) {
  const resetUrl = location.$$parseLinkUrl(toUrl, relHref);
  return resetUrl && location.absUrl() || undefined;
}
