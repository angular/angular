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
import {Event, NavigationEnd, provideRouter, Router, withDisabledInitialNavigation, withViewTransitions} from '@angular/router';


describe('view transitions', () => {
  if (isNode) {
    it('are not available in node environment', () => {});
    return;
  }

  beforeEach(destroyPlatform);
  afterEach(destroyPlatform);
  it('should create injector where ambient providers shadow explicit providers',
     withBody('<test-app></test-app>', async () => {
       @Component({
         selector: 'test-app',
         standalone: true,
         template: ``,
       })
       class App {
       }

       const appRef = await bootstrapApplication(App, {
         providers: [provideRouter(
             [{path: '**', component: App}],
             withDisabledInitialNavigation(),
             withViewTransitions({skipInitialTransition: true}),
             )]
       });

       const doc = appRef.injector.get(DOCUMENT);
       if (!doc.startViewTransition) {
         return;
       }

       const viewTransitionSpy = spyOn(doc, 'startViewTransition').and.callThrough();
       await appRef.injector.get(Router).navigateByUrl('/a');
       expect(viewTransitionSpy).not.toHaveBeenCalled();
       await appRef.injector.get(Router).navigateByUrl('/b');
       expect(viewTransitionSpy).toHaveBeenCalled();
     }));

  it('should have the correct event order when using view transitions',
     withBody('<app></app>', async () => {
       @Component({
         selector: 'component-b',
         template: `b`,
         standalone: true,
       })
       class ComponentB {
       }


       @Component({standalone: true, template: '', selector: 'app'})
       class App {
       }


       const res = await bootstrapApplication(App, {
         providers: [provideRouter([{path: 'b', component: ComponentB}], withViewTransitions())]
       });
       const router = res.injector.get(Router);
       const eventLog = [] as Event[];
       router.events.subscribe(e => {
         eventLog.push(e);
       });

       await router.navigateByUrl('/b');
       expect(eventLog[eventLog.length - 1]).toBeInstanceOf(NavigationEnd);
     }));
});
