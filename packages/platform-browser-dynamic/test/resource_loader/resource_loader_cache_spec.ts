/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ResourceLoader, UrlResolver} from '@angular/compiler';
import {Component} from '@angular/core';
import {TestBed, async, fakeAsync, tick} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

import {CachedResourceLoader} from '../../src/resource_loader/resource_loader_cache';

import {setTemplateCache} from './resource_loader_cache_setter';

export function main() {
  describe('CachedResourceLoader', () => {
    let resourceLoader: CachedResourceLoader;

    function createCachedResourceLoader(): CachedResourceLoader {
      setTemplateCache({'test.html': '<div>Hello</div>'});
      return new CachedResourceLoader();
    }
    beforeEach(fakeAsync(() => {
      TestBed.configureCompiler({
        providers: [
          {provide: UrlResolver, useClass: TestUrlResolver},
          {provide: ResourceLoader, useFactory: createCachedResourceLoader}
        ]
      });

      TestBed.configureTestingModule({declarations: [TestComponent]});
      TestBed.compileComponents();
    }));

    it('should throw exception if $templateCache is not found', () => {
      setTemplateCache(null);
      expect(() => {
        resourceLoader = new CachedResourceLoader();
      }).toThrowError('CachedResourceLoader: Template cache was not found in $templateCache.');
    });

    it('should resolve the Promise with the cached file content on success', async(() => {
         setTemplateCache({'test.html': '<div>Hello</div>'});
         resourceLoader = new CachedResourceLoader();
         resourceLoader.get('test.html').then((text) => { expect(text).toBe('<div>Hello</div>'); });
       }));

    it('should reject the Promise on failure', async(() => {
         resourceLoader = new CachedResourceLoader();
         resourceLoader.get('unknown.html')
             .then((text) => { throw new Error('Not expected to succeed.'); })
             .catch((error) => {/** success */});
       }));

    it('should allow fakeAsync Tests to load components with templateUrl synchronously',
       fakeAsync(() => {
         TestBed.configureTestingModule({declarations: [TestComponent]});
         TestBed.compileComponents();
         tick();

         const fixture = TestBed.createComponent(TestComponent);

         // This should initialize the fixture.
         tick();

         expect(fixture.debugElement.children[0].nativeElement).toHaveText('Hello');
       }));
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
