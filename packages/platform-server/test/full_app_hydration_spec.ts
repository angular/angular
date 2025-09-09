/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import '@angular/localize/init';

import {
  CommonModule,
  DOCUMENT,
  isPlatformBrowser,
  isPlatformServer,
  NgComponentOutlet,
  NgFor,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgTemplateOutlet,
  PlatformLocation,
} from '@angular/common';
import {MockPlatformLocation} from '@angular/common/testing';
import {computeMsgId} from '@angular/compiler';
import {
  afterEveryRender,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  createComponent,
  destroyPlatform,
  Directive,
  ɵCLIENT_RENDER_MODE_FLAG as CLIENT_RENDER_MODE_FLAG,
  ElementRef,
  EnvironmentInjector,
  ErrorHandler,
  inject,
  Input,
  NgZone,
  PendingTasks,
  Pipe,
  PipeTransform,
  PLATFORM_ID,
  provideZonelessChangeDetection,
  Provider,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  ɵNoopNgZone as NoopNgZone,
  ContentChild,
  provideZoneChangeDetection,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {clearTranslations, loadTranslations} from '@angular/localize';
import {withI18nSupport} from '@angular/platform-browser';
import {provideRouter, RouterOutlet, Routes} from '@angular/router';

import {
  clearDocument,
  getAppContents,
  prepareEnvironmentAndHydrate,
  resetTViewsFor,
  stripUtilAttributes,
} from './dom_utils';
import {
  clearConsole,
  EMPTY_TEXT_NODE_COMMENT,
  getComponentRef,
  getHydrationInfoFromTransferState,
  NGH_ATTR_NAME,
  resetNgDevModeCounters,
  ssr,
  stripExcessiveSpaces,
  stripSsrIntegrityMarker,
  stripTransferDataScript,
  TEXT_NODE_SEPARATOR_COMMENT,
  TRANSFER_STATE_TOKEN_ID,
  verifyAllChildNodesClaimedForHydration,
  verifyAllNodesClaimedForHydration,
  verifyClientAndSSRContentsMatch,
  verifyEmptyConsole,
  verifyHasLog,
  verifyHasNoLog,
  verifyNodeHasMismatchInfo,
  verifyNodeHasSkipHydrationMarker,
  verifyNoNodesWereClaimedForHydration,
  withDebugConsole,
  withNoopErrorHandler,
} from './hydration_utils';

describe('platform-server full application hydration integration', () => {
  beforeEach(() => {
    resetNgDevModeCounters();
  });

  afterEach(() => {
    destroyPlatform();
  });

  describe('hydration', () => {
    let doc: Document;

    beforeEach(() => {
      doc = TestBed.inject(DOCUMENT);
      clearConsole(TestBed.inject(ApplicationRef));
    });

    afterEach(() => {
      clearDocument(doc);
      clearConsole(TestBed.inject(ApplicationRef));
    });

    describe('annotations', () => {
      it('should add hydration annotations to component host nodes during ssr', async () => {
        @Component({
          standalone: true,
          selector: 'nested',
          template: 'This is a nested component.',
        })
        class NestedComponent {}

        @Component({
          standalone: true,
          selector: 'app',
          imports: [NestedComponent],
          template: `
            <nested />
          `,
        })
        class SimpleComponent {}

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
        class NestedComponent {}

        @Component({
          standalone: true,
          selector: 'app',
          imports: [NestedComponent],
          template: `
            <div #localRef></div>
            <nested />
          `,
        })
        class SimpleComponent {}

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
        class SimpleComponent {}

        const extraChildNodes = '<!--comment--> Some text! <b>and a tag</b>';
        const doc = `<html><head></head><body><app>${extraChildNodes}</app></body></html>`;
        const html = await ssr(SimpleComponent, {doc});
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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should hydrate root components with empty templates', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: '',
          })
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should hydrate child components with empty templates', async () => {
          @Component({
            standalone: true,
            selector: 'child',
            template: '',
          })
          class ChildComponent {}

          @Component({
            standalone: true,
            imports: [ChildComponent],
            selector: 'app',
            template: '<child />',
          })
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent, ChildComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
          class NestedComponent {}

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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent, NestedComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            envProviders: [withDebugConsole()],
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          // Make sure there are no extra logs in case
          // default NgZone is setup for an application.
          verifyHasNoLog(
            appRef,
            'NG05000: Angular detected that hydration was enabled for an application ' +
              'that uses a custom or a noop Zone.js implementation.',
          );

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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
          class SimpleComponent {}

          const extraChildNodes = '<!--comment--> Some text! <b>and a tag</b>';
          const docContent = `<html><head></head><body><app>${extraChildNodes}</app></body></html>`;
          const html = await ssr(SimpleComponent, {doc: docContent});
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
          class Cmp {}

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

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            class SimpleComponent {}

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            class SimpleComponent {}

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            class SimpleComponent {}

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            class SimpleComponent {}
            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);
            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);
            resetTViewsFor(SimpleComponent);
            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            class NestedComponent {}

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
            class SimpleComponent {}

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent, NestedComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            class SimpleComponent {}

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            class NestedComponent {}

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

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
              numbers = [...Array(10).keys()]; // [0..9]
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            // Check whether serialized hydration info has multipliers
            // (which avoids repeated views serialization).
            const hydrationInfo = getHydrationInfoFromTransferState(ssrContents);
            expect(hydrationInfo).toContain('"x":5'); // [0, 5) range, 5 views
            expect(hydrationInfo).toContain('"x":3'); // [5, 8) range, 3 views
            expect(hydrationInfo).toContain('"x":2'); // [8, 10) range, 2 views

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            class NestedComponent {}

            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgComponentOutlet],
              template: `
                <ng-container *ngComponentOutlet="NestedComponent" />`,
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

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            class NestedComponent {}

            @Component({
              standalone: true,
              selector: 'app',
              imports: [NgComponentOutlet],
              template: `
                <div *ngComponentOutlet="NestedComponent"></div>
              `,
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

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            class NestedComponent {}

            @Component({
              standalone: true,
              selector: 'other-nested-cmp',
              imports: [NgComponentOutlet],
              template: `
                <ng-container *ngComponentOutlet="NestedComponent" />`,
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
                <ng-container *ngComponentOutlet="OtherNestedComponent" />`,
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

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            class SimpleComponent {}

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            class SimpleComponent {}

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            class DynamicComponent {}

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

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should hydrate dynamically created components using root component as an anchor', async () => {
            @Component({
              standalone: true,
              imports: [CommonModule],
              selector: 'dynamic',
              template: `
                    <span>This is a content of a dynamic component.</span>
                  `,
            })
            class DynamicComponent {}

            @Component({
              standalone: true,
              selector: 'app',
              template: `
                    <main>Hi! This is the main content.</main>
                  `,
            })
            class SimpleComponent {
              vcr = inject(ViewContainerRef);

              ngAfterViewInit() {
                const compRef = this.vcr.createComponent(DynamicComponent);
                compRef.changeDetectorRef.detectChanges();
              }
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent, DynamicComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            // Compare output starting from the parent node above the component node,
            // because component host node also acted as a ViewContainerRef anchor,
            // thus there are elements after this node (as next siblings).
            const clientRootNode = compRef.location.nativeElement.parentNode;
            await appRef.whenStable();

            verifyAllChildNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should hydrate embedded views when using root component as an anchor', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              template: `
                <ng-template #tmpl>
                  <h1>Content of embedded view</h1>
                </ng-template>
                <main>Hi! This is the main content.</main>
              `,
            })
            class SimpleComponent {
              @ViewChild('tmpl', {read: TemplateRef}) tmpl!: TemplateRef<unknown>;

              vcr = inject(ViewContainerRef);

              ngAfterViewInit() {
                const viewRef = this.vcr.createEmbeddedView(this.tmpl);
                viewRef.detectChanges();
              }
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            // Compare output starting from the parent node above the component node,
            // because component host node also acted as a ViewContainerRef anchor,
            // thus there are elements after this node (as next siblings).
            const clientRootNode = compRef.location.nativeElement.parentNode;
            await appRef.whenStable();

            verifyAllChildNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it('should hydrate dynamically created components using root component as an anchor', async () => {
            @Component({
              standalone: true,
              imports: [CommonModule],
              selector: 'nested-dynamic-a',
              template: `
                    <p>NestedDynamicComponentA</p>
                  `,
            })
            class NestedDynamicComponentA {}

            @Component({
              standalone: true,
              imports: [CommonModule],
              selector: 'nested-dynamic-b',
              template: `
                    <p>NestedDynamicComponentB</p>
                  `,
            })
            class NestedDynamicComponentB {}

            @Component({
              standalone: true,
              imports: [CommonModule],
              selector: 'dynamic',
              template: `
                    <span>This is a content of a dynamic component.</span>
                  `,
            })
            class DynamicComponent {
              vcr = inject(ViewContainerRef);

              ngAfterViewInit() {
                const compRef = this.vcr.createComponent(NestedDynamicComponentB);
                compRef.changeDetectorRef.detectChanges();
              }
            }

            @Component({
              standalone: true,
              selector: 'app',
              template: `
                    <main>Hi! This is the main content.</main>
                  `,
            })
            class SimpleComponent {
              doc = inject(DOCUMENT);
              appRef = inject(ApplicationRef);
              elementRef = inject(ElementRef);
              viewContainerRef = inject(ViewContainerRef);
              environmentInjector = inject(EnvironmentInjector);

              createOuterDynamicComponent() {
                const hostElement = this.doc.body.querySelector('[id=dynamic-cmp-target]')!;
                const compRef = createComponent(DynamicComponent, {
                  hostElement,
                  environmentInjector: this.environmentInjector,
                });
                compRef.changeDetectorRef.detectChanges();
                this.appRef.attachView(compRef.hostView);
              }

              createInnerDynamicComponent() {
                const compRef = this.viewContainerRef.createComponent(NestedDynamicComponentA);
                compRef.changeDetectorRef.detectChanges();
              }

              ngAfterViewInit() {
                this.createInnerDynamicComponent();
                this.createOuterDynamicComponent();
              }
            }

            // In this test we expect to have the following structure,
            // where both root component nodes also act as ViewContainerRef
            // anchors, i.e.:
            // ```
            //  <app />
            //  <nested-dynamic-b />
            //  <!--container-->
            //  <div></div>  // Host element for DynamicComponent
            //  <nested-dynamic-a/>
            //  <!--container-->
            // ```
            // The test verifies that 2 root components acting as ViewContainerRef
            // do not have overlaps in DOM elements that represent views and all
            // DOM nodes are able to hydrate correctly.
            const indexHtml =
              '<html><head></head><body>' +
              '<app></app>' +
              '<div id="dynamic-cmp-target"></div>' +
              '</body></html>';
            const html = await ssr(SimpleComponent, {doc: indexHtml});
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent, DynamicComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            // Compare output starting from the parent node above the component node,
            // because component host node also acted as a ViewContainerRef anchor,
            // thus there are elements after this node (as next siblings).
            const clientRootNode = compRef.location.nativeElement.parentNode;
            await appRef.whenStable();

            verifyAllChildNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });

          it(
            'should hydrate dynamically created components using ' +
              "another component's host node as an anchor",
            async () => {
              @Component({
                standalone: true,
                selector: 'another-dynamic',
                template: `<span>This is a content of another dynamic component.</span>`,
              })
              class AnotherDynamicComponent {
                vcr = inject(ViewContainerRef);
              }

              @Component({
                standalone: true,
                selector: 'dynamic',
                template: `<span>This is a content of a dynamic component.</span>`,
              })
              class DynamicComponent {
                vcr = inject(ViewContainerRef);

                ngAfterViewInit() {
                  const compRef = this.vcr.createComponent(AnotherDynamicComponent);
                  compRef.changeDetectorRef.detectChanges();
                }
              }

              @Component({
                standalone: true,
                selector: 'app',
                template: `<main>Hi! This is the main content.</main>`,
              })
              class SimpleComponent {
                vcr = inject(ViewContainerRef);

                ngAfterViewInit() {
                  const compRef = this.vcr.createComponent(DynamicComponent);
                  compRef.changeDetectorRef.detectChanges();
                }
              }

              const html = await ssr(SimpleComponent);
              const ssrContents = getAppContents(html);

              expect(ssrContents).toContain('<app ngh');

              resetTViewsFor(SimpleComponent, DynamicComponent);

              const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
              const compRef = getComponentRef<SimpleComponent>(appRef);
              appRef.tick();

              // Compare output starting from the parent node above the component node,
              // because component host node also acted as a ViewContainerRef anchor,
              // thus there are elements after this node (as next siblings).
              const clientRootNode = compRef.location.nativeElement.parentNode;
              await appRef.whenStable();

              verifyAllChildNodesClaimedForHydration(clientRootNode);
              verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
            },
          );

          it(
            'should hydrate dynamically created embedded views using ' +
              "another component's host node as an anchor",
            async () => {
              @Component({
                standalone: true,
                selector: 'dynamic',
                template: `
                      <ng-template #tmpl>
                        <h1>Content of an embedded view</h1>
                      </ng-template>
                      <main>Hi! This is the dynamic component content.</main>
                    `,
              })
              class DynamicComponent {
                @ViewChild('tmpl', {read: TemplateRef}) tmpl!: TemplateRef<unknown>;

                vcr = inject(ViewContainerRef);

                ngAfterViewInit() {
                  const viewRef = this.vcr.createEmbeddedView(this.tmpl);
                  viewRef.detectChanges();
                }
              }

              @Component({
                standalone: true,
                selector: 'app',
                template: `<main>Hi! This is the main content.</main>`,
              })
              class SimpleComponent {
                vcr = inject(ViewContainerRef);

                ngAfterViewInit() {
                  const compRef = this.vcr.createComponent(DynamicComponent);
                  compRef.changeDetectorRef.detectChanges();
                }
              }

              const html = await ssr(SimpleComponent);
              const ssrContents = getAppContents(html);

              expect(ssrContents).toContain('<app ngh');

              resetTViewsFor(SimpleComponent, DynamicComponent);

              const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
              const compRef = getComponentRef<SimpleComponent>(appRef);
              appRef.tick();

              // Compare output starting from the parent node above the component node,
              // because component host node also acted as a ViewContainerRef anchor,
              // thus there are elements after this node (as next siblings).
              const clientRootNode = compRef.location.nativeElement.parentNode;
              await appRef.whenStable();

              verifyAllChildNodesClaimedForHydration(clientRootNode);
              verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
            },
          );

          it(
            'should re-create the views from the ViewContainerRef ' +
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

              const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
            },
          );

          it('should allow injecting ViewContainerRef in the root component', async () => {
            @Component({
              standalone: true,
              selector: 'app',
              template: `Hello World!`,
            })
            class SimpleComponent {
              private vcRef = inject(ViewContainerRef);
            }

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);

            // Replace the trailing comment node (added as a result of the
            // `ViewContainerRef` injection) before comparing contents.
            const _ssrContents = ssrContents.replace(/<\/app><!--container-->/, '</app>');
            verifyClientAndSSRContentsMatch(_ssrContents, clientRootNode);
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
            class SimpleComponent {}

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
              `,
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
            class SimpleComponent {}

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          });
        });
      });
    });

    describe('i18n', () => {
      describe('support is enabled', () => {
        afterEach(() => {
          clearTranslations();
        });

        it('should append skip hydration flag if component uses i18n blocks and no `withI18nSupport()` call present', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: '<div i18n>Hi!</div>',
          })
          class SimpleComponent {
            // Having `ViewContainerRef` here is important: it triggers
            // a code path that serializes top-level `LContainer`s.
            vcr = inject(ViewContainerRef);
          }

          const hydrationFeatures = () => [];
          const html = await ssr(SimpleComponent, {hydrationFeatures});

          const ssrContents = getAppContents(html);

          // Since `withI18nSupport()` was not included and a component has i18n blocks -
          // we expect that the `ngSkipHydration` attribute was added during serialization.
          expect(ssrContents).not.toContain('ngh="');
          expect(ssrContents).toContain('ngskiphydration="');
        });

        it('should not append skip hydration flag if component uses i18n blocks', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
            <div i18n>Hi!</div>
          `,
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');
        });

        it('should not append skip hydration flag if component uses i18n blocks inside embedded views', async () => {
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
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');
        });

        it('should not append skip hydration flag if component uses i18n blocks on <ng-container>s', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
              <ng-container i18n>Hi!</ng-container>
            `,
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');
        });

        it('should not append skip hydration flag if component uses i18n blocks (with *ngIfs on <ng-container>s)', async () => {
          @Component({
            standalone: true,
            imports: [CommonModule],
            selector: 'app',
            template: `
              <ng-container *ngIf="true" i18n>Hi!</ng-container>
            `,
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');
        });

        it('should support translations that do not include every placeholder', async () => {
          loadTranslations({
            [computeMsgId('Some {$START_TAG_STRONG}strong{$CLOSE_TAG_STRONG} content')]:
              'Some normal content',
          });

          @Component({
            standalone: true,
            selector: 'app',
            template: `<div i18n>Some <strong>strong</strong> content</div>`,
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const div = clientRootNode.querySelector('div');
          expect(div.innerHTML).toBe('Some normal content');
        });

        it('should support projecting translated content', async () => {
          @Component({
            standalone: true,
            selector: 'app-content',
            template: `<ng-content select="span"></ng-content><ng-content select="div"></ng-content>`,
          })
          class ContentComponent {}

          @Component({
            standalone: true,
            selector: 'app',
            template: `<div i18n><app-content><div>one</div><span>two</span></app-content></div>`,
            imports: [ContentComponent],
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ContentComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const content = clientRootNode.querySelector('app-content');
          expect(content.innerHTML).toBe('<span>two</span><div>one</div>');
        });

        it('should work when i18n content is not projected', async () => {
          @Component({
            standalone: true,
            selector: 'app-content',
            template: `
              @if (false) {
                <ng-content />
              }
              Content outside of 'if'.
            `,
          })
          class ContentComponent {}

          @Component({
            standalone: true,
            selector: 'app',
            template: `
              <app-content>
                <div i18n>Hello!</div>
                <ng-container i18n>Hello again!</ng-container>
              </app-content>
            `,
            imports: [ContentComponent],
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});

          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ContentComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const content = clientRootNode.querySelector('app-content');
          const text = content.textContent.trim();
          expect(text).toBe("Content outside of 'if'.");
          expect(text).not.toContain('Hello');
        });

        it('should support interleaving projected content', async () => {
          @Component({
            standalone: true,
            selector: 'app-content',
            template: `Start <ng-content select="div" /> Middle <ng-content select="span" /> End`,
          })
          class ContentComponent {}

          @Component({
            standalone: true,
            selector: 'app',
            template: `
              <app-content i18n>
                <span>Span</span>
                Middle Start
                Middle End
                <div>Div</div>
              </app-content>
            `,
            imports: [ContentComponent],
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ContentComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const content = clientRootNode.querySelector('app-content');
          expect(content.innerHTML).toBe('Start <div>Div</div> Middle <span>Span</span> End');
        });

        it('should support disjoint nodes', async () => {
          @Component({
            standalone: true,
            selector: 'app-content',
            template: `Start <ng-content select=":not(span)" /> Middle <ng-content select="span" /> End`,
          })
          class ContentComponent {}

          @Component({
            standalone: true,
            selector: 'app',
            template: `
              <app-content i18n>
                Inner Start
                <span>Span</span>
                { count, plural, other { Hello <span>World</span>! }}
                Inner End
              </app-content>
            `,
            imports: [ContentComponent],
          })
          class SimpleComponent {
            count = 0;
          }

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ContentComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const content = clientRootNode.querySelector('app-content');
          expect(content.innerHTML).toBe(
            'Start  Inner Start  Hello <span>World</span>! <!--ICU 27:0--> Inner End  Middle <span>Span</span> End',
          );
        });

        it('should support nested content projection', async () => {
          @Component({
            standalone: true,
            selector: 'app-content-inner',
            template: `Start <ng-content select=":not(span)" /> Middle <ng-content select="span" /> End`,
          })
          class InnerContentComponent {}

          @Component({
            standalone: true,
            selector: 'app-content-outer',
            template: `<app-content-inner><ng-content /></app-content-inner>`,
            imports: [InnerContentComponent],
          })
          class OuterContentComponent {}

          @Component({
            standalone: true,
            selector: 'app',
            template: `
              <app-content-outer i18n>
                Outer Start
                <span>Span</span>
                { count, plural, other { Hello <span>World</span>! }}
                Outer End
              </app-content-outer>
            `,
            imports: [OuterContentComponent],
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, OuterContentComponent, InnerContentComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const content = clientRootNode.querySelector('app-content-outer');
          expect(content.innerHTML).toBe(
            '<app-content-inner>Start  Outer Start <span>Span</span> Hello <span>World</span>! <!--ICU 27:0--> Outer End  Middle  End</app-content-inner>',
          );
        });

        it('should support hosting projected content', async () => {
          @Component({
            standalone: true,
            selector: 'app-content',
            template: `<span i18n>Start <ng-content /> End</span>`,
          })
          class ContentComponent {}

          @Component({
            standalone: true,
            selector: 'app',
            template: `<div><app-content>Middle</app-content></div>`,
            imports: [ContentComponent],
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ContentComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const div = clientRootNode.querySelector('div');
          expect(div.innerHTML).toBe('<app-content><span>Start Middle End</span></app-content>');
        });

        it('should support projecting multiple elements', async () => {
          @Component({
            standalone: true,
            selector: 'app-content',
            template: `<ng-content />`,
          })
          class ContentComponent {}

          @Component({
            standalone: true,
            selector: 'app',
            template: `
              <app-content i18n>
                Start
                <span>Middle</span>
                End
              </app-content>
            `,
            imports: [ContentComponent],
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const content = clientRootNode.querySelector('app-content');
          expect(content.innerHTML).toMatch(/ Start <span>Middle<\/span> End /);
        });

        it('should support disconnecting i18n nodes during projection', async () => {
          @Component({
            standalone: true,
            selector: 'app-content',
            template: `Start <ng-content select="span" /> End`,
          })
          class ContentComponent {}

          @Component({
            standalone: true,
            selector: 'app',
            template: `
              <app-content i18n>
                Middle Start
                <span>Middle</span>
                Middle End
              </app-content>
            `,
            imports: [ContentComponent],
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ContentComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const content = clientRootNode.querySelector('app-content');
          expect(content.innerHTML).toBe('Start <span>Middle</span> End');
        });

        it('should support using translated views as view container anchors', async () => {
          @Component({
            standalone: true,
            selector: 'dynamic-cmp',
            template: `DynamicComponent content`,
          })
          class DynamicComponent {}

          @Component({
            standalone: true,
            selector: 'app',
            template: `<div i18n><div #target>one</div><span>two</span></div>`,
          })
          class SimpleComponent {
            @ViewChild('target', {read: ViewContainerRef}) vcr!: ViewContainerRef;

            ngAfterViewInit() {
              const compRef = this.vcr.createComponent(DynamicComponent);
              compRef.changeDetectorRef.detectChanges();
            }
          }

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, DynamicComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const div = clientRootNode.querySelector('div');
          const clientContents = stripExcessiveSpaces(stripUtilAttributes(div.innerHTML, false));
          expect(clientContents).toBe(
            '<div>one</div><dynamic-cmp>DynamicComponent content</dynamic-cmp><!--container--><span>two</span>',
          );
        });

        it('should support translations that reorder placeholders', async () => {
          loadTranslations({
            [computeMsgId(
              '{$START_TAG_DIV}one{$CLOSE_TAG_DIV}{$START_TAG_SPAN}two{$CLOSE_TAG_SPAN}',
            )]: '{$START_TAG_SPAN}dos{$CLOSE_TAG_SPAN}{$START_TAG_DIV}uno{$CLOSE_TAG_DIV}',
          });

          @Component({
            standalone: true,
            selector: 'app',
            template: `<div i18n><div>one</div><span>two</span></div>`,
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const div = clientRootNode.querySelector('div');
          expect(div.innerHTML).toBe('<span>dos</span><div>uno</div>');
        });

        it('should support translations that include additional elements', async () => {
          loadTranslations({
            [computeMsgId('{VAR_PLURAL, plural, other {normal}}')]:
              '{VAR_PLURAL, plural, other {<strong>strong</strong>}}',
          });

          @Component({
            standalone: true,
            selector: 'app',
            template: `<div i18n>Some {case, plural, other {normal}} content</div>`,
          })
          class SimpleComponent {
            case = 0;
          }

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const div = clientRootNode.querySelector('div');
          expect(div.innerHTML).toMatch(/Some <strong>strong<\/strong><!--ICU 27:0--> content/);
        });

        it('should support translations that remove elements', async () => {
          loadTranslations({
            [computeMsgId('Hello {$START_TAG_STRONG}World{$CLOSE_TAG_STRONG}!')]: 'Bonjour!',
          });

          @Component({
            standalone: true,
            selector: 'app',
            template: `<div i18n>Hello <strong>World</strong>!</div>`,
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const div = clientRootNode.querySelector('div');
          expect(div.innerHTML).toMatch(/Bonjour!/);
        });

        it('should cleanup dehydrated ICU cases', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `<div i18n>{isServer, select, true { This is a SERVER-ONLY content } false { This is a CLIENT-ONLY content }}</div>`,
          })
          class SimpleComponent {
            isServer = isPlatformServer(inject(PLATFORM_ID)) + '';
          }

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          let ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          ssrContents = stripExcessiveSpaces(stripUtilAttributes(ssrContents, false));

          // In the SSR output we expect to see SERVER content, but not CLIENT.
          expect(ssrContents).not.toContain('This is a CLIENT-ONLY content');
          expect(ssrContents).toContain('This is a SERVER-ONLY content');

          const clientRootNode = compRef.location.nativeElement;

          await appRef.whenStable();

          const clientContents = stripExcessiveSpaces(
            stripUtilAttributes(clientRootNode.outerHTML, false),
          );

          // After the cleanup, we expect to see CLIENT content, but not SERVER.
          expect(clientContents).toContain('This is a CLIENT-ONLY content');
          expect(clientContents).not.toContain('This is a SERVER-ONLY content');
        });

        it('should hydrate ICUs (simple)', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `<div i18n>{{firstCase}} {firstCase, plural, =1 {item} other {items}}, {{secondCase}} {secondCase, plural, =1 {item} other {items}}</div>`,
          })
          class SimpleComponent {
            firstCase = 0;
            secondCase = 1;
          }

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const div = clientRootNode.querySelector('div');
          expect(div.textContent).toBe('0 items, 1 item');
        });

        it('should hydrate ICUs (nested)', async () => {
          @Component({
            standalone: true,
            selector: 'simple-component',
            template: `<div i18n>{firstCase, select, 1 {one-{secondCase, select, 1 {one} 2 {two}}} 2 {two-{secondCase, select, 1 {one} 2 {two}}}}</div>`,
          })
          class SimpleComponent {
            @Input() firstCase!: number;
            @Input() secondCase!: number;
          }

          @Component({
            standalone: true,
            imports: [SimpleComponent],
            selector: 'app',
            template: `
                <simple-component id="one" firstCase="1" secondCase="1"></simple-component>
                <simple-component id="two" firstCase="1" secondCase="2"></simple-component>
                <simple-component id="three" firstCase="2" secondCase="1"></simple-component>
                <simple-component id="four" firstCase="2" secondCase="2"></simple-component>
              `,
          })
          class AppComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(AppComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(AppComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, AppComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<AppComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          expect(clientRootNode.querySelector('#one').textContent).toBe('one-one');
          expect(clientRootNode.querySelector('#two').textContent).toBe('one-two');
          expect(clientRootNode.querySelector('#three').textContent).toBe('two-one');
          expect(clientRootNode.querySelector('#four').textContent).toBe('two-two');
        });

        it('should hydrate containers', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
                <ng-container i18n>
                  Container #1
                </ng-container>
                <ng-container i18n>
                  Container #2
                </ng-container>
              `,
          })
          class SimpleComponent {}

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const clientContents = stripExcessiveSpaces(clientRootNode.innerHTML);
          expect(clientContents).toBe(
            ' Container #1 <!--ng-container--> Container #2 <!--ng-container-->',
          );
        });

        it('should hydrate when using the *ngFor directive', async () => {
          @Component({
            standalone: true,
            imports: [NgFor],
            selector: 'app',
            template: `
                <ol i18n>
                  <li *ngFor="let item of items">{{ item }}</li>
                </ol>
              `,
          })
          class SimpleComponent {
            items = [1, 2, 3];
          }

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const clientContents = stripExcessiveSpaces(clientRootNode.innerHTML);
          expect(clientContents).toBe('<ol><li>1</li><li>2</li><li>3</li><!--container--></ol>');
        });

        it('should hydrate when using @for control flow', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
                <ol i18n>
                  @for (item of items; track $index) {
                    <li>{{ item }}</li>
                  }
                </ol>
              `,
          })
          class SimpleComponent {
            items = [1, 2, 3];
          }

          const hydrationFeatures = () => [withI18nSupport()];
          const html = await ssr(SimpleComponent, {hydrationFeatures});
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            hydrationFeatures,
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

          const clientContents = stripExcessiveSpaces(clientRootNode.innerHTML);
          expect(clientContents).toBe('<ol><li>1</li><li>2</li><li>3</li><!--container--></ol>');
        });

        describe('with ngSkipHydration', () => {
          it('should skip hydration when ngSkipHydration and i18n attributes are present on a same node', async () => {
            loadTranslations({
              [computeMsgId(' Some {$START_TAG_STRONG}strong{$CLOSE_TAG_STRONG} content ')]:
                'Some normal content',
            });

            @Component({
              standalone: true,
              selector: 'cmp-a',
              template: `<ng-content />`,
            })
            class CmpA {}

            @Component({
              standalone: true,
              selector: 'app',
              imports: [CmpA],
              template: `
                <cmp-a i18n ngSkipHydration>
                  Some <strong>strong</strong> content
                </cmp-a>
              `,
            })
            class SimpleComponent {}

            const hydrationFeatures = () => [withI18nSupport()];
            const html = await ssr(SimpleComponent, {hydrationFeatures});
            const ssrContents = getAppContents(html);
            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
              hydrationFeatures,
            });
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

            const cmpA = clientRootNode.querySelector('cmp-a');
            expect(cmpA.textContent).toBe('Some normal content');
            verifyNodeHasSkipHydrationMarker(cmpA);
          });

          it('should skip hydration when i18n is inside of an ngSkipHydration block', async () => {
            loadTranslations({
              [computeMsgId('strong')]: 'very strong',
            });

            @Component({
              standalone: true,
              selector: 'cmp-a',
              template: `<ng-content />`,
            })
            class CmpA {}

            @Component({
              standalone: true,
              selector: 'app',
              imports: [CmpA],
              template: `
                <cmp-a ngSkipHydration>
                  Some <strong i18n>strong</strong> content
                </cmp-a>
              `,
            })
            class SimpleComponent {}

            const hydrationFeatures = () => [withI18nSupport()];
            const html = await ssr(SimpleComponent, {hydrationFeatures});
            const ssrContents = getAppContents(html);
            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
              hydrationFeatures,
            });
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

            const cmpA = clientRootNode.querySelector('cmp-a');
            expect(cmpA.textContent.trim()).toBe('Some very strong content');
            verifyNodeHasSkipHydrationMarker(cmpA);
          });
        });
      });

      // Note: hydration for i18n blocks is not *yet* fully supported, so the tests
      // below verify that components that use i18n are excluded from the hydration
      // by adding the `ngSkipHydration` flag onto the component host element.
      describe('support is disabled', () => {
        it('should append skip hydration flag if component uses i18n blocks', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
            <div i18n>Hi!</div>
          `,
          })
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngskiphydration="">');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngskiphydration="true">');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyNoNodesWereClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should append skip hydration flag if component uses i18n blocks inside embedded views', async () => {
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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngskiphydration="">');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyNoNodesWereClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should append skip hydration flag if component uses i18n blocks on <ng-container>s', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
              <ng-container i18n>Hi!</ng-container>
            `,
          })
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngskiphydration="">');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyNoNodesWereClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should append skip hydration flag if component uses i18n blocks (with *ngIfs on <ng-container>s)', async () => {
          @Component({
            standalone: true,
            imports: [CommonModule],
            selector: 'app',
            template: `
              <ng-container *ngIf="true" i18n>Hi!</ng-container>
            `,
          })
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);
          expect(ssrContents).toContain('<app ngskiphydration="">');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it(
          'should *not* throw when i18n is used in nested component ' +
            'excluded using `ngSkipHydration`',
          async () => {
            @Component({
              standalone: true,
              selector: 'nested',
              template: `
                <div i18n>Hi!</div>
              `,
            })
            class NestedComponent {}

            @Component({
              standalone: true,
              imports: [NestedComponent],
              selector: 'app',
              template: `
               Nested component with i18n inside:
               <nested ngSkipHydration />
             `,
            })
            class SimpleComponent {}

            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent);

            const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
            const compRef = getComponentRef<SimpleComponent>(appRef);
            appRef.tick();

            const clientRootNode = compRef.location.nativeElement;
            verifyAllNodesClaimedForHydration(clientRootNode);
            verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
          },
        );

        it('should exclude components with i18n from hydration automatically', async () => {
          @Component({
            standalone: true,
            selector: 'nested',
            template: `
            <div i18n>Hi!</div>
          `,
          })
          class NestedComponent {}

          @Component({
            standalone: true,
            imports: [NestedComponent],
            selector: 'app',
            template: `
            Nested component with i18n inside
            (the content of this component would be excluded from hydration):
            <nested />
          `,
          })
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });
      });
    });

    describe('defer blocks', () => {
      it('should not trigger defer blocks on the server', async () => {
        @Component({
          selector: 'my-lazy-cmp',
          standalone: true,
          template: 'Hi!',
        })
        class MyLazyCmp {}

        @Component({
          standalone: true,
          selector: 'app',
          imports: [MyLazyCmp],
          template: `
            Visible: {{ isVisible }}.

            @defer (when isVisible) {
              <my-lazy-cmp />
            } @loading {
              Loading...
            } @placeholder {
              Placeholder!
            } @error {
              Failed to load dependencies :(
            }
          `,
        })
        class SimpleComponent {
          isVisible = false;

          ngOnInit() {
            setTimeout(() => {
              // This changes the triggering condition of the defer block,
              // but it should be ignored and the placeholder content should be visible.
              this.isVisible = true;
            });
          }
        }

        const envProviders = [provideZoneChangeDetection() as any];
        const html = await ssr(SimpleComponent, {envProviders});

        const ssrContents = getAppContents(html);
        expect(ssrContents).toContain('<app ngh');

        // Even though trigger condition is `true`,
        // the defer block remains in the "placeholder" mode on the server.
        expect(ssrContents).toContain('Visible: true.');
        expect(ssrContents).toContain('Placeholder');

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders,
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        await appRef.whenStable();

        const clientRootNode = compRef.location.nativeElement;

        // This content is rendered only on the client, since it's
        // inside a defer block.
        const innerComponent = clientRootNode.querySelector('my-lazy-cmp');
        const exceptions = [innerComponent];

        verifyAllNodesClaimedForHydration(clientRootNode, exceptions);

        // Verify that defer block renders correctly after hydration and triggering
        // loading condition.
        expect(clientRootNode.outerHTML).toContain('<my-lazy-cmp>Hi!</my-lazy-cmp>');
      });

      it('should not trigger `setTimeout` calls for `on timer` triggers on the server', async () => {
        const setTimeoutSpy = spyOn(globalThis, 'setTimeout').and.callThrough();

        @Component({
          selector: 'my-lazy-cmp',
          standalone: true,
          template: 'Hi!',
        })
        class MyLazyCmp {}

        @Component({
          standalone: true,
          selector: 'app',
          imports: [MyLazyCmp],
          template: `
            @defer (on timer(123ms)) {
              <my-lazy-cmp />
            }
          `,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);

        const ssrContents = getAppContents(html);
        expect(ssrContents).toContain('<app ngh');

        // Make sure that there were no `setTimeout` calls with the # of ms
        // defined in the `on timer` trigger.
        for (let i = 0; i < setTimeoutSpy.calls.count(); i++) {
          const args = setTimeoutSpy.calls.argsFor(i);
          expect(args[1]).not.toBe(123, 'on timer was triggered during SSR unexpectedly');
        }
      });

      it('should hydrate a placeholder block', async () => {
        @Component({
          selector: 'my-lazy-cmp',
          standalone: true,
          template: 'Hi!',
        })
        class MyLazyCmp {}

        @Component({
          selector: 'my-placeholder-cmp',
          standalone: true,
          imports: [NgIf],
          template: '<div *ngIf="true">Hi!</div>',
        })
        class MyPlaceholderCmp {}

        @Component({
          standalone: true,
          selector: 'app',
          imports: [MyLazyCmp, MyPlaceholderCmp],
          template: `
            Visible: {{ isVisible }}.

            @defer (when isVisible) {
              <my-lazy-cmp />
            } @loading {
              Loading...
            } @placeholder {
              Placeholder!
              <my-placeholder-cmp />
            } @error {
              Failed to load dependencies :(
            }
          `,
        })
        class SimpleComponent {
          isVisible = false;
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        // Make sure we have placeholder contents in SSR output.
        expect(ssrContents).toContain('Placeholder! <my-placeholder-cmp ngh="0"><div>Hi!</div>');

        resetTViewsFor(SimpleComponent, MyPlaceholderCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        await appRef.whenStable();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should render nothing on the server if no placeholder block is provided', async () => {
        @Component({
          selector: 'my-lazy-cmp',
          standalone: true,
          template: 'Hi!',
        })
        class MyLazyCmp {}

        @Component({
          selector: 'my-placeholder-cmp',
          standalone: true,
          imports: [NgIf],
          template: '<div *ngIf="true">Hi!</div>',
        })
        class MyPlaceholderCmp {}

        @Component({
          standalone: true,
          selector: 'app',
          imports: [MyLazyCmp, MyPlaceholderCmp],
          template: `
            Before|@defer (when isVisible) {<my-lazy-cmp />}|After
          `,
        })
        class SimpleComponent {
          isVisible = false;
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        // Make sure no elements from a defer block is present in SSR output.
        // Note: comment nodes represent main content and defer block anchors,
        // which is expected.
        expect(ssrContents).toContain('Before|<!--container--><!--container-->|After');

        resetTViewsFor(SimpleComponent, MyPlaceholderCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        await appRef.whenStable();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should not reference IntersectionObserver on the server', async () => {
        // This test verifies that there are no errors produced while rendering on a server
        // when `on viewport` trigger is used for a defer block.
        @Component({
          selector: 'my-lazy-cmp',
          standalone: true,
          template: 'Hi!',
        })
        class MyLazyCmp {}

        @Component({
          standalone: true,
          selector: 'app',
          imports: [MyLazyCmp],
          template: `
            @defer (when isVisible; prefetch on viewport(ref)) {
              <my-lazy-cmp />
            } @placeholder {
              <div #ref>Placeholder!</div>
            }
          `,
        })
        class SimpleComponent {
          isVisible = false;
        }

        const errors: string[] = [];
        class CustomErrorHandler extends ErrorHandler {
          override handleError(error: any): void {
            errors.push(error);
          }
        }
        const envProviders = [
          {
            provide: ErrorHandler,
            useClass: CustomErrorHandler,
          },
        ];

        const html = await ssr(SimpleComponent, {envProviders});
        const ssrContents = getAppContents(html);
        expect(ssrContents).toContain('<app ngh');
        expect(ssrContents).toContain('Placeholder');

        // Verify that there are no errors.
        expect(errors).toHaveSize(0);
      });

      it('should not hydrate when an entire block in skip hydration section', async () => {
        @Component({
          selector: 'my-lazy-cmp',
          standalone: true,
          template: 'Hi!',
        })
        class MyLazyCmp {}

        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
             <main>
               <ng-content />
             </main>
           `,
        })
        class ProjectorCmp {}

        @Component({
          selector: 'my-placeholder-cmp',
          standalone: true,
          imports: [NgIf],
          template: '<div *ngIf="true">Hi!</div>',
        })
        class MyPlaceholderCmp {}

        @Component({
          standalone: true,
          selector: 'app',
          imports: [MyLazyCmp, MyPlaceholderCmp, ProjectorCmp],
          template: `
            Visible: {{ isVisible }}.

            <projector-cmp ngSkipHydration="true">
              @defer (when isVisible) {
                <my-lazy-cmp />
              } @loading {
                Loading...
              } @placeholder {
                <my-placeholder-cmp />
              } @error {
                Failed to load dependencies :(
              }
            </projector-cmp>
          `,
        })
        class SimpleComponent {
          isVisible = false;
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        // Make sure we have placeholder contents in SSR output.
        expect(ssrContents).toContain('<my-placeholder-cmp');

        resetTViewsFor(SimpleComponent, MyPlaceholderCmp, ProjectorCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        await appRef.whenStable();

        const clientRootNode = compRef.location.nativeElement;

        // Verify that placeholder nodes were not claimed for hydration,
        // i.e. nodes were re-created since placeholder was in skip hydration block.
        const placeholderCmp = clientRootNode.querySelector('my-placeholder-cmp');
        verifyNoNodesWereClaimedForHydration(placeholderCmp);

        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should not hydrate when a placeholder block in skip hydration section', async () => {
        @Component({
          selector: 'my-lazy-cmp',
          standalone: true,
          template: 'Hi!',
        })
        class MyLazyCmp {}

        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
             <main>
               <ng-content />
             </main>
           `,
        })
        class ProjectorCmp {}

        @Component({
          selector: 'my-placeholder-cmp',
          standalone: true,
          imports: [NgIf],
          template: '<div *ngIf="true">Hi!</div>',
        })
        class MyPlaceholderCmp {}

        @Component({
          standalone: true,
          selector: 'app',
          imports: [MyLazyCmp, MyPlaceholderCmp, ProjectorCmp],
          template: `
            Visible: {{ isVisible }}.

            <projector-cmp ngSkipHydration="true">
              @defer (when isVisible) {
                <my-lazy-cmp />
              } @loading {
                Loading...
              } @placeholder {
                <my-placeholder-cmp ngSkipHydration="true" />
              } @error {
                Failed to load dependencies :(
              }
            </projector-cmp>
          `,
        })
        class SimpleComponent {
          isVisible = false;
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        // Make sure we have placeholder contents in SSR output.
        expect(ssrContents).toContain('<my-placeholder-cmp');

        resetTViewsFor(SimpleComponent, MyPlaceholderCmp, ProjectorCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        await appRef.whenStable();

        const clientRootNode = compRef.location.nativeElement;

        // Verify that placeholder nodes were not claimed for hydration,
        // i.e. nodes were re-created since placeholder was in skip hydration block.
        const placeholderCmp = clientRootNode.querySelector('my-placeholder-cmp');
        verifyNoNodesWereClaimedForHydration(placeholderCmp);

        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });
    });

    describe('ShadowDom encapsulation', () => {
      it('should append skip hydration flag if component uses ShadowDom encapsulation', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          encapsulation: ViewEncapsulation.ShadowDom,
          template: `Hi!`,
          styles: [':host { color: red; }'],
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);
        expect(ssrContents).toContain('<app ngskiphydration="">');
      });

      it(
        'should append skip hydration flag if component uses ShadowDom encapsulation ' +
          '(but keep parent and sibling elements hydratable)',
        async () => {
          @Component({
            standalone: true,
            selector: 'shadow-dom',
            encapsulation: ViewEncapsulation.ShadowDom,
            template: `ShadowDom component`,
            styles: [':host { color: red; }'],
          })
          class ShadowDomComponent {}

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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh="0">');
          expect(ssrContents).toContain('<shadow-dom ngskiphydration="">');
          expect(ssrContents).toContain('<regular id="1" ngh="0">');
          expect(ssrContents).toContain('<regular id="2" ngh="0">');
        },
      );
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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, NestedComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it(
        'should skip hydrating elements when host element ' + 'has the ngSkipHydration attribute',
        async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
            <main>Main content</main>
          `,
          })
          class SimpleComponent {}

          const indexHtml =
            '<html><head></head><body>' + '<app ngSkipHydration></app>' + '</body></html>';
          const html = await ssr(SimpleComponent, {doc: indexHtml});
          const ssrContents = getAppContents(html);

          // No `ngh` attribute in the <app> element.
          expect(ssrContents).toContain('<app ngskiphydration=""><main>Main content</main></app>');

          // Even though hydration was skipped at the root level, the hydration
          // info key and an empty array as a value are still included into the
          // TransferState to indicate that the server part was configured correctly.
          const transferState = getHydrationInfoFromTransferState(html);
          expect(transferState).toContain(TRANSFER_STATE_TOKEN_ID);

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        },
      );

      it(
        'should allow the same component with and without hydration in the same template ' +
          '(when component with `ngSkipHydration` goes first)',
        async () => {
          @Component({
            standalone: true,
            selector: 'nested',
            imports: [NgIf],
            template: `
               <ng-container *ngIf="true">Hello world</ng-container>
             `,
          })
          class Nested {}

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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent, Nested);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        },
      );

      it(
        'should allow projecting hydrated content into components that skip hydration ' +
          '(view containers with embedded views as projection root nodes)',
        async () => {
          @Component({
            standalone: true,
            selector: 'regular-cmp',
            template: `
                <ng-content />
              `,
          })
          class RegularCmp {}

          @Component({
            standalone: true,
            selector: 'deeply-nested',
            host: {ngSkipHydration: 'true'},
            template: `
                <ng-content />
              `,
          })
          class DeeplyNested {}

          @Component({
            standalone: true,
            selector: 'deeply-nested-wrapper',
            host: {ngSkipHydration: 'true'},
            imports: [RegularCmp],
            template: `
                <regular-cmp>
                  <ng-content />
                </regular-cmp>
              `,
          })
          class DeeplyNestedWrapper {}

          @Component({
            standalone: true,
            selector: 'layout',
            imports: [DeeplyNested, DeeplyNestedWrapper],
            template: `
                <deeply-nested>
                  <deeply-nested-wrapper>
                    <ng-content />
                  </deeply-nested-wrapper>
                </deeply-nested>
              `,
          })
          class Layout {}

          @Component({
            standalone: true,
            selector: 'app',
            imports: [NgIf, Layout],
            template: `
              <layout>
                <h1 *ngIf="true">Hi!</h1>
              </layout>
            `,
          })
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent, Layout, RegularCmp, DeeplyNested, DeeplyNestedWrapper);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        },
      );

      it(
        'should allow projecting hydrated content into components that skip hydration ' +
          '(view containers with components as projection root nodes)',
        async () => {
          @Component({
            standalone: true,
            selector: 'dynamic-cmp',
            template: `DynamicComponent content`,
          })
          class DynamicComponent {}

          @Component({
            standalone: true,
            selector: 'regular-cmp',
            template: `
            <ng-content />
          `,
          })
          class RegularCmp {}

          @Component({
            standalone: true,
            selector: 'deeply-nested',
            host: {ngSkipHydration: 'true'},
            template: `
            <ng-content />
          `,
          })
          class DeeplyNested {}

          @Component({
            standalone: true,
            selector: 'deeply-nested-wrapper',
            host: {ngSkipHydration: 'true'},
            imports: [RegularCmp],
            template: `
            <regular-cmp>
              <ng-content />
            </regular-cmp>
          `,
          })
          class DeeplyNestedWrapper {}

          @Component({
            standalone: true,
            selector: 'layout',
            imports: [DeeplyNested, DeeplyNestedWrapper],
            template: `
            <deeply-nested>
              <deeply-nested-wrapper>
                <ng-content />
              </deeply-nested-wrapper>
            </deeply-nested>
          `,
          })
          class Layout {}

          @Component({
            standalone: true,
            selector: 'app',
            imports: [NgIf, Layout],
            template: `
              <layout>
                <div #target></div>
              </layout>
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

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(
            SimpleComponent,
            Layout,
            DynamicComponent,
            RegularCmp,
            DeeplyNested,
            DeeplyNestedWrapper,
          );

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        },
      );

      it(
        'should allow projecting hydrated content into components that skip hydration ' +
          '(with ng-containers as projection root nodes)',
        async () => {
          @Component({
            standalone: true,
            selector: 'regular-cmp',
            template: `
                <ng-content />
              `,
          })
          class RegularCmp {}

          @Component({
            standalone: true,
            selector: 'deeply-nested',
            host: {ngSkipHydration: 'true'},
            template: `
              <ng-content />
            `,
          })
          class DeeplyNested {}

          @Component({
            standalone: true,
            selector: 'deeply-nested-wrapper',
            host: {ngSkipHydration: 'true'},
            imports: [RegularCmp],
            template: `
              <regular-cmp>
                <ng-content />
              </regular-cmp>
            `,
          })
          class DeeplyNestedWrapper {}

          @Component({
            standalone: true,
            selector: 'layout',
            imports: [DeeplyNested, DeeplyNestedWrapper],
            template: `
              <deeply-nested>
                <deeply-nested-wrapper>
                  <ng-content />
                </deeply-nested-wrapper>
              </deeply-nested>
            `,
          })
          class Layout {}

          @Component({
            standalone: true,
            selector: 'app',
            imports: [NgIf, Layout],
            template: `
              <layout>
                <ng-container>Hi!</ng-container>
              </layout>
            `,
          })
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent, Layout, RegularCmp, DeeplyNested, DeeplyNestedWrapper);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        },
      );

      it(
        'should allow the same component with and without hydration in the same template ' +
          '(when component without `ngSkipHydration` goes first)',
        async () => {
          @Component({
            standalone: true,
            selector: 'nested',
            imports: [NgIf],
            template: `
               <ng-container *ngIf="true">Hello world</ng-container>
             `,
          })
          class Nested {}

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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent, Nested);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        },
      );

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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, NestedComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
        class SecondCmd {}

        @Component({
          standalone: true,
          imports: [SecondCmd],
          selector: 'nested-cmp',
          template: `<second-cmp />`,
          host: {ngSkipHydration: 'true'},
        })
        class NestedCmp {}

        @Component({
          standalone: true,
          imports: [NestedCmp],
          selector: 'app',
          template: `
            <nested-cmp />
          `,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, NestedCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should skip hydrating all child content of an element with ngSkipHydration attribute', async () => {
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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, NestedComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should skip hydrating when ng-containers exist and ngSkipHydration attribute is present', async () => {
        @Component({
          standalone: true,
          selector: 'nested-cmp',
          template: `
              <h1>Hello World!</h1>
              <div>This is the content of a nested component</div>
            `,
        })
        class NestedComponent {}

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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, NestedComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [withDebugConsole()],
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        verifyHasLog(
          appRef,
          'Angular hydrated 1 component(s) and 6 node(s), 1 component(s) were skipped',
        );

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should skip hydrating and safely allow DOM manipulation inside block that was skipped', async () => {
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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, NestedComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        expect(clientRootNode.outerHTML).toContain('Appended span');
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should skip hydrating and safely allow adding and removing DOM nodes inside block that was skipped', async () => {
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
            document.querySelector('p')?.remove();
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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, NestedComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        expect(clientRootNode.outerHTML).toContain('Appended span');
        expect(clientRootNode.outerHTML).not.toContain('This content will be removed');
        verifyAllNodesClaimedForHydration(clientRootNode);
      });

      it('should skip hydrating elements with ngSkipHydration attribute on ViewContainerRef host', async () => {
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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it(
        'should throw when ngSkipHydration attribute is set on a node ' +
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
          class SimpleComponent {}

          try {
            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent);

            await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);

            fail('Expected the hydration process to throw.');
          } catch (e: unknown) {
            expect((e as Error).toString()).toContain(
              'The `ngSkipHydration` flag is applied ' +
                "on a node that doesn't act as a component host",
            );
          }
        },
      );

      it(
        'should throw when ngSkipHydration attribute is set on a node ' +
          'which is not a component host (when using host bindings)',
        async () => {
          @Directive({
            standalone: true,
            selector: '[dir]',
            host: {ngSkipHydration: 'true'},
          })
          class Dir {}

          @Component({
            standalone: true,
            selector: 'app',
            imports: [Dir],
            template: `
                <div dir></div>
              `,
          })
          class SimpleComponent {}

          try {
            const html = await ssr(SimpleComponent);
            const ssrContents = getAppContents(html);

            expect(ssrContents).toContain('<app ngh');

            resetTViewsFor(SimpleComponent);

            await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);

            fail('Expected the hydration process to throw.');
          } catch (e: unknown) {
            const errorMessage = (e as Error).toString();
            expect(errorMessage).toContain(
              'The `ngSkipHydration` flag is applied ' +
                "on a node that doesn't act as a component host",
            );
            expect(errorMessage).toContain(
              '<div ngskiphydration="true" dir="">…</div>  <-- AT THIS LOCATION',
            );
          }
        },
      );
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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it(
        'should support empty text interpolations within elements ' +
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

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        },
      );

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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        ssrContents = stripExcessiveSpaces(stripUtilAttributes(ssrContents, false));

        // In the SSR output we expect to see SERVER content, but not CLIENT.
        expect(ssrContents).not.toContain('<i>This is a CLIENT-ONLY content</i>');
        expect(ssrContents).toContain('<b>This is a SERVER-ONLY content</b>');

        const clientRootNode = compRef.location.nativeElement;

        await appRef.whenStable();

        const clientContents = stripExcessiveSpaces(
          stripUtilAttributes(clientRootNode.outerHTML, false),
        );

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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        ssrContents = stripExcessiveSpaces(stripUtilAttributes(ssrContents, false));

        // In the SSR output we expect to see SERVER content, but not CLIENT.
        expect(ssrContents).not.toContain('This is a CLIENT-ONLY content<!--ng-container-->');
        expect(ssrContents).toContain('This is a SERVER-ONLY content<!--ng-container-->');

        const clientRootNode = compRef.location.nativeElement;

        await appRef.whenStable();

        const clientContents = stripExcessiveSpaces(
          stripUtilAttributes(clientRootNode.outerHTML, false),
        );

        // After the cleanup, we expect to see CLIENT content, but not SERVER.
        expect(clientContents).toContain('This is a CLIENT-ONLY content<!--ng-container-->');
        expect(clientContents).not.toContain('This is a SERVER-ONLY content<!--ng-container-->');
      });

      it(
        'should cleanup unclaimed views in a view container when ' +
          'root component is used as an anchor for ViewContainerRef',
        async () => {
          @Component({
            standalone: true,
            selector: 'app',
            imports: [NgIf],
            template: `
                <ng-template #tmpl>
                  <span *ngIf="isServer">This is a SERVER-ONLY content (embedded view)</span>
                  <div *ngIf="!isServer">This is a CLIENT-ONLY content (embedded view)</div>
                </ng-template>
                <b *ngIf="isServer">This is a SERVER-ONLY content (root component)</b>
                <i *ngIf="!isServer">This is a CLIENT-ONLY content (root component)</i>
              `,
          })
          class SimpleComponent {
            // This flag is intentionally different between the client
            // and the server: we use it to test the logic to cleanup
            // dehydrated views.
            isServer = isPlatformServer(inject(PLATFORM_ID));

            @ViewChild('tmpl', {read: TemplateRef}) tmpl!: TemplateRef<unknown>;

            vcr = inject(ViewContainerRef);

            ngAfterViewInit() {
              const viewRef = this.vcr.createEmbeddedView(this.tmpl);
              viewRef.detectChanges();
            }
          }

          const html = await ssr(SimpleComponent);
          let ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          ssrContents = stripExcessiveSpaces(stripUtilAttributes(ssrContents, false));

          // In the SSR output we expect to see SERVER content, but not CLIENT.
          expect(ssrContents).not.toContain(
            '<i>This is a CLIENT-ONLY content (root component)</i>',
          );
          expect(ssrContents).not.toContain(
            '<div>This is a CLIENT-ONLY content (embedded view)</div>',
          );

          expect(ssrContents).toContain('<b>This is a SERVER-ONLY content (root component)</b>');
          expect(ssrContents).toContain(
            '<span>This is a SERVER-ONLY content (embedded view)</span>',
          );

          const clientRootNode = compRef.location.nativeElement;

          await appRef.whenStable();

          const clientContents = stripExcessiveSpaces(
            stripUtilAttributes(clientRootNode.parentNode.outerHTML, false),
          );

          // After the cleanup, we expect to see CLIENT content, but not SERVER.
          expect(clientContents).toContain('<i>This is a CLIENT-ONLY content (root component)</i>');
          expect(clientContents).toContain(
            '<div>This is a CLIENT-ONLY content (embedded view)</div>',
          );

          expect(clientContents).not.toContain(
            '<b>This is a SERVER-ONLY content (root component)</b>',
          );
          expect(clientContents).not.toContain(
            '<span>This is a SERVER-ONLY content (embedded view)</span>',
          );
        },
      );

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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        ssrContents = stripExcessiveSpaces(stripUtilAttributes(ssrContents, false));

        // In the SSR output we expect to see SERVER content, but not CLIENT.
        expect(ssrContents).not.toContain('<i>This is a CLIENT-ONLY content</i>');
        expect(ssrContents).toContain('<b>This is a SERVER-ONLY content</b>');
        expect(ssrContents).toContain('Outside of the container (must be retained).');

        const clientRootNode = compRef.location.nativeElement;

        await appRef.whenStable();

        const clientContents = stripExcessiveSpaces(
          stripUtilAttributes(clientRootNode.outerHTML, false),
        );

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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;

        await appRef.whenStable();

        // Post-cleanup should *not* contain dehydrated views.
        const postCleanupContents = stripExcessiveSpaces(clientRootNode.outerHTML);
        expect(postCleanupContents).not.toContain(
          '<span> 5 <b>is bigger than 15!</b><!--container--></span>',
        );
        expect(postCleanupContents).toContain(
          '<span> 30 <b>is bigger than 15!</b><!--container--></span>',
        );
        expect(postCleanupContents).toContain('<span> 5 <!--container--></span>');
        expect(postCleanupContents).toContain(
          '<span> 50 <b>is bigger than 15!</b><!--container--></span>',
        );
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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        ssrContents = stripExcessiveSpaces(stripUtilAttributes(ssrContents, false));

        // We expect to see SERVER content, but not CLIENT.
        expect(ssrContents).not.toContain('<i>This is a CLIENT-ONLY content</i>');
        expect(ssrContents).toContain('<b>This is a SERVER-ONLY content</b>');

        const clientRootNode = compRef.location.nativeElement;

        await appRef.whenStable();

        const clientContents = stripExcessiveSpaces(
          stripUtilAttributes(clientRootNode.outerHTML, false),
        );

        // After the cleanup, we expect to see CLIENT content, but not SERVER.
        expect(clientContents).toContain('<i>This is a CLIENT-ONLY content</i>');
        expect(clientContents).not.toContain('<b>This is a SERVER-ONLY content</b>');
      });

      it('should trigger change detection after cleanup (immediate)', async () => {
        const observedChildCountLog: number[] = [];

        @Component({
          standalone: true,
          selector: 'app',
          imports: [NgIf],
          template: `
            <span *ngIf="isServer">This is a SERVER-ONLY content</span>
            <span *ngIf="!isServer">This is a CLIENT-ONLY content</span>
          `,
        })
        class SimpleComponent {
          isServer = isPlatformServer(inject(PLATFORM_ID));
          elementRef = inject(ElementRef);

          constructor() {
            afterEveryRender(() => {
              observedChildCountLog.push(this.elementRef.nativeElement.childElementCount);
            });
          }
        }
        const envProviders = [provideZoneChangeDetection() as any];
        const html = await ssr(SimpleComponent, {envProviders});
        let ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        // Before hydration
        expect(observedChildCountLog).toEqual([]);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders,
        });
        await appRef.whenStable();

        // afterRender should be triggered by:
        //   1.) Bootstrap
        //   2.) Microtask empty event
        //   3.) Stabilization + cleanup
        expect(observedChildCountLog).toEqual([2, 2, 1]);
      });

      it('should trigger change detection after cleanup (deferred)', async () => {
        const observedChildCountLog: number[] = [];

        @Component({
          standalone: true,
          selector: 'app',
          imports: [NgIf],
          template: `
            <span *ngIf="isServer">This is a SERVER-ONLY content</span>
            <span *ngIf="!isServer">This is a CLIENT-ONLY content</span>
          `,
        })
        class SimpleComponent {
          isServer = isPlatformServer(inject(PLATFORM_ID));
          elementRef = inject(ElementRef);

          constructor() {
            afterEveryRender(() => {
              observedChildCountLog.push(this.elementRef.nativeElement.childElementCount);
            });

            // Create a dummy promise to prevent stabilization
            new Promise<void>((resolve) => {
              setTimeout(resolve, 0);
            });
          }
        }

        const envProviders = [provideZoneChangeDetection() as any];
        const html = await ssr(SimpleComponent, {envProviders});
        let ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        // Before hydration
        expect(observedChildCountLog).toEqual([]);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders,
        });

        // afterRender should be triggered by:
        //   1.) Bootstrap
        //   2.) Microtask empty event
        expect(observedChildCountLog).toEqual([2, 2]);

        await appRef.whenStable();

        // afterRender should be triggered by:
        //   3.) Microtask empty event
        //   4.) Stabilization + cleanup
        expect(observedChildCountLog).toEqual([2, 2, 2, 1]);
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
        class ProjectorCmp {}

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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [withDebugConsole()],
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        verifyHasLog(
          appRef,
          'Angular hydrated 2 component(s) and 5 node(s), 0 component(s) were skipped',
        );

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should allow re-projection of child content', async () => {
        @Component({
          standalone: true,
          selector: 'mat-step',
          template: `<ng-template><ng-content /></ng-template>`,
        })
        class MatStep {
          @ViewChild(TemplateRef, {static: true}) content!: TemplateRef<any>;
        }

        @Component({
          standalone: true,
          selector: 'mat-stepper',
          imports: [NgTemplateOutlet],
          template: `
            @for (step of steps; track step) {
              <ng-container [ngTemplateOutlet]="step.content" />
            }
          `,
        })
        class MatStepper {
          @ContentChildren(MatStep) steps!: QueryList<MatStep>;
        }

        @Component({
          standalone: true,
          selector: 'nested-cmp',
          template: 'Nested cmp content',
        })
        class NestedCmp {}

        @Component({
          standalone: true,
          imports: [MatStepper, MatStep, NgIf, NestedCmp],
          selector: 'app',
          template: `
            <mat-stepper>
              <mat-step>Text-only content</mat-step>

              <mat-step>
                <ng-container>Using ng-containers</ng-container>
              </mat-step>

              <mat-step>
                <ng-container *ngIf="true">
                  Using ng-containers with *ngIf
                </ng-container>
              </mat-step>

              <mat-step>
                @if (true) {
                  Using built-in control flow (if)
                }
              </mat-step>

              <mat-step>
                <nested-cmp />
              </mat-step>

            </mat-stepper>
          `,
        })
        class App {}

        const html = await ssr(App);
        const ssrContents = getAppContents(html);
        expect(ssrContents).toContain('<app ngh');

        // Verify that elements projected without their parent nodes
        // use an element within the same template (at position `0`
        // in the test, i.e. `<mat-stepper>`) as an anchor.
        const hydrationInfo = getHydrationInfoFromTransferState(ssrContents);
        expect(hydrationInfo).toContain(
          '"n":{"2":"0f","4":"0fn2","7":"0fn5","9":"0fn9","11":"0fn12"}',
        );

        resetTViewsFor(App, MatStepper, NestedCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, App);
        const compRef = getComponentRef<App>(appRef);
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
        class ProjectorCmp {}

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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
        class ReprojectorCmp {}

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
        class ProjectorCmp {}

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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp, ReprojectorCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should handle multiple nodes projected in a single slot', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
            <ng-content select="foo" />
            <ng-content select="bar" />
          `,
        })
        class ProjectorCmp {}

        @Component({selector: 'foo', standalone: true, template: ''})
        class FooCmp {}

        @Component({selector: 'bar', standalone: true, template: ''})
        class BarCmp {}

        @Component({
          standalone: true,
          imports: [ProjectorCmp, FooCmp, BarCmp],
          selector: 'app',
          template: `
            <projector-cmp>
              <foo />
              <bar />
              <foo />
            </projector-cmp>
          `,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should handle multiple nodes projected in a single slot (different order)', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
            <ng-content select="foo" />
            <ng-content select="bar" />
          `,
        })
        class ProjectorCmp {}

        @Component({selector: 'foo', standalone: true, template: ''})
        class FooCmp {}

        @Component({selector: 'bar', standalone: true, template: ''})
        class BarCmp {}

        @Component({
          standalone: true,
          imports: [ProjectorCmp, FooCmp, BarCmp],
          selector: 'app',
          template: `
            <projector-cmp>
              <bar />
              <foo />
              <bar />
            </projector-cmp>
          `,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
        class ProjectorCmp {}

        @Component({
          standalone: true,
          imports: [ProjectorCmp],
          selector: 'app',
          template: `
            <projector-cmp />
          `,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it(
        'should handle empty projection slots within <ng-container> ' +
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
          class ProjectorCmp {}

          @Component({
            standalone: true,
            imports: [ProjectorCmp],
            selector: 'app',
            template: `
              <projector-cmp />
            `,
          })
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ProjectorCmp);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        },
      );

      it(
        'should handle empty projection slots within a template ' +
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
          class ProjectorCmp {}

          @Component({
            standalone: true,
            imports: [ProjectorCmp],
            selector: 'app',
            template: `
              <projector-cmp />
            `,
          })
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ProjectorCmp);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        },
      );

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
        class ProjectorCmp {}

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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it(
        'should handle view container nodes that go after projection slots ' +
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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ProjectorCmp);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        },
      );

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
          class ProjectorCmp {}

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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ProjectorCmp);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should support cases when some element nodes are not projected', async () => {
          @Component({
            standalone: true,
            selector: 'app-dropdown-content',
            template: `<ng-content />`,
          })
          class DropdownContentComponent {}

          @Component({
            standalone: true,
            selector: 'app-dropdown',
            template: `
              @if (false) {
                <ng-content select="app-dropdown-content" />
              }
            `,
          })
          class DropdownComponent {}

          @Component({
            standalone: true,
            imports: [DropdownComponent, DropdownContentComponent],
            selector: 'app-menu',
            template: `
              <app-dropdown>
                <app-dropdown-content>
                  <ng-content />
                </app-dropdown-content>
              </app-dropdown>
            `,
          })
          class MenuComponent {}

          @Component({
            selector: 'app',
            standalone: true,
            imports: [MenuComponent],
            template: `
              <app-menu>
                Menu Content
              </app-menu>
            `,
          })
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(
            SimpleComponent,
            MenuComponent,
            DropdownComponent,
            DropdownContentComponent,
          );

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
          class ProjectorCmp {}

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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ProjectorCmp);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
          class ProjectorCmp {}

          @Component({
            standalone: true,
            selector: 'nested',
            template: 'This is a nested component.',
          })
          class NestedComponent {}

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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ProjectorCmp, NestedComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });

        it('should support cases when component nodes are not projected in nested components', async () => {
          @Component({
            standalone: true,
            selector: 'projector-cmp',
            template: `
                <main>
                  <ng-content />
                </main>
              `,
          })
          class ProjectorCmp {}

          @Component({
            standalone: true,
            selector: 'nested',
            template: 'No content projection slots.',
          })
          class NestedComponent {}

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
          class SimpleComponent {}

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent, ProjectorCmp, NestedComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;
          verifyAllNodesClaimedForHydration(clientRootNode);
          verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        });
      });

      it("should project contents with *ngIf's", async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
            <main>
              <ng-content></ng-content>
            </main>
          `,
        })
        class ProjectorCmp {}

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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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
        class ProjectorCmp {}

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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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

            const cmp = createComponent(DynamicComponent, {
              hostElement,
              environmentInjector: this.environmentInjector,
            });
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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        const portalRootNode = clientRootNode.ownerDocument.querySelector('portal-app');
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyAllNodesClaimedForHydration(portalRootNode.firstChild);
        const clientContents =
          stripUtilAttributes(portalRootNode.outerHTML, false) +
          stripUtilAttributes(clientRootNode.outerHTML, false);
        expect(clientContents).toBe(
          stripSsrIntegrityMarker(stripUtilAttributes(stripTransferDataScript(ssrContents), false)),
          'Client and server contents mismatch',
        );
      });

      it('should not render content twice with contentChildren', async () => {
        // (globalThis as any).ngDevMode = false;
        @Component({
          selector: 'app-shell',
          imports: [NgTemplateOutlet],
          template: `
          <ng-container [ngTemplateOutlet]="customTemplate"></ng-container>
        `,
        })
        class ShellCmp {
          @ContentChild('customTemplate', {static: true})
          customTemplate: TemplateRef<any> | null = null;
        }

        @Component({
          imports: [ShellCmp],
          selector: 'app',
          template: `
          <app-shell>
            <ng-template #customTemplate>
              <p>template</p>
            </ng-template>
          </app-shell>
          `,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);
        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ShellCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      }, 100_000);

      it('should handle projected containers inside other containers', async () => {
        @Component({
          standalone: true,
          selector: 'child-comp',
          template: '<ng-content />',
        })
        class ChildComp {}

        @Component({
          standalone: true,
          selector: 'root-comp',
          template: '<ng-content />',
        })
        class RootComp {}

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
          `,
        })
        class MyApp {
          items: number[] = [1, 2, 3];
        }

        const html = await ssr(MyApp);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(MyApp, RootComp, ChildComp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, MyApp);
        const compRef = getComponentRef<MyApp>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should throw an error when projecting DOM nodes via ViewContainerRef.createComponent API', async () => {
        @Component({
          standalone: true,
          selector: 'dynamic',
          template: `
              <ng-content />
              <ng-content />
            `,
        })
        class DynamicComponent {}

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
            const compRef = this.vcr.createComponent(DynamicComponent, {
              projectableNodes: [
                [div, p],
                [span, b],
              ],
            });
            compRef.changeDetectorRef.detectChanges();
          }
        }

        try {
          await ssr(SimpleComponent);
        } catch (error: unknown) {
          const errorMessage = (error as Error).toString();
          expect(errorMessage).toContain(
            'During serialization, Angular detected DOM nodes that ' +
              'were created outside of Angular context',
          );
          expect(errorMessage).toContain('<dynamic>…</dynamic>  <-- AT THIS LOCATION');
        }
      });

      it('should throw an error when projecting DOM nodes via createComponent function call', async () => {
        @Component({
          standalone: true,
          selector: 'dynamic',
          template: `
              <ng-content />
              <ng-content />
            `,
        })
        class DynamicComponent {}

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
              projectableNodes: [
                [div, p],
                [span, b],
              ],
            });
            compRef.changeDetectorRef.detectChanges();
          }
        }

        try {
          await ssr(SimpleComponent);
        } catch (error: unknown) {
          const errorMessage = (error as Error).toString();
          expect(errorMessage).toContain(
            'During serialization, Angular detected DOM nodes that ' +
              'were created outside of Angular context',
          );
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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
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

      it('should support slots with fallback content', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
            <div>
              Header slot: <ng-content select="header">Header fallback</ng-content>
              Main slot: <ng-content select="main"><main>Main fallback</main></ng-content>
              Footer slot: <ng-content select="footer">Footer fallback {{expr}}</ng-content>
              <ng-content>Wildcard fallback</ng-content>
            </div>
          `,
        })
        class ProjectorCmp {
          expr = 123;
        }

        @Component({
          standalone: true,
          imports: [ProjectorCmp],
          selector: 'app',
          template: `<projector-cmp></projector-cmp>`,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        const content = clientRootNode.innerHTML;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        expect(content).toContain('Header slot: Header fallback');
        expect(content).toContain('Main slot: <main>Main fallback</main>');
        expect(content).toContain('Footer slot: Footer fallback 123');
        expect(content).toContain('Wildcard fallback');
      });

      it('should support mixed slots with and without fallback content', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: `
            <div>
              Header slot: <ng-content select="header">Header fallback</ng-content>
              Main slot: <ng-content select="main"><main>Main fallback</main></ng-content>
              Footer slot: <ng-content select="footer">Footer fallback {{expr}}</ng-content>
              <ng-content>Wildcard fallback</ng-content>
            </div>
          `,
        })
        class ProjectorCmp {
          expr = 123;
        }

        @Component({
          standalone: true,
          imports: [ProjectorCmp],
          selector: 'app',
          template: `
            <projector-cmp>
              <header>Header override</header>
              <footer>
                <h1>Footer override {{expr}}</h1>
              </footer>
            </projector-cmp>
          `,
        })
        class SimpleComponent {
          expr = 321;
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent, ProjectorCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        const content = clientRootNode.innerHTML;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        expect(content).toContain('Header slot: <!--container--><header>Header override</header>');
        expect(content).toContain('Main slot: <main>Main fallback</main>');
        expect(content).toContain(
          'Footer slot: <!--container--><footer><h1>Footer override 321</h1></footer>',
        );
        expect(content).toContain('Wildcard fallback');
      });
    });

    describe('unsupported Zone.js config', () => {
      it('should log a warning when a noop zone is used', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `Hi!`,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [
            provideZoneChangeDetection() as any,
            {provide: NgZone, useValue: new NoopNgZone()},
            withDebugConsole(),
          ],
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        verifyHasLog(
          appRef,
          'NG05000: Angular detected that hydration was enabled for an application ' +
            'that uses a custom or a noop Zone.js implementation.',
        );

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
        class SimpleComponent {}

        const envProviders = [provideZoneChangeDetection() as any];
        const html = await ssr(SimpleComponent, {envProviders});
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        class CustomNgZone extends NgZone {}

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [
            provideZoneChangeDetection() as any,
            {provide: NgZone, useValue: new CustomNgZone({})},
            withDebugConsole(),
          ],
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        verifyHasLog(
          appRef,
          'NG05000: Angular detected that hydration was enabled for an application ' +
            'that uses a custom or a noop Zone.js implementation.',
        );

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

        await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [withNoopErrorHandler()],
        }).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
            'During hydration Angular expected a text node but found <span>',
          );
          expect(message).toContain('#text(This is an original content)  <-- AT THIS LOCATION');
          expect(message).toContain('<span title="Hi!">…</span>  <-- AT THIS LOCATION');

          verifyNodeHasMismatchInfo(doc);
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

        await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: withNoopErrorHandler(),
        }).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
            'During hydration Angular expected <div> but the node was not found',
          );
          expect(message).toContain('<div id="abc">…</div>  <-- AT THIS LOCATION');
          verifyNodeHasMismatchInfo(doc);
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

        await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [withNoopErrorHandler()],
        }).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain('During hydration Angular expected <b> but found <span>');
          expect(message).toContain('<b>…</b>  <-- AT THIS LOCATION');
          expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
          verifyNodeHasMismatchInfo(doc);
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

        await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [withNoopErrorHandler()],
        }).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
            'During hydration Angular expected a comment node but found <span>',
          );
          expect(message).toContain('<!-- ng-container -->  <-- AT THIS LOCATION');
          expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
        });
      });

      it(
        'should handle <ng-container> node mismatch ' +
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

          await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            envProviders: [withNoopErrorHandler()],
          }).catch((err: unknown) => {
            const message = (err as Error).message;
            expect(message).toContain(
              'During hydration Angular expected a comment node but found <span>',
            );
            expect(message).toContain('<!-- ng-container -->  <-- AT THIS LOCATION');
            expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
          });
        },
      );

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

        await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [withNoopErrorHandler()],
        }).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
            'During hydration Angular expected a comment node but found <span>',
          );
          expect(message).toContain('<!-- container -->  <-- AT THIS LOCATION');
          expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
          verifyNodeHasMismatchInfo(doc);
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
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [withNoopErrorHandler()],
        }).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
            'During hydration Angular expected a comment node but found <span>',
          );
          expect(message).toContain('<!-- container -->  <-- AT THIS LOCATION');
          expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
          expect(message).toContain('check the "NestedComponent" component');
          verifyNodeHasMismatchInfo(doc, 'nested-cmp');
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

        await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [withNoopErrorHandler()],
        }).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
            'During hydration Angular expected more sibling nodes to be present',
          );
          expect(message).toContain('<main>…</main>  <-- AT THIS LOCATION');
          verifyNodeHasMismatchInfo(doc);
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

        await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [withNoopErrorHandler()],
        }).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
            'During hydration Angular expected a comment node but found <span>',
          );
          expect(message).toContain('<!-- container -->  <-- AT THIS LOCATION');
          expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
          verifyNodeHasMismatchInfo(doc);
        });
      });

      it('should handle a mismatch for a node that goes after a ViewContainerRef node', async () => {
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

        await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [withNoopErrorHandler()],
        }).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
            'During hydration Angular expected a comment node but found <span>',
          );
          expect(message).toContain('<!-- container -->  <-- AT THIS LOCATION');
          expect(message).toContain('<span>…</span>  <-- AT THIS LOCATION');
          verifyNodeHasMismatchInfo(doc);
        });
      });

      it('should handle a case when a node is not found (removed)', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: '<ng-content />',
        })
        class ProjectorComponent {}

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

        await ssr(SimpleComponent, {
          envProviders: [withNoopErrorHandler()],
        }).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
            'During serialization, Angular was unable to find an element in the DOM',
          );
          expect(message).toContain('<b>…</b>  <-- AT THIS LOCATION');
          verifyNodeHasMismatchInfo(doc, 'projector-cmp');
        });
      });

      it('should handle a case when a node is not found (detached)', async () => {
        @Component({
          standalone: true,
          selector: 'projector-cmp',
          template: '<ng-content />',
        })
        class ProjectorComponent {}

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

        await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [withNoopErrorHandler()],
        }).catch((err: unknown) => {
          const message = (err as Error).message;
          expect(message).toContain(
            'During hydration Angular was unable to locate a node using the "firstChild" path, ' +
              'starting from the <projector-cmp>…</projector-cmp> node',
          );
          verifyNodeHasMismatchInfo(doc, 'projector-cmp');
        });
      });

      it('should handle a case when a node is not found (invalid DOM)', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          imports: [CommonModule],
          template: `
            <a>
              <ng-container *ngTemplateOutlet="titleTemplate"></ng-container>
              <ng-content *ngIf="true"></ng-content>
            </a>

            <ng-template #titleTemplate>
              <ng-container *ngIf="true">
                <a>test</a>
              </ng-container>
            </ng-template>
          `,
        })
        class SimpleComponent {}

        try {
          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain('<app ngh');

          resetTViewsFor(SimpleComponent);
          await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);

          fail('Expected the hydration process to throw.');
        } catch (e: unknown) {
          const message = (e as Error).toString();
          expect(message).toContain(
            'During hydration, Angular expected an element to be present at this location.',
          );
          expect(message).toContain('<!-- container -->  <-- AT THIS LOCATION');
          expect(message).toContain('check to see if your template has valid HTML structure');
          verifyNodeHasMismatchInfo(doc);
        }
      });

      it('should log a warning when there was no hydration info in the TransferState', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `Hi!`,
        })
        class SimpleComponent {}

        // Note: SSR *without* hydration logic enabled.
        const html = await ssr(SimpleComponent, {enableHydration: false});
        const ssrContents = getAppContents(html);

        expect(ssrContents).not.toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [withDebugConsole()],
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        verifyHasLog(
          appRef,
          'NG0505: Angular hydration was requested on the client, ' +
            'but there was no serialized information present in the server response',
        );

        const clientRootNode = compRef.location.nativeElement;

        // Make sure that no hydration logic was activated,
        // effectively re-rendering from scratch happened and
        // all the content inside the <app> host element was
        // cleared on the client (as it usually happens in client
        // rendering mode).
        verifyNoNodesWereClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it(
        'should not log a warning when there was no hydration info in the TransferState, ' +
          'but a client mode marker is present',
        async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `Hi!`,
          })
          class SimpleComponent {}

          const html = `<html><head></head><body ${CLIENT_RENDER_MODE_FLAG}><app></app></body></html>`;

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
            envProviders: [withDebugConsole()],
          });
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          verifyEmptyConsole(appRef);

          const clientRootNode = compRef.location.nativeElement;
          expect(clientRootNode.textContent).toContain('Hi!');
        },
      );

      it('should not throw an error when app is destroyed before becoming stable', async () => {
        // Spy manually, because we may not be able to retrieve the `DebugConsole`
        // after we destroy the application, but we still want to ensure that
        // no error is thrown in the console.
        const errorSpy = spyOn(console, 'error').and.callThrough();
        const logs: string[] = [];

        @Component({
          standalone: true,
          selector: 'app',
          template: `Hi!`,
        })
        class SimpleComponent {
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
        }

        const html = await ssr(SimpleComponent);

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);

        appRef.isStable.subscribe((isStable) => {
          logs.push(`isStable=${isStable}`);
        });

        // Destroy the application before it becomes stable, because we added
        // a task and didn't remove it explicitly.
        appRef.destroy();

        expect(logs).toEqual([
          'isStable=false',
          // In the end, the application became stable while being destroyed.
          'isStable=true',
        ]);

        // Wait for a microtask so that `whenStableWithTimeout` resolves.
        await Promise.resolve();

        // Ensure no error has been logged in the console,
        // such as "injector has already been destroyed."
        expect(errorSpy).not.toHaveBeenCalled();
      });
    });

    describe('@if', () => {
      it('should work with `if`s that have different value on the client and on the server', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          imports: [NgIf],
          template: `
            <ng-container *ngIf="isServer; else elseBlock">
              <b>This is NgIf SERVER-ONLY content</b>
            </ng-container>
            <ng-template #elseBlock>
              <i>This is NgIf CLIENT-ONLY content</i>
            </ng-template>

            @if (isServer) { <b>This is new if SERVER-ONLY content</b> }
            @else { <i id="client-only">This is new if CLIENT-ONLY content</i> }
            @if (alwaysTrue) { <p>CLIENT and SERVER content</p> }
          `,
        })
        class SimpleComponent {
          alwaysTrue = true;

          // This flag is intentionally different between the client
          // and the server: we use it to test the logic to cleanup
          // dehydrated views.
          isServer = isPlatformServer(inject(PLATFORM_ID));
          pendingTasks = inject(PendingTasks);
          ngOnInit() {
            const remove = this.pendingTasks.add();
            setTimeout(() => void remove(), 100);
          }
        }

        const html = await ssr(SimpleComponent);
        let ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        ssrContents = stripExcessiveSpaces(stripUtilAttributes(ssrContents, false));

        // In the SSR output we expect to see SERVER content, but not CLIENT.
        expect(ssrContents).not.toContain(
          '<i id="client-only">This is new if CLIENT-ONLY content</i>',
        );
        expect(ssrContents).toContain('<b>This is new if SERVER-ONLY content</b>');

        expect(ssrContents).not.toContain('<i>This is NgIf CLIENT-ONLY content</i>');
        expect(ssrContents).toContain('<b>This is NgIf SERVER-ONLY content</b>');

        // Content that should be rendered on both client and server should also be present.
        expect(ssrContents).toContain('<p>CLIENT and SERVER content</p>');

        resetTViewsFor(SimpleComponent);
        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;

        expect(clientRootNode.outerHTML).not.toContain('<b>This is NgIf SERVER-ONLY content</b>');
        expect(clientRootNode.outerHTML).not.toContain('<b>This is new if SERVER-ONLY content</b>');

        await appRef.whenStable(); // post-hydration cleanup happens here

        const clientContents = stripExcessiveSpaces(
          stripUtilAttributes(clientRootNode.outerHTML, false),
        );

        // After the cleanup, we expect to see CLIENT content, but not SERVER.
        expect(clientContents).toContain(
          '<i id="client-only">This is new if CLIENT-ONLY content</i>',
        );
        expect(clientContents).not.toContain('<b>This is new if SERVER-ONLY content</b>');

        // Content that should be rendered on both client and server should still be present.
        expect(clientContents).toContain('<p>CLIENT and SERVER content</p>');

        const clientOnlyNode1 = clientRootNode.querySelector('i');
        const clientOnlyNode2 = clientRootNode.querySelector('#client-only');
        verifyAllNodesClaimedForHydration(clientRootNode, [clientOnlyNode1, clientOnlyNode2]);
      });

      it('should support nested `if`s', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            This is a non-empty block:
            @if (true) {
              @if (true) {
                <h1>
                @if (true) {
                  <span>Hello world!</span>
                }
                </h1>
              }
            }
            <div>Post-container element</div>
          `,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should hydrate `else` blocks', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            @if (conditionA) {
              if block
            } @else {
              else block
            }
          `,
        })
        class SimpleComponent {
          conditionA = false;
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);
        expect(ssrContents).toContain(`else block`);
        expect(ssrContents).not.toContain(`if block`);

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        await appRef.whenStable();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);

        // Verify that we still have expected content rendered.
        expect(clientRootNode.innerHTML).toContain(`else block`);
        expect(clientRootNode.innerHTML).not.toContain(`if block`);

        // Verify that switching `if` condition results
        // in an update to the DOM which was previously hydrated.
        compRef.instance.conditionA = true;
        compRef.changeDetectorRef.detectChanges();

        expect(clientRootNode.innerHTML).not.toContain(`else block`);
        expect(clientRootNode.innerHTML).toContain(`if block`);
      });
    });

    describe('@switch', () => {
      it('should work with `switch`es that have different value on the client and on the server', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          imports: [NgSwitch, NgSwitchCase],
          template: `
              <ng-container [ngSwitch]="isServer">
                <b *ngSwitchCase="true">This is NgSwitch SERVER-ONLY content</b>
                <i *ngSwitchCase="false" id="old">This is NgSwitch CLIENT-ONLY content</i>
              </ng-container>

              @switch (isServer) {
                @case (true) { <b>This is a SERVER-ONLY content</b> }
                @case (false) { <i id="new">This is a CLIENT-ONLY content</i> }
              }
            `,
        })
        class SimpleComponent {
          // This flag is intentionally different between the client
          // and the server: we use it to test the logic to cleanup
          // dehydrated views.
          isServer = isPlatformServer(inject(PLATFORM_ID));
          ngOnInit() {
            setTimeout(() => {}, 100);
          }
        }

        const envProviders = [provideZoneChangeDetection() as any];
        const html = await ssr(SimpleComponent, {envProviders});
        let ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        ssrContents = stripExcessiveSpaces(stripUtilAttributes(ssrContents, false));

        // In the SSR output we expect to see SERVER content, but not CLIENT.
        expect(ssrContents).not.toContain('<i id="new">This is a CLIENT-ONLY content</i>');
        expect(ssrContents).not.toContain('<i id="old">This is NgSwitch CLIENT-ONLY content</i>');
        expect(ssrContents).toContain('<b>This is a SERVER-ONLY content</b>');
        expect(ssrContents).toContain('<b>This is NgSwitch SERVER-ONLY content</b>');

        resetTViewsFor(SimpleComponent);
        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders,
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;

        // NgSwitch had slower cleanup than NgIf
        expect(clientRootNode.outerHTML).toContain('<b>This is NgSwitch SERVER-ONLY content</b>');

        expect(clientRootNode.outerHTML).not.toContain('<b>This is a SERVER-ONLY content</b>');
        expect(clientRootNode.outerHTML).toContain('<i id="new">This is a CLIENT-ONLY content</i>');
        expect(clientRootNode.outerHTML).toContain(
          '<i id="old">This is NgSwitch CLIENT-ONLY content</i>',
        );

        await appRef.whenStable();

        const clientContents = stripExcessiveSpaces(
          stripUtilAttributes(clientRootNode.outerHTML, false),
        );

        // After the cleanup, we expect to see CLIENT content, but not SERVER.
        expect(clientContents).toContain('<i id="new">This is a CLIENT-ONLY content</i>');
        expect(clientContents).toContain('<i id="old">This is NgSwitch CLIENT-ONLY content</i>');
        expect(clientContents).not.toContain('<b>This is NgSwitch SERVER-ONLY content</b>');
        expect(clientContents).not.toContain('<b>This is a SERVER-ONLY content</b>');

        const clientOnlyNode1 = clientRootNode.querySelector('#old');
        const clientOnlyNode2 = clientRootNode.querySelector('#new');
        verifyAllNodesClaimedForHydration(clientRootNode, [clientOnlyNode1, clientOnlyNode2]);
      });

      it('should cleanup rendered case if none of the cases match on the client', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
              @switch (label) {
                @case ('A') { This is A }
                @case ('B') { This is B }
              }
            `,
        })
        class SimpleComponent {
          // This flag is intentionally different between the client
          // and the server: we use it to test the logic to cleanup
          // dehydrated views.
          label = isPlatformServer(inject(PLATFORM_ID)) ? 'A' : 'Not A';
        }

        const html = await ssr(SimpleComponent);
        let ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        ssrContents = stripExcessiveSpaces(stripUtilAttributes(ssrContents, false));

        expect(ssrContents).toContain('This is A');

        const clientRootNode = compRef.location.nativeElement;

        await appRef.whenStable();

        const clientContents = stripExcessiveSpaces(
          stripUtilAttributes(clientRootNode.outerHTML, false),
        );

        // After the cleanup, we expect that the contents is removed and none
        // of the cases are rendered, since they don't match the condition.
        expect(clientContents).not.toContain('This is A');
        expect(clientContents).not.toContain('This is B');

        verifyAllNodesClaimedForHydration(clientRootNode);
      });
    });

    describe('@for', () => {
      it('should hydrate for loop content', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            @for (item of items; track item) {
              <div>
                <h1>Item #{{ item }}</h1>
              </div>
            }
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

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should hydrate @empty block content', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            @for (item of items; track item) {
              <p>Item #{{ item }}</p>
            } @empty {
              <div>This is an "empty" block</div>
            }
          `,
        })
        class SimpleComponent {
          items = [];
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it(
        'should handle a case when @empty block is rendered ' +
          'on the server and main content on the client',
        async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
                @for (item of items; track item) {
                  <p>Item #{{ item }}</p>
                } @empty {
                  <div>This is an "empty" block</div>
                }
              `,
          })
          class SimpleComponent {
            items = isPlatformServer(inject(PLATFORM_ID)) ? [] : [1, 2, 3];
            ngOnInit() {
              setTimeout(() => {}, 100);
            }
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          resetTViewsFor(SimpleComponent);

          // Expect only the `@empty` block to be rendered on the server.
          expect(ssrContents).not.toContain('Item #1');
          expect(ssrContents).not.toContain('Item #2');
          expect(ssrContents).not.toContain('Item #3');
          expect(ssrContents).toContain('This is an "empty" block');

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();
          const clientRootNode = compRef.location.nativeElement;

          expect(clientRootNode.innerHTML).toContain('Item #1');
          expect(clientRootNode.innerHTML).toContain('Item #2');
          expect(clientRootNode.innerHTML).toContain('Item #3');
          expect(clientRootNode.innerHTML).not.toContain('This is an "empty" block');

          await appRef.whenStable();

          // After hydration and post-hydration cleanup,
          // expect items to be present, but `@empty` block to be removed.
          expect(clientRootNode.innerHTML).toContain('Item #1');
          expect(clientRootNode.innerHTML).toContain('Item #2');
          expect(clientRootNode.innerHTML).toContain('Item #3');
          expect(clientRootNode.innerHTML).not.toContain('This is an "empty" block');

          const clientRenderedItems = compRef.location.nativeElement.querySelectorAll('p');
          verifyAllNodesClaimedForHydration(clientRootNode, Array.from(clientRenderedItems));
        },
      );

      it(
        'should handle a case when @empty block is rendered ' +
          'on the client and main content on the server',
        async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: `
              @for (item of items; track item) {
                <p>Item #{{ item }}</p>
              } @empty {
                <div>This is an "empty" block</div>
              }
            `,
          })
          class SimpleComponent {
            items = isPlatformServer(inject(PLATFORM_ID)) ? [1, 2, 3] : [];
            ngOnInit() {
              setTimeout(() => {}, 100);
            }
          }

          const html = await ssr(SimpleComponent);
          const ssrContents = getAppContents(html);

          expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

          // Expect items to be rendered on the server.
          expect(ssrContents).toContain('Item #1');
          expect(ssrContents).toContain('Item #2');
          expect(ssrContents).toContain('Item #3');
          expect(ssrContents).not.toContain('This is an "empty" block');

          resetTViewsFor(SimpleComponent);

          const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
          const compRef = getComponentRef<SimpleComponent>(appRef);
          appRef.tick();

          const clientRootNode = compRef.location.nativeElement;

          expect(clientRootNode.innerHTML).not.toContain('Item #1');
          expect(clientRootNode.innerHTML).not.toContain('Item #2');
          expect(clientRootNode.innerHTML).not.toContain('Item #3');
          expect(clientRootNode.innerHTML).toContain('This is an "empty" block');

          await appRef.whenStable();

          // After hydration and post-hydration cleanup,
          // expect an `@empty` block to be present and items to be removed.
          expect(clientRootNode.innerHTML).not.toContain('Item #1');
          expect(clientRootNode.innerHTML).not.toContain('Item #2');
          expect(clientRootNode.innerHTML).not.toContain('Item #3');
          expect(clientRootNode.innerHTML).toContain('This is an "empty" block');

          const clientRenderedItems = compRef.location.nativeElement.querySelectorAll('div');
          verifyAllNodesClaimedForHydration(clientRootNode, Array.from(clientRenderedItems));
        },
      );

      it('should handle different number of items rendered on the client and on the server', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
                @for (item of items; track item) {
                  <p id="{{ item }}">Item #{{ item }}</p>
                }
              `,
        })
        class SimpleComponent {
          // Item '3' is the same, the rest of the items are different.
          items = isPlatformServer(inject(PLATFORM_ID)) ? [3, 2, 1] : [3, 4, 5];
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

        resetTViewsFor(SimpleComponent);

        expect(ssrContents).toContain('Item #1');
        expect(ssrContents).toContain('Item #2');
        expect(ssrContents).toContain('Item #3');
        expect(ssrContents).not.toContain('Item #4');
        expect(ssrContents).not.toContain('Item #5');

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        await appRef.whenStable();

        const clientRootNode = compRef.location.nativeElement;

        // After hydration and post-hydration cleanup,
        // expect items to be present, but `@empty` block to be removed.
        expect(clientRootNode.innerHTML).not.toContain('Item #1');
        expect(clientRootNode.innerHTML).not.toContain('Item #2');
        expect(clientRootNode.innerHTML).toContain('Item #3');
        expect(clientRootNode.innerHTML).toContain('Item #4');
        expect(clientRootNode.innerHTML).toContain('Item #5');

        // Note: we exclude item '3', since it's the same (and at the same location)
        // on the server and on the client, so it was hydrated.
        const clientRenderedItems = [4, 5].map((id) =>
          compRef.location.nativeElement.querySelector(`[id=${id}]`),
        );
        verifyAllNodesClaimedForHydration(clientRootNode, Array.from(clientRenderedItems));
      });

      it('should handle a reconciliation with swaps', async () => {
        @Component({
          selector: 'app',
          standalone: true,
          template: `
                @for(item of items; track item) {
                  <div>{{ item }}</div>
                }
              `,
        })
        class SimpleComponent {
          items = ['a', 'b', 'c'];

          swap() {
            // Reshuffling of the array will result in
            // "swap" operations in repeater.
            this.items = ['b', 'c', 'a'];
          }
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

        resetTViewsFor(SimpleComponent);

        expect(ssrContents).toContain('a');
        expect(ssrContents).toContain('b');
        expect(ssrContents).toContain('c');

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        await appRef.whenStable();

        const root: HTMLElement = compRef.location.nativeElement;
        const divs = root.querySelectorAll('div');
        expect(divs.length).toBe(3);

        compRef.instance.swap();
        compRef.changeDetectorRef.detectChanges();

        const divsAfterSwap = root.querySelectorAll('div');
        expect(divsAfterSwap.length).toBe(3);
      });
    });

    describe('@let', () => {
      it('should handle a let declaration', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            @let greeting = name + '!!!';
            Hello, {{greeting}}
          `,
        })
        class SimpleComponent {
          name = 'Frodo';
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');
        expect(ssrContents).toContain('Hello, Frodo!!!');

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        expect(clientRootNode.textContent).toContain('Hello, Frodo!!!');

        compRef.instance.name = 'Bilbo';
        compRef.changeDetectorRef.detectChanges();
        expect(clientRootNode.textContent).toContain('Hello, Bilbo!!!');
      });

      it('should handle multiple let declarations that depend on each other', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            @let plusOne = value + 1;
            @let plusTwo = plusOne + 1;
            @let result = plusTwo + 1;
            Result: {{result}}
          `,
        })
        class SimpleComponent {
          value = 1;
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');
        expect(ssrContents).toContain('Result: 4');

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        expect(clientRootNode.textContent).toContain('Result: 4');

        compRef.instance.value = 2;
        compRef.changeDetectorRef.detectChanges();

        expect(clientRootNode.textContent).toContain('Result: 5');
      });

      it('should handle a let declaration using a pipe that injects ChangeDetectorRef', async () => {
        @Pipe({
          name: 'double',
          standalone: true,
        })
        class DoublePipe implements PipeTransform {
          changeDetectorRef = inject(ChangeDetectorRef);

          transform(value: number) {
            return value * 2;
          }
        }

        @Component({
          standalone: true,
          selector: 'app',
          imports: [DoublePipe],
          template: `
            @let result = value | double;
            Result: {{result}}
          `,
        })
        class SimpleComponent {
          value = 1;
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');
        expect(ssrContents).toContain('Result: 2');

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        expect(clientRootNode.textContent).toContain('Result: 2');

        compRef.instance.value = 2;
        compRef.changeDetectorRef.detectChanges();
        expect(clientRootNode.textContent).toContain('Result: 4');
      });

      it('should handle let declarations referenced through multiple levels of views', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            @if (true) {
              @if (true) {
                @let three = two + 1;
                The result is {{three}}
              }
              @let two = one + 1;
            }

            @let one = value + 1;
          `,
        })
        class SimpleComponent {
          value = 0;
        }

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');
        expect(ssrContents).toContain('The result is 3');

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        expect(clientRootNode.textContent).toContain('The result is 3');

        compRef.instance.value = 2;
        compRef.changeDetectorRef.detectChanges();
        expect(clientRootNode.textContent).toContain('The result is 5');
      });

      it('should handle non-projected let declarations', async () => {
        @Component({
          selector: 'inner',
          template: `
            <ng-content select="header">Fallback header</ng-content>
            <ng-content>Fallback content</ng-content>
            <ng-content select="footer">Fallback footer</ng-content>
          `,
          standalone: true,
        })
        class InnerComponent {}

        @Component({
          standalone: true,
          selector: 'app',
          template: `
            <inner>
              @let one = 1;
              <footer>|Footer value {{one}}</footer>
              @let two = one + 1;
              <header>Header value {{two}}|</header>
            </inner>
          `,
          imports: [InnerComponent],
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);
        const expectedContent =
          '<!--container--><header>Header value 2|</header>' +
          'Fallback content<!--container--><!--container-->' +
          '<footer>|Footer value 1</footer>';

        expect(ssrContents).toContain('<app ngh');
        expect(ssrContents).toContain(`<inner ngh="0">${expectedContent}</inner>`);

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        expect(clientRootNode.innerHTML).toContain(`<inner>${expectedContent}</inner>`);
      });

      it('should handle let declaration before and directly inside of an embedded view', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            @let before = 'before';
            @if (true) {
              @let inside = 'inside';
              {{before}}|{{inside}}
            }
          `,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');
        expect(ssrContents).toContain('before|inside');

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        expect(clientRootNode.textContent).toContain('before|inside');
      });

      it('should handle let declaration before, directly inside of and after an embedded view', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            @let before = 'before';
            @if (true) {
              @let inside = 'inside';
              {{inside}}
            }
            @let after = 'after';
            {{before}}|{{after}}
          `,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');
        expect(ssrContents).toContain('inside <!--container--> before|after');

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        expect(clientRootNode.textContent).toContain('inside  before|after');
      });

      it('should handle let declaration with array inside of an embedded view', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            @let foo = ['foo'];
            @if (true) {
              {{foo}}
            }
          `,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');
        expect(ssrContents).toContain('foo');

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        expect(clientRootNode.textContent).toContain('foo');
      });

      it('should handle let declaration inside a projected control flow node', async () => {
        @Component({
          selector: 'test',
          template: 'Main: <ng-content/> Slot: <ng-content slot="foo"/>',
        })
        class TestComponent {}

        @Component({
          selector: 'app',
          imports: [TestComponent],
          template: `
            <test>
              @let a = 1;
              @let b = a + 1;
              <span foo>{{b}}</span>
            </test>
          `,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain('<app ngh');
        expect(ssrContents).toContain(
          'Main: <!--ngtns--> Slot: <span foo="">2</span></test></app>',
        );

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent);
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
        expect(clientRootNode.textContent).toContain('Main:  Slot: 2');
      });
    });

    describe('zoneless', () => {
      it('should not produce "unsupported configuration" warnings for zoneless mode', async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            <header>Header</header>
            <footer>Footer</footer>
          `,
        })
        class SimpleComponent {}

        const html = await ssr(SimpleComponent);
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

        resetTViewsFor(SimpleComponent);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders: [
            withDebugConsole(),
            provideZonelessChangeDetection() as unknown as Provider[],
          ],
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        // Make sure there are no extra logs in case zoneless mode is enabled.
        verifyHasNoLog(
          appRef,
          'NG05000: Angular detected that hydration was enabled for an application ' +
            'that uses a custom or a noop Zone.js implementation.',
        );

        const clientRootNode = compRef.location.nativeElement;
        verifyAllNodesClaimedForHydration(clientRootNode);
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
        class LazyCmp {}

        const routes: Routes = [
          {
            path: '',
            loadComponent: () => {
              return ngZone.runOutsideAngular(() => {
                return new Promise((resolve) => {
                  setTimeout(() => resolve(LazyCmp), 100);
                });
              });
            },
          },
        ];

        @Component({
          standalone: true,
          selector: 'app',
          imports: [RouterOutlet],
          template: `
            Works!
            <router-outlet />
          `,
        })
        class SimpleComponent {}

        const envProviders = [
          {provide: PlatformLocation, useClass: MockPlatformLocation},
          provideRouter(routes),
        ] as unknown as Provider[];
        const html = await ssr(SimpleComponent, {envProviders});
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

        // Expect serialization to happen once a lazy-loaded route completes loading
        // and a lazy component is rendered.
        expect(ssrContents).toContain(`<lazy ${NGH_ATTR_NAME}="0">LazyCmp content</lazy>`);

        resetTViewsFor(SimpleComponent, LazyCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders,
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;

        await appRef.whenStable();

        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should wait for lazy routes before triggering post-hydration cleanup in zoneless mode', async () => {
        const ngZone = TestBed.inject(NgZone);

        @Component({
          standalone: true,
          selector: 'lazy',
          template: `LazyCmp content`,
        })
        class LazyCmp {}

        const routes: Routes = [
          {
            path: '',
            loadComponent: () => {
              return ngZone.runOutsideAngular(() => {
                return new Promise((resolve) => {
                  setTimeout(() => resolve(LazyCmp), 100);
                });
              });
            },
          },
        ];

        @Component({
          standalone: true,
          selector: 'app',
          imports: [RouterOutlet],
          template: `
            Works!
            <router-outlet />
          `,
        })
        class SimpleComponent {}

        const envProviders = [
          provideZonelessChangeDetection(),
          {provide: PlatformLocation, useClass: MockPlatformLocation},
          provideRouter(routes),
        ] as unknown as Provider[];
        const html = await ssr(SimpleComponent, {envProviders});
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);

        // Expect serialization to happen once a lazy-loaded route completes loading
        // and a lazy component is rendered.
        expect(ssrContents).toContain(`<lazy ${NGH_ATTR_NAME}="0">LazyCmp content</lazy>`);

        resetTViewsFor(SimpleComponent, LazyCmp);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders,
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        const clientRootNode = compRef.location.nativeElement;
        await appRef.whenStable();

        verifyAllNodesClaimedForHydration(clientRootNode);
        verifyClientAndSSRContentsMatch(ssrContents, clientRootNode);
      });

      it('should cleanup dehydrated views in routed components that use ViewContainerRef', async () => {
        @Component({
          standalone: true,
          selector: 'cmp-a',
          template: `
            @if (isServer) {
              <p>Server view</p>
            } @else {
              <p>Client view</p>
            }
          `,
        })
        class CmpA {
          isServer = isPlatformServer(inject(PLATFORM_ID));
          viewContainerRef = inject(ViewContainerRef);
        }

        const routes: Routes = [
          {
            path: '',
            component: CmpA,
          },
        ];

        @Component({
          standalone: true,
          selector: 'app',
          imports: [RouterOutlet],
          template: `
            <router-outlet />
          `,
        })
        class SimpleComponent {}

        const envProviders = [
          {provide: PlatformLocation, useClass: MockPlatformLocation},
          provideRouter(routes),
        ] as unknown as Provider[];
        const html = await ssr(SimpleComponent, {envProviders});
        const ssrContents = getAppContents(html);

        expect(ssrContents).toContain(`<app ${NGH_ATTR_NAME}`);
        expect(ssrContents).toContain('Server view');
        expect(ssrContents).not.toContain('Client view');

        resetTViewsFor(SimpleComponent, CmpA);

        const appRef = await prepareEnvironmentAndHydrate(doc, html, SimpleComponent, {
          envProviders,
        });
        const compRef = getComponentRef<SimpleComponent>(appRef);
        appRef.tick();

        await appRef.whenStable();

        const clientRootNode = compRef.location.nativeElement;

        // <p> tag is used in a view that is different on a server and
        // on a client, so it gets re-created (not hydrated) on a client
        const p = clientRootNode.querySelector('p');
        verifyAllNodesClaimedForHydration(clientRootNode, [p]);

        expect(clientRootNode.innerHTML).not.toContain('Server view');
        expect(clientRootNode.innerHTML).toContain('Client view');
      });
    });
  });
});
