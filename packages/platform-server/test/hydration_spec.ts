/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '@angular/localize/init';

import {CommonModule, DOCUMENT, isPlatformServer, NgComponentOutlet, NgFor, NgIf, NgTemplateOutlet, PlatformLocation} from '@angular/common';
import {MockPlatformLocation} from '@angular/common/testing';
import {ApplicationRef, Component, ComponentRef, createComponent, destroyPlatform, Directive, ElementRef, EnvironmentInjector, ErrorHandler, getPlatform, inject, Injectable, Input, NgZone, PLATFORM_ID, Provider, TemplateRef, Type, ViewChild, ViewContainerRef, ViewEncapsulation, ɵsetDocument} from '@angular/core';
import {Console} from '@angular/core/src/console';
import {InitialRenderPendingTasks} from '@angular/core/src/initial_render_pending_tasks';
import {getComponentDef} from '@angular/core/src/render3/definition';
import {unescapeTransferStateContent} from '@angular/core/src/transfer_state';
import {NoopNgZone} from '@angular/core/src/zone/ng_zone';
import {TestBed} from '@angular/core/testing';
import {bootstrapApplication, HydrationFeature, HydrationFeatureKind, provideClientHydration, withNoDomReuse} from '@angular/platform-browser';
import {provideRouter, RouterOutlet, Routes} from '@angular/router';
import {first} from 'rxjs/operators';

import {provideServerRendering} from '../public_api';
import {renderApplication} from '../src/utils';

/**
 * The name of the attribute that contains a slot index
 * inside the TransferState storage where hydration info
 * could be found.
 */
const NGH_ATTR_NAME = 'ngh';
const EMPTY_TEXT_NODE_COMMENT = 'ngetn';
const TEXT_NODE_SEPARATOR_COMMENT = 'ngtns';

const SKIP_HYDRATION_ATTR_NAME = 'ngSkipHydration';
const SKIP_HYDRATION_ATTR_NAME_LOWER_CASE = SKIP_HYDRATION_ATTR_NAME.toLowerCase();

const TRANSFER_STATE_TOKEN_ID = '__ɵnghData__';

const NGH_ATTR_REGEXP = new RegExp(` ${NGH_ATTR_NAME}=".*?"`, 'g');
const EMPTY_TEXT_NODE_REGEXP = new RegExp(`<!--${EMPTY_TEXT_NODE_COMMENT}-->`, 'g');
const TEXT_NODE_SEPARATOR_REGEXP = new RegExp(`<!--${TEXT_NODE_SEPARATOR_COMMENT}-->`, 'g');

/**
 * Drop utility attributes such as `ng-version`, `ng-server-context` and `ngh`,
 * so that it's easier to make assertions in tests.
 */
function stripUtilAttributes(html: string, keepNgh: boolean): string {
  html = html.replace(/ ng-version=".*?"/g, '')
             .replace(/ ng-server-context=".*?"/g, '')
             .replace(/ ng-reflect-(.*?)=".*?"/g, '')
             .replace(/ _nghost(.*?)=""/g, '')
             .replace(/ _ngcontent(.*?)=""/g, '');
  if (!keepNgh) {
    html = html.replace(NGH_ATTR_REGEXP, '')
               .replace(EMPTY_TEXT_NODE_REGEXP, '')
               .replace(TEXT_NODE_SEPARATOR_REGEXP, '');
  }
  return html;
}

function getComponentRef<T>(appRef: ApplicationRef): ComponentRef<T> {
  return appRef.components[0];
}

/**
 * Extracts a portion of HTML located inside of the `<body>` element.
 * This content belongs to the application view (and supporting TransferState
 * scripts) rendered on the server.
 */
function getAppContents(html: string): string {
  const result = stripUtilAttributes(html, true).match(/<body>(.*?)<\/body>/s);
  if (!result) {
    throw new Error('Invalid HTML structure is provided.');
  }
  return result[1];
}

/**
 * Converts a static HTML to a DOM structure.
 *
 * @param html the rendered html in test
 * @param doc the document object
 * @returns a div element containing a copy of the app contents
 */
function convertHtmlToDom(html: string, doc: Document): HTMLElement {
  const contents = getAppContents(html);
  const container = doc.createElement('div');
  container.innerHTML = contents;
  return container;
}

function stripTransferDataScript(input: string): string {
  return input.replace(/<script (.*?)<\/script>/s, '');
}

function stripExcessiveSpaces(html: string): string {
  return html.replace(/\s+/g, ' ');
}

/** Returns a Promise that resolves when the ApplicationRef becomes stable. */
function whenStable(appRef: ApplicationRef): Promise<unknown> {
  const isStablePromise = appRef.isStable.pipe(first((isStable: boolean) => isStable)).toPromise();
  const pendingTasksPromise = appRef.injector.get(InitialRenderPendingTasks).whenAllTasksComplete;
  return Promise.allSettled([isStablePromise, pendingTasksPromise]);
}

function verifyClientAndSSRContentsMatch(ssrContents: string, clientAppRootElement: HTMLElement) {
  const clientContents =
      stripTransferDataScript(stripUtilAttributes(clientAppRootElement.outerHTML, false));
  ssrContents = stripTransferDataScript(stripUtilAttributes(ssrContents, false));
  expect(clientContents).toBe(ssrContents, 'Client and server contents mismatch');
}

/**
 * Walks over DOM nodes starting from a given node and checks
 * whether all nodes were claimed for hydration, i.e. annotated
 * with a special monkey-patched flag (which is added in dev mode
 * only). It skips any nodes with the skip hydration attribute.
 */
function verifyAllNodesClaimedForHydration(el: HTMLElement, exceptions: HTMLElement[] = []) {
  if ((el.nodeType === Node.ELEMENT_NODE && el.hasAttribute(SKIP_HYDRATION_ATTR_NAME_LOWER_CASE)) ||
      exceptions.includes(el))
    return;

  if (!(el as any).__claimed) {
    fail('Hydration error: the node is *not* hydrated: ' + el.outerHTML);
  }
  let current = el.firstChild;
  while (current) {
    verifyAllNodesClaimedForHydration(current as HTMLElement, exceptions);
    current = current.nextSibling;
  }
}

/**
 * Walks over DOM nodes starting from a given node and make sure
 * those nodes were not annotated as "claimed" by hydration.
 * This helper function is needed to verify that the non-destructive
 * hydration feature can be turned off.
 */
function verifyNoNodesWereClaimedForHydration(el: HTMLElement) {
  if ((el as any).__claimed) {
    fail(
        'Unexpected state: the following node was hydrated, when the test ' +
        'expects the node to be re-created instead: ' + el.outerHTML);
  }
  let current = el.firstChild;
  while (current) {
    verifyNoNodesWereClaimedForHydration(current as HTMLElement);
    current = current.nextSibling;
  }
}

/**
 * Verifies whether a console has a log entry that contains a given message.
 */
function verifyHasLog(appRef: ApplicationRef, message: string) {
  const console = appRef.injector.get(Console) as DebugConsole;
  const context = `Expected '${message}' to be present in the log, but it was not found. ` +
      `Logs content: ${JSON.stringify(console.logs)}`;
  expect(console.logs.some(log => log.includes(message))).withContext(context).toBe(true);
}

/**
 * Verifies that there is no message with a particular content in a console.
 */
function verifyHasNoLog(appRef: ApplicationRef, message: string) {
  const console = appRef.injector.get(Console) as DebugConsole;
  const context = `Expected '${message}' to be present in the log, but it was not found. ` +
      `Logs content: ${JSON.stringify(console.logs)}`;
  expect(console.logs.some(log => log.includes(message))).withContext(context).toBe(false);
}


/**
 * Reset TView, so that we re-enter the first create pass as
 * we would normally do when we hydrate on the client. Otherwise,
 * hydration info would not be applied to T data structures.
 */
function resetTViewsFor(...types: Type<unknown>[]) {
  for (const type of types) {
    getComponentDef(type)!.tView = null;
  }
}

function getHydrationInfoFromTransferState(input: string): string|null {
  const rawContents = input.match(/<script[^>]+>(.*?)<\/script>/)?.[1];
  return rawContents ? unescapeTransferStateContent(rawContents) : null;
}

function withNoopErrorHandler() {
  class NoopErrorHandler extends ErrorHandler {
    override handleError(error: any): void {
      // noop
    }
  }
  return [{
    provide: ErrorHandler,
    useClass: NoopErrorHandler,
  }];
}

@Injectable()
class DebugConsole extends Console {
  logs: string[] = [];
  override log(message: string) {
    this.logs.push(message);
  }
  override warn(message: string) {
    this.logs.push(message);
  }
}

function withDebugConsole() {
  return [{provide: Console, useClass: DebugConsole}];
}

describe('platform-server integration', () => {
  beforeEach(() => {
    if (typeof ngDevMode === 'object') {
      // Reset all ngDevMode counters.
      for (const metric of Object.keys(ngDevMode!)) {
        const currentValue = (ngDevMode as unknown as {[key: string]: number | boolean})[metric];
        if (typeof currentValue === 'number') {
          // Rest only numeric values, which represent counters.
          (ngDevMode as unknown as {[key: string]: number | boolean})[metric] = 0;
        }
      }
    }
    if (getPlatform()) destroyPlatform();
  });

  afterAll(() => destroyPlatform());

  describe('hydration', () => {
    let doc: Document;

    beforeEach(() => {
      doc = TestBed.inject(DOCUMENT);
    });

    afterEach(() => {
      doc.body.textContent = '';
    });

    /**
     * This renders the application with server side rendering logic.
     *
     * @param component the test component to be rendered
     * @param doc the document
     * @param envProviders the environment providers
     * @returns a promise containing the server rendered app as a string
     */
    async function ssr(
        component: Type<unknown>, doc?: string, envProviders?: Provider[],
        hydrationFeatures: HydrationFeature<HydrationFeatureKind>[] = [],
        enableHydration = true): Promise<string> {
      const defaultHtml = '<html><head></head><body><app></app></body></html>';
      const providers = [
        ...(envProviders ?? []),
        provideServerRendering(),
        (enableHydration ? provideClientHydration(...hydrationFeatures) : []),
      ];

      const bootstrap = () => bootstrapApplication(component, {providers});

      return renderApplication(bootstrap, {
        document: doc ?? defaultHtml,
      });
    }

    /**
     * This bootstraps an application with existing html and enables hydration support
     * causing hydration to be invoked.
     *
     * @param html the server side rendered DOM string to be hydrated
     * @param component the root component
     * @param envProviders the environment providers
     * @returns a promise with the application ref
     */
    async function hydrate(
        html: string, component: Type<unknown>, envProviders?: Provider[],
        hydrationFeatures: HydrationFeature<HydrationFeatureKind>[] = []): Promise<ApplicationRef> {
      // Destroy existing platform, a new one will be created later by the `bootstrapApplication`.
      destroyPlatform();

      // Get HTML contents of the `<app>`, create a DOM element and append it into the body.
      const container = convertHtmlToDom(html, doc);
      Array.from(container.children).forEach(node => doc.body.appendChild(node));

      function _document(): any {
        ɵsetDocument(doc);
        global.document = doc;  // needed for `DefaultDomRenderer2`
        return doc;
      }

      const providers = [
        ...(envProviders ?? []),
        {provide: DOCUMENT, useFactory: _document, deps: []},
        provideClientHydration(...hydrationFeatures),
      ];

      return bootstrapApplication(component, {providers});
    }

    describe('public API', () => {
      it('should allow to disable DOM hydration using `withNoDomReuse` feature', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            <header>Header</header>
            <main>This is hydrated content in the main element.</main>
            <footer>Footer</footer>
          `,
        })
        class SimpleComponent {
        }

        const html =
            await ssr(SimpleComponent, undefined, [withDebugConsole()], [withNoDomReuse()]);
        const ssrContents = getAppContents(html);

        // There should be no `ngh` annotations.
        expect(ssrContents).not.toContain(`<app ${NGH_ATTR_NAME}`);

        resetTViewsFor(SimpleComponent);

        const appRef =
            await hydrate(html, SimpleComponent, [withDebugConsole()], [withNoDomReuse()]);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        // Make sure there is no hydration-related message in a console.
        verifyHasNoLog(appRef, 'Angular hydrated');

        const clientRootNode = compRef.location.nativeElement;
        verifyNoNodesWereClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });
    });

    describe('annotations', () => {
      it('should add hydration annotations to component host nodes during ssr', async () => {
        @Component({
          standalone: true,
          selector: 'nested',
          template: 'This is a nested component.',
        })
        class NestedComponent {
        }

        @Component({
          standalone: true,
          selector: 'app',
          imports: [NestedComponent],
          template: `
            <nested />
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);
        expect(ssrContents).toContain(`<nested ${NGH_ATTR_NAME}`);
      });

      it('should skip local ref slots while producing hydration annotations', async () => {
        @Component({
          standalone: true,
          selector: 'nested',
          template: 'This is a nested component.',
        })
        class NestedComponent {
        }

        @Component({
          standalone: true,
          selector: 'app',
          imports: [NestedComponent],
          template: `
            <div #localRef></div>
            <nested />
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);
        expect(ssrContents).toContain(`<nested ${NGH_ATTR_NAME}`);
      });

      it('should skip embedded views from an ApplicationRef during annotation', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            <ng-template #tmpl>Hi!</ng-template>
          `,
        })
        class SimpleComponent {
          @ViewChild('tmpl', {read: TemplateRef}) tmplRef!: TemplateRef<unknown>;
          private appRef = inject(ApplicationRef);

          ngAfterViewInit() {
            const viewRef = this.tmplRef.createEmbeddedView({});
            this.appRef.attachView(viewRef);
          }
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);
      });
    });

    describe('server rendering', () => {
      it('should wipe out existing host element content when server side rendering', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            <div>Some content</div>
          `,
        })
        class SimpleComponent {
        }

        const extraChildNodes = '<!--comment--> Some text! <b>and a tag</b>';
        const doc = `<html><head></head><body><app>${extraChildNodes}</app></body></html>`;
        const html = await ssr(SimpleComponent, doc);
        const ssrContents = getAppContents(html);

        // We expect that the existing content of the host node is fully removed.
        expect(ssrContents).not.toContain(extraChildNodes);
        expect(ssrContents).toContain('<app ngh="0"><div>Some content</div></app>');
      });
    });

    describe('hydration', () => {
      it('should remove ngh attributes after hydration on the client', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: 'Hi!',
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

        resetTViewsFor(SimpleComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const appHostNode = compRef.location.nativeElement;
        expect(appHostNode.getAttribute(NGH_ATTR_NAME)).toBeNull();
      });

      describe('basic scenarios', () => {
        it('should support text-only contents', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
              This is hydrated content.
            `,
          })
          class SimpleComponent {
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await hydrate(html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should support a single text interpolation', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
              {{ text }}
            `,
          })
          class SimpleComponent {
            text = 'text';
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await hydrate(html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should support text and HTML elements', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
              <header>Header</header>
              <main>This is hydrated content in the main element.</main>
              <footer>Footer</footer>
            `,
          })
          class SimpleComponent {
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await hydrate(html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should support text and HTML elements in nested components', async () => {
          @Component({
            standalone: true,
            selector: 'nested-cmp',
            template: `
              <h1>Hello World!</h1>
              <div>This is the content of a nested component</div>
            `,
          })
          class NestedComponent {
          }

          @Component({
            standalone: true,
            selector: 'app',
            imports: [NestedComponent],
            template: `
              <header>Header</header>
              <nested-cmp />
              <footer>Footer</footer>
            `,
          })
          class SimpleComponent {
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent, NestedComponent);

          const appRef = await hydrate(html, SimpleComponent, [withDebugConsole()]);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          // Make sure there are no extra logs in case
          // default NgZone is setup for an application.
          verifyHasNoLog(
              appRef,
              'NG05000: Angular detected that hydration was enabled for an application ' +
                  'that uses a custom or a noop Zone.js implementation.');

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should support elements with local refs', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
              <header #headerRef>Header</header>
              <main #mainRef>This is hydrated content in the main element.</main>
              <footer #footerRef>Footer</footer>
            `,
          })
          class SimpleComponent {
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await hydrate(html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should handle extra child nodes within a root app component', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
              <div>Some content</div>
            `,
          })
          class SimpleComponent {
          }

          const extraChildNodes = '<!--comment--> Some text! <b>and a tag</b>';
          const doc = `<html><head></head><body><app>${extraChildNodes}</app></body></html>`;
          const html = await ssr(SimpleComponent, doc);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await hydrate(html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });
      });

      describe('ng-container', () => {
        it('should support empty containers', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
              This is an empty container: <ng-container></ng-container>
            `,
          })
          class SimpleComponent {
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await hydrate(html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should support non-empty containers', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
              This is a non-empty container:
              <ng-container>
                <h1>Hello world!</h1>
              </ng-container>
              <div>Post-container element</div>
            `,
          })
          class SimpleComponent {
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await hydrate(html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should support nested containers', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
              This is a non-empty container:
              <ng-container>
                <ng-container>
                  <ng-container>
                    <h1>Hello world!</h1>
                  </ng-container>
                </ng-container>
              </ng-container>
              <div>Post-container element</div>
              <ng-container>
                <div>Tags between containers</div>
                <ng-container>
                  <div>More tags between containers</div>
                  <ng-container>
                    <h1>Hello world!</h1>
                  </ng-container>
                </ng-container>
              </ng-container>
            `,
          })
          class SimpleComponent {
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await hydrate(html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should support element containers with *ngIf', async () => {
          @Component({
            selector: 'cmp',
            standalone: true,
            template: 'Hi!',
          })
          class Cmp {
          }

          @Component({
            standalone: true,
            selector: 'app',
            imports: [NgIf],
            template: `
              <ng-container *ngIf="true">
                <div #inner></div>
              </ng-container>
              <ng-template #outer />
            `,
          })
          class SimpleComponent {
            @ViewChild('inner', {read: ViewContainerRef}) inner!: ViewContainerRef;
            @ViewChild('outer', {read: ViewContainerRef}) outer!: ViewContainerRef;

            ngAfterViewInit() {
              this.inner.createComponent(Cmp);
              this.outer.createComponent(Cmp);
            }
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent, Cmp);

          const appRef = await hydrate(html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });
      });

      describe('view containers', () => {
        describe('*ngIf', () => {
          it('should work with *ngIf on ng-container nodes', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgIf],
              template: `
              This is a non-empty container:
              <ng-container *ngIf="true">
                <h1>Hello world!</h1>
              </ng-container>
              <div>Post-container element</div>
            `,
            })
            class SimpleComponent {
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should work with empty containers on ng-container nodes', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgIf],
              template: `
                This is an empty container:
                <ng-container *ngIf="false" />
                <div>Post-container element</div>
              `,
            })
            class SimpleComponent {
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should work with *ngIf on element nodes', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgIf],
              template: `
              <h1 *ngIf="true">Hello world!</h1>
            `,
            })
            class SimpleComponent {
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should work with empty containers on element nodes', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgIf],
              template: `
                <h1 *ngIf="false">Hello world!</h1>
              `,
            })
            class SimpleComponent {
            }
            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);
            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);
            resetTViewsFor(SimpleComponent);
            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();
            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should work with *ngIf on component host nodes', async () => {
            @Component({
              standalone: true,
              selector: 'nested-cmp',
              imports: [NgIf],
              template: `
              <h1 *ngIf="true">Hello World!</h1>
            `,
            })
            class NestedComponent {
            }

            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgIf, NestedComponent],
              template: `
              This is a component:
              <nested-cmp *ngIf="true" />
              <div>Post-container element</div>
            `,
            })
            class SimpleComponent {
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent, NestedComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should support nested *ngIfs', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgIf],
              template: `
              This is a non-empty container:
              <ng-container *ngIf="true">
                <h1 *ngIf="true">
                  <span *ngIf="true">Hello world!</span>
                </h1>
              </ng-container>
              <div>Post-container element</div>
            `,
            })
            class SimpleComponent {
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });
        });

        describe('*ngFor', () => {
          it('should support *ngFor on <ng-container> nodes', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgIf, NgFor],
              template: `
              <ng-container *ngFor="let item of items">
                <h1 *ngIf="true">Item #{{ item }}</h1>
              </ng-container>
              <div>Post-container element</div>
            `,
            })
            class SimpleComponent {
              items = [1, 2, 3];
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            // Check whether serialized hydration info has a multiplier
            // (which avoids repeated views serialization).
            const hydrationInfo = getHydrationInfoFromTransferState(ssrContents);
            expect(hydrationInfo).toContain('"x":3');

            resetTViewsFor(SimpleComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should support *ngFor on element nodes', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgIf, NgFor],
              template: `
                <div *ngFor="let item of items">
                  <h1 *ngIf="true">Item #{{ item }}</h1>
                </div>
                <div>Post-container element</div>
              `,
            })
            class SimpleComponent {
              items = [1, 2, 3];
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            // Check whether serialized hydration info has a multiplier
            // (which avoids repeated views serialization).
            const hydrationInfo = getHydrationInfoFromTransferState(ssrContents);
            expect(hydrationInfo).toContain('"x":3');

            resetTViewsFor(SimpleComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should support *ngFor on host component nodes', async () => {
            @Component({
              standalone: true,
              selector: 'nested-cmp',
              imports: [NgIf],
              template: `
              <h1 *ngIf="true">Hello World!</h1>
            `,
            })
            class NestedComponent {
            }

            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgIf, NgFor, NestedComponent],
              template: `
              <nested-cmp *ngFor="let item of items" />
              <div>Post-container element</div>
            `,
            })
            class SimpleComponent {
              items = [1, 2, 3];
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            // Check whether serialized hydration info has a multiplier
            // (which avoids repeated views serialization).
            const hydrationInfo = getHydrationInfoFromTransferState(ssrContents);
            expect(hydrationInfo).toContain('"x":3');

            resetTViewsFor(SimpleComponent, NestedComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should support compact serialization for *ngFor', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgIf, NgFor],
              template: `
                <div *ngFor="let number of numbers">
                  Number {{ number }}
                  <ng-container *ngIf="number >= 0 && number < 5">is in [0, 5) range.</ng-container>
                  <ng-container *ngIf="number >= 5 && number < 8">is in [5, 8) range.</ng-container>
                  <ng-container *ngIf="number >= 8 && number < 10">is in [8, 10) range.</ng-container>
                </div>
              `,
            })
            class SimpleComponent {
              numbers = [...Array(10).keys()];  // [0..9]
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            // Check whether serialized hydration info has multipliers
            // (which avoids repeated views serialization).
            const hydrationInfo = getHydrationInfoFromTransferState(ssrContents);
            expect(hydrationInfo).toContain('"x":5');  // [0, 5) range, 5 views
            expect(hydrationInfo).toContain('"x":3');  // [5, 8) range, 3 views
            expect(hydrationInfo).toContain('"x":2');  // [8, 10) range, 2 views

            resetTViewsFor(SimpleComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });
        });

        describe('*ngComponentOutlet', () => {
          it('should support hydration on <ng-container> nodes', async () => {
            @Component({
              standalone: true,
              selector: 'nested-cmp',
              imports: [NgIf],
              template: `
                <h1 *ngIf="true">Hello World!</h1>
              `,
            })
            class NestedComponent {
            }

            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgComponentOutlet],
              template: `
                <ng-container *ngComponentOutlet="NestedComponent" />`
            })
            class SimpleComponent {
              // This field is necessary to expose
              // the `NestedComponent` to the template.
              NestedComponent = NestedComponent;
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent, NestedComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should support hydration on element nodes', async () => {
            @Component({
              standalone: true,
              selector: 'nested-cmp',
              imports: [NgIf],
              template: `
                <h1 *ngIf="true">Hello World!</h1>
              `,
            })
            class NestedComponent {
            }

            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgComponentOutlet],
              template: `
                <div *ngComponentOutlet="NestedComponent"></div>
              `
            })
            class SimpleComponent {
              // This field is necessary to expose
              // the `NestedComponent` to the template.
              NestedComponent = NestedComponent;
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent, NestedComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should support hydration for nested components', async () => {
            @Component({
              standalone: true,
              selector: 'nested-cmp',
              imports: [NgIf],
              template: `
                <h1 *ngIf="true">Hello World!</h1>
              `,
            })
            class NestedComponent {
            }

            @Component({
              standalone: true,
              selector: 'other-nested-cmp',
              imports: [NgComponentOutlet],
              template: `
                <ng-container *ngComponentOutlet="NestedComponent" />`
            })
            class OtherNestedComponent {
              // This field is necessary to expose
              // the `NestedComponent` to the template.
              NestedComponent = NestedComponent;
            }

            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgComponentOutlet],
              template: `
                <ng-container *ngComponentOutlet="OtherNestedComponent" />`
            })
            class SimpleComponent {
              // This field is necessary to expose
              // the `OtherNestedComponent` to the template.
              OtherNestedComponent = OtherNestedComponent;
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent, NestedComponent, OtherNestedComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });
        });

        describe('*ngTemplateOutlet', () => {
          it('should work with <ng-container>', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgTemplateOutlet],
              template: `
                <ng-template #tmpl>
                  This is a content of the template!
                </ng-template>
                <ng-container [ngTemplateOutlet]="tmpl"></ng-container>
              `,
            })
            class SimpleComponent {
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should work with element nodes', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgTemplateOutlet],
              template: `
                <ng-template #tmpl>
                  This is a content of the template!
                </ng-template>
                <div [ngTemplateOutlet]="tmpl"></div>
                <div>Some extra content</div>
              `,
            })
            class SimpleComponent {
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });
        });

        describe('ViewContainerRef', () => {
          it('should work with ViewContainerRef.createComponent', async () => {
            @Component({
              standalone: true,
              selector: 'dynamic',
              template: `
                <span>This is a content of a dynamic component.</span>
              `,
            })
            class DynamicComponent {
            }

            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgIf, NgFor],
              template: `
                <div #target></div>
                <main>Hi! This is the main content.</main>
              `,
            })
            class SimpleComponent {
              @ViewChild('target', {read: ViewContainerRef}) vcr!: ViewContainerRef;

              ngAfterViewInit() {
                const compRef = this.vcr.createComponent(DynamicComponent);
                compRef.changeDetectorRef.detectChanges();
              }
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent, DynamicComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should work with ViewContainerRef.createEmbeddedView', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgIf, NgFor],
              template: `
                <ng-template #tmpl>
                  <h1>This is a content of an ng-template.</h1>
                </ng-template>
                <ng-container #target></ng-container>
              `,
            })
            class SimpleComponent {
              @ViewChild('target', {read: ViewContainerRef}) vcr!: ViewContainerRef;
              @ViewChild('tmpl', {read: TemplateRef}) tmpl!: TemplateRef<unknown>;

              ngAfterViewInit() {
                const viewRef = this.vcr.createEmbeddedView(this.tmpl);
                viewRef.detectChanges();
              }
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should re-create the views from the ViewContainerRef ' +
                 'if there is a mismatch in template ids between the current view ' +
                 '(that is being created) and the first dehydrated view in the list',
             async () => {
               @Component({
                 standalone: true,
                 selector: 'app',
                 template: `
                    <ng-template #tmplH1>
                      <h1>Content of H1</h1>
                    </ng-template>
                    <ng-template #tmplH2>
                      <h2>Content of H2</h2>
                    </ng-template>
                    <ng-template #tmplH3>
                      <h3>Content of H3</h3>
                    </ng-template>
                    <p>Pre-container content</p>
                    <ng-container #target></ng-container>
                    <div>Post-container content</div>
                  `,
               })
               class SimpleComponent {
                 @ViewChild('target', {read: ViewContainerRef}) vcr!: ViewContainerRef;
                 @ViewChild('tmplH1', {read: TemplateRef}) tmplH1!: TemplateRef<unknown>;
                 @ViewChild('tmplH2', {read: TemplateRef}) tmplH2!: TemplateRef<unknown>;
                 @ViewChild('tmplH3', {read: TemplateRef}) tmplH3!: TemplateRef<unknown>;

                 isServer = isPlatformServer(inject(PLATFORM_ID));

                 ngAfterViewInit() {
                   const viewRefH1 = this.vcr.createEmbeddedView(this.tmplH1);
                   const viewRefH2 = this.vcr.createEmbeddedView(this.tmplH2);
                   const viewRefH3 = this.vcr.createEmbeddedView(this.tmplH3);
                   viewRefH1.detectChanges();
                   viewRefH2.detectChanges();
                   viewRefH3.detectChanges();

                   // Move the last view in front of the first one.
                   this.vcr.move(viewRefH3, 0);
                 }
               }

               const html = await ssr(SimpleComponent);
               const ssrContents = getAppContents(html);

               expect(ssrContents).toContain('<app ngh');

               resetTViewsFor(SimpleComponent);

               const appRef = await hydrate(html, SimpleComponent);
               const compRef = getComponentRef<SimpleComponent>(appRef);
               appRef.tick();

               // We expect that all 3 dehydrated views would be removed
               // (each dehydrated view represents a real embedded view),
               // since we can not hydrate them in order (views were
               // moved in a container).
               expect(ngDevMode!.dehydratedViewsRemoved).toBe(3);

               const clientRootNode = compRef.location.nativeElement;
               const h1 = clientRootNode.querySelector('h1');
               const h2 = clientRootNode.querySelector('h2');
               const h3 = clientRootNode.querySelector('h3');
               const exceptions = [h1, h2, h3];
               verifyAllNodesClaimedForHydration(clientRootNode, exceptions);
               verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
             });
        });

        describe('<ng-template>', () => {
          it('should support unused <ng-template>s', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              template: `
                <ng-template #a>Some content</ng-template>
                <div>Tag in between</div>
                <ng-template #b>Some content</ng-template>
                <p>Tag in between</p>
                <ng-template #c>
                  Some content
                  <ng-template #d>
                    Nested template content.
                  </ng-template>
                </ng-template>
              `,
            })
            class SimpleComponent {
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });
        });

        describe('transplanted views', () => {
          it('should work when passing TemplateRef to a different component', async () => {
            @Component({
              standalone: true,
              imports: [CommonModule],
              selector: 'insertion-component',
              template: `
                <ng-container [ngTemplateOutlet]="template"></ng-container>
              `
            })
            class InsertionComponent {
              @Input() template!: TemplateRef<unknown>;
            }

            @Component({
              standalone: true,
              selector: 'app',
              imports: [InsertionComponent, CommonModule],
              template: `
                <ng-template #template>
                  This is a transplanted view!
                  <div *ngIf="true">With more nested views!</div>
                </ng-template>
                <insertion-component [template]="template" />
              `,
            })
            class SimpleComponent {
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent);

            const appRef = await hydrate(html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });
        });
      });
    });

    // Note: hydration for i18n blocks is not *yet* supported, so the tests
    // below verify that components that use i18n are excluded from the hydration
    // by adding the `ngSkipHydration` flag onto the component host element.
    describe('i18n', () => {
      it('should append skip hydration flag if component uses i18n blocks', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            <div i18n>Hi!</div>
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);
        expect(ssrContents).toContain('<app ngskiphydration="">');

        resetTViewsFor(SimpleComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyNoNodesWereClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should keep the skip hydration flag if component uses i18n blocks', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          host: {ngSkipHydration: 'true'},
          template: `
            <div i18n>Hi!</div>
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);
        expect(ssrContents).toContain('<app ngskiphydration="true">');

        resetTViewsFor(SimpleComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyNoNodesWereClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should append skip hydration flag if component uses i18n blocks inside embedded views',
         async () => {
           @Component({
             standalone: true,
             imports: [NgIf],
             selector: 'app',
             template: `
               <main *ngIf="true">
                 <div *ngIf="true" i18n>Hi!</div>
               </main>
              `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);
           expect(ssrContents).toContain('<app ngskiphydration="">');

           resetTViewsFor(SimpleComponent);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           verifyNoNodesWereClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      it('should append skip hydration flag if component uses i18n blocks on <ng-container>s',
         async () => {
           @Component({
             standalone: true,
             selector: 'app',
             template: `
              <ng-container i18n>Hi!</ng-container>
            `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);
           expect(ssrContents).toContain('<app ngskiphydration="">');

           resetTViewsFor(SimpleComponent);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           verifyNoNodesWereClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      it('should append skip hydration flag if component uses i18n blocks (with *ngIfs on <ng-container>s)',
         async () => {
           @Component({
             standalone: true,
             imports: [CommonModule],
             selector: 'app',
             template: `
              <ng-container *ngIf="true" i18n>Hi!</ng-container>
            `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);
           expect(ssrContents).toContain('<app ngskiphydration="">');

           resetTViewsFor(SimpleComponent);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           verifyNoNodesWereClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      it('should *not* throw when i18n attributes are used', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
              <div i18n-title title="Hello world">Hi!</div>
            `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should *not* throw when i18n is used in nested component ' +
             'excluded using `ngSkipHydration`',
         async () => {
           @Component({
             standalone: true,
             selector: 'nested',
             template: `
                <div i18n>Hi!</div>
              `,
           })
           class NestedComponent {
           }

           @Component({
             standalone: true,
             imports: [NestedComponent],
             selector: 'app',
             template: `
               Nested component with i18n inside:
               <nested ngSkipHydration />
             `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain('<app ngh');

           resetTViewsFor(SimpleComponent);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           verifyAllNodesClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });
    });

    describe('ShadowDom encapsulation', () => {
      it('should append skip hydration flag if component uses ShadowDom encapsulation',
         async () => {
           @Component({
             standalone: true,
             selector: 'app',
             encapsulation: ViewEncapsulation.ShadowDom,
             template: `Hi!`,
             styles: [':host { color: red; }']
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);
           expect(ssrContents).toContain('<app ngskiphydration="">');
         });

      it('should append skip hydration flag if component uses ShadowDom encapsulation ' +
             '(but keep parent and sibling elements hydratable)',
         async () => {
           @Component({
             standalone: true,
             selector: 'shadow-dom',
             encapsulation: ViewEncapsulation.ShadowDom,
             template: `ShadowDom component`,
             styles: [':host { color: red; }']
           })
           class ShadowDomComponent {
           }

           @Component({
             standalone: true,
             selector: 'regular',
             template: `<p>Regular component</p>`,
           })
           class RegularComponent {
             @Input() id?: string;
           }

           @Component({
             standalone: true,
             selector: 'app',
             imports: [RegularComponent, ShadowDomComponent],
             template: `
                <main>Main content</main>
                <regular id="1" />
                <shadow-dom />
                <regular id="2" />
              `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain('<app ngh="0">');
           expect(ssrContents).toContain('<shadow-dom ngskiphydration="">');
           expect(ssrContents).toContain('<regular id="1" ngh="0">');
           expect(ssrContents).toContain('<regular id="2" ngh="0">');
         });
    });

    describe('ngSkipHydration', () => {
      it('should skip hydrating elements with ngSkipHydration attribute', async () => {
        @Component({
          standalone: true,
          selector: 'nested-cmp',
          template: `
            <h1>Hello World!</h1>
            <div>This is the content of a nested component</div>
          `,
        })
        class NestedComponent {
          @Input() title = '';
        }

        @Component({
          standalone: true,
          selector: 'app',
          imports: [NestedComponent],
          template: `
            <header>Header</header>
            <nested-cmp [title]="someTitle" style="width:100px; height:200px; color:red" moo="car" foo="value" baz ngSkipHydration />
            <footer>Footer</footer>
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, NestedComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should skip hydrating elements when host element ' +
             'has the ngSkipHydration attribute',
         async () => {
           @Component({
             standalone: true,
             selector: 'app',
             template: `
            <main>Main content</main>
          `,
           })
           class SimpleComponent {
           }

           const indexHtml = '<html><head></head><body>' +
               '<app ngSkipHydration></app>' +
               '</body></html>';
           const html = await ssr(SimpleComponent, indexHtml);
           const ssrContents = getAppContents(html);

           // No `ngh` attribute in the <app> element.
           expect(ssrContents).toContain('<app ngskiphydration=""><main>Main content</main></app>');

           // Even though hydration was skipped at the root level, the hydration
           // info key and an empty array as a value are still included into the
           // TransferState to indicate that the server part was configured correctly.
           const transferState = getHydrationInfoFromTransferState(html);
           expect(transferState).toContain(TRANSFER_STATE_TOKEN_ID);

           resetTViewsFor(SimpleComponent);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           verifyAllNodesClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      it('should allow the same component with and without hydration in the same template ' +
             '(when component with `ngSkipHydration` goes first)',
         async () => {
           @Component({
             standalone: true,
             selector: 'nested',
             imports: [NgIf],
             template: `
               <ng-container *ngIf="true">Hello world</ng-container>
             `
           })
           class Nested {
           }

           @Component({
             standalone: true,
             selector: 'app',
             imports: [NgIf, Nested],
             template: `
                <nested ngSkipHydration />
                <nested />
                <nested ngSkipHydration />
                <nested />
              `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

           resetTViewsFor(SimpleComponent, Nested);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           verifyAllNodesClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      it('should allow the same component with and without hydration in the same template ' +
             '(when component without `ngSkipHydration` goes first)',
         async () => {
           @Component({
             standalone: true,
             selector: 'nested',
             imports: [NgIf],
             template: `
               <ng-container *ngIf="true">Hello world</ng-container>
             `
           })
           class Nested {
           }

           @Component({
             standalone: true,
             selector: 'app',
             imports: [NgIf, Nested],
             template: `
               <nested />
               <nested ngSkipHydration />
               <nested />
               <nested ngSkipHydration />
             `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

           resetTViewsFor(SimpleComponent, Nested);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           verifyAllNodesClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      it('should hydrate when the value of an attribute is "ngskiphydration"', async () => {
        @Component({
          standalone: true,
          selector: 'nested-cmp',
          template: `
            <h1>Hello World!</h1>
            <div>This is the content of a nested component</div>
          `,
        })
        class NestedComponent {
          @Input() title = '';
        }

        @Component({
          standalone: true,
          selector: 'app',
          imports: [NestedComponent],
          template: `
            <header>Header</header>
            <nested-cmp style="width:100px; height:200px; color:red" moo="car" foo="value" baz [title]="ngSkipHydration" />
            <footer>Footer</footer>
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, NestedComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should skip hydrating elements with ngSkipHydration host binding', async () => {
        @Component({
          standalone: true,
          selector: 'second-cmp',
          template: `<div>Not hydrated</div>`,
        })
        class SecondCmd {
        }

        @Component({
          standalone: true,
          imports: [SecondCmd],
          selector: 'nested-cmp',
          template: `<second-cmp />`,
          host: {ngSkipHydration: 'true'},
        })
        class NestedCmp {
        }

        @Component({
          standalone: true,
          imports: [NestedCmp],
          selector: 'app',
          template: `
            <nested-cmp />
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, NestedCmp);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should skip hydrating all child content of an element with ngSkipHydration attribute',
         async () => {
           @Component({
             standalone: true,
             selector: 'nested-cmp',
             template: `
              <h1>Hello World!</h1>
              <div>This is the content of a nested component</div>
            `,
           })
           class NestedComponent {
             @Input() title = '';
           }

           @Component({
             standalone: true,
             selector: 'app',
             imports: [NestedComponent],
             template: `
              <header>Header</header>
              <nested-cmp ngSkipHydration>
                <h1>Dehydrated content header</h1>
                <p>This content is definitely dehydrated and could use some water.</p>
              </nested-cmp>
              <footer>Footer</footer>
            `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain('<app ngh');

           resetTViewsFor(SimpleComponent, NestedComponent);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           verifyAllNodesClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      it('should skip hydrating when ng-containers exist and ngSkipHydration attribute is present',
         async () => {
           @Component({
             standalone: true,
             selector: 'nested-cmp',
             template: `
              <h1>Hello World!</h1>
              <div>This is the content of a nested component</div>
            `,
           })
           class NestedComponent {
           }

           @Component({
             standalone: true,
             selector: 'app',
             imports: [NestedComponent],
             template: `
              <header>Header</header>
                <nested-cmp ngSkipHydration>
                  <ng-container>
                    <h1>Dehydrated content header</h1>
                  </ng-container>
                </nested-cmp>
              <footer>Footer</footer>
            `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain('<app ngh');

           resetTViewsFor(SimpleComponent, NestedComponent);

           const appRef = await hydrate(html, SimpleComponent, [withDebugConsole()]);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           verifyHasLog(
               appRef,
               'Angular hydrated 1 component(s) and 6 node(s), 1 component(s) were skipped');

           const clientRootNode = compRef.location.nativeElement;
           verifyAllNodesClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      it('should skip hydrating and safely allow DOM manipulation inside block that was skipped',
         async () => {
           @Component({
             standalone: true,
             selector: 'nested-cmp',
             template: `
              <h1>Hello World!</h1>
              <div #nestedDiv>This is the content of a nested component</div>
            `,
           })
           class NestedComponent {
             el = inject(ElementRef);

             ngAfterViewInit() {
               const span = document.createElement('span');
               span.innerHTML = 'Appended span';
               this.el.nativeElement.appendChild(span);
             }
           }

           @Component({
             standalone: true,
             selector: 'app',
             imports: [NestedComponent],
             template: `
              <header>Header</header>
              <nested-cmp ngSkipHydration />
              <footer>Footer</footer>
            `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain('<app ngh');

           resetTViewsFor(SimpleComponent, NestedComponent);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           expect(clientRootNode.outerHTML).toContain('Appended span');
           verifyAllNodesClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      it('should skip hydrating and safely allow adding and removing DOM nodes inside block that was skipped',
         async () => {
           @Component({
             standalone: true,
             selector: 'nested-cmp',
             template: `
              <h1>Hello World!</h1>
              <div #nestedDiv>
                <p>This content will be removed</p>
              </div>
            `,
           })
           class NestedComponent {
             el = inject(ElementRef);

             ngAfterViewInit() {
               const pTag = document.querySelector('p');
               pTag?.parentElement?.removeChild(pTag);
               const span = document.createElement('span');
               span.innerHTML = 'Appended span';
               this.el.nativeElement.appendChild(span);
             }
           }

           @Component({
             standalone: true,
             selector: 'app',
             imports: [NestedComponent],
             template: `
              <header>Header</header>
              <nested-cmp ngSkipHydration />
              <footer>Footer</footer>
            `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain('<app ngh');

           resetTViewsFor(SimpleComponent, NestedComponent);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           expect(clientRootNode.outerHTML).toContain('Appended span');
           expect(clientRootNode.outerHTML).not.toContain('This content will be removed');
           verifyAllNodesClaimedForHydration(clientRootNode);
         });

      it('should skip hydrating elements with ngSkipHydration attribute on ViewContainerRef host',
         async () => {
           @Component({
             standalone: true,
             selector: 'nested-cmp',
             template: `<p>Just some text</p>`,
           })
           class NestedComponent {
             el = inject(ElementRef);
             doc = inject(DOCUMENT);

             ngAfterViewInit() {
               const pTag = this.doc.querySelector('p');
               pTag?.remove();
               const span = this.doc.createElement('span');
               span.innerHTML = 'Appended span';
               this.el.nativeElement.appendChild(span);
             }
           }

           @Component({
             standalone: true,
             selector: 'projector-cmp',
             imports: [NestedComponent],
             template: `
                <main>
                  <nested-cmp></nested-cmp>
                </main>
              `,
           })
           class ProjectorCmp {
             vcr = inject(ViewContainerRef);
           }

           @Component({
             standalone: true,
             imports: [ProjectorCmp],
             selector: 'app',
             template: `
              <projector-cmp ngSkipHydration>
              </projector-cmp>
            `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain('<app ngh');

           resetTViewsFor(SimpleComponent, ProjectorCmp);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           verifyAllNodesClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      it('should throw when ngSkipHydration attribute is set on a node ' +
             'which is not a component host',
         async () => {
           @Component({
             standalone: true,
             selector: 'app',
             template: `
                <header ngSkipHydration>Header</header>
                <footer ngSkipHydration>Footer</footer>
              `,
           })
           class SimpleComponent {
           }

           try {
             const html = await ssr(SimpleComponent);
             const ssrContents = getAppContents(html);

             expect(ssrContents).toContain('<app ngh');

             resetTViewsFor(SimpleComponent);

             await hydrate(html, SimpleComponent);

             fail('Expected the hydration process to throw.');
           } catch (e: unknown) {
             expect((e as Error).toString())
                 .toContain(
                     'The `ngSkipHydration` flag is applied ' +
                     'on a node that doesn\'t act as a component host');
           }
         });

      it('should throw when ngSkipHydration attribute is set on a node ' +
             'which is not a component host (when using host bindings)',
         async () => {
           @Directive({
             standalone: true,
             selector: '[dir]',
             host: {ngSkipHydration: 'true'},
           })
           class Dir {
           }

           @Component({
             standalone: true,
             selector: 'app',
             imports: [Dir],
             template: `
                <div dir></div>
              `,
           })
           class SimpleComponent {
           }

           try {
             const html = await ssr(SimpleComponent);
             const ssrContents = getAppContents(html);

             expect(ssrContents).toContain('<app ngh');

             resetTViewsFor(SimpleComponent);

             await hydrate(html, SimpleComponent);

             fail('Expected the hydration process to throw.');
           } catch (e: unknown) {
             const errorMessage = (e as Error).toString();
             expect(errorMessage)
                 .toContain(
                     'The `ngSkipHydration` flag is applied ' +
                     'on a node that doesn\'t act as a component host');
             expect(errorMessage)
                 .toContain('<div ngskiphydration="true" dir="">…</div>  <-- AT THIS LOCATION');
           }
         });
    });

    describe('corrupted text nodes restoration', () => {
      it('should support empty text nodes', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            This is hydrated content.
            <span>{{spanText}}</span>.
            <p>{{pText}}</p>
            <div>{{anotherText}}</div>
          `,
        })
        class SimpleComponent {
          spanText = '';
          pText = '';
          anotherText = '';
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should support empty text interpolations within elements ' +
             '(when interpolation is on a new line)',
         async () => {
           @Component({
             standalone: true,
             selector: 'app',
             template: `
                <div>
                  {{ text }}
                </div>
              `,
           })
           class SimpleComponent {
             text = '';
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain('<app ngh');

           // Expect special markers to not be present, since there
           // are no corrupted text nodes that require restoring.
           //
           // The HTML contents produced by the SSR would look like this:
           // `<div>  </div>` (1 text node with 2 empty spaces inside of
           // a <div>), which would result in creating a text node by a
           // browser.
           expect(ssrContents).not.toContain(EMPTY_TEXT_NODE_COMMENT);
           expect(ssrContents).not.toContain(TEXT_NODE_SEPARATOR_COMMENT);

           resetTViewsFor(SimpleComponent);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           verifyAllNodesClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      it('should not treat text nodes with `&nbsp`s as empty', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            <div>&nbsp;{{ text }}&nbsp;</div>
            &nbsp;&nbsp;&nbsp;
            <h1>Hello world!</h1>
            &nbsp;&nbsp;&nbsp;
            <h2>Hello world!</h2>
          `,
        })
        class SimpleComponent {
          text = '';
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        // Expect special markers to not be present, since there
        // are no corrupted text nodes that require restoring.
        expect(ssrContents).not.toContain(EMPTY_TEXT_NODE_COMMENT);
        expect(ssrContents).not.toContain(TEXT_NODE_SEPARATOR_COMMENT);

        resetTViewsFor(SimpleComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should support restoration of multiple text nodes in a row', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            This is hydrated content.<span>{{emptyText}}{{moreText}}{{andMoreText}}</span>.
            <p>{{secondEmptyText}}{{secondMoreText}}</p>
          `,
        })
        class SimpleComponent {
          emptyText = '';
          moreText = '';
          andMoreText = '';
          secondEmptyText = '';
          secondMoreText = '';
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should support projected text node content with plain text nodes', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          imports: [NgIf],
          template: `
            <div>
              Hello
              <ng-container *ngIf="true">Angular</ng-container>
              <ng-container *ngIf="true">World</ng-container>
            </div>
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });
    });

    describe('post-hydration cleanup', () => {
      it('should cleanup unclaimed views in a component (when using elements)', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          imports: [NgIf],
          template: `
            <b *ngIf="isServer">This is a SERVER-ONLY content</b>
            <i *ngIf="!isServer">This is a CLIENT-ONLY content</i>
          `,
        })
        class SimpleComponent {
          // This flag is intentionally different between the client
          // and the server: we use it to test the logic to cleanup
          // dehydrated views.
          isServer = isPlatformServer(inject(PLATFORM_ID));
        }

        const html = await ssr(SimpleComponent);
        let ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        ssrContents = stripExcessiveSpaces(stripUtilAttributes(ssrContents, false));

        // In the SSR output we expect to see SERVER content, but not CLIENT.
        expect(ssrContents).not.toContain('<i>This is a CLIENT-ONLY content</i>');
        expect(ssrContents).toContain('<b>This is a SERVER-ONLY content</b>');

        const clientRootNode = compRef.location.nativeElement;

        await whenStable(appRef);

        const clientContents =
            stripExcessiveSpaces(stripUtilAttributes(clientRootNode.outerHTML, false));

        // After the cleanup, we expect to see CLIENT content, but not SERVER.
        expect(clientContents).toContain('<i>This is a CLIENT-ONLY content</i>');
        expect(clientContents).not.toContain('<b>This is a SERVER-ONLY content</b>');
      });

      it('should cleanup unclaimed views in a component (when using <ng-container>s)', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          imports: [NgIf],
          template: `
            <ng-container *ngIf="isServer">This is a SERVER-ONLY content</ng-container>
            <ng-container *ngIf="!isServer">This is a CLIENT-ONLY content</ng-container>
          `,
        })
        class SimpleComponent {
          // This flag is intentionally different between the client
          // and the server: we use it to test the logic to cleanup
          // dehydrated views.
          isServer = isPlatformServer(inject(PLATFORM_ID));
        }

        const html = await ssr(SimpleComponent);
        let ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        ssrContents = stripExcessiveSpaces(stripUtilAttributes(ssrContents, false));

        // In the SSR output we expect to see SERVER content, but not CLIENT.
        expect(ssrContents).not.toContain('This is a CLIENT-ONLY content<!--ng-container-->');
        expect(ssrContents).toContain('This is a SERVER-ONLY content<!--ng-container-->');

        const clientRootNode = compRef.location.nativeElement;

        await whenStable(appRef);

        const clientContents =
            stripExcessiveSpaces(stripUtilAttributes(clientRootNode.outerHTML, false));

        // After the cleanup, we expect to see CLIENT content, but not SERVER.
        expect(clientContents).toContain('This is a CLIENT-ONLY content<!--ng-container-->');
        expect(clientContents).not.toContain('This is a SERVER-ONLY content<!--ng-container-->');
      });

      it('should cleanup within inner containers', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          imports: [NgIf],
          template: `
            <ng-container *ngIf="true">
              <b *ngIf="isServer">This is a SERVER-ONLY content</b>
              Outside of the container (must be retained).
            </ng-container>
            <i *ngIf="!isServer">This is a CLIENT-ONLY content</i>
          `,
        })
        class SimpleComponent {
          // This flag is intentionally different between the client
          // and the server: we use it to test the logic to cleanup
          // dehydrated views.
          isServer = isPlatformServer(inject(PLATFORM_ID));
        }

        const html = await ssr(SimpleComponent);
        let ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        ssrContents = stripExcessiveSpaces(stripUtilAttributes(ssrContents, false));

        // In the SSR output we expect to see SERVER content, but not CLIENT.
        expect(ssrContents).not.toContain('<i>This is a CLIENT-ONLY content</i>');
        expect(ssrContents).toContain('<b>This is a SERVER-ONLY content</b>');
        expect(ssrContents).toContain('Outside of the container (must be retained).');

        const clientRootNode = compRef.location.nativeElement;

        await whenStable(appRef);

        const clientContents =
            stripExcessiveSpaces(stripUtilAttributes(clientRootNode.outerHTML, false));

        // After the cleanup, we expect to see CLIENT content, but not SERVER.
        expect(clientContents).toContain('<i>This is a CLIENT-ONLY content</i>');
        expect(clientContents).not.toContain('<b>This is a SERVER-ONLY content</b>');

        // This line must be preserved (it's outside of the dehydrated container).
        expect(clientContents).toContain('Outside of the container (must be retained).');
      });

      it('should reconcile *ngFor-generated views', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          imports: [NgIf, NgFor],
          template: `
            <div>
              <span *ngFor="let item of items">
                {{ item }}
                <b *ngIf="item > 15">is bigger than 15!</b>
              </span>
              <main>Hi! This is the main content.</main>
            </div>
          `,
        })
        class SimpleComponent {
          isServer = isPlatformServer(inject(PLATFORM_ID));
          // Note: this is needed to test cleanup/reconciliation logic.
          items = this.isServer ? [10, 20, 100, 200] : [30, 5, 50];
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;

        await whenStable(appRef);

        // Post-cleanup should *not* contain dehydrated views.
        const postCleanupContents = stripExcessiveSpaces(clientRootNode.outerHTML);
        expect(postCleanupContents)
            .not.toContain(
                '<span> 5 <b>is bigger than 15!</b><!--bindings={ "ng-reflect-ng-if": "false" }--></span>');
        expect(postCleanupContents)
            .toContain(
                '<span> 30 <b>is bigger than 15!</b><!--bindings={ "ng-reflect-ng-if": "true" }--></span>');
        expect(postCleanupContents)
            .toContain('<span> 5 <!--bindings={ "ng-reflect-ng-if": "false" }--></span>');
        expect(postCleanupContents)
            .toContain(
                '<span> 50 <b>is bigger than 15!</b><!--bindings={ "ng-reflect-ng-if": "true" }--></span>');
      });

      it('should cleanup dehydrated views within dynamically created components', async () => {
        @Component({
          standalone: true,
          imports: [CommonModule],
          selector: 'dynamic',
          template: `
            <span>This is a content of a dynamic component.</span>
            <b *ngIf="isServer">This is a SERVER-ONLY content</b>
            <i *ngIf="!isServer">This is a CLIENT-ONLY content</i>
            <ng-container *ngIf="isServer">
              This is also a SERVER-ONLY content, but inside ng-container.
              <b>With some extra tags</b> and some text inside.
            </ng-container>
          `,
        })
        class DynamicComponent {
          isServer = isPlatformServer(inject(PLATFORM_ID));
        }

        @Component({
          standalone: true,
          selector: 'app',
          imports: [NgIf, NgFor],
          template: `
            <div #target></div>
            <main>Hi! This is the main content.</main>
          `,
        })
        class SimpleComponent {
          @ViewChild('target', {read: ViewContainerRef}) vcr!: ViewContainerRef;

          ngAfterViewInit() {
            const compRef = this.vcr.createComponent(DynamicComponent);
            compRef.changeDetectorRef.detectChanges();
          }
        }

        const html = await ssr(SimpleComponent);
        let ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, DynamicComponent);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        ssrContents = stripExcessiveSpaces(stripUtilAttributes(ssrContents, false));

        // We expect to see SERVER content, but not CLIENT.
        expect(ssrContents).not.toContain('<i>This is a CLIENT-ONLY content</i>');
        expect(ssrContents).toContain('<b>This is a SERVER-ONLY content</b>');

        const clientRootNode = compRef.location.nativeElement;

        await whenStable(appRef);

        const clientContents =
            stripExcessiveSpaces(stripUtilAttributes(clientRootNode.outerHTML, false));

        // After the cleanup, we expect to see CLIENT content, but not SERVER.
        expect(clientContents).toContain('<i>This is a CLIENT-ONLY content</i>');
        expect(clientContents).not.toContain('<b>This is a SERVER-ONLY content</b>');
      });
    });

    describe('content projection', () => {
      it('should project plain text', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
            <main>
              <ng-content></ng-content>
            </main>
          `,
        })
        class ProjectorCmp {
        }

        @Component({
          standalone: true,
          imports: [ProjectorCmp],
          selector: 'app',
          template: `
            <projector-cmp>
              Projected content is just a plain text.
            </projector-cmp>
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await hydrate(html, SimpleComponent, [withDebugConsole()]);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        verifyHasLog(
            appRef, 'Angular hydrated 2 component(s) and 5 node(s), 0 component(s) were skipped');

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should project plain text and HTML elements', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
            <main>
              <ng-content></ng-content>
            </main>
          `,
        })
        class ProjectorCmp {
        }

        @Component({
          standalone: true,
          imports: [ProjectorCmp],
          selector: 'app',
          template: `
            <projector-cmp>
              Projected content is a plain text.
              <b>Also the content has some tags</b>
            </projector-cmp>
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should support re-projection of contents', async () => {
        @Component({
          standalone: true,
          selector: 'reprojector-cmp',
          template: `
            <main>
              <ng-content></ng-content>
            </main>
          `,
        })
        class ReprojectorCmp {
        }

        @Component({
          standalone: true,
          selector: 'projector-cmp',
          imports: [ReprojectorCmp],
          template: `
            <reprojector-cmp>
              <b>Before</b>
              <ng-content></ng-content>
              <i>After</i>
            </reprojector-cmp>
          `,
        })
        class ProjectorCmp {
        }

        @Component({
          standalone: true,
          imports: [ProjectorCmp],
          selector: 'app',
          template: `
            <projector-cmp>
              Projected content is a plain text.
            </projector-cmp>
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp, ReprojectorCmp);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should handle empty projection slots within <ng-container>', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          imports: [CommonModule],
          template: `
            <ng-container *ngIf="true">
              <ng-content select="[left]"></ng-content>
              <div>
                <ng-content select="[main]"></ng-content>
              </div>
              <ng-content select="[right]"></ng-content>
            </ng-container>
          `,
        })
        class ProjectorCmp {
        }

        @Component({
          standalone: true,
          imports: [ProjectorCmp],
          selector: 'app',
          template: `
            <projector-cmp />
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should handle empty projection slots within <ng-container> ' +
             '(when no other elements are present)',
         async () => {
           @Component({
             standalone: true,
             selector: 'projector-cmp',
             imports: [CommonModule],
             template: `
              <ng-container *ngIf="true">
                <ng-content select="[left]"></ng-content>
                <ng-content select="[right]"></ng-content>
              </ng-container>
            `,
           })
           class ProjectorCmp {
           }

           @Component({
             standalone: true,
             imports: [ProjectorCmp],
             selector: 'app',
             template: `
              <projector-cmp />
            `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain('<app ngh');

           resetTViewsFor(SimpleComponent, ProjectorCmp);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           verifyAllNodesClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      it('should handle empty projection slots within a template ' +
             '(when no other elements are present)',
         async () => {
           @Component({
             standalone: true,
             selector: 'projector-cmp',
             template: `
              <ng-content select="[left]"></ng-content>
              <ng-content select="[right]"></ng-content>
             `,
           })
           class ProjectorCmp {
           }

           @Component({
             standalone: true,
             imports: [ProjectorCmp],
             selector: 'app',
             template: `
              <projector-cmp />
            `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain('<app ngh');

           resetTViewsFor(SimpleComponent, ProjectorCmp);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           verifyAllNodesClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      it('should project contents into different slots', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
            <div>
              Header slot: <ng-content select="header"></ng-content>
              Main slot: <ng-content select="main"></ng-content>
              Footer slot: <ng-content select="footer"></ng-content>
              <ng-content></ng-content> <!-- everything else -->
            </div>
          `,
        })
        class ProjectorCmp {
        }

        @Component({
          standalone: true,
          imports: [ProjectorCmp],
          selector: 'app',
          template: `
            <projector-cmp>
              <!-- contents is intentionally randomly ordered -->
              <h1>H1</h1>
              <footer>Footer</footer>
              <header>Header</header>
              <main>Main</main>
              <h2>H2</h2>
            </projector-cmp>
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should handle view container nodes that go after projection slots', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          imports: [CommonModule],
          template: `
            <ng-container *ngIf="true">
              <ng-content select="[left]"></ng-content>
              <span *ngIf="true">{{ label }}</span>
            </ng-container>
          `,
        })
        class ProjectorCmp {
          label = 'Hi';
        }

        @Component({
          standalone: true,
          imports: [ProjectorCmp],
          selector: 'app',
          template: `
            <projector-cmp />
          `,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should handle view container nodes that go after projection slots ' +
             '(when view container host node is <ng-container>)',
         async () => {
           @Component({
             standalone: true,
             selector: 'projector-cmp',
             imports: [CommonModule],
             template: `
              <ng-container *ngIf="true">
                <ng-content select="[left]"></ng-content>
                <ng-container *ngIf="true">{{ label }}</ng-container>
              </ng-container>
            `,
           })
           class ProjectorCmp {
             label = 'Hi';
           }

           @Component({
             standalone: true,
             imports: [ProjectorCmp],
             selector: 'app',
             template: `
              <projector-cmp />
            `,
           })
           class SimpleComponent {
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain('<app ngh');

           resetTViewsFor(SimpleComponent, ProjectorCmp);

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           const clientRootNode = compRef.location.nativeElement;
           verifyAllNodesClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });

      describe('partial projection', () => {
        it('should support cases when some element nodes are not projected', async () => {
          @Component({
            standalone: true,
            selector: 'projector-cmp',
            template: `
              <div>
                Header slot: <ng-content select="header" />
                Main slot: <ng-content select="main" />
                Footer slot: <ng-content select="footer" />
                <!-- no "default" projection bucket -->
              </div>
            `,
          })
          class ProjectorCmp {
          }

          @Component({
            standalone: true,
            imports: [ProjectorCmp],
            selector: 'app',
            template: `
              <projector-cmp>
                <!-- contents is randomly ordered for testing -->
                <h1>This node is not projected.</h1>
                <footer>Footer</footer>
                <header>Header</header>
                <main>Main</main>
                <h2>This node is not projected as well.</h2>
              </projector-cmp>
            `,
          })
          class SimpleComponent {
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ProjectorCmp);

          const appRef = await hydrate(html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should support cases when view containers are not projected', async () => {
          @Component({
            standalone: true,
            selector: 'projector-cmp',
            template: `No content projection slots.`,
          })
          class ProjectorCmp {
          }

          @Component({
            standalone: true,
            imports: [ProjectorCmp],
            selector: 'app',
            template: `
              <projector-cmp>
                <ng-container *ngIf="true">
                  <h1>This node is not projected.</h1>
                  <h2>This node is not projected as well.</h2>
                </ng-container>
              </projector-cmp>
            `,
          })
          class SimpleComponent {
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ProjectorCmp);

          const appRef = await hydrate(html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should support cases when component nodes are not projected', async () => {
          @Component({
            standalone: true,
            selector: 'projector-cmp',
            template: `No content projection slots.`,
          })
          class ProjectorCmp {
          }

          @Component({
            standalone: true,
            selector: 'nested',
            template: 'This is a nested component.',
          })
          class NestedComponent {
          }


          @Component({
            standalone: true,
            imports: [ProjectorCmp, NestedComponent],
            selector: 'app',
            template: `
              <projector-cmp>
                <nested>
                  <h1>This node is not projected.</h1>
                  <h2>This node is not projected as well.</h2>
                </nested>
              </projector-cmp>
            `,
          })
          class SimpleComponent {
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ProjectorCmp, NestedComponent);

          const appRef = await hydrate(html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should support cases when component nodes are not projected in nested components',
           async () => {
             @Component({
               standalone: true,
               selector: 'projector-cmp',
               template: `
                <main>
                  <ng-content />
                </main>
              `,
             })
             class ProjectorCmp {
             }

             @Component({
               standalone: true,
               selector: 'nested',
               template: 'No content projection slots.',
             })
             class NestedComponent {
             }


             @Component({
               standalone: true,
               imports: [ProjectorCmp, NestedComponent],
               selector: 'app',
               template: `
                <projector-cmp>
                  <nested>
                    <h1>This node is not projected.</h1>
                    <h2>This node is not projected as well.</h2>
                  </nested>
                </projector-cmp>
              `,
             })
             class SimpleComponent {
             }

             const html = await ssr(SimpleComponent);
             const ssrContents = getAppContents(html);

             expect(ssrContents).toContain('<app ngh');

             resetTViewsFor(SimpleComponent, ProjectorCmp, NestedComponent);

             const appRef = await hydrate(html, SimpleComponent);
             const compRef = getComponentRef<SimpleComponent>(appRef);
             appRef.tick();

             const clientRootNode = compRef.location.nativeElement;
             verifyAllNodesClaimedForHydration(clientRootNode);
             verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
           });
      });

      it('should project contents with *ngIf\'s', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
            <main>
              <ng-content></ng-content>
            </main>
          `,
        })
        class ProjectorCmp {
        }

        @Component({
          standalone: true,
          imports: [ProjectorCmp, CommonModule],
          selector: 'app',
          template: `
            <projector-cmp>
              <h1 *ngIf="visible">Header with an ngIf condition.</h1>
            </projector-cmp>
          `,
        })
        class SimpleComponent {
          visible = true;
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should project contents with *ngFor', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
            <main>
              <ng-content></ng-content>
            </main>
          `,
        })
        class ProjectorCmp {
        }

        @Component({
          standalone: true,
          imports: [ProjectorCmp, CommonModule],
          selector: 'app',
          template: `
            <projector-cmp>
              <h1 *ngFor="let item of items">Item {{ item }}</h1>
            </projector-cmp>
          `,
        })
        class SimpleComponent {
          items = [1, 2, 3];
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should support projecting contents outside of a current host element', async () => {
        @Component({
          standalone: true,
          selector: 'dynamic-cmp',
          template: `<div #target></div>`,
        })
        class DynamicComponent {
          @ViewChild('target', {read: ViewContainerRef}) vcRef!: ViewContainerRef;

          createView(tmplRef: TemplateRef<unknown>) {
            this.vcRef.createEmbeddedView(tmplRef);
          }
        }

        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
            <ng-template #ref>
              <ng-content></ng-content>
            </ng-template>
          `,
        })
        class ProjectorCmp {
          @ViewChild('ref', {read: TemplateRef}) tmplRef!: TemplateRef<unknown>;

          appRef = inject(ApplicationRef);
          environmentInjector = inject(EnvironmentInjector);
          doc = inject(DOCUMENT) as Document;
          isServer = isPlatformServer(inject(PLATFORM_ID));

          ngAfterViewInit() {
            // Create a host DOM node outside of the main app's host node
            // to emulate a situation where a host node already exists
            // on a page.
            let hostElement: Element;
            if (this.isServer) {
              hostElement = this.doc.createElement('portal-app');
              this.doc.body.insertBefore(hostElement, this.doc.body.firstChild);
            } else {
              hostElement = this.doc.querySelector('portal-app')!;
            }

            const cmp = createComponent(
                DynamicComponent, {hostElement, environmentInjector: this.environmentInjector});
            cmp.changeDetectorRef.detectChanges();
            cmp.instance.createView(this.tmplRef);
            this.appRef.attachView(cmp.hostView);
          }
        }

        @Component({
          standalone: true,
          imports: [ProjectorCmp, CommonModule],
          selector: 'app',
          template: `
            <projector-cmp>
              <header>Header</header>
            </projector-cmp>
          `,
        })
        class SimpleComponent {
          visible = true;
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        const portalRootNode = clientRootNode.ownerDocument.body.firstChild;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyAllNodesClaimedForHydration(portalRootNode.firstChild);
        const clientContents = stripUtilAttributes(portalRootNode.outerHTML, false) +
            stripUtilAttributes(clientRootNode.outerHTML, false);
        expect(clientContents)
            .toBe(
                stripUtilAttributes(stripTransferDataScript(ssrContents), false),
                'Client and server contents mismatch');
      });

      it('should handle projected containers inside other containers', async () => {
        @Component({
          standalone: true,
          selector: 'child-comp',
          template: '<ng-content />',
        })
        class ChildComp {
        }

        @Component({
          standalone: true,
          selector: 'root-comp',
          template: '<ng-content />',
        })
        class RootComp {
        }

        @Component({
          standalone: true,
          selector: 'app',
          imports: [CommonModule, RootComp, ChildComp],
          template: `
            <root-comp>
              <ng-container *ngFor="let item of items; last as last">
                <child-comp *ngIf="!last">{{ item }}|</child-comp>
              </ng-container>
            </root-comp>
          `
        })
        class MyApp {
          items: number[] = [1, 2, 3];
        }

        const html = await ssr(MyApp);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(MyApp, RootComp, ChildComp);

        const appRef = await hydrate(html, MyApp);
        const compRef = getComponentRef<MyApp>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should throw an error when projecting DOM nodes via ViewContainerRef.createComponent API',
         async () => {
           @Component({
             standalone: true,
             selector: 'dynamic',
             template: `
              <ng-content />
              <ng-content />
            `,
           })
           class DynamicComponent {
           }

           @Component({
             standalone: true,
             selector: 'app',
             imports: [NgIf, NgFor],
             template: `
              <div #target></div>
              <main>Hi! This is the main content.</main>
            `,
           })
           class SimpleComponent {
             @ViewChild('target', {read: ViewContainerRef}) vcr!: ViewContainerRef;

             ngAfterViewInit() {
               const div = document.createElement('div');
               const p = document.createElement('p');
               const span = document.createElement('span');
               const b = document.createElement('b');
               // In this test we create DOM nodes outside of Angular context
               // (i.e. not using Angular APIs) and try to content-project them.
               // This is an unsupported pattern and we expect an exception.
               const compRef = this.vcr.createComponent(
                   DynamicComponent, {projectableNodes: [[div, p], [span, b]]});
               compRef.changeDetectorRef.detectChanges();
             }
           }

           try {
             await ssr(SimpleComponent);
           } catch (error: unknown) {
             const errorMessage = (error as Error).toString();
             expect(errorMessage)
                 .toContain(
                     'During serialization, Angular detected DOM nodes that ' +
                     'were created outside of Angular context');
             expect(errorMessage).toContain('<dynamic>…</dynamic>  <-- AT THIS LOCATION');
           }
         });

      it('should throw an error when projecting DOM nodes via createComponent function call',
         async () => {
           @Component({
             standalone: true,
             selector: 'dynamic',
             template: `
              <ng-content />
              <ng-content />
            `,
           })
           class DynamicComponent {
           }

           @Component({
             standalone: true,
             selector: 'app',
             imports: [NgIf, NgFor],
             template: `
              <div #target></div>
              <main>Hi! This is the main content.</main>
            `,
           })
           class SimpleComponent {
             @ViewChild('target', {read: ViewContainerRef}) vcr!: ViewContainerRef;
             envInjector = inject(EnvironmentInjector);

             ngAfterViewInit() {
               const div = document.createElement('div');
               const p = document.createElement('p');
               const span = document.createElement('span');
               const b = document.createElement('b');
               // In this test we create DOM nodes outside of Angular context
               // (i.e. not using Angular APIs) and try to content-project them.
               // This is an unsupported pattern and we expect an exception.
               const compRef = createComponent(DynamicComponent, {
                 environmentInjector: this.envInjector,
                 projectableNodes: [[div, p], [span, b]]
               });
               compRef.changeDetectorRef.detectChanges();
             }
           }

           try {
             await ssr(SimpleComponent);
           } catch (error: unknown) {
             const errorMessage = (error as Error).toString();
             expect(errorMessage)
                 .toContain(
                     'During serialization, Angular detected DOM nodes that ' +
                     'were created outside of Angular context');
             expect(errorMessage).toContain('<dynamic>…</dynamic>  <-- AT THIS LOCATION');
           }
         });

      it('should support cases when <ng-content> is used with *ngIf="false"', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          imports: [NgIf],
          template: `
            Project?: <span>{{ project ? 'yes' : 'no' }}</span>
            <ng-content *ngIf="project" />
          `,
        })
        class ProjectorCmp {
          @Input() project: boolean = false;
        }

        @Component({
          standalone: true,
          imports: [ProjectorCmp],
          selector: 'app',
          template: `
              <projector-cmp [project]="project">
                <h1>This node is not projected.</h1>
                <h2>This node is not projected as well.</h2>
              </projector-cmp>
            `,
        })
        class SimpleComponent {
          project = false;
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

        let h1 = clientRootNode.querySelector('h1');
        let h2 = clientRootNode.querySelector('h2');
        let span = clientRootNode.querySelector('span');

        expect(h1).not.toBeDefined();
        expect(h2).not.toBeDefined();
        expect(span.textContent).toBe('no');

        // Flip the flag to enable content projection.
        compRef.instance.project = true;
        compRef.changeDetectorRef.detectChanges();

        h1 = clientRootNode.querySelector('h1');
        h2 = clientRootNode.querySelector('h2');
        span = clientRootNode.querySelector('span');

        expect(h1).toBeDefined();
        expect(h2).toBeDefined();
        expect(span.textContent).toBe('yes');
      });

      it('should support cases when <ng-content> is used with *ngIf="true"', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          imports: [NgIf],
          template: `
            Project?: <span>{{ project ? 'yes' : 'no' }}</span>
            <ng-content *ngIf="project" />
          `,
        })
        class ProjectorCmp {
          @Input() project: boolean = false;
        }

        @Component({
          standalone: true,
          imports: [ProjectorCmp],
          selector: 'app',
          template: `
              <projector-cmp [project]="project">
                <h1>This node is projected.</h1>
                <h2>This node is projected as well.</h2>
              </projector-cmp>
            `,
        })
        class SimpleComponent {
          project = true;
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

        let h1 = clientRootNode.querySelector('h1');
        let h2 = clientRootNode.querySelector('h2');
        let span = clientRootNode.querySelector('span');

        expect(h1).toBeDefined();
        expect(h2).toBeDefined();
        expect(span.textContent).toBe('yes');

        // Flip the flag to disable content projection.
        compRef.instance.project = false;
        compRef.changeDetectorRef.detectChanges();

        h1 = clientRootNode.querySelector('h1');
        h2 = clientRootNode.querySelector('h2');
        span = clientRootNode.querySelector('span');

        expect(h1).not.toBeDefined();
        expect(h2).not.toBeDefined();
        expect(span.textContent).toBe('no');
      });
    });

    describe('unsupported Zone.js config', () => {
      it('should log a warning when a noop zone is used', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `Hi!`,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        const appRef = await hydrate(html, SimpleComponent, [
          {provide: NgZone, useValue: new NoopNgZone()},
          withDebugConsole(),
        ]);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        verifyHasLog(
            appRef,
            'NG05000: Angular detected that hydration was enabled for an application ' +
                'that uses a custom or a noop Zone.js implementation.');

        const clientRootNode = compRef.location.nativeElement;

        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should log a warning when a custom zone is used', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `Hi!`,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        class CustomNgZone extends NgZone {}

        const appRef = await hydrate(html, SimpleComponent, [
          {provide: NgZone, useValue: new CustomNgZone({})},
          withDebugConsole(),
        ]);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        verifyHasLog(
            appRef,
            'NG05000: Angular detected that hydration was enabled for an application ' +
                'that uses a custom or a noop Zone.js implementation.');

        const clientRootNode = compRef.location.nativeElement;

        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });
    });

    describe('error handling', () => {
      it('should handle text node mismatch', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
        <div id="abc">This is an original content</div>
    `,
        })
        class SimpleComponent {
          private doc = inject(DOCUMENT);
          ngAfterViewInit() {
            const div = this.doc.querySelector('div');
            div!.innerHTML = '<span title="Hi!">This is an extra span causing a problem!</span>';
          }
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        await hydrate(html, SimpleComponent, withNoopErrorHandler()).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
              'During hydration Angular expected a text node but found <span>');
          expect(message).toContain('#text(This is an original content)  <-- AT THIS LOCATION');
          expect(message).toContain('<span title="Hi!">…</span>  <-- AT THIS LOCATION');
        });
      });

      it('should not crash when a node can not be found during hydration', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
        Some text.
        <div id="abc">This is an original content</div>
    `,
        })
        class SimpleComponent {
          private doc = inject(DOCUMENT);
          private isServer = isPlatformServer(inject(PLATFORM_ID));
          ngAfterViewInit() {
            if (this.isServer) {
              const div = this.doc.querySelector('div');
              div!.remove();
            }
          }
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        await hydrate(html, SimpleComponent, withNoopErrorHandler()).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
              'During hydration Angular expected <div> but the node was not found');
          expect(message).toContain('<div id="abc">…</div>  <-- AT THIS LOCATION');
        });
      });

      it('should handle element node mismatch', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
        <div id="abc">
          <p>This is an original content</p>
          <b>Bold text</b>
          <i>Italic text</i>
        </div>
    `,
        })
        class SimpleComponent {
          private doc = inject(DOCUMENT);
          ngAfterViewInit() {
            const b = this.doc.querySelector('b');
            const span = this.doc.createElement('span');
            span.textContent = 'This is an eeeeevil span causing a problem!';
            b?.parentNode?.replaceChild(span, b);
          }
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        await hydrate(html, SimpleComponent, withNoopErrorHandler()).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain('During hydration Angular expected <b> but found <span>');
          expect(message).toContain('<b>…</b>  <-- AT THIS LOCATION');
          expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
        });
      });

      it('should handle <ng-container> node mismatch', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
        <b>Bold text</b>
        <ng-container>
          <p>This is an original content</p>
        </ng-container>
      `,
        })
        class SimpleComponent {
          private doc = inject(DOCUMENT);
          ngAfterViewInit() {
            const p = this.doc.querySelector('p');
            const span = this.doc.createElement('span');
            span.textContent = 'This is an eeeeevil span causing a problem!';
            p?.parentNode?.insertBefore(span, p.nextSibling);
          }
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        await hydrate(html, SimpleComponent, withNoopErrorHandler()).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
              'During hydration Angular expected a comment node but found <span>');
          expect(message).toContain('<!-- ng-container -->  <-- AT THIS LOCATION');
          expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
        });
      });

      it('should handle <ng-container> node mismatch ' +
             '(when it is wrapped into a non-container node)',
         async () => {
           @Component({
             standalone: true,
             selector: 'app',
             template: `
          <div id="abc" class="wrapper">
            <ng-container>
              <p>This is an original content</p>
            </ng-container>
          </div>
        `,
           })
           class SimpleComponent {
             private doc = inject(DOCUMENT);
             ngAfterViewInit() {
               const p = this.doc.querySelector('p');
               const span = this.doc.createElement('span');
               span.textContent = 'This is an eeeeevil span causing a problem!';
               p?.parentNode?.insertBefore(span, p.nextSibling);
             }
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain('<app ngh');

           resetTViewsFor(SimpleComponent);

           await hydrate(html, SimpleComponent, withNoopErrorHandler()).catch((err: unknown) => {
             const message = (err as Error).message;
             expect(message).toContain(
                 'During hydration Angular expected a comment node but found <span>');
             expect(message).toContain('<!-- ng-container -->  <-- AT THIS LOCATION');
             expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
           });
         });

      it('should handle <ng-template> node mismatch', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          imports: [CommonModule],
          template: `
          <b *ngIf="true">Bold text</b>
          <i *ngIf="false">Italic text</i>
        `,
        })
        class SimpleComponent {
          private doc = inject(DOCUMENT);
          ngAfterViewInit() {
            const b = this.doc.querySelector('b');
            const firstCommentNode = b!.nextSibling;
            const span = this.doc.createElement('span');
            span.textContent = 'This is an eeeeevil span causing a problem!';
            firstCommentNode?.parentNode?.insertBefore(span, firstCommentNode.nextSibling);
          }
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        await hydrate(html, SimpleComponent, withNoopErrorHandler()).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
              'During hydration Angular expected a comment node but found <span>');
          expect(message).toContain('<!-- container -->  <-- AT THIS LOCATION');
          expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
        });
      });

      it('should handle node mismatches in nested components', async () => {
        @Component({
          standalone: true,
          selector: 'nested-cmp',
          imports: [CommonModule],
          template: `
          <b *ngIf="true">Bold text</b>
          <i *ngIf="false">Italic text</i>
        `,
        })
        class NestedComponent {
          private doc = inject(DOCUMENT);
          ngAfterViewInit() {
            const b = this.doc.querySelector('b');
            const firstCommentNode = b!.nextSibling;
            const span = this.doc.createElement('span');
            span.textContent = 'This is an eeeeevil span causing a problem!';
            firstCommentNode?.parentNode?.insertBefore(span, firstCommentNode.nextSibling);
          }
        }

        @Component({
          standalone: true,
          selector: 'app',
          imports: [NestedComponent],
          template: `<nested-cmp />`,
        })
        class SimpleComponent {
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        await hydrate(html, SimpleComponent, withNoopErrorHandler()).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
              'During hydration Angular expected a comment node but found <span>');
          expect(message).toContain('<!-- container -->  <-- AT THIS LOCATION');
          expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
          expect(message).toContain('check the "NestedComponent" component');
        });
      });

      it('should handle sibling count mismatch', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          imports: [CommonModule],
          template: `
          <ng-container *ngIf="true">
            <b>Bold text</b>
            <i>Italic text</i>
          </ng-container>
          <main>Main content</main>
        `,
        })
        class SimpleComponent {
          private doc = inject(DOCUMENT);
          ngAfterViewInit() {
            this.doc.querySelector('b')?.remove();
            this.doc.querySelector('i')?.remove();
          }
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        await hydrate(html, SimpleComponent, withNoopErrorHandler()).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
              'During hydration Angular expected more sibling nodes to be present');
          expect(message).toContain('<main>…</main>  <-- AT THIS LOCATION');
        });
      });

      it('should handle ViewContainerRef node mismatch', async () => {
        @Directive({
          standalone: true,
          selector: 'b',
        })
        class SimpleDir {
          vcr = inject(ViewContainerRef);
        }

        @Component({
          standalone: true,
          selector: 'app',
          imports: [CommonModule, SimpleDir],
          template: `
        <b>Bold text</b>
      `,
        })
        class SimpleComponent {
          private doc = inject(DOCUMENT);
          ngAfterViewInit() {
            const b = this.doc.querySelector('b');
            const firstCommentNode = b!.nextSibling;
            const span = this.doc.createElement('span');
            span.textContent = 'This is an eeeeevil span causing a problem!';
            firstCommentNode?.parentNode?.insertBefore(span, firstCommentNode);
          }
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        await hydrate(html, SimpleComponent, withNoopErrorHandler()).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
              'During hydration Angular expected a comment node but found <span>');
          expect(message).toContain('<!-- container -->  <-- AT THIS LOCATION');
          expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
        });
      });

      it('should handle a mismatch for a node that goes after a ViewContainerRef node',
         async () => {
           @Directive({
             standalone: true,
             selector: 'b',
           })
           class SimpleDir {
             vcr = inject(ViewContainerRef);
           }

           @Component({
             standalone: true,
             selector: 'app',
             imports: [CommonModule, SimpleDir],
             template: `
            <b>Bold text</b>
            <i>Italic text</i>
          `,
           })
           class SimpleComponent {
             private doc = inject(DOCUMENT);
             ngAfterViewInit() {
               const b = this.doc.querySelector('b');
               const span = this.doc.createElement('span');
               span.textContent = 'This is an eeeeevil span causing a problem!';
               b?.parentNode?.insertBefore(span, b.nextSibling);
             }
           }

           const html = await ssr(SimpleComponent);
           const ssrContents = getAppContents(html);

           expect(ssrContents).toContain('<app ngh');

           resetTViewsFor(SimpleComponent);

           await hydrate(html, SimpleComponent, withNoopErrorHandler()).catch((err: unknown) => {
             const message = (err as Error).message;
             expect(message).toContain(
                 'During hydration Angular expected a comment node but found <span>');
             expect(message).toContain('<!-- container -->  <-- AT THIS LOCATION');
             expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
           });
         });

      it('should handle a case when a node is not found (removed)', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: '<ng-content />',
        })
        class ProjectorComponent {
        }

        @Component({
          standalone: true,
          selector: 'app',
          imports: [CommonModule, ProjectorComponent],
          template: `
        <projector-cmp>
          <b>Bold text</b>
          <i>Italic text</i>
        </projector-cmp>
      `,
        })
        class SimpleComponent {
          private doc = inject(DOCUMENT);
          ngAfterContentInit() {
            this.doc.querySelector('b')?.remove();
            this.doc.querySelector('i')?.remove();
          }
        }

        ssr(SimpleComponent, undefined, withNoopErrorHandler()).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
              'During serialization, Angular was unable to find an element in the DOM');
          expect(message).toContain('<b>…</b>  <-- AT THIS LOCATION');
        });
      });

      it('should handle a case when a node is not found (detached)', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: '<ng-content />',
        })
        class ProjectorComponent {
        }

        @Component({
          standalone: true,
          selector: 'app',
          imports: [CommonModule, ProjectorComponent],
          template: `
        <projector-cmp>
          <b>Bold text</b>
        </projector-cmp>
      `,
        })
        class SimpleComponent {
          private doc = inject(DOCUMENT);
          isServer = isPlatformServer(inject(PLATFORM_ID));

          constructor() {
            if (!this.isServer) {
              this.doc.querySelector('b')?.remove();
            }
          }
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        await hydrate(html, SimpleComponent, withNoopErrorHandler()).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
              'During hydration Angular was unable to locate a node using the "firstChild" path, ' +
              'starting from the <projector-cmp>…</projector-cmp> node');
        });
      });

      it('should log an warning when there was no hydration info in the TransferState',
         async () => {
           @Component({
             standalone: true,
             selector: 'app',
             template: `Hi!`,
           })
           class SimpleComponent {
           }

           // Note: SSR *without* hydration logic enabled.
           const html = await ssr(SimpleComponent, undefined, undefined, undefined, false);
           const ssrContents = getAppContents(html);

           expect(ssrContents).not.toContain('<app ngh');

           resetTViewsFor(SimpleComponent);

           const appRef = await hydrate(html, SimpleComponent, [withDebugConsole()]);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

           verifyHasLog(
               appRef,
               'NG0505: Angular hydration was requested on the client, ' +
                   'but there was no serialized information present in the server response');

           const clientRootNode = compRef.location.nativeElement;

           // Make sure that no hydration logic was activated,
           // effectively re-rendering from scratch happened and
           // all the content inside the <app> host element was
           // cleared on the client (as it usually happens in client
           // rendering mode).
           verifyNoNodesWereClaimedForHydration(clientRootNode);
           verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
         });
    });

    describe('Router', () => {
      it('should wait for lazy routes before triggering post-hydration cleanup', async () => {
        const ngZone = TestBed.inject(NgZone);

        @Component({
          standalone: true,
          selector: 'lazy',
          template: `LazyCmp content`,
        })
        class LazyCmp {
        }

        const routes: Routes = [{
          path: '',
          loadComponent: () => {
            return ngZone.runOutsideAngular(() => {
              return new Promise(resolve => {
                setTimeout(() => resolve(LazyCmp), 100);
              });
            });
          },
        }];

        @Component({
          standalone: true,
          selector: 'app',
          imports: [RouterOutlet],
          template: `
            Works!
            <router-outlet />
          `,
        })
        class SimpleComponent {
        }

        const providers = [
          {provide: PlatformLocation, useClass: MockPlatformLocation},
          provideRouter(routes),
        ] as unknown as Provider[];
        const html = await ssr(SimpleComponent, undefined, providers);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

        // Expect serialization to happen once a lazy-loaded route completes loading
        // and a lazy component is rendered.
        expect(ssrContents).toContain(`<lazy ${NGH_ATTR_NAME}="0">LazyCmp content</lazy>`);

        resetTViewsFor(SimpleComponent, LazyCmp);

        const appRef = await hydrate(html, SimpleComponent, providers);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;

        await whenStable(appRef);

        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });
    });
  });
});
