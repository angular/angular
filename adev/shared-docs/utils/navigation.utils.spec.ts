/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, withComponentInputBinding, withRouterResources} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {DocContent, NavigationItem} from '../interfaces/index';
import {DOCS_CONTENT_LOADER} from '../providers/index';
import {isExternalLink, mapNavigationItemsToRoutes} from './navigation.utils';

// Specs here are JIT-compiled, which registers neither signal inputs nor field decorators.
@Component({template: '', inputs: ['docContent']})
class FakeDocPage {
  docContent?: DocContent;
}

describe('navigation.utils', () => {
  describe('isExternalLink', () => {
    it('should return true for http and https links', () => {
      expect(isExternalLink('http://example.com')).toBeTrue();
      expect(isExternalLink('https://example.com')).toBeTrue();
      expect(isExternalLink('https://github.com/angular/angularfire#readme')).toBeTrue();
    });

    it('should return false for internal relative or absolute paths', () => {
      expect(isExternalLink('guide/signals')).toBeFalse();
      expect(isExternalLink('/guide/signals')).toBeFalse();
      expect(isExternalLink('overview')).toBeFalse();
    });
  });

  describe('mapNavigationItemsToRoutes', () => {
    it('should map internal navigation items to routes and ignore external links', () => {
      const items: NavigationItem[] = [
        {
          label: 'Overview',
          path: 'overview',
        },
        {
          label: 'AngularFire',
          path: 'https://github.com/angular/angularfire#readme',
        },
        {
          label: 'Google Maps',
          path: 'https://github.com/angular/components/tree/main/src/google-maps#readme',
        },
        {
          label: 'Guide',
          path: 'guide/components',
        },
      ];

      const routes = mapNavigationItemsToRoutes(items, {});

      expect(routes.length).toBe(2);
      expect(routes.map((r) => r.path)).toEqual(['overview', 'guide/components']);
    });

    describe('docContent resource', () => {
      let getContent: jasmine.Spy<(path: string) => Promise<DocContent>>;

      async function navigate(items: NavigationItem[], url: string): Promise<FakeDocPage> {
        TestBed.configureTestingModule({
          providers: [
            provideRouter(
              mapNavigationItemsToRoutes(items, {component: FakeDocPage}),
              withComponentInputBinding(),
              withRouterResources(),
            ),
            {provide: DOCS_CONTENT_LOADER, useValue: {getContent}},
          ],
        });
        const harness = await RouterTestingHarness.create();
        return harness.navigateByUrl(url, FakeDocPage);
      }

      beforeEach(() => {
        getContent = jasmine
          .createSpy('getContent')
          .and.callFake((path: string) => Promise.resolve({id: path, contents: `<p>${path}</p>`}));
      });

      it('should load the content of the navigation item before activating the route', async () => {
        const page = await navigate(
          [{label: 'Signals', path: 'guide/signals', contentPath: 'guide/signals/overview'}],
          '/guide/signals',
        );

        expect(getContent).toHaveBeenCalledOnceWith('guide/signals/overview');
        expect(page.docContent).toEqual({
          id: 'guide/signals/overview',
          contents: '<p>guide/signals/overview</p>',
        });
      });

      it('should not load any content when the navigation item has no content path', async () => {
        const page = await navigate([{label: 'Overview', path: 'overview'}], '/overview');

        expect(getContent).not.toHaveBeenCalled();
        expect(page.docContent).toBeUndefined();
      });

      it('should keep a resources function provided in the additional route properties', async () => {
        TestBed.configureTestingModule({
          providers: [
            provideRouter(
              mapNavigationItemsToRoutes(
                [{label: 'Overview', path: 'overview', contentPath: 'overview'}],
                {component: FakeDocPage, resources: () => ({})},
              ),
              withRouterResources(),
            ),
            {provide: DOCS_CONTENT_LOADER, useValue: {getContent}},
          ],
        });
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/overview', FakeDocPage);

        expect(getContent).not.toHaveBeenCalled();
      });
    });
  });
});
