/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Component, destroyPlatform} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {withBody} from '@angular/private/testing';
import {NavigationCancel, NavigationError, NavigationSkipped, NavigationStart, provideRouter, Router, withDisabledInitialNavigation} from '@angular/router';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';

/// <reference types="@types/dom-navigation" />

describe('navigation api', () => {
  if (isNode) {
    it('not available in node environment', () => {});
    return;
  }

  beforeEach(destroyPlatform);
  afterEach(destroyPlatform);
  it('should not duplicate router navigations if the browser navigation event is intercepted',
     withBody('<test-app></test-app>', async () => {
       // intercepting a `NavigateEvent` causes the navigation to be converted to a single-page
       // navigation and will result in a `popstate` event. Because `popstate` events might be a
       // result of some navigation outside the Router (like a history traversal using the
       // forward/back buttons), the router listens for these events and triggers a navigation.
       // However, if this event happened because of the URL update _during_ an existing Router
       // navigation, we should not then trigger another Router navigation to sync state with the
       // browser.
       @Component({
         selector: 'test-app',
         standalone: true,
         template: ``,
       })
       class App {
       }

       const appRef = await bootstrapApplication(App, {
         providers: [
           provideRouter(
               [{
                 path: '**',
                 // Add a guard that delays this navigation. This is needed to verify that the
                 // intercepted navigation, which causes a `popstate` did not result in another
                 // router navigation (the navigations as a result of `popstate` are done in a
                 // `setTimeout`).
                 canActivate: [() => of(true).pipe(delay(500))],
                 component: App,
               }],
               withDisabledInitialNavigation(),
               ),
         ]
       });

       const window = appRef.injector.get(DOCUMENT).defaultView;
       const listener = (e: NavigateEvent) => {
         if (e.canIntercept) {
           e.intercept({handler: Promise.resolve});
         }
       };
       if (window?.navigation) {
         window.navigation.addEventListener('navigate', listener);
       }

       const router = appRef.injector.get(Router);
       let navigations = 0;
       let navigationFailures = 0;
       router.events.subscribe(e => {
         if (e instanceof NavigationCancel || e instanceof NavigationSkipped ||
             e instanceof NavigationError) {
           navigationFailures++;
         }
         if (e instanceof NavigationStart) {
           navigations++;
         }
       });
       await router.navigateByUrl('/a');
       await router.navigateByUrl('/b');
       expect(navigations).toBe(2);
       expect(navigationFailures)
           .withContext('expected all navigations to succeed but at least one failed')
           .toBe(0);
       if (window?.navigation) {
         window.navigation.removeEventListener('navigate', listener);
       }
     }));
});
