/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {CachedResourceLoader} from '@angular/platform-browser-dynamic/src/resource_loader/resource_loader_cache';
import {setTemplateCache} from '@angular/platform-browser-dynamic/test/resource_loader/resource_loader_cache_setter';
import {expect} from '@angular/platform-browser/testing/src/matchers';

if (isBrowser) {
  // TODO(alxhub): Resource loading works very differently in Ivy.
  xdescribe('CachedResourceLoader', () => {
    let resourceLoader: CachedResourceLoader;

    function createCachedResourceLoader(): CachedResourceLoader {
      setTemplateCache({'test.html': '<div>Hello</div>'});
      return new CachedResourceLoader();
    }

    it('should throw exception if $templateCache is not found', () => {
      setTemplateCache(null);
      expect(() => {
        resourceLoader = new CachedResourceLoader();
      }).toThrowError('CachedResourceLoader: Template cache was not found in $templateCache.');
    });

    it('should resolve the Promise with the cached file content on success', waitForAsync(() => {
         resourceLoader = createCachedResourceLoader();
         resourceLoader.get('test.html').then((text) => {
           expect(text).toBe('<div>Hello</div>');
         });
       }));

    it('should reject the Promise on failure', waitForAsync(() => {
         resourceLoader = createCachedResourceLoader();
         resourceLoader.get('unknown.html').then(() => {
           throw new Error('Not expected to succeed.');
         }, () => {/* success */});
       }));

    it('should allow fakeAsync Tests to load components with templateUrl synchronously',
       fakeAsync(() => {
         const loader = createCachedResourceLoader();
         @Component({selector: 'test-cmp', templateUrl: 'test.html'})
         class TestComponent {
         }

         //  resolveComponentResources(url => loader.get(url));
         tick();

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
