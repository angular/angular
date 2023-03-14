/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, DOCUMENT, isPlatformServer, NgComponentOutlet, NgFor, NgIf, NgTemplateOutlet} from '@angular/common';
import {APP_ID, ApplicationRef, Component, ComponentRef, createComponent, destroyPlatform, ElementRef, EnvironmentInjector, getPlatform, inject, Input, PLATFORM_ID, Provider, TemplateRef, Type, ViewChild, ViewContainerRef, ɵgetComponentDef as getComponentDef, ɵprovideHydrationSupport as provideHydrationSupport, ɵsetDocument} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {bootstrapApplication} from '@angular/platform-browser';

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

const NGH_ATTR_REGEXP = new RegExp(` ${NGH_ATTR_NAME}=".*?"`, 'g');
const EMPTY_TEXT_NODE_REGEXP = new RegExp(`<!--${EMPTY_TEXT_NODE_COMMENT}-->`, 'g');
const TEXT_NODE_SEPARATOR_REGEXP = new RegExp(`<!--${TEXT_NODE_SEPARATOR_COMMENT}-->`, 'g');

/**
 * Drop utility attributes such as `ng-version`, `ng-server-context` and `ngh`,
 * so that it's easier to make assertions in tests.
 */
function stripUtilAttributes(html: string, keepNgh: boolean): string {
  html = html.replace(/ ng-version=".*?"/g, '')  //
             .replace(/ ng-server-context=".*?"/g, '');
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
 * Reset TView, so that we re-enter the first create pass as
 * we would normally do when we hydrate on the client. Otherwise,
 * hydration info would not be applied to T data structures.
 */
function resetTViewsFor(...types: Type<unknown>[]) {
  for (const type of types) {
    getComponentDef(type)!.tView = null;
  }
}

describe('platform-server integration', () => {
  beforeEach(() => {
    if (getPlatform()) destroyPlatform();
  });

  afterAll(() => destroyPlatform());

  describe('hydration', () => {
    const appId = 'simple-cmp';

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
        component: Type<unknown>, doc?: string, envProviders?: Provider[]): Promise<string> {
      const defaultHtml = '<html><head></head><body><app></app></body></html>';
      const providers = [
        ...(envProviders ?? []),
        {provide: APP_ID, useValue: appId},
        provideHydrationSupport(),
      ];
      return renderApplication(component, {
        document: doc ?? defaultHtml,
        appId,
        providers,
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
    async function hydrate(html: string, component: Type<unknown>, envProviders?: Provider[]):
        Promise<ApplicationRef> {
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
        {provide: APP_ID, useValue: appId},
        {provide: DOCUMENT, useFactory: _document, deps: []},
        provideHydrationSupport(),
      ];
      return bootstrapApplication(component, {providers});
    }

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
      it('should remove ngh attributes after hydation on the client', async () => {
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

          const appRef = await hydrate(html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

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

            resetTViewsFor(SimpleComponent, NestedComponent);

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
               expect((ngDevMode as any).dehydratedViewsRemoved).toBe(3);

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

           const appRef = await hydrate(html, SimpleComponent);
           const compRef = getComponentRef<SimpleComponent>(appRef);
           appRef.tick();

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

        // TODO: properly assert `ngh` attribute value once the `ngh`
        // format stabilizes, for now we just check that it's present.
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
        // TODO: properly assert `ngh` attribute value once the `ngh`
        // format stabilizes, for now we just check that it's present.
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

        const appRef = await hydrate(html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

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

      // FIXME(akushnir): this is a special use-case that will be covered in a followup PR.
      // This would require some extra logic to detect if some nodes were "dropped" during the
      // content projection operation.
      xit('should support partial projection (when some nodes are not projected)', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
            <div>
              Header slot: <ng-content select="header"></ng-content>
              Main slot: <ng-content select="main"></ng-content>
              Footer slot: <ng-content select="footer"></ng-content>
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
              <!-- contents is intentionally randomly ordered -->
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
             expect((error as Error).toString())
                 .toContain(
                     'During serialization, Angular detected DOM nodes that ' +
                     'were created outside of Angular context');
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
             expect((error as Error).toString())
                 .toContain(
                     'During serialization, Angular detected DOM nodes that ' +
                     'were created outside of Angular context');
           }
         });
    });
  });
});
