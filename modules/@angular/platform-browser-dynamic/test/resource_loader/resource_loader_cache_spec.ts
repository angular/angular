/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UrlResolver, ResourceLoader} from '@angular/compiler';
import {BaseException, Component} from '@angular/core';
import {TestBed, fakeAsync, flushMicrotasks, tick} from '@angular/core/testing';
import {AsyncTestCompleter, TestComponentBuilder, beforeEach, beforeEachProviders, ddescribe, describe, iit, inject, it, xit} from '@angular/core/testing/testing_internal';
import {expect} from '@angular/platform-browser/testing/matchers';

import {CachedResourceLoader} from '../../src/resource_loader/resource_loader_cache';

import {setTemplateCache} from './resource_loader_cache_setter';

export function main() {
  describe('CachedResourceLoader', () => {
    var xhr: CachedResourceLoader;

    function createCachedResourceLoader(): CachedResourceLoader {
      setTemplateCache({'test.html': '<div>Hello</div>'});
      return new CachedResourceLoader();
    }
    beforeEach(() => {
      TestBed.configureCompiler({
        providers: [
          {provide: UrlResolver, useClass: TestUrlResolver},
          {provide: ResourceLoader, useFactory: createCachedResourceLoader}
        ]
      });
    });

    it('should throw exception if $templateCache is not found', () => {
      setTemplateCache(null);
      expect(() => {
        xhr = new CachedResourceLoader();
      }).toThrowError('CachedResourceLoader: Template cache was not found in $templateCache.');
    });

    it('should resolve the Promise with the cached file content on success',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         setTemplateCache({'test.html': '<div>Hello</div>'});
         xhr = new CachedResourceLoader();
         xhr.get('test.html').then((text) => {
           expect(text).toEqual('<div>Hello</div>');
           async.done();
         });
       }));

    it('should reject the Promise on failure',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         xhr = new CachedResourceLoader();
         xhr.get('unknown.html')
             .then((text) => { throw new BaseException('Not expected to succeed.'); })
             .catch((error) => { async.done(); });
       }));

    it('should allow fakeAsync Tests to load components with templateUrl synchronously',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         let fixture = tcb.createFakeAsync(TestComponent);

         // This should initialize the fixture.
         tick();

         expect(fixture.debugElement.children[0].nativeElement).toHaveText('Hello');
       })));
  });
}

@Component({selector: 'test-cmp', templateUrl: 'test.html'})
class TestComponent {
}

class TestUrlResolver extends UrlResolver {
  resolve(baseUrl: string, url: string): string {
    // Don't use baseUrl to get the same URL as templateUrl.
    // This is to remove any difference between Dart and TS tests.
    return url;
  }
}
