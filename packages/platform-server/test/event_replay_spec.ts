/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  APP_ID,
  Component,
  destroyPlatform,
  Directive,
  ErrorHandler,
  HostListener,
  inject,
  PendingTasks,
  PLATFORM_ID,
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {
  bootstrapApplication,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import {EventPhase} from '@angular/core/primitives/event-dispatch';

import {
  getAppContents,
  hydrate,
  prepareEnvironment,
  prepareEnvironmentAndHydrate,
  resetTViewsFor,
} from './dom_utils';
import {getDocument} from '@angular/core/src/render3/interfaces/document';
import {EVENT_DISPATCH_SCRIPT, ssr} from './hydration_utils';
import {EVENT_DISPATCH_SCRIPT_ID} from '../src/utils';

/** Checks whether event dispatch script is present in the generated HTML */
function hasEventDispatchScript(content: string) {
  return content.includes(EVENT_DISPATCH_SCRIPT_ID);
}

/** Checks whether there are any `jsaction` attributes present in the generated HTML */
function hasJSActionAttrs(content: string) {
  return content.includes('jsaction="');
}

/**
 * Enables strict error handler that fails a test
 * if there was an error reported to the ErrorHandler.
 */
function withStrictErrorHandler() {
  class StrictErrorHandler extends ErrorHandler {
    override handleError(error: any): void {
      fail(error);
    }
  }
  return [
    {
      provide: ErrorHandler,
      useClass: StrictErrorHandler,
    },
  ];
}

describe('event replay', () => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;

  beforeAll(async () => {
    globalThis.window = globalThis as unknown as Window & typeof globalThis;
    await import('@angular/core/primitives/event-dispatch/contract_bundle_min.js' as string);
  });

  beforeEach(() => {
    destroyPlatform();
  });

  afterAll(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });

  afterEach(() => {
    destroyPlatform();
    window._ejsas = {};
  });

  it('should work for elements with local refs', async () => {
    const onClickSpy = jasmine.createSpy();

    @Component({
      selector: 'app',
      standalone: true,
      template: `
        <button id="btn" (click)="onClick()" #localRef></button>
      `,
    })
    class AppComponent {
      onClick = onClickSpy;
    }
    const hydrationFeatures = () => [withEventReplay()];
    const html = await ssr(AppComponent, {hydrationFeatures});
    const ssrContents = getAppContents(html);
    const doc = getDocument();

    prepareEnvironment(doc, ssrContents);
    resetTViewsFor(AppComponent);
    const btn = doc.getElementById('btn')!;
    btn.click();
    const appRef = await hydrate(doc, AppComponent, {hydrationFeatures});
    appRef.tick();
    expect(onClickSpy).toHaveBeenCalled();
  });

  it('stash event listeners should not conflict when multiple apps are bootstrapped', async () => {
    const onClickSpy = jasmine.createSpy();

    @Component({
      selector: 'app',
      standalone: true,
      template: `
        <button id="btn-1" (click)="onClick()"></button>
      `,
    })
    class AppComponent_1 {
      onClick = onClickSpy;
    }

    @Component({
      selector: 'app-2',
      standalone: true,
      template: `
        <button id="btn-2" (click)="onClick()"></button>
      `,
    })
    class AppComponent_2 {
      onClick() {}
    }

    const hydrationFeatures = () => [withEventReplay()];
    const docHtml = `
      <html>
      <head></head>
      <body>
        ${EVENT_DISPATCH_SCRIPT}
        <app></app>
        <app-2></app-2>
      </body>
      </html>
    `;
    const html = await ssr(AppComponent_1, {hydrationFeatures, doc: docHtml});
    const ssrContents = getAppContents(html);
    const doc = getDocument();

    prepareEnvironment(doc, ssrContents);
    resetTViewsFor(AppComponent_1);

    const btn = doc.getElementById('btn-1')!;
    btn.click();

    // It's hard to server-side render multiple applications in this
    // particular unit test and hydrate them on the client, so instead,
    // let's render the application with `provideClientHydration` to enable
    // event replay features and ensure the stash event listener is set.
    await bootstrapApplication(AppComponent_2, {
      providers: [
        provideClientHydration(withEventReplay()),
        {provide: APP_ID, useValue: 'random_name'},
      ],
    });

    // Now let's hydrate the second application and ensure that the
    // button click event has been replayed.
    const appRef = await hydrate(doc, AppComponent_1, {hydrationFeatures});
    appRef.tick();

    expect(onClickSpy).toHaveBeenCalled();
  });

  it('should cleanup `window._ejsas[appId]` once app is destroyed', async () => {
    @Component({
      selector: 'app',
      standalone: true,
      template: `
        <button id="btn" (click)="onClick()"></button>
      `,
    })
    class AppComponent {
      onClick() {}
    }

    const hydrationFeatures = () => [withEventReplay()];
    const html = await ssr(AppComponent, {hydrationFeatures});
    const ssrContents = getAppContents(html);
    const doc = getDocument();

    prepareEnvironment(doc, ssrContents);
    resetTViewsFor(AppComponent);

    const btn = doc.getElementById('btn')!;
    btn.click();

    const appRef = await hydrate(doc, AppComponent, {hydrationFeatures});
    appRef.tick();
    const appId = appRef.injector.get(APP_ID);

    appRef.destroy();
    // This ensure that `_ejsas` for the current application is cleaned up
    // once the application is destroyed.
    expect(window._ejsas![appId]).toBeUndefined();
  });

  it('should route to the appropriate component with content projection', async () => {
    const outerOnClickSpy = jasmine.createSpy();
    const innerOnClickSpy = jasmine.createSpy();
    @Component({
      selector: 'app-card',
      standalone: true,
      template: `
        <div class="card">
          <button id="inner-button" (click)="onClick()"></button>
          <ng-content></ng-content>
        </div>
      `,
    })
    class CardComponent {
      onClick = innerOnClickSpy;
    }

    @Component({
      selector: 'app',
      imports: [CardComponent],
      standalone: true,
      template: `
        <app-card>
          <h2>Card Title</h2>
          <p>This is some card content.</p>
          <button id="outer-button" (click)="onClick()">Click Me</button>
        </app-card>
      `,
    })
    class AppComponent {
      onClick = outerOnClickSpy;
    }
    const hydrationFeatures = () => [withEventReplay()];
    const html = await ssr(AppComponent, {hydrationFeatures});
    const ssrContents = getAppContents(html);
    const doc = getDocument();

    prepareEnvironment(doc, ssrContents);
    resetTViewsFor(AppComponent);
    const outer = doc.getElementById('outer-button')!;
    const inner = doc.getElementById('inner-button')!;
    outer.click();
    inner.click();
    await hydrate(doc, AppComponent, {
      envProviders: [{provide: PLATFORM_ID, useValue: 'browser'}],
      hydrationFeatures,
    });
    expect(outerOnClickSpy).toHaveBeenCalledBefore(innerOnClickSpy);
  });

  describe('host bindings', () => {
    it('should not error when when binding to document:click on a container', async () => {
      const clickSpy = jasmine.createSpy();
      @Directive({
        selector: '[add-listener]',
      })
      class AddGlobalListener {
        @HostListener('document:click')
        handleClick = clickSpy;
      }

      @Component({
        selector: 'app',
        template: `
          <ng-container add-listener>
            <button id="click-me">Click me!</button>
          </ng-container>`,
        imports: [AddGlobalListener],
      })
      class AppComponent {}

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}];
      const hydrationFeatures = () => [withEventReplay()];

      const html = await ssr(AppComponent, {envProviders: providers, hydrationFeatures});
      const ssrContents = getAppContents(html);
      const doc = getDocument();

      prepareEnvironment(doc, ssrContents);
      resetTViewsFor(AppComponent);
      const clickMe = doc.getElementById('click-me')!;
      clickMe.click();
      await hydrate(doc, AppComponent, {
        envProviders: [{provide: PLATFORM_ID, useValue: 'browser'}, ...providers],
        hydrationFeatures,
      });

      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('should not error when when binding to window:click on a container', async () => {
      const clickSpy = jasmine.createSpy();
      @Directive({
        selector: '[add-listener]',
      })
      class AddGlobalListener {
        @HostListener('window:click')
        handleClick = clickSpy;
      }

      @Component({
        selector: 'app',
        template: `
          <ng-container add-listener>
            <button id="click-me">Click me!</button>
          </ng-container>`,
        imports: [AddGlobalListener],
      })
      class AppComponent {}

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}];
      const hydrationFeatures = () => [withEventReplay()];

      const html = await ssr(AppComponent, {envProviders: providers, hydrationFeatures});
      const ssrContents = getAppContents(html);
      const doc = getDocument();

      prepareEnvironment(doc, ssrContents);
      resetTViewsFor(AppComponent);
      const clickMe = doc.getElementById('click-me')!;
      clickMe.click();
      await hydrate(doc, AppComponent, {
        envProviders: [{provide: PLATFORM_ID, useValue: 'browser'}, ...providers],
        hydrationFeatures,
      });

      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('should not error when when binding to body:click on a container', async () => {
      const clickSpy = jasmine.createSpy();
      @Directive({
        selector: '[add-listener]',
      })
      class AddGlobalListener {
        @HostListener('body:click')
        handleClick = clickSpy;
      }

      @Component({
        selector: 'app',
        template: `
          <ng-container add-listener>
            <button id="click-me">Click me!</button>
          </ng-container>`,
        imports: [AddGlobalListener],
      })
      class AppComponent {}

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}];
      const hydrationFeatures = () => [withEventReplay()];

      const html = await ssr(AppComponent, {envProviders: providers, hydrationFeatures});
      const ssrContents = getAppContents(html);
      const doc = getDocument();

      prepareEnvironment(doc, ssrContents);
      resetTViewsFor(AppComponent);
      const clickMe = doc.getElementById('click-me')!;
      clickMe.click();
      await hydrate(doc, AppComponent, {
        envProviders: [{provide: PLATFORM_ID, useValue: 'browser'}, ...providers],
        hydrationFeatures,
      });

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  it('should remove jsaction attributes, but continue listening to events.', async () => {
    @Component({
      standalone: true,
      selector: 'app',
      template: `
            <div (click)="onClick()" id="1">
              <div (click)="onClick()" id="2"></div>
            </div>
          `,
    })
    class SimpleComponent {
      onClick() {}
    }

    const hydrationFeatures = () => [withEventReplay()];
    const html = await ssr(SimpleComponent, {hydrationFeatures});
    const ssrContents = getAppContents(html);
    const doc = getDocument();
    prepareEnvironment(doc, ssrContents);
    const el = doc.getElementById('1')!;
    expect(el.hasAttribute('jsaction')).toBeTrue();
    expect((el.firstChild as Element).hasAttribute('jsaction')).toBeTrue();
    resetTViewsFor(SimpleComponent);
    await hydrate(doc, SimpleComponent, {hydrationFeatures});
    expect(el.hasAttribute('jsaction')).toBeFalse();
    expect((el.firstChild as Element).hasAttribute('jsaction')).toBeFalse();
  });

  it(`should add 'nonce' attribute to event record script when 'ngCspNonce' is provided`, async () => {
    @Component({
      standalone: true,
      selector: 'app',
      template: `
            <div (click)="onClick()">
                <div (blur)="onClick()"></div>
            </div>
          `,
    })
    class SimpleComponent {
      onClick() {}
    }
    const hydrationFeatures = () => [withEventReplay()];

    const doc =
      `<html><head></head><body>${EVENT_DISPATCH_SCRIPT}` +
      `<app ngCspNonce="{{nonce}}"></app></body></html>`;
    const html = await ssr(SimpleComponent, {doc, hydrationFeatures});
    expect(getAppContents(html)).toContain('<script nonce="{{nonce}}">window.__jsaction_bootstrap');
  });

  it('should not throw an error when app is destroyed before becoming stable', async () => {
    // Spy manually, because we may not be able to retrieve the `Console`
    // after we destroy the application, but we still want to ensure that
    // no error is thrown in the console.
    const errorSpy = spyOn(console, 'error').and.callThrough();
    const logs: string[] = [];

    @Component({
      selector: 'app',
      standalone: true,
      template: `
        <button id="btn" (click)="onClick()"></button>
      `,
    })
    class AppComponent {
      constructor() {
        const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
        if (isBrowser) {
          const pendingTasks = inject(PendingTasks);
          // Given that, in a real-world scenario, some APIs add a pending
          // task and don't remove it until the app is destroyed.
          // This could be an HTTP request that contributes to app stability
          // and does not respond until the app is destroyed.
          pendingTasks.add();
        }
      }

      onClick(): void {}
    }
    const html = await ssr(AppComponent);
    const ssrContents = getAppContents(html);
    const doc = getDocument();

    prepareEnvironment(doc, ssrContents);
    resetTViewsFor(AppComponent);
    const btn = doc.getElementById('btn')!;
    btn.click();
    const appRef = await hydrate(doc, AppComponent, {
      hydrationFeatures: () => [withEventReplay()],
    });

    appRef.isStable.subscribe((isStable) => {
      logs.push(`isStable=${isStable}`);
    });

    // Destroy the application before it becomes stable, because we added
    // a task and didn't remove it explicitly.
    appRef.destroy();

    // Wait for a microtask so that `whenStable` resolves.
    await Promise.resolve();

    expect(logs).toEqual([
      'isStable=false',
      // In the end, the application became stable while being destroyed.
      'isStable=true',
    ]);

    // Ensure no error has been logged in the console,
    // such as "injector has already been destroyed."
    expect(errorSpy).not.toHaveBeenCalledWith(/Injector has already been destroyed/);
  });

  describe('bubbling behavior', () => {
    it('should propagate events', async () => {
      const onClickSpy = jasmine.createSpy();
      @Component({
        standalone: true,
        selector: 'app',
        template: `
            <div id="top" (click)="onClick()">
                <div id="bottom" (click)="onClick()"></div>
            </div>
          `,
      })
      class SimpleComponent {
        onClick = onClickSpy;
      }
      const hydrationFeatures = () => [withEventReplay()];
      const html = await ssr(SimpleComponent, {hydrationFeatures});
      const ssrContents = getAppContents(html);
      const doc = getDocument();

      prepareEnvironment(doc, ssrContents);
      resetTViewsFor(SimpleComponent);
      const bottomEl = doc.getElementById('bottom')!;
      bottomEl.click();
      await hydrate(doc, SimpleComponent, {
        envProviders: [{provide: PLATFORM_ID, useValue: 'browser'}],
        hydrationFeatures,
      });
      expect(onClickSpy).toHaveBeenCalledTimes(2);
      onClickSpy.calls.reset();
      bottomEl.click();
      expect(onClickSpy).toHaveBeenCalledTimes(2);
    });

    it('should not propagate events if stopPropagation is called', async () => {
      @Component({
        standalone: true,
        selector: 'app',
        template: `
            <div id="top" (click)="onClick($event)">
                <div id="bottom" (click)="onClick($event)"></div>
            </div>
          `,
      })
      class SimpleComponent {
        onClick(e: Event) {
          e.stopPropagation();
        }
      }
      const onClickSpy = spyOn(SimpleComponent.prototype, 'onClick').and.callThrough();
      const hydrationFeatures = () => [withEventReplay()];
      const html = await ssr(SimpleComponent, {hydrationFeatures});
      const ssrContents = getAppContents(html);
      const doc = getDocument();
      prepareEnvironment(doc, ssrContents);
      resetTViewsFor(SimpleComponent);
      const bottomEl = doc.getElementById('bottom')!;
      bottomEl.click();
      await hydrate(doc, SimpleComponent, {hydrationFeatures});
      expect(onClickSpy).toHaveBeenCalledTimes(1);
      onClickSpy.calls.reset();
      bottomEl.click();
      expect(onClickSpy).toHaveBeenCalledTimes(1);
    });

    it('should not have differences in event fields', async () => {
      let currentEvent!: Event;
      let latestTarget: EventTarget | null = null;
      let latestCurrentTarget: EventTarget | null = null;
      @Component({
        standalone: true,
        selector: 'app',
        template: `
            <div id="top" (click)="onClick($event)">
                <div id="bottom" (click)="onClick($event)"></div>
            </div>
          `,
      })
      class SimpleComponent {
        onClick(event: Event) {
          currentEvent = event;
          latestTarget = event.target;
          latestCurrentTarget = event.currentTarget;
        }
      }

      const hydrationFeatures = () => [withEventReplay()];

      const html = await ssr(SimpleComponent, {hydrationFeatures});
      const ssrContents = getAppContents(html);
      const doc = getDocument();
      prepareEnvironment(doc, ssrContents);
      resetTViewsFor(SimpleComponent);
      const bottomEl = doc.getElementById('bottom')!;
      bottomEl.click();
      await hydrate(doc, SimpleComponent, {
        envProviders: [{provide: PLATFORM_ID, useValue: 'browser'}],
        hydrationFeatures,
      });
      const replayedEvent = currentEvent;
      expect(replayedEvent.target).not.toBeNull();
      expect(replayedEvent.currentTarget).not.toBeNull();
      expect(replayedEvent.eventPhase).toBe(EventPhase.REPLAY);
      bottomEl.click();
      expect(replayedEvent.target).toBe(latestTarget);
      expect(replayedEvent.currentTarget).toBe(latestCurrentTarget);
    });
  });

  describe('event dispatch script', () => {
    it('should not be present on a page when hydration is disabled', async () => {
      @Component({
        standalone: true,
        selector: 'app',
        template: '<input (click)="onClick()" />',
      })
      class SimpleComponent {
        onClick() {}
      }

      const html = await ssr(SimpleComponent, {enableHydration: false});
      const ssrContents = getAppContents(html);

      expect(hasJSActionAttrs(ssrContents)).toBeFalse();
      expect(hasEventDispatchScript(ssrContents)).toBeFalse();
    });

    it('should not be present on a page if there are no events to replay', async () => {
      @Component({
        standalone: true,
        selector: 'app',
        template: 'Some text',
      })
      class SimpleComponent {}

      const hydrationFeatures = () => [withEventReplay()];
      const html = await ssr(SimpleComponent, {hydrationFeatures});
      const ssrContents = getAppContents(html);

      expect(hasJSActionAttrs(ssrContents)).toBeFalse();
      expect(hasEventDispatchScript(ssrContents)).toBeFalse();

      resetTViewsFor(SimpleComponent);
      const doc = getDocument();
      await prepareEnvironmentAndHydrate(doc, ssrContents, SimpleComponent, {
        envProviders: [
          {provide: PLATFORM_ID, useValue: 'browser'},
          // This ensures that there are no errors while bootstrapping an application
          // that has no events, but enables Event Replay feature.
          withStrictErrorHandler(),
        ],
        hydrationFeatures,
      });
    });

    it('should not replay mouse events', async () => {
      @Component({
        standalone: true,
        selector: 'app',
        template: '<div (mouseenter)="doThing()"><div>',
      })
      class SimpleComponent {
        doThing() {}
      }
      const hydrationFeatures = () => [withEventReplay()];

      const html = await ssr(SimpleComponent, {hydrationFeatures});
      const ssrContents = getAppContents(html);

      expect(hasJSActionAttrs(ssrContents)).toBeFalse();
      expect(hasEventDispatchScript(ssrContents)).toBeFalse();
    });

    it('should not be present on a page where event replay is not enabled', async () => {
      @Component({
        standalone: true,
        selector: 'app',
        template: '<input (click)="onClick()" />',
      })
      class SimpleComponent {
        onClick() {}
      }

      const html = await ssr(SimpleComponent, {});
      const ssrContents = getAppContents(html);

      // Expect that there are no JSAction artifacts in the HTML
      // (even though there are events in a template), since event
      // replay is disabled in the config.
      expect(hasJSActionAttrs(ssrContents)).toBeFalse();
      expect(hasEventDispatchScript(ssrContents)).toBeFalse();
    });

    it('should be retained if there are events to replay', async () => {
      @Component({
        standalone: true,
        selector: 'app',
        template: '<input (click)="onClick()" />',
      })
      class SimpleComponent {
        onClick() {}
      }

      const hydrationFeatures = () => [withEventReplay()];
      const html = await ssr(SimpleComponent, {hydrationFeatures});

      const ssrContents = getAppContents(html);

      expect(hasJSActionAttrs(ssrContents)).toBeTrue();
      expect(hasEventDispatchScript(ssrContents)).toBeTrue();

      // Verify that inlined event delegation script goes first and
      // event contract setup goes second (since it uses some code from
      // the inlined script).
      expect(ssrContents).toContain(
        `<script type="text/javascript" id="ng-event-dispatch-contract"></script>` +
          `<script>window.__jsaction_bootstrap(document.body,"ng",["click"],[]);</script>`,
      );
    });
  });
});
