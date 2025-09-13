/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  APP_ID,
  ApplicationRef,
  Component,
  destroyPlatform,
  inject,
  Input,
  NgZone,
  PLATFORM_ID,
  Provider,
  QueryList,
  signal,
  ViewChildren,
  ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
  ɵDEHYDRATED_BLOCK_REGISTRY as DEHYDRATED_BLOCK_REGISTRY,
  ɵJSACTION_BLOCK_ELEMENT_MAP as JSACTION_BLOCK_ELEMENT_MAP,
  ɵJSACTION_EVENT_CONTRACT as JSACTION_EVENT_CONTRACT,
  ɵgetDocument as getDocument,
  ɵTimerScheduler as TimerScheduler,
  provideZoneChangeDetection,
} from '@angular/core';

import {getAppContents, prepareEnvironmentAndHydrate, resetTViewsFor} from './dom_utils';
import {
  clearConsole,
  getComponentRef,
  resetNgDevModeCounters,
  ssr,
  timeout,
  verifyHasLog,
  verifyNodeWasHydrated,
  verifyNodeWasNotHydrated,
  withDebugConsole,
} from './hydration_utils';
import {
  isPlatformServer,
  Location,
  PlatformLocation,
  ɵPLATFORM_BROWSER_ID as PLATFORM_BROWSER_ID,
} from '@angular/common';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import {TestBed} from '@angular/core/testing';
import {provideRouter, RouterLink, RouterOutlet, Routes} from '@angular/router';
import {MockPlatformLocation} from '@angular/common/testing';

/**
 * Emulates a dynamic import promise.
 *
 * Note: `setTimeout` is used to make `fixture.whenStable()` function
 * wait for promise resolution, since `whenStable()` relies on the state
 * of a macrotask queue.
 */
function dynamicImportOf<T>(type: T, timeout = 0): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(type);
    }, timeout);
  });
}

/**
 * Emulates a failed dynamic import promise.
 */
function failedDynamicImport(): Promise<void> {
  return new Promise((_, reject) => {
    setTimeout(() => reject());
  });
}

/**
 * Helper function to await all pending dynamic imports
 * emulated using `dynamicImportOf` function.
 */
function allPendingDynamicImports() {
  return dynamicImportOf(null, 101);
}

describe('platform-server partial hydration integration', () => {
  const originalWindow = globalThis.window;

  beforeAll(async () => {
    globalThis.window = globalThis as unknown as Window & typeof globalThis;
    await import('../../core/primitives/event-dispatch/contract_bundle_min.js' as string);
  });

  afterAll(() => {
    globalThis.window = originalWindow;
  });

  afterEach(() => {
    destroyPlatform();
    window._ejsas = {};
  });

  describe('core functionality', () => {
    beforeEach(() => {
      clearConsole(TestBed.inject(ApplicationRef));
      resetNgDevModeCounters();
    });

    afterEach(() => {
      clearConsole(TestBed.inject(ApplicationRef));
    });

    describe('annotation', () => {
      it('should annotate inner components with defer block id', async () => {
        @Component({
          selector: 'dep-a',
          template: '<button (click)="null">Click A</button>',
        })
        class DepA {}

        @Component({
          selector: 'dep-b',
          imports: [DepA],
          template: `
        <dep-a />
        <button (click)="null">Click B</button>
      `,
        })
        class DepB {}

        @Component({
          selector: 'app',
          imports: [DepB],
          template: `
        <main (click)="fnA()">
          @defer (on viewport; hydrate on interaction) {
            <div (click)="fnA()">
              Main defer block rendered!
              @if (visible) {
                Defer events work!
              }
              <div id="outer-trigger" (mouseover)="showMessage()"></div>
              @defer (on viewport; hydrate on interaction) {
                <p (click)="fnA()">Nested defer block</p>
                <dep-b />
              } @placeholder {
                <span>Inner block placeholder</span>
              }
            </div>
          } @placeholder {
            <span>Outer block placeholder</span>
          }
        </main>
      `,
        })
        class SimpleComponent {
          items = [1, 2, 3];
          visible = false;
          fnA() {}
          showMessage() {
            this.visible = true;
          }
        }

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration(), withEventReplay()];

        const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<main jsaction="click:;">');
        // Buttons inside nested components inherit parent defer block namespace.
        expect(ssrContents).toContain('<button jsaction="click:;" ngb="d1">Click A</button>');
        expect(ssrContents).toContain('<button jsaction="click:;" ngb="d1">Click B</button>');
        expect(ssrContents).toContain('<!--ngh=d0-->');
        expect(ssrContents).toContain('<!--ngh=d1-->');
      });

      it('should not include trigger array when only JSAction triggers are present', async () => {
        @Component({
          selector: 'dep-a',
          template: '<button (click)="null">Click A</button>',
        })
        class DepA {}

        @Component({
          selector: 'dep-b',
          imports: [DepA],
          template: `
        <dep-a />
        <button (click)="null">Click B</button>
      `,
        })
        class DepB {}

        @Component({
          selector: 'app',
          imports: [DepB],
          template: `
        <main (click)="fnA()">
          @defer (on viewport; hydrate on interaction) {
            <div (click)="fnA()">
              Main defer block rendered!
              @if (visible) {
                Defer events work!
              }
              <div id="outer-trigger" (mouseover)="showMessage()"></div>
              @defer (on viewport; hydrate on interaction) {
                <p (click)="fnA()">Nested defer block</p>
                <dep-b />
              } @placeholder {
                <span>Inner block placeholder</span>
              }
            </div>
          } @placeholder {
            <span>Outer block placeholder</span>
          }
        </main>
      `,
        })
        class SimpleComponent {
          items = [1, 2, 3];
          visible = false;
          fnA() {}
          showMessage() {
            this.visible = true;
          }
        }

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration(), withEventReplay()];

        const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(
          '"__nghDeferData__":{"d0":{"r":1,"s":2},"d1":{"r":2,"s":2,"p":"d0"}}',
        );
      });

      it('should include trigger array for non-jsaction triggers', async () => {
        @Component({
          selector: 'dep-a',
          template: '<button (click)="null">Click A</button>',
        })
        class DepA {}

        @Component({
          selector: 'dep-b',
          imports: [DepA],
          template: `
        <dep-a />
        <button (click)="null">Click B</button>
      `,
        })
        class DepB {}

        @Component({
          selector: 'app',
          imports: [DepB],
          template: `
        <main (click)="fnA()">
          @defer (on viewport; hydrate on interaction) {
            <div (click)="fnA()">
              Main defer block rendered!
              @if (visible) {
                Defer events work!
              }
              <div id="outer-trigger" (mouseover)="showMessage()"></div>
              @defer (on viewport; hydrate on viewport) {
                <p (click)="fnA()">Nested defer block</p>
                <dep-b />
              } @placeholder {
                <span>Inner block placeholder</span>
              }
            </div>
          } @placeholder {
            <span>Outer block placeholder</span>
          }
        </main>
      `,
        })
        class SimpleComponent {
          items = [1, 2, 3];
          visible = false;
          fnA() {}
          showMessage() {
            this.visible = true;
          }
        }

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration(), withEventReplay()];

        const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(
          '"__nghDeferData__":{"d0":{"r":1,"s":2},"d1":{"r":2,"s":2,"t":[2],"p":"d0"}}',
        );
      });

      it('should not include parent id in serialized data for top-level `@defer` blocks', async () => {
        @Component({
          selector: 'app',
          template: `
            @defer (on viewport; hydrate on interaction) {
              Hello world!
            } @placeholder {
              <span>Placeholder</span>
            }
        `,
        })
        class SimpleComponent {}

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration()];

        const html = await ssr(SimpleComponent, {
          envProviders: providers,
          hydrationFeatures,
        });

        const ssrContents = getAppContents(html);

        // Assert that the serialized data doesn't contain the "p" field,
        // which contains parent id (which is not needed for top-level blocks).
        expect(ssrContents).toContain('"__nghDeferData__":{"d0":{"r":1,"s":2}}}');
      });
    });

    describe('basic hydration behavior', () => {
      it('should SSR and hydrate top-level `@defer` blocks', async () => {
        @Component({
          selector: 'app',
          template: `
          <main (click)="fnA()">
            @defer (on viewport; hydrate on interaction) {
              <article (click)="fnA()">
                Main defer block rendered!
                @if (visible) {
                  Defer events work!
                }
                <aside id="outer-trigger" (mouseover)="showMessage()"></aside>
                @defer (on viewport; hydrate on interaction) {
                  <p (click)="fnA()">Nested defer block</p>
                } @placeholder {
                  <span>Inner block placeholder</span>
                }
              </article>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
          </main>
        `,
        })
        class SimpleComponent {
          items = [1, 2, 3];
          visible = false;
          fnA() {}
          showMessage() {
            this.visible = true;
          }
        }

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration()];

        const html = await ssr(SimpleComponent, {
          envProviders: providers,
          hydrationFeatures,
        });

        const ssrContents = getAppContents(html);

        // Assert that we have `jsaction` annotations and
        // defer blocks are triggered and rendered.

        // <main> uses "eager" `custom-app-id` namespace.
        expect(ssrContents).toContain('<main jsaction="click:;');
        // <div>s inside a defer block have `d0` as a namespace.
        expect(ssrContents).toContain('<article jsaction="click:;keydown:;" ngb="d0');
        expect(ssrContents).toContain('<aside id="outer-trigger" jsaction="mouseover:;" ngb="d0');
        // <p> is inside a nested defer block -> different namespace.
        expect(ssrContents).toContain('<p jsaction="click:;keydown:;" ngb="d1');
        // There is an extra annotation in the TransferState data.
        expect(ssrContents).toContain(
          '"__nghDeferData__":{"d0":{"r":1,"s":2},"d1":{"r":1,"s":2,"p":"d0"}}',
        );
        // Outer defer block is rendered.
        expect(ssrContents).toContain('Main defer block rendered');
        // Inner defer block is rendered as well.
        expect(ssrContents).toContain('Nested defer block');

        // Internal cleanup before we do server->client transition in this test.
        resetTViewsFor(SimpleComponent);

        ////////////////////////////////
        const doc = getDocument();
        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
          hydrationFeatures,
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();
        await appRef.whenStable();

        const appHostNode = compRef.location.nativeElement;

        // At this point an eager part of an app is hydrated,
        // but defer blocks are still in dehydrated state.

        // <main> no longer has `jsaction` attribute.
        expect(appHostNode.outerHTML).toContain('<main>');

        // Elements from @defer blocks still have `jsaction` annotations,
        // since they were not triggered yet.
        expect(appHostNode.outerHTML).toContain('<article jsaction="click:;keydown:;" ngb="d0');
        expect(appHostNode.outerHTML).toContain(
          '<aside id="outer-trigger" jsaction="mouseover:;" ngb="d0',
        );
        expect(appHostNode.outerHTML).toContain('<p jsaction="click:;keydown:;" ngb="d1');

        // Emit an event inside of a defer block, which should result
        // in triggering the defer block (start loading deps, etc) and
        // subsequent hydration.
        const inner = doc.getElementById('outer-trigger')!;
        const clickEvent2 = new CustomEvent('mouseover', {bubbles: true});
        inner.dispatchEvent(clickEvent2);
        await allPendingDynamicImports();

        appRef.tick();

        // An event was replayed after hydration, which resulted in
        // an `@if` block becoming active and its inner content got
        // rendered/
        expect(appHostNode.outerHTML).toContain('Defer events work');

        // All outer defer block elements no longer have `jsaction` annotations.
        expect(appHostNode.outerHTML).not.toContain('<div jsaction="click:;" ngb="d0');
        expect(appHostNode.outerHTML).not.toContain(
          '<div id="outer-trigger" jsaction="mouseover:;" ngb="d0',
        );

        // Inner defer block was not triggered, thus it retains `jsaction` attributes.
        expect(appHostNode.outerHTML).toContain('<p jsaction="click:;keydown:;" ngb="d1');
      });

      it('should SSR and hydrate nested `@defer` blocks', async () => {
        @Component({
          selector: 'app',
          template: `
          <main (click)="fnA()">
            @defer (on viewport; hydrate on interaction) {
              <div (click)="fnA()">
                Main defer block rendered!
                @if (visible) {
                  Defer events work!
                }
                <div id="outer-trigger" (mouseover)="showMessage()"></div>
                @defer (on viewport; hydrate on interaction) {
                  <p (click)="showMessage()">Nested defer block</p>
                } @placeholder {
                  <span>Inner block placeholder</span>
                }
              </div>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
          </main>
        `,
        })
        class SimpleComponent {
          items = [1, 2, 3];
          visible = false;
          fnA() {}
          showMessage() {
            this.visible = true;
          }
        }

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration()];

        const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
        const ssrContents = getAppContents(html);

        // Assert that we have `jsaction` annotations and
        // defer blocks are triggered and rendered.

        // <main> uses "eager" `custom-app-id` namespace.
        expect(ssrContents).toContain('<main jsaction="click:;');
        // <div>s inside a defer block have `d0` as a namespace.
        expect(ssrContents).toContain('<div jsaction="click:;keydown:;" ngb="d0"');
        expect(ssrContents).toContain('<div id="outer-trigger" jsaction="mouseover:;" ngb="d0"');
        // <p> is inside a nested defer block -> different namespace.
        expect(ssrContents).toContain('<p jsaction="click:;keydown:;" ngb="d1');
        // There is an extra annotation in the TransferState data.
        expect(ssrContents).toContain(
          '"__nghDeferData__":{"d0":{"r":1,"s":2},"d1":{"r":1,"s":2,"p":"d0"}}',
        );
        // Outer defer block is rendered.
        expect(ssrContents).toContain('Main defer block rendered');
        // Inner defer block is rendered as well.
        expect(ssrContents).toContain('Nested defer block');

        // Internal cleanup before we do server->client transition in this test.
        resetTViewsFor(SimpleComponent);

        ////////////////////////////////
        const doc = getDocument();

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
          hydrationFeatures,
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();
        await appRef.whenStable();

        const appHostNode = compRef.location.nativeElement;

        // At this point an eager part of an app is hydrated,
        // but defer blocks are still in dehydrated state.

        // <main> no longer has `jsaction` attribute.
        expect(appHostNode.outerHTML).toContain('<main>');

        // Elements from @defer blocks still have `jsaction` annotations,
        // since they were not triggered yet.
        expect(appHostNode.outerHTML).toContain('<div jsaction="click:;keydown:;" ngb="d0"');
        expect(appHostNode.outerHTML).toContain(
          '<div id="outer-trigger" jsaction="mouseover:;" ngb="d0',
        );
        expect(appHostNode.outerHTML).toContain('<p jsaction="click:;keydown:;" ngb="d1"');

        // Emit an event inside of a defer block, which should result
        // in triggering the defer block (start loading deps, etc) and
        // subsequent hydration.
        const inner = doc.body.querySelector('p')!;
        const clickEvent = new CustomEvent('click', {bubbles: true});
        inner.dispatchEvent(clickEvent);

        await allPendingDynamicImports();

        appRef.tick();

        // An event was replayed after hydration, which resulted in
        // an `@if` block becoming active and its inner content got
        // rendered/
        expect(appHostNode.outerHTML).toContain('Defer events work');

        // Since inner `@defer` block was triggered, all parent blocks
        // were hydrated as well, so all `jsaction` attributes are removed.
        expect(appHostNode.outerHTML).not.toContain('jsaction="');
      });

      it('should SSR and hydrate only defer blocks with hydrate syntax', async () => {
        @Component({
          selector: 'app',
          template: `
          <main (click)="fnA()">
            @defer (hydrate on interaction) {
              <div (click)="fnA()">
                Main defer block rendered!
                @if (visible) {
                  Defer events work!
                }
                <div id="outer-trigger" (mouseover)="showMessage()"></div>
                @defer (on interaction) {
                  <p (click)="showMessage()">Nested defer block</p>
                } @placeholder {
                  <span>Inner block placeholder</span>
                }
              </div>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
          </main>
        `,
        })
        class SimpleComponent {
          items = [1, 2, 3];
          visible = false;
          fnA() {}
          showMessage() {
            this.visible = true;
          }
        }

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}, withDebugConsole()];
        const hydrationFeatures = () => [withIncrementalHydration()];

        const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
        const ssrContents = getAppContents(html);

        // Assert that we have `jsaction` annotations and
        // defer blocks are triggered and rendered.

        // <main> uses "eager" `custom-app-id` namespace.
        expect(ssrContents).toContain('<main jsaction="click:;');
        // <div>s inside a defer block have `d0` as a namespace.
        expect(ssrContents).toContain('<div jsaction="click:;keydown:;" ngb="d0"');
        expect(ssrContents).toContain('<div id="outer-trigger" jsaction="mouseover:;" ngb="d0"');
        // <p> is inside a nested defer block -> different namespace.
        // expect(ssrContents).toContain('<p jsaction="click:;" ngb="d1');
        // There is an extra annotation in the TransferState data.
        expect(ssrContents).toContain('"__nghDeferData__":{"d0":{"r":1,"s":2}}');
        // Outer defer block is rendered.
        expect(ssrContents).toContain('Main defer block rendered');
        // Inner defer block should only display placeholder.
        expect(ssrContents).toContain('Inner block placeholder');

        // Internal cleanup before we do server->client transition in this test.
        resetTViewsFor(SimpleComponent);

        ////////////////////////////////
        const doc = getDocument();

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
          hydrationFeatures,
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();
        await appRef.whenStable();

        verifyHasLog(
          appRef,
          'Angular hydrated 1 component(s) and 8 node(s), 0 component(s) were skipped. 1 defer block(s) were configured to use incremental hydration.',
        );

        const appHostNode = compRef.location.nativeElement;

        // At this point an eager part of an app is hydrated,
        // but defer blocks are still in dehydrated state.

        // <main> no longer has `jsaction` attribute.
        expect(appHostNode.outerHTML).toContain('<main>');

        // Elements from @defer blocks still have `jsaction` annotations,
        // since they were not triggered yet.
        expect(appHostNode.outerHTML).toContain('<div jsaction="click:;keydown:;" ngb="d0"');
        expect(appHostNode.outerHTML).toContain(
          '<div id="outer-trigger" jsaction="mouseover:;" ngb="d0',
        );
        // expect(appHostNode.outerHTML).toContain('<p jsaction="click:;" ngb="d1"');

        // Emit an event inside of a defer block, which should result
        // in triggering the defer block (start loading deps, etc) and
        // subsequent hydration.
        const inner = doc.getElementById('outer-trigger')!;
        const clickEvent2 = new CustomEvent('mouseover', {bubbles: true});
        inner.dispatchEvent(clickEvent2);
        await allPendingDynamicImports();

        appRef.tick();

        const innerParagraph = doc.body.querySelector('p')!;
        expect(innerParagraph).toBeUndefined();

        // An event was replayed after hydration, which resulted in
        // an `@if` block becoming active and its inner content got
        // rendered/
        expect(appHostNode.outerHTML).toContain('Defer events work');
        expect(appHostNode.outerHTML).toContain('Inner block placeholder');

        // Since inner `@defer` block was triggered, all parent blocks
        // were hydrated as well, so all `jsaction` attributes are removed.
        expect(appHostNode.outerHTML).not.toContain('jsaction="');
      });
    });

    describe('transfer state for nested defer blocks', () => {
      it('should have correct transfer state data for 2-level nested defer blocks', async () => {
        @Component({
          selector: 'app',
          template: `
            @defer (on viewport; hydrate on interaction) {
              <div>
                Level 1
                @defer (on viewport; hydrate on interaction) {
                  <div>Level 2</div>
                } @placeholder {
                  <span>Level 2 placeholder</span>
                }
              </div>
            } @placeholder {
              <span>Level 1 placeholder</span>
            }
          `,
        })
        class SimpleComponent {}

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration()];

        const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
        const ssrContents = getAppContents(html);

        // Check that levels are rendered
        expect(ssrContents).toContain('Level 1');
        expect(ssrContents).toContain('Level 2');

        // Check the transfer state data
        expect(ssrContents).toContain(
          '"__nghDeferData__":{"d0":{"r":1,"s":2},"d1":{"r":1,"s":2,"p":"d0"}}',
        );
      });

      it('should have correct transfer state data for 4-level nested defer blocks', async () => {
        @Component({
          selector: 'app',
          template: `
            @defer (on viewport; hydrate on interaction) {
              <div>
                Level 1
                @defer (on viewport; hydrate on interaction) {
                  <div>
                    Level 2
                    @defer (on viewport; hydrate on interaction) {
                      <div>
                        Level 3
                        @defer (on viewport; hydrate on interaction) {
                          <div>Level 4</div>
                        } @placeholder {
                          <span>Level 4 placeholder</span>
                        }
                      </div>
                    } @placeholder {
                      <span>Level 3 placeholder</span>
                    }
                  </div>
                } @placeholder {
                  <span>Level 2 placeholder</span>
                }
              </div>
            } @placeholder {
              <span>Level 1 placeholder</span>
            }
          `,
        })
        class SimpleComponent {}

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration()];

        const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
        const ssrContents = getAppContents(html);

        // Check that all levels are rendered
        expect(ssrContents).toContain('Level 1');
        expect(ssrContents).toContain('Level 2');
        expect(ssrContents).toContain('Level 3');
        expect(ssrContents).toContain('Level 4');

        // Check the transfer state data
        expect(ssrContents).toContain(
          '"__nghDeferData__":{"d0":{"r":1,"s":2},"d1":{"r":1,"s":2,"p":"d0"},"d2":{"r":1,"s":2,"p":"d1"},"d3":{"r":1,"s":2,"p":"d2"}}',
        );
      });

      it('should have correct transfer state data for nested defer blocks with different triggers', async () => {
        @Component({
          selector: 'app',
          template: `
            @defer (on viewport; hydrate on interaction) {
              <div>
                Level 1
                @defer (on viewport; hydrate on viewport) {
                  <div>Level 2</div>
                } @placeholder {
                  <span>Level 2 placeholder</span>
                }
              </div>
            } @placeholder {
              <span>Level 1 placeholder</span>
            }
          `,
        })
        class SimpleComponent {}

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration()];

        const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
        const ssrContents = getAppContents(html);

        // Check that levels are rendered
        expect(ssrContents).toContain('Level 1');
        expect(ssrContents).toContain('Level 2');

        // Check the transfer state data with trigger array
        expect(ssrContents).toContain(
          '"__nghDeferData__":{"d0":{"r":1,"s":2},"d1":{"r":1,"s":2,"t":[2],"p":"d0"}}',
        );
      });
    });

    describe('triggers', () => {
      describe('hydrate on interaction', () => {
        it('click', async () => {
          @Component({
            selector: 'app',
            template: `
            <main (click)="fnA()">
              @defer (on viewport; hydrate on interaction) {
                <article>
                  defer block rendered!
                </article>
                <span id="test" (click)="fnB()">{{value()}}</span>
              } @placeholder {
                <span>Outer block placeholder</span>
              }
            </main>
          `,
          })
          class SimpleComponent {
            value = signal('start');
            fnA() {}
            fnB() {
              this.value.set('end');
            }
          }

          const appId = 'custom-app-id';
          const providers = [{provide: APP_ID, useValue: appId}];
          const hydrationFeatures = () => [withIncrementalHydration()];

          const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
          const ssrContents = getAppContents(html);

          // <main> uses "eager" `custom-app-id` namespace.
          expect(ssrContents).toContain('<main jsaction="click:;');
          // <div>s inside a defer block have `d0` as a namespace.
          expect(ssrContents).toContain('<article jsaction="click:;keydown:;"');
          // Outer defer block is rendered.
          expect(ssrContents).toContain('defer block rendered');

          // Internal cleanup before we do server->client transition in this test.
          resetTViewsFor(SimpleComponent);

          ////////////////////////////////
          const doc = getDocument();
          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();
          await appRef.whenStable();

          const appHostNode = compRef.location.nativeElement;

          expect(appHostNode.outerHTML).toContain('<article jsaction="click:;keydown:;"');

          // Emit an event inside of a defer block, which should result
          // in triggering the defer block (start loading deps, etc) and
          // subsequent hydration.
          const article = doc.getElementsByTagName('article')![0];
          const clickEvent = new CustomEvent('click', {bubbles: true});
          article.dispatchEvent(clickEvent);
          await allPendingDynamicImports();

          appRef.tick();
          expect(appHostNode.outerHTML).not.toContain('<div jsaction="click:;keydown:;"');
        });

        it('keydown', async () => {
          @Component({
            selector: 'app',
            template: `
            <main (click)="fnA()">
              @defer (on viewport; hydrate on interaction) {
                <article>
                  defer block rendered!
                  <span id="test" (click)="fnB()">{{value()}}</span>
                  </article>
              } @placeholder {
                <span>Outer block placeholder</span>
              }
            </main>
          `,
          })
          class SimpleComponent {
            value = signal('start');
            fnA() {}
            fnB() {
              this.value.set('end');
            }
          }

          const appId = 'custom-app-id';
          const providers = [{provide: APP_ID, useValue: appId}];
          const hydrationFeatures = () => [withIncrementalHydration()];

          const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
          const ssrContents = getAppContents(html);

          // <main> uses "eager" `custom-app-id` namespace.
          expect(ssrContents).toContain('<main jsaction="click:;');
          // <div>s inside a defer block have `d0` as a namespace.
          expect(ssrContents).toContain('<article jsaction="click:;keydown:;"');
          // Outer defer block is rendered.
          expect(ssrContents).toContain('defer block rendered');

          // Internal cleanup before we do server->client transition in this test.
          resetTViewsFor(SimpleComponent);

          ////////////////////////////////
          const doc = getDocument();
          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();
          await appRef.whenStable();

          const appHostNode = compRef.location.nativeElement;

          expect(appHostNode.outerHTML).toContain('<article jsaction="click:;keydown:;"');

          // Emit an event inside of a defer block, which should result
          // in triggering the defer block (start loading deps, etc) and
          // subsequent hydration.
          const article = doc.getElementsByTagName('article')![0];
          const keydownEvent = new KeyboardEvent('keydown');
          article.dispatchEvent(keydownEvent);
          await allPendingDynamicImports();

          appRef.tick();

          expect(appHostNode.outerHTML).not.toContain('<div jsaction="click:;keydown:;"');
        });
      });

      describe('hydrate on hover', () => {
        it('mouseover', async () => {
          @Component({
            selector: 'app',
            template: `
            <main (click)="fnA()">
              @defer (hydrate on hover) {
                <article>
                  defer block rendered!
                  <span id="test" (click)="fnB()">{{value()}}</span>
                </article>
              } @placeholder {
                <span>Outer block placeholder</span>
              }
            </main>
          `,
          })
          class SimpleComponent {
            value = signal('start');
            fnA() {}
            fnB() {
              this.value.set('end');
            }
          }

          const appId = 'custom-app-id';
          const providers = [{provide: APP_ID, useValue: appId}];
          const hydrationFeatures = () => [withIncrementalHydration()];

          const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
          const ssrContents = getAppContents(html);

          // <main> uses "eager" `custom-app-id` namespace.
          expect(ssrContents).toContain('<main jsaction="click:;');
          // <div>s inside a defer block have `d0` as a namespace.
          expect(ssrContents).toContain('<article jsaction="mouseenter:;mouseover:;focusin:;"');
          // Outer defer block is rendered.
          expect(ssrContents).toContain('defer block rendered');

          // Internal cleanup before we do server->client transition in this test.
          resetTViewsFor(SimpleComponent);

          ////////////////////////////////
          const doc = getDocument();
          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();
          await appRef.whenStable();

          const appHostNode = compRef.location.nativeElement;

          expect(appHostNode.outerHTML).toContain(
            '<article jsaction="mouseenter:;mouseover:;focusin:;"',
          );

          // Emit an event inside of a defer block, which should result
          // in triggering the defer block (start loading deps, etc) and
          // subsequent hydration.
          const article = doc.getElementsByTagName('article')![0];
          const hoverEvent = new CustomEvent('mouseover', {bubbles: true});
          article.dispatchEvent(hoverEvent);
          await allPendingDynamicImports();

          appRef.tick();

          expect(appHostNode.outerHTML).not.toContain(
            '<div jsaction="mouseenter:;mouseover:;focusin:;"',
          );
        });

        it('focusin', async () => {
          @Component({
            selector: 'app',
            template: `
            <main (click)="fnA()">
              @defer (hydrate on hover) {
                <article>
                  defer block rendered!
                  <span id="test" (click)="fnB()">{{value()}}</span>
                </article>
              } @placeholder {
                <span>Outer block placeholder</span>
              }
            </main>
          `,
          })
          class SimpleComponent {
            value = signal('start');
            fnA() {}
            fnB() {
              this.value.set('end');
            }
          }

          const appId = 'custom-app-id';
          const providers = [{provide: APP_ID, useValue: appId}];
          const hydrationFeatures = () => [withIncrementalHydration()];

          const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
          const ssrContents = getAppContents(html);

          // <main> uses "eager" `custom-app-id` namespace.
          expect(ssrContents).toContain('<main jsaction="click:;');
          // <div>s inside a defer block have `d0` as a namespace.
          expect(ssrContents).toContain('<article jsaction="mouseenter:;mouseover:;focusin:;"');
          // Outer defer block is rendered.
          expect(ssrContents).toContain('defer block rendered');

          // Internal cleanup before we do server->client transition in this test.
          resetTViewsFor(SimpleComponent);

          ////////////////////////////////
          const doc = getDocument();
          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();
          await appRef.whenStable();

          const appHostNode = compRef.location.nativeElement;

          expect(appHostNode.outerHTML).toContain(
            '<article jsaction="mouseenter:;mouseover:;focusin:;"',
          );

          // Emit an event inside of a defer block, which should result
          // in triggering the defer block (start loading deps, etc) and
          // subsequent hydration.
          const article = doc.getElementsByTagName('article')![0];
          const focusEvent = new CustomEvent('focusin', {bubbles: true});
          article.dispatchEvent(focusEvent);
          await allPendingDynamicImports();

          appRef.tick();

          expect(appHostNode.outerHTML).not.toContain(
            '<div jsaction="mouseenter:;mouseover:;focusin:;"',
          );
        });
      });

      describe('viewport', () => {
        let activeObservers: MockIntersectionObserver[] = [];
        let nativeIntersectionObserver: typeof IntersectionObserver;

        beforeEach(() => {
          nativeIntersectionObserver = globalThis.IntersectionObserver;
          globalThis.IntersectionObserver = MockIntersectionObserver;
        });

        afterEach(() => {
          globalThis.IntersectionObserver = nativeIntersectionObserver;
          activeObservers = [];
        });

        /**
         * Mocked out implementation of the native IntersectionObserver API. We need to
         * mock it out for tests, because it's unsupported in Domino and we can't trigger
         * it reliably in the browser.
         */
        class MockIntersectionObserver implements IntersectionObserver {
          root = null;
          rootMargin = null!;
          thresholds = null!;

          observedElements = new Set<Element>();
          private elementsInView = new Set<Element>();

          constructor(private callback: IntersectionObserverCallback) {
            activeObservers.push(this);
          }

          static invokeCallbacksForElement(element: Element, isInView: boolean) {
            for (const observer of activeObservers) {
              const elements = observer.elementsInView;
              const wasInView = elements.has(element);

              if (isInView) {
                elements.add(element);
              } else {
                elements.delete(element);
              }

              observer.invokeCallback();

              if (wasInView) {
                elements.add(element);
              } else {
                elements.delete(element);
              }
            }
          }

          private invokeCallback() {
            for (const el of this.observedElements) {
              this.callback(
                [
                  {
                    target: el,
                    isIntersecting: this.elementsInView.has(el),

                    // Unsupported properties.
                    boundingClientRect: null!,
                    intersectionRatio: null!,
                    intersectionRect: null!,
                    rootBounds: null,
                    time: null!,
                  },
                ],
                this,
              );
            }
          }

          observe(element: Element) {
            this.observedElements.add(element);
            // Native observers fire their callback as soon as an
            // element is observed so we try to mimic it here.
            this.invokeCallback();
          }

          unobserve(element: Element) {
            this.observedElements.delete(element);
          }

          disconnect() {
            this.observedElements.clear();
            this.elementsInView.clear();
          }

          takeRecords(): IntersectionObserverEntry[] {
            throw new Error('Not supported');
          }
        }
        it('viewport', async () => {
          @Component({
            selector: 'app',
            template: `
          <main (click)="fnA()">
            @defer (hydrate on viewport) {
              <article>
                defer block rendered!
                <span id="test" (click)="fnB()">{{value()}}</span>
              </article>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
          </main>
        `,
          })
          class SimpleComponent {
            value = signal('start');
            fnA() {}
            fnB() {
              this.value.set('end');
            }
          }

          const appId = 'custom-app-id';
          const providers = [{provide: APP_ID, useValue: appId}];
          const hydrationFeatures = () => [withIncrementalHydration()];

          const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
          const ssrContents = getAppContents(html);

          // <main> uses "eager" `custom-app-id` namespace.
          expect(ssrContents).toContain('<main jsaction="click:;');
          // <div>s inside a defer block have `d0` as a namespace.
          expect(ssrContents).toContain('<!--ngh=d0-->');
          // Outer defer block is rendered.
          expect(ssrContents).toContain('defer block rendered');

          // Internal cleanup before we do server->client transition in this test.
          resetTViewsFor(SimpleComponent);

          ////////////////////////////////
          const doc = getDocument();
          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();
          await appRef.whenStable();

          const appHostNode = compRef.location.nativeElement;
          expect(appHostNode.outerHTML).toContain(
            '<span id="test" jsaction="click:;" ngb="d0">start</span>',
          );

          const article: HTMLElement = document.getElementsByTagName('article')[0];
          MockIntersectionObserver.invokeCallbacksForElement(article, false);

          appRef.tick();

          const testElement = doc.getElementById('test')!;
          const clickEvent = new CustomEvent('click');
          testElement.dispatchEvent(clickEvent);

          appRef.tick();

          expect(appHostNode.outerHTML).toContain(
            '<span id="test" jsaction="click:;" ngb="d0">start</span>',
          );

          MockIntersectionObserver.invokeCallbacksForElement(article, true);

          await allPendingDynamicImports();

          const clickEvent2 = new CustomEvent('click');
          testElement.dispatchEvent(clickEvent2);

          appRef.tick();

          expect(appHostNode.outerHTML).toContain('<span id="test">end</span>');
        });
      });

      it('immediate', async () => {
        @Component({
          selector: 'app',
          template: `
          <main (click)="fnA()">
            @defer (hydrate on immediate) {
              <article>
                defer block rendered!
                <span id="test" (click)="fnB()">{{value()}}</span>
              </article>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
          </main>
        `,
        })
        class SimpleComponent {
          value = signal('start');
          fnA() {}
          fnB() {
            this.value.set('end');
          }
        }

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration()];

        const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
        const ssrContents = getAppContents(html);

        // <main> uses "eager" `custom-app-id` namespace.
        expect(ssrContents).toContain('<main jsaction="click:;');
        // Outer defer block is rendered.
        expect(ssrContents).toContain('defer block rendered');

        // Internal cleanup before we do server->client transition in this test.
        resetTViewsFor(SimpleComponent);

        ////////////////////////////////
        const doc = getDocument();
        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
          hydrationFeatures,
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();
        await appRef.whenStable();
        appRef.tick();

        const appHostNode = compRef.location.nativeElement;
        expect(appHostNode.outerHTML).toContain('<span id="test">start</span>');

        const testElement = doc.getElementById('test')!;
        const clickEvent2 = new CustomEvent('click');
        testElement.dispatchEvent(clickEvent2);

        appRef.tick();

        expect(appHostNode.outerHTML).toContain('<span id="test">end</span>');
      });

      describe('idle', () => {
        /**
         * Sets up interceptors for when an idle callback is requested
         * and when it's cancelled. This is needed to keep track of calls
         * made to `requestIdleCallback` and `cancelIdleCallback` APIs.
         */
        let id = 0;
        let idleCallbacksRequested: number;
        let idleCallbacksInvoked: number;
        let idleCallbacksCancelled: number;
        const onIdleCallbackQueue: Map<number, IdleRequestCallback> = new Map();

        function resetCounters() {
          idleCallbacksRequested = 0;
          idleCallbacksInvoked = 0;
          idleCallbacksCancelled = 0;
        }
        resetCounters();

        let nativeRequestIdleCallback: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions,
        ) => number;
        let nativeCancelIdleCallback: (id: number) => void;

        const mockRequestIdleCallback = (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions,
        ): number => {
          onIdleCallbackQueue.set(id, callback);
          expect(idleCallbacksRequested).toBe(0);
          expect(NgZone.isInAngularZone()).toBe(true);
          idleCallbacksRequested++;
          return id++;
        };

        const mockCancelIdleCallback = (id: number) => {
          onIdleCallbackQueue.delete(id);
          idleCallbacksRequested--;
          idleCallbacksCancelled++;
        };

        const triggerIdleCallbacks = () => {
          for (const [_, callback] of onIdleCallbackQueue) {
            idleCallbacksInvoked++;
            callback(null!);
          }
          onIdleCallbackQueue.clear();
        };

        beforeEach(() => {
          nativeRequestIdleCallback = globalThis.requestIdleCallback;
          nativeCancelIdleCallback = globalThis.cancelIdleCallback;
          globalThis.requestIdleCallback = mockRequestIdleCallback;
          globalThis.cancelIdleCallback = mockCancelIdleCallback;
          resetCounters();
        });

        afterEach(() => {
          globalThis.requestIdleCallback = nativeRequestIdleCallback;
          globalThis.cancelIdleCallback = nativeCancelIdleCallback;
          onIdleCallbackQueue.clear();
          resetCounters();
        });

        it('idle', async () => {
          @Component({
            selector: 'app',
            template: `
        <main (click)="fnA()">
          @defer (hydrate on idle) {
            <article>
              defer block rendered!
              <span id="test" (click)="fnB()">{{value()}}</span>
            </article>
          } @placeholder {
            <span>Outer block placeholder</span>
          }
        </main>
      `,
          })
          class SimpleComponent {
            value = signal('start');
            fnA() {}
            fnB() {
              this.value.set('end');
            }
          }

          const appId = 'custom-app-id';
          const providers = [
            {provide: APP_ID, useValue: appId},
            provideZoneChangeDetection() as any,
          ];
          const hydrationFeatures = () => [withIncrementalHydration()];

          const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
          const ssrContents = getAppContents(html);

          // <main> uses "eager" `custom-app-id` namespace.
          expect(ssrContents).toContain('<main jsaction="click:;');
          // <div>s inside a defer block have `d0` as a namespace.
          expect(ssrContents).toContain('<article>');
          // Outer defer block is rendered.
          expect(ssrContents).toContain('defer block rendered');

          // Internal cleanup before we do server->client transition in this test.
          resetTViewsFor(SimpleComponent);

          ////////////////////////////////
          const doc = getDocument();
          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();
          await appRef.whenStable();

          const appHostNode = compRef.location.nativeElement;

          expect(appHostNode.outerHTML).toContain('<article>');

          triggerIdleCallbacks();
          await allPendingDynamicImports();
          appRef.tick();

          expect(appHostNode.outerHTML).toContain('<span id="test">start</span>');

          const testElement = doc.getElementById('test')!;
          const clickEvent2 = new CustomEvent('click');
          testElement.dispatchEvent(clickEvent2);

          appRef.tick();

          expect(appHostNode.outerHTML).toContain('<span id="test">end</span>');
        });
      });

      describe('timer', () => {
        class FakeTimerScheduler {
          add(delay: number, callback: VoidFunction) {
            callback();
          }
          remove(callback: VoidFunction) {
            /* noop */
          }
        }

        it('top level timer', async () => {
          @Component({
            selector: 'app',
            template: `
            <main (click)="fnA()">
              @defer (hydrate on timer(150)) {
                <article>
                  defer block rendered!
                  <span id="test" (click)="fnB()">{{value()}}</span>
                </article>
              } @placeholder {
                <span>Outer block placeholder</span>
              }
            </main>
          `,
          })
          class SimpleComponent {
            value = signal('start');
            fnA() {}
            fnB() {
              this.value.set('end');
            }
          }

          const appId = 'custom-app-id';
          const providers = [
            {provide: APP_ID, useValue: appId},
            {provide: TimerScheduler, useClass: FakeTimerScheduler},
          ];
          const hydrationFeatures = () => [withIncrementalHydration()];

          const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
          const ssrContents = getAppContents(html);

          // <main> uses "eager" `custom-app-id` namespace.
          expect(ssrContents).toContain('<main jsaction="click:;');
          // <div>s inside a defer block have `d0` as a namespace.
          expect(ssrContents).toContain('<article>');
          // Outer defer block is rendered.
          expect(ssrContents).toContain('defer block rendered');

          // Internal cleanup before we do server->client transition in this test.
          resetTViewsFor(SimpleComponent);

          ////////////////////////////////
          const doc = getDocument();
          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          await appRef.whenStable();

          const appHostNode = compRef.location.nativeElement;

          expect(appHostNode.outerHTML).toContain('<article>');
          await allPendingDynamicImports();

          expect(appHostNode.outerHTML).toContain('<span id="test">start</span>');
        });

        it('nested timer', async () => {
          @Component({
            selector: 'app',
            template: `
            <main (click)="fnA()">
              @defer (on viewport; hydrate on interaction) {
                <div id="main" (click)="fnA()">
                  defer block rendered!
                  @defer (on viewport; hydrate on timer(150)) {
                    <article>
                      <p id="nested">Nested defer block</p>
                      <span id="test">{{value()}}</span>
                    </article>
                  } @placeholder {
                    <span>Inner block placeholder</span>
                  }
                </div>
              } @placeholder {
                <span>Outer block placeholder</span>
              }
            </main>
          `,
          })
          class SimpleComponent {
            value = signal('start');
            fnA() {}
            constructor() {
              if (!isPlatformServer(inject(PLATFORM_ID))) {
                this.value.set('end');
              }
            }
          }

          const appId = 'custom-app-id';
          const providers = [
            {provide: APP_ID, useValue: appId},
            {provide: TimerScheduler, useClass: FakeTimerScheduler},
          ];
          const hydrationFeatures = () => [withIncrementalHydration()];

          const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
          const ssrContents = getAppContents(html);

          // <main> uses "eager" `custom-app-id` namespace.
          expect(ssrContents).toContain('<main jsaction="click:;');
          // <div>s inside a defer block have `d0` as a namespace.
          expect(ssrContents).toContain('<article>');
          // Outer defer block is rendered.
          expect(ssrContents).toContain('defer block rendered');

          // Internal cleanup before we do server->client transition in this test.
          resetTViewsFor(SimpleComponent);

          ////////////////////////////////
          const doc = getDocument();
          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          await appRef.whenStable();

          const appHostNode = compRef.location.nativeElement;

          expect(appHostNode.outerHTML).toContain('<article>');

          await allPendingDynamicImports();

          expect(appHostNode.outerHTML).toContain('<span id="test">end</span>');
        });
      });

      it('when', async () => {
        @Component({
          selector: 'app',
          template: `
          <main (click)="fnA()">
            @defer (on immediate; hydrate when iSaySo()) {
              <article>
                defer block rendered!
                <span id="test" (click)="fnB()">{{value()}}</span>
              </article>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
            <button id="hydrate-me" (click)="triggerHydration()">Click Here</button>
          </main>
        `,
        })
        class SimpleComponent {
          value = signal('start');
          iSaySo = signal(false);
          fnA() {}
          triggerHydration() {
            this.iSaySo.set(true);
          }
          fnB() {
            this.value.set('end');
          }
          registry = inject(DEHYDRATED_BLOCK_REGISTRY);
        }

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration()];

        const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
        const ssrContents = getAppContents(html);

        // <main> uses "eager" `custom-app-id` namespace.
        expect(ssrContents).toContain('<main jsaction="click:;');
        // <div>s inside a defer block have `d0` as a namespace.
        expect(ssrContents).toContain('<article>');
        // Outer defer block is rendered.
        expect(ssrContents).toContain('defer block rendered');

        // Internal cleanup before we do server->client transition in this test.
        resetTViewsFor(SimpleComponent);

        ////////////////////////////////
        const doc = getDocument();
        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [...providers],
          hydrationFeatures,
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        const registry = compRef.instance.registry;
        spyOn(registry, 'cleanup').and.callThrough();
        appRef.tick();
        await appRef.whenStable();

        const appHostNode = compRef.location.nativeElement;

        const article = appHostNode.querySelector('article');

        verifyNodeWasNotHydrated(article);

        expect(appHostNode.outerHTML).toContain(
          '<span id="test" jsaction="click:;" ngb="d0">start</span>',
        );
        expect(registry.has('d0')).toBeTruthy();

        const testElement = doc.getElementById('hydrate-me')!;
        const clickEvent = new CustomEvent('click');
        testElement.dispatchEvent(clickEvent);

        await allPendingDynamicImports();
        appRef.tick();

        await appRef.whenStable();

        verifyNodeWasHydrated(article);
        expect(registry.cleanup).toHaveBeenCalledTimes(1);

        expect(registry.has('d0')).toBeFalsy();
        expect(appHostNode.outerHTML).toContain('<span id="test">start</span>');
      });

      it('never', async () => {
        @Component({
          selector: 'app',
          template: `
          <main (click)="fnA()">
            @defer (hydrate never) {
              <article>
                defer block rendered!
              </article>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
          </main>
        `,
        })
        class SimpleComponent {
          value = signal('start');
          fnA() {}
          fnB() {
            this.value.set('end');
          }
        }

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration()];

        const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
        const ssrContents = getAppContents(html);

        // <main> uses "eager" `custom-app-id` namespace.
        expect(ssrContents).toContain('<main jsaction="click:;');
        // <div>s inside a defer block have `d0` as a namespace.
        expect(ssrContents).toContain('<article>');
        // Outer defer block is rendered.
        expect(ssrContents).toContain('defer block rendered');

        // Internal cleanup before we do server->client transition in this test.
        resetTViewsFor(SimpleComponent);

        ////////////////////////////////
        const doc = getDocument();
        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
          hydrationFeatures,
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();
        await appRef.whenStable();

        const appHostNode = compRef.location.nativeElement;

        expect(appHostNode.outerHTML).toContain('<article>');

        await timeout(500); // wait for timer
        appRef.tick();

        await allPendingDynamicImports();
        appRef.tick();

        expect(appHostNode.outerHTML).not.toContain('Outer block placeholder');
      });

      it('defer triggers should not fire when hydrate never is used', async () => {
        @Component({
          selector: 'app',
          template: `
          <main (click)="fnA()">
            @defer (on timer(1s); hydrate never) {
              <article>
                defer block rendered!
                <span id="test" (click)="fnB()">{{value()}}</span>
              </article>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
          </main>
        `,
        })
        class SimpleComponent {
          value = signal('start');
          fnA() {}
          fnB() {
            this.value.set('end');
          }
        }

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration()];

        const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
        const ssrContents = getAppContents(html);

        // <main> uses "eager" `custom-app-id` namespace.
        expect(ssrContents).toContain('<main jsaction="click:;');
        // <div>s inside a defer block have `d0` as a namespace.
        expect(ssrContents).toContain('<article>');
        // Outer defer block is rendered.
        expect(ssrContents).toContain('defer block rendered');

        // Internal cleanup before we do server->client transition in this test.
        resetTViewsFor(SimpleComponent);

        ////////////////////////////////
        const doc = getDocument();
        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
          hydrationFeatures,
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();
        await appRef.whenStable();

        const appHostNode = compRef.location.nativeElement;

        expect(appHostNode.outerHTML).toContain('<article>');

        expect(appHostNode.outerHTML).toContain('>start</span>');

        await timeout(500); // wait for timer
        appRef.tick();

        await allPendingDynamicImports();
        appRef.tick();

        const testElement = doc.getElementById('test')!;
        const clickEvent2 = new CustomEvent('click');
        testElement.dispatchEvent(clickEvent2);

        appRef.tick();

        expect(appHostNode.outerHTML).toContain('>start</span>');
        expect(appHostNode.outerHTML).not.toContain('<span id="test">end</span>');

        expect(appHostNode.outerHTML).not.toContain('Outer block placeholder');
      });

      it('should not annotate jsaction events for events inside a hydrate never block', async () => {
        @Component({
          selector: 'app',
          template: `
          <main (click)="fnA()">
            @defer (on timer(1s); hydrate never) {
              <article>
                defer block rendered!
                <span id="test" (click)="fnB()">{{value()}}</span>
                @defer(on immediate; hydrate on idle) {
                  <p id="test2" (click)="fnB()">shouldn't be annotated</p>
                } @placeholder {
                  <p>blah de blah</p>
                }
              </article>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
            @defer (on timer(1s); hydrate on viewport) {
              <div>
                viewport section
                <p (click)="fnA()">has a binding</p>
            </div>
            } @placeholder {
              <span>another placeholder</span>
            }
          </main>
        `,
        })
        class SimpleComponent {
          value = signal('start');
          fnA() {}
          fnB() {
            this.value.set('end');
          }
        }

        const appId = 'custom-app-id';
        const providers = [{provide: APP_ID, useValue: appId}];
        const hydrationFeatures = () => [withIncrementalHydration()];

        const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
        const ssrContents = getAppContents(html);

        expect(ssrContents).not.toContain('<span id="test" jsaction="click:;');
        expect(ssrContents).toContain('<span id="test">start</span>');
        expect(ssrContents).toContain('<p jsaction="click:;" ngb="d1">has a binding</p>');
        expect(ssrContents).not.toContain('<p id="test2" jsaction="click:;');
        expect(ssrContents).toContain('<p id="test2">shouldn\'t be annotated</p>');
      });
    });

    it('should only count and log blocks that were skipped', async () => {
      @Component({
        selector: 'app',
        template: `
          <main (click)="fnA()">
            @defer (on viewport; hydrate on interaction) {
              <div id="main" (click)="fnA()">
                <aside>Main defer block rendered!</aside>
                @defer (on viewport; hydrate on interaction) {
                  <p id="nested">Nested defer block</p>
                } @placeholder {
                  <span>Inner block placeholder</span>
                }
              </div>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
            @defer (on viewport) {
              <p>This should remain in the registry</p>
            } @placeholder {
              <span>a second placeholder</span>
            }
          </main>
        `,
      })
      class SimpleComponent {
        fnA() {}
      }

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}, withDebugConsole()];
      const hydrationFeatures = () => [withIncrementalHydration()];

      const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
      // Internal cleanup before we do server->client transition in this test.
      resetTViewsFor(SimpleComponent);

      ////////////////////////////////
      const doc = getDocument();

      const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
        envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
        hydrationFeatures,
      });
      appRef.tick();
      await appRef.whenStable();

      verifyHasLog(
        appRef,
        'Angular hydrated 1 component(s) and 16 node(s), 0 component(s) were skipped. 2 defer block(s) were configured to use incremental hydration.',
      );
    });
  });

  describe('client side navigation', () => {
    beforeEach(() => {
      // This test emulates client-side behavior, set global server mode flag to `false`.
      globalThis['ngServerMode'] = false;

      TestBed.configureTestingModule({
        providers: [
          {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
          provideClientHydration(withIncrementalHydration()),
        ],
      });
    });

    afterEach(() => {
      globalThis['ngServerMode'] = undefined;
    });

    it('should not try to hydrate in CSR only cases', async () => {
      @Component({
        selector: 'app',
        template: `
          @defer (hydrate when true; on interaction) {
            <p>Defer block rendered!</p>
          } @placeholder {
            <span>Outer block placeholder</span>
          }
        `,
      })
      class SimpleComponent {}

      const fixture = TestBed.createComponent(SimpleComponent);
      fixture.detectChanges();

      // Verify that `hydrate when true` doesn't trigger rendering of the main
      // content in client-only use-cases (expecting to see placeholder content).
      expect(fixture.nativeElement.innerHTML).toContain('Outer block placeholder');
    });
  });

  describe('control flow', () => {
    it('should support hydration for all items in a for loop', async () => {
      @Component({
        selector: 'app',
        template: `
          <main>
            @defer (on interaction; hydrate on interaction) {
              <div id="main" (click)="fnA()">
                <p>Main defer block rendered!</p>
                @for (item of items; track $index) {
                  @defer (on interaction; hydrate on interaction) {
                    <article id="item-{{item}}">
                      defer block {{item}} rendered!
                      <span (click)="fnB()">{{value()}}</span>
                    </article>
                  } @placeholder {
                    <span>Outer block placeholder</span>
                  }
                }
              </div>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
          </main>
        `,
      })
      class SimpleComponent {
        value = signal('start');
        items = [1, 2, 3, 4, 5, 6];
        fnA() {}
        fnB() {
          this.value.set('end');
        }
        registry = inject(DEHYDRATED_BLOCK_REGISTRY);
      }

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}, provideZoneChangeDetection() as any];
      const hydrationFeatures = () => [withIncrementalHydration()];

      const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
      const ssrContents = getAppContents(html);

      // <main> uses "eager" `custom-app-id` namespace.
      // <div>s inside a defer block have `d0` as a namespace.
      expect(ssrContents).toContain('<article id="item-1" jsaction="click:;keydown:;"');
      // Outer defer block is rendered.
      expect(ssrContents).toContain('defer block 1 rendered');

      // Internal cleanup before we do server->client transition in this test.
      resetTViewsFor(SimpleComponent);

      ////////////////////////////////
      const doc = getDocument();
      const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
        envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
        hydrationFeatures,
      });
      const compRef = getComponentRef<SimpleComponent>(appRef);
      const registry = compRef.instance.registry;
      spyOn(registry, 'cleanup').and.callThrough();
      appRef.tick();
      await appRef.whenStable();

      const appHostNode = compRef.location.nativeElement;

      expect(appHostNode.outerHTML).toContain('<article id="item-1" jsaction="click:;keydown:;"');

      // Emit an event inside of a defer block, which should result
      // in triggering the defer block (start loading deps, etc) and
      // subsequent hydration.
      const article = doc.getElementById('item-1')!;
      const clickEvent = new CustomEvent('click', {bubbles: true});
      article.dispatchEvent(clickEvent);
      await allPendingDynamicImports();

      appRef.tick();
      expect(appHostNode.outerHTML).not.toContain(
        '<article id="item-1" jsaction="click:;keydown:;"',
      );
      expect(appHostNode.outerHTML).not.toContain('<span>Outer block placeholder</span>');
      expect(registry.cleanup).toHaveBeenCalledTimes(1);
    });

    it('should handle hydration and cleanup when if then condition changes', async () => {
      @Component({
        selector: 'app',
        template: `
          <main>
            @defer (on interaction; hydrate on interaction) {
              <div id="main" (click)="fnA()">
                <p>Main defer block rendered!</p>
                @if (isServer) {
                  @defer (on interaction; hydrate on interaction) {
                    <article id="item">
                      nested defer block rendered!
                    </article>
                  } @placeholder {
                    <span>Outer block placeholder</span>
                  }
                } @else {
                  <p>client side</p>
                }
              </div>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
          </main>
        `,
      })
      class SimpleComponent {
        value = signal('start');
        isServer = isPlatformServer(inject(PLATFORM_ID));
        fnA() {}
        fnB() {
          this.value.set('end');
        }
      }

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}];
      const hydrationFeatures = () => [withIncrementalHydration()];

      const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
      const ssrContents = getAppContents(html);

      expect(ssrContents).toContain('<article id="item" jsaction="click:;keydown:;"');
      expect(ssrContents).toContain('nested defer block rendered');

      // Internal cleanup before we do server->client transition in this test.
      resetTViewsFor(SimpleComponent);

      ////////////////////////////////
      const doc = getDocument();
      const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
        envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
        hydrationFeatures,
      });
      const compRef = getComponentRef<SimpleComponent>(appRef);
      appRef.tick();
      await appRef.whenStable();

      const appHostNode = compRef.location.nativeElement;
      expect(appHostNode.outerHTML).toContain('nested defer block rendered');

      const article = doc.getElementById('item')!;
      const clickEvent = new CustomEvent('click', {bubbles: true});
      article.dispatchEvent(clickEvent);
      await allPendingDynamicImports();

      appRef.tick();

      expect(appHostNode.outerHTML).not.toContain('nested defer block rendered');
      expect(appHostNode.outerHTML).toContain('<p>client side</p>');

      // Emit an event inside of a defer block, which should result
      // in triggering the defer block (start loading deps, etc) and
      // subsequent hydration.
      expect(appHostNode.outerHTML).not.toContain('<span>Outer block placeholder</span>');
    });

    it('should render an error block when loading fails and cleanup the original content', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'app',
        imports: [NestedCmp],
        template: `
          <main>
            @defer (on interaction; hydrate on interaction) {
              <article id="item">
                <nested-cmp [block]="'primary'" />
              </article>
            } @placeholder {
              <span>Outer block placeholder</span>
            } @error {
              <p>Failed to load dependencies :(</p>
              <nested-cmp [block]="'error'" />
            }
          </main>
          `,
      })
      class SimpleComponent {
        @ViewChildren(NestedCmp) cmps!: QueryList<NestedCmp>;
        value = signal('start');
        fnA() {}
        fnB() {
          this.value.set('end');
        }
      }

      const deferDepsInterceptor = {
        intercept() {
          return () => [failedDynamicImport()];
        },
      };

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}];
      const hydrationFeatures = () => [withIncrementalHydration()];

      const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
      const ssrContents = getAppContents(html);

      expect(ssrContents).toContain('<article id="item" jsaction="click:;keydown:;"');
      expect(ssrContents).toContain('Rendering primary block');

      // Internal cleanup before we do server->client transition in this test.
      resetTViewsFor(SimpleComponent);

      ////////////////////////////////
      const doc = getDocument();
      const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
        envProviders: [
          ...providers,
          {provide: PLATFORM_ID, useValue: 'browser'},
          {provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor},
        ],
        hydrationFeatures,
      });
      const compRef = getComponentRef<SimpleComponent>(appRef);
      appRef.tick();
      await appRef.whenStable();

      const appHostNode = compRef.location.nativeElement;
      expect(appHostNode.outerHTML).toContain('Rendering primary block');

      const article = doc.getElementById('item')!;
      const clickEvent = new CustomEvent('click', {bubbles: true});
      article.dispatchEvent(clickEvent);
      await allPendingDynamicImports();

      appRef.tick();

      expect(appHostNode.outerHTML).not.toContain('Rendering primary block');
      expect(appHostNode.outerHTML).toContain('Rendering error block');
    });
  });

  describe('cleanup', () => {
    it('should cleanup partial hydration blocks appropriately', async () => {
      @Component({
        selector: 'app',
        template: `
          <main (click)="fnA()">
            @defer (on idle; hydrate on interaction) {
              <p id="test">inside defer block</p>
              @if (isServer) {
                <span>Server!</span>
              } @else {
                <span>Client!</span>
              }
            } @loading {
              <span>Loading...</span>
            } @placeholder {
              <p>Placeholder!</p>
            }
          </main>
        `,
      })
      class SimpleComponent {
        fnA() {}
        isServer = isPlatformServer(inject(PLATFORM_ID));
        registry = inject(DEHYDRATED_BLOCK_REGISTRY);
      }

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}];
      const hydrationFeatures = () => [withIncrementalHydration()];

      const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
      const ssrContents = getAppContents(html);

      // <main> uses "eager" `custom-app-id` namespace.
      expect(ssrContents).toContain('<main jsaction="click:;');
      // <div>s inside a defer block have `d0` as a namespace.
      expect(ssrContents).toContain(
        '<p id="test" jsaction="click:;keydown:;" ngb="d0">inside defer block</p>',
      );
      // Outer defer block is rendered.
      expect(ssrContents).toContain('<span jsaction="click:;keydown:;" ngb="d0">Server!</span>');

      // Internal cleanup before we do server->client transition in this test.
      resetTViewsFor(SimpleComponent);

      ////////////////////////////////
      const doc = getDocument();
      const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
        envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
        hydrationFeatures,
      });
      const compRef = getComponentRef<SimpleComponent>(appRef);
      const registry = compRef.instance.registry;
      spyOn(registry, 'cleanup').and.callThrough();

      appRef.tick();
      await appRef.whenStable();
      const appHostNode = compRef.location.nativeElement;

      expect(appHostNode.outerHTML).toContain(
        '<p id="test" jsaction="click:;keydown:;" ngb="d0">inside defer block</p>',
      );

      expect(appHostNode.outerHTML).toContain(
        '<span jsaction="click:;keydown:;" ngb="d0">Server!</span>',
      );

      const testElement = doc.getElementById('test')!;
      const clickEvent = new CustomEvent('click', {bubbles: true});
      testElement.dispatchEvent(clickEvent);

      await allPendingDynamicImports();

      appRef.tick();
      expect(appHostNode.outerHTML).toContain('<span>Client!</span>');
      expect(appHostNode.outerHTML).not.toContain('>Server!</span>');
      expect(registry.cleanup).toHaveBeenCalledTimes(1);
    });

    it('should clear registry of blocks as they are hydrated', async () => {
      @Component({
        selector: 'app',
        template: `
          <main (click)="fnA()">
            @defer (on viewport; hydrate on interaction) {
              <div id="main" (click)="fnA()">
                Main defer block rendered!
                @defer (on viewport; hydrate on interaction) {
                  <p id="nested">Nested defer block</p>
                } @placeholder {
                  <span>Inner block placeholder</span>
                }
              </div>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
          </main>
        `,
      })
      class SimpleComponent {
        fnA() {}

        registry = inject(DEHYDRATED_BLOCK_REGISTRY);
        jsActionMap = inject(JSACTION_BLOCK_ELEMENT_MAP);
        contract = inject(JSACTION_EVENT_CONTRACT);
      }

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}];
      const hydrationFeatures = () => [withIncrementalHydration()];

      const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});

      // Internal cleanup before we do server->client transition in this test.
      resetTViewsFor(SimpleComponent);

      ////////////////////////////////
      const doc = getDocument();

      const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
        envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
        hydrationFeatures,
      });
      const compRef = getComponentRef<SimpleComponent>(appRef);
      appRef.tick();
      await appRef.whenStable();

      const registry = compRef.instance.registry;
      const jsActionMap = compRef.instance.jsActionMap;
      const contract = compRef.instance.contract;
      spyOn(contract.instance!, 'cleanUp').and.callThrough();
      spyOn(registry, 'cleanup').and.callThrough();

      expect(registry.size).toBe(1);
      expect(jsActionMap.size).toBe(2);
      expect(registry.has('d0')).toBeTruthy();

      const mainBlock = doc.getElementById('main')!;
      const clickEvent = new CustomEvent('click', {bubbles: true});
      mainBlock.dispatchEvent(clickEvent);

      await allPendingDynamicImports();

      expect(registry.size).toBe(1);
      expect(registry.has('d0')).toBeFalsy();
      expect(jsActionMap.size).toBe(1);
      expect(registry.cleanup).toHaveBeenCalledTimes(1);

      const nested = doc.getElementById('nested')!;
      const clickEvent2 = new CustomEvent('click', {bubbles: true});
      nested.dispatchEvent(clickEvent2);
      await allPendingDynamicImports();
      appRef.tick();

      expect(registry.size).toBe(0);
      expect(jsActionMap.size).toBe(0);
      expect(contract.instance!.cleanUp).toHaveBeenCalled();
      expect(registry.cleanup).toHaveBeenCalledTimes(2);
    });

    it('should clear registry of multiple blocks if they are hydrated in one go', async () => {
      @Component({
        selector: 'app',
        template: `
          <main (click)="fnA()">
            @defer (on viewport; hydrate on interaction) {
              <div id="main" (click)="fnA()">
                Main defer block rendered!
                @defer (on viewport; hydrate on interaction) {
                  <p id="nested">Nested defer block</p>
                } @placeholder {
                  <span>Inner block placeholder</span>
                }
              </div>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
          </main>
        `,
      })
      class SimpleComponent {
        fnA() {}

        registry = inject(DEHYDRATED_BLOCK_REGISTRY);
        jsActionMap = inject(JSACTION_BLOCK_ELEMENT_MAP);
        contract = inject(JSACTION_EVENT_CONTRACT);
      }

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}];
      const hydrationFeatures = () => [withIncrementalHydration()];

      const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});

      // Internal cleanup before we do server->client transition in this test.
      resetTViewsFor(SimpleComponent);

      ////////////////////////////////
      const doc = getDocument();

      const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
        envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
        hydrationFeatures,
      });
      const compRef = getComponentRef<SimpleComponent>(appRef);
      appRef.tick();
      await appRef.whenStable();

      const registry = compRef.instance.registry;
      const jsActionMap = compRef.instance.jsActionMap;
      const contract = compRef.instance.contract;
      spyOn(contract.instance!, 'cleanUp').and.callThrough();

      expect(registry.size).toBe(1);
      expect(jsActionMap.size).toBe(2);
      expect(registry.has('d0')).toBeTruthy();

      const nested = doc.getElementById('nested')!;
      const clickEvent2 = new CustomEvent('click', {bubbles: true});
      nested.dispatchEvent(clickEvent2);
      await allPendingDynamicImports();
      appRef.tick();

      expect(registry.size).toBe(0);
      expect(jsActionMap.size).toBe(0);
      expect(contract.instance!.cleanUp).toHaveBeenCalled();
    });

    it('should clean up only one time per stack of blocks post hydration', async () => {
      @Component({
        selector: 'app',
        template: `
          <main (click)="fnA()">
            @defer (on viewport; hydrate on interaction) {
              <div id="main" (click)="fnA()">
                Main defer block rendered!
                @defer (on viewport; hydrate on interaction) {
                  <p id="nested">Nested defer block</p>
                } @placeholder {
                  <span>Inner block placeholder</span>
                }
              </div>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
          </main>
        `,
      })
      class SimpleComponent {
        fnA() {}

        registry = inject(DEHYDRATED_BLOCK_REGISTRY);
        jsActionMap = inject(JSACTION_BLOCK_ELEMENT_MAP);
        contract = inject(JSACTION_EVENT_CONTRACT);
      }

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}];
      const hydrationFeatures = () => [withIncrementalHydration()];

      const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});

      // Internal cleanup before we do server->client transition in this test.
      resetTViewsFor(SimpleComponent);

      ////////////////////////////////
      const doc = getDocument();

      const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
        envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
        hydrationFeatures,
      });
      const compRef = getComponentRef<SimpleComponent>(appRef);
      appRef.tick();
      await appRef.whenStable();

      const registry = compRef.instance.registry;
      const jsActionMap = compRef.instance.jsActionMap;
      const contract = compRef.instance.contract;
      spyOn(contract.instance!, 'cleanUp').and.callThrough();
      spyOn(registry, 'cleanup').and.callThrough();

      expect(registry.size).toBe(1);
      expect(jsActionMap.size).toBe(2);
      expect(registry.has('d0')).toBeTruthy();

      const nested = doc.getElementById('nested')!;
      const clickEvent2 = new CustomEvent('click', {bubbles: true});
      nested.dispatchEvent(clickEvent2);
      await allPendingDynamicImports();
      appRef.tick();

      expect(registry.size).toBe(0);
      expect(jsActionMap.size).toBe(0);
      expect(contract.instance!.cleanUp).toHaveBeenCalled();
      expect(registry.cleanup).toHaveBeenCalledTimes(1);
    });

    it('should leave blocks in registry when not hydrated', async () => {
      @Component({
        selector: 'app',
        template: `
          <main (click)="fnA()">
            @defer (on viewport; hydrate on interaction) {
              <div id="main" (click)="fnA()">
                <aside>Main defer block rendered!</aside>
                @defer (on viewport; hydrate on interaction) {
                  <p id="nested">Nested defer block</p>
                } @placeholder {
                  <span>Inner block placeholder</span>
                }
              </div>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
            @defer (on viewport; hydrate on hover) {
              <p>This should remain in the registry</p>
            } @placeholder {
              <span>a second placeholder</span>
            }
          </main>
        `,
      })
      class SimpleComponent {
        fnA() {}

        registry = inject(DEHYDRATED_BLOCK_REGISTRY);
        jsActionMap = inject(JSACTION_BLOCK_ELEMENT_MAP);
        contract = inject(JSACTION_EVENT_CONTRACT);
      }

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}];
      const hydrationFeatures = () => [withIncrementalHydration()];

      const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});

      // Internal cleanup before we do server->client transition in this test.
      resetTViewsFor(SimpleComponent);

      ////////////////////////////////
      const doc = getDocument();

      const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
        envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
        hydrationFeatures,
      });
      const compRef = getComponentRef<SimpleComponent>(appRef);
      appRef.tick();
      await appRef.whenStable();
      const contract = compRef.instance.contract;
      spyOn(contract.instance!, 'cleanUp').and.callThrough();

      const registry = compRef.instance.registry;
      const jsActionMap = compRef.instance.jsActionMap;
      spyOn(registry, 'cleanup').and.callThrough();

      // registry size should be the number of highest level dehydrated defer blocks
      // in this case, 2.
      expect(registry.size).toBe(2);
      // jsactionmap should include all elements that have jsaction on them, in this
      // case, 3, due to the defer block root nodes.
      expect(jsActionMap.size).toBe(3);
      expect(registry.has('d0')).toBeTruthy();

      const nested = doc.getElementById('nested')!;
      const clickEvent2 = new CustomEvent('click', {bubbles: true});
      nested.dispatchEvent(clickEvent2);
      await allPendingDynamicImports();
      appRef.tick();

      expect(registry.size).toBe(1);
      expect(jsActionMap.size).toBe(1);
      expect(registry.has('d2')).toBeTruthy();
      expect(contract.instance!.cleanUp).not.toHaveBeenCalled();
      expect(registry.cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('Router', () => {
    it('should trigger event replay after next render', async () => {
      @Component({
        selector: 'deferred',
        template: `<p>Deferred content</p>`,
      })
      class DeferredCmp {}

      @Component({
        selector: 'other',
        template: `<p>OtherCmp content</p>`,
      })
      class OtherCmp {}

      @Component({
        selector: 'home',
        imports: [RouterLink, DeferredCmp],
        template: `
          <main (click)="fnA()">
            @defer (on viewport; hydrate on hover) {
              <div id="main" (click)="fnA()">
                <aside>Main defer block rendered!</aside>
                @if (true) {
                  @defer (on viewport; hydrate on hover) {
                    <deferred />
                    <p id="nested">Nested defer block</p>
                    <a id="route-link" [routerLink]="[path, thing(), stuff()]">Go There</a>
                  } @placeholder {
                    <span>Inner block placeholder</span>
                  }
                }
              </div>
            } @placeholder {
              <span>Outer block placeholder</span>
            }
          </main>
        `,
      })
      class HomeCmp {
        path = 'other';
        thing = signal('thing');
        stuff = signal('stuff');
        fnA() {}
      }

      const routes: Routes = [
        {
          path: '',
          component: HomeCmp,
        },
        {
          path: 'other/thing/stuff',
          component: OtherCmp,
        },
      ];

      @Component({
        selector: 'app',
        imports: [RouterOutlet],
        template: `
          Works!
          <router-outlet />
        `,
      })
      class SimpleComponent {
        location = inject(Location);
      }

      const deferDepsInterceptor = {
        intercept() {
          return () => {
            return [dynamicImportOf(DeferredCmp, 100)];
          };
        },
      };

      const appId = 'custom-app-id';
      const providers = [
        {provide: APP_ID, useValue: appId},
        {provide: PlatformLocation, useClass: MockPlatformLocation},
        {provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor},
        provideRouter(routes),
      ] as unknown as Provider[];
      const hydrationFeatures = () => [withIncrementalHydration()];

      const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});

      resetTViewsFor(SimpleComponent, HomeCmp, DeferredCmp);

      const doc = getDocument();
      const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
        envProviders: [...providers],
        hydrationFeatures,
      });
      const compRef = getComponentRef<SimpleComponent>(appRef);
      await appRef.whenStable();
      const appHostNode = compRef.location.nativeElement;
      const location = compRef.instance.location;

      const routeLink = doc.getElementById('route-link')!;
      routeLink.click();
      await appRef.whenStable();
      await allPendingDynamicImports();
      appRef.tick();

      await allPendingDynamicImports();
      await appRef.whenStable();

      expect(location.path()).toBe('/other/thing/stuff');

      expect(appHostNode.outerHTML).toContain('<p>OtherCmp content</p>');
    });

    it('should trigger immediate with a lazy loaded route', async () => {
      @Component({
        selector: 'nested-more',
        template: `
          <div>
            @defer(hydrate on immediate) {
              <button id="click-me" (click)="clickMe()">Click me I'm dehydrated?</button>
              <p id="hydrated">{{hydrated()}}</p>
            }
          </div>
        `,
      })
      class NestedMoreCmp {
        hydrated = signal('nope');
        constructor() {
          if (!isPlatformServer(inject(PLATFORM_ID))) {
            this.hydrated.set('yup');
          }
        }
      }
      @Component({
        selector: 'nested',
        imports: [NestedMoreCmp],
        template: `
          <div>
            @defer(hydrate on interaction) {
              <nested-more />
            }
          </div>
        `,
      })
      class NestedCmp {}

      @Component({
        selector: 'lazy',
        imports: [NestedCmp],
        template: `
          @defer (hydrate on interaction) {
            <nested />
          }
        `,
      })
      class LazyCmp {}

      const routes: Routes = [
        {
          path: '',
          loadComponent: () => dynamicImportOf(LazyCmp, 50),
        },
      ];

      @Component({
        selector: 'app',
        imports: [RouterOutlet],
        template: `
          Works!
          <router-outlet />
        `,
      })
      class SimpleComponent {
        location = inject(Location);
      }

      const appId = 'custom-app-id';
      const providers = [
        {provide: APP_ID, useValue: appId},
        {provide: PlatformLocation, useClass: MockPlatformLocation},
        provideRouter(routes),
      ] as unknown as Provider[];
      const hydrationFeatures = () => [withIncrementalHydration()];

      const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
      const ssrContents = getAppContents(html);

      expect(ssrContents).toContain(
        `<button id="click-me" jsaction="click:;" ngb="d2">Click me I'm dehydrated?</button>`,
      );
      expect(ssrContents).toContain(`<p id="hydrated">nope</p>`);

      resetTViewsFor(SimpleComponent, LazyCmp);

      const doc = getDocument();
      const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
        envProviders: [...providers],
        hydrationFeatures,
      });
      const compRef = getComponentRef<SimpleComponent>(appRef);
      await appRef.whenStable();
      await allPendingDynamicImports();
      const appHostNode = compRef.location.nativeElement;

      expect(appHostNode.outerHTML).toContain(
        `<button id="click-me">Click me I'm dehydrated?</button>`,
      );
      expect(appHostNode.outerHTML).toContain(`<p id="hydrated">yup</p>`);
    });
  });

  describe('misconfiguration', () => {
    it('should throw an error when `withIncrementalHydration()` is missing in SSR setup', async () => {
      @Component({
        selector: 'app',
        template: `
          @defer (hydrate never) {
            <div>Hydrate never block</div>
          }
        `,
      })
      class SimpleComponent {}

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}];

      // Empty list, `withIncrementalHydration()` is not included intentionally.
      const hydrationFeatures = () => [];

      let producedError;
      try {
        await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
      } catch (error: unknown) {
        producedError = error;
      }
      expect((producedError as Error).message).toContain('NG0508');
    });

    it('should throw an error when `withIncrementalHydration()` is missing in hydration setup', async () => {
      @Component({
        selector: 'app',
        template: `
          @defer (hydrate never) {
            <div>Hydrate never block</div>
          }
        `,
      })
      class SimpleComponent {}

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}];

      const hydrationFeatures = () => [withIncrementalHydration()];

      const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});

      // Internal cleanup before we do server->client transition in this test.
      resetTViewsFor(SimpleComponent);

      ////////////////////////////////

      let producedError;
      try {
        const doc = getDocument();
        await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [...providers, {provide: PLATFORM_ID, useValue: 'browser'}],
          // Empty list, `withIncrementalHydration()` is not included intentionally.
          hydrationFeatures: () => [],
        });
      } catch (error: unknown) {
        producedError = error;
      }
      expect((producedError as Error).message).toContain('NG0508');
    });
  });
});
