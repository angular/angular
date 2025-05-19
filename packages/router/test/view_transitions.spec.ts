/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {Component, destroyPlatform, inject} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {withBody, isNode} from '@angular/private/testing';
import {
  Event,
  NavigationEnd,
  provideRouter,
  Router,
  withDisabledInitialNavigation,
  withViewTransitions,
} from '../index';

describe('view transitions', () => {
  if (isNode) {
    it('are not available in node environment', () => {});
    return;
  }

  beforeEach(destroyPlatform);
  afterEach(destroyPlatform);

  @Component({
    selector: 'test-app',
    template: ``,
  })
  class App {}
  beforeEach(withBody('<test-app></test-app>', () => {}));
  it('should skip initial transition', async () => {
    const appRef = await bootstrapApplication(App, {
      providers: [
        provideRouter(
          [{path: '**', component: App}],
          withDisabledInitialNavigation(),
          withViewTransitions({skipInitialTransition: true}),
        ),
      ],
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
  });

  it('should have the correct event order when using view transitions', async () => {
    @Component({
      selector: 'component-b',
      template: `b`,
    })
    class ComponentB {}

    const res = await bootstrapApplication(App, {
      providers: [provideRouter([{path: 'b', component: ComponentB}], withViewTransitions())],
    });
    const router = res.injector.get(Router);
    const eventLog = [] as Event[];
    router.events.subscribe((e) => {
      eventLog.push(e);
    });

    await router.navigateByUrl('/b');
    expect(eventLog[eventLog.length - 1]).toBeInstanceOf(NavigationEnd);
  });

  describe('onViewTransitionCreated option', () => {
    it('should not create a view transition if only the fragment changes', async () => {
      @Component({
        selector: 'test-app',
        template: `{{checks}}`,
      })
      class App {
        checks = 0;
        ngDoCheck() {
          this.checks++;
        }
      }

      const transitionSpy = jasmine.createSpy();
      const appRef = await bootstrapApplication(App, {
        providers: [
          provideRouter(
            [{path: '**', component: App}],
            withDisabledInitialNavigation(),
            withViewTransitions({onViewTransitionCreated: transitionSpy}),
          ),
        ],
      });

      const doc = appRef.injector.get(DOCUMENT);
      if (!doc.startViewTransition) {
        return;
      }

      await appRef.injector.get(Router).navigateByUrl('/a');
      expect(transitionSpy).toHaveBeenCalled();
    });
  });
});
