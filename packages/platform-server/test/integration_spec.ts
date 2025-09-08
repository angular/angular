/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import '@angular/compiler';

import {animate, AnimationBuilder, state, style, transition, trigger} from '@angular/animations';
import {DOCUMENT, isPlatformServer, PlatformLocation, ɵgetDOM as getDOM} from '@angular/common';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {
  ApplicationConfig,
  ApplicationRef,
  Component,
  destroyPlatform,
  EnvironmentProviders,
  HostListener,
  Inject,
  inject as coreInject,
  Injectable,
  Input,
  makeStateKey,
  mergeApplicationConfig,
  NgModule,
  NgModuleRef,
  NgZone,
  PLATFORM_ID,
  Provider,
  TransferState,
  Type,
  ViewEncapsulation,
  ɵPendingTasks as PendingTasks,
  ɵwhenStable as whenStable,
  APP_INITIALIZER,
  inject,
  getPlatform,
} from '@angular/core';
import {SSR_CONTENT_INTEGRITY_MARKER} from '@angular/core/src/hydration/utils';
import {TestBed} from '@angular/core/testing';
import {
  bootstrapApplication,
  BootstrapContext,
  BrowserModule,
  provideClientHydration,
  Title,
} from '@angular/platform-browser';
import {
  BEFORE_APP_SERIALIZED,
  INITIAL_CONFIG,
  platformServer,
  PlatformState,
  provideServerRendering,
  renderModule,
  ServerModule,
} from '@angular/platform-server';
import {provideRouter, RouterOutlet, Routes} from '@angular/router';
import {Observable} from 'rxjs';

import {renderApplication, SERVER_CONTEXT} from '../src/utils';

const APP_CONFIG: ApplicationConfig = {
  providers: [provideServerRendering()],
};

function getStandaloneBootstrapFn(
  component: Type<unknown>,
  providers: Array<Provider | EnvironmentProviders> = [],
): (context: BootstrapContext) => Promise<ApplicationRef> {
  return (context: BootstrapContext) =>
    bootstrapApplication(component, mergeApplicationConfig(APP_CONFIG, {providers}), context);
}

function createMyServerApp(standalone: boolean) {
  @Component({
    standalone,
    selector: 'app',
    template: `Works!`,
  })
  class MyServerApp {}
  return MyServerApp;
}

const MyServerApp = createMyServerApp(false);
const MyServerAppStandalone = createMyServerApp(true);

@NgModule({
  declarations: [MyServerApp],
  exports: [MyServerApp],
})
export class MyServerAppModule {}

function createAppWithPendingTask(standalone: boolean) {
  @Component({
    standalone,
    selector: 'app',
    template: `Completed: {{ completed }}`,
  })
  class PendingTasksApp {
    completed = 'No';

    constructor() {
      const pendingTasks = coreInject(PendingTasks);
      const taskId = pendingTasks.add();
      setTimeout(() => {
        pendingTasks.remove(taskId);
        this.completed = 'Yes';
      });
    }
  }
  return PendingTasksApp;
}

const PendingTasksApp = createAppWithPendingTask(false);
const PendingTasksAppStandalone = createAppWithPendingTask(true);

@NgModule({
  declarations: [PendingTasksApp],
  exports: [PendingTasksApp],
  imports: [ServerModule],
  bootstrap: [PendingTasksApp],
})
export class PendingTasksAppModule {}

@NgModule({
  bootstrap: [MyServerApp],
  imports: [MyServerAppModule, ServerModule],
})
class ExampleModule {}

function getTitleRenderHook(doc: any) {
  return () => {
    // Set the title as part of the render hook.
    doc.title = 'RenderHook';
  };
}

function exceptionRenderHook() {
  throw new Error('error');
}

function getMetaRenderHook(doc: any) {
  return () => {
    // Add a meta tag before rendering the document.
    const metaElement = doc.createElement('meta');
    metaElement.setAttribute('name', 'description');
    doc.head.appendChild(metaElement);
  };
}

function getAsyncTitleRenderHook(doc: any) {
  return () => {
    // Async set the title as part of the render hook.
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        doc.title = 'AsyncRenderHook';
        resolve();
      });
    });
  };
}

function asyncRejectRenderHook() {
  return () => {
    return new Promise<void>((_resolve, reject) => {
      setTimeout(() => {
        reject('reject');
      });
    });
  };
}

const RenderHookProviders = [
  {provide: BEFORE_APP_SERIALIZED, useFactory: getTitleRenderHook, multi: true, deps: [DOCUMENT]},
];

@NgModule({
  bootstrap: [MyServerApp],
  imports: [MyServerAppModule, BrowserModule, ServerModule],
  providers: [...RenderHookProviders],
})
class RenderHookModule {}

const MultiRenderHookProviders = [
  {provide: BEFORE_APP_SERIALIZED, useFactory: getTitleRenderHook, multi: true, deps: [DOCUMENT]},
  {provide: BEFORE_APP_SERIALIZED, useValue: exceptionRenderHook, multi: true},
  {provide: BEFORE_APP_SERIALIZED, useFactory: getMetaRenderHook, multi: true, deps: [DOCUMENT]},
];

@NgModule({
  bootstrap: [MyServerApp],
  imports: [MyServerAppModule, BrowserModule, ServerModule],
  providers: [...MultiRenderHookProviders],
})
class MultiRenderHookModule {}

const AsyncRenderHookProviders = [
  {
    provide: BEFORE_APP_SERIALIZED,
    useFactory: getAsyncTitleRenderHook,
    multi: true,
    deps: [DOCUMENT],
  },
];

@NgModule({
  bootstrap: [MyServerApp],
  imports: [MyServerAppModule, BrowserModule, ServerModule],
  providers: [...AsyncRenderHookProviders],
})
class AsyncRenderHookModule {}

const AsyncMultiRenderHookProviders = [
  {provide: BEFORE_APP_SERIALIZED, useFactory: getMetaRenderHook, multi: true, deps: [DOCUMENT]},
  {
    provide: BEFORE_APP_SERIALIZED,
    useFactory: getAsyncTitleRenderHook,
    multi: true,
    deps: [DOCUMENT],
  },
  {provide: BEFORE_APP_SERIALIZED, useFactory: asyncRejectRenderHook, multi: true},
];

@NgModule({
  bootstrap: [MyServerApp],
  imports: [MyServerAppModule, BrowserModule, ServerModule],
  providers: [...AsyncMultiRenderHookProviders],
})
class AsyncMultiRenderHookModule {}

@Component({selector: 'app', template: `Works too!`})
class MyServerApp2 {}

@NgModule({declarations: [MyServerApp2], imports: [ServerModule], bootstrap: [MyServerApp2]})
class ExampleModule2 {}

@Component({selector: 'app', template: ``})
class TitleApp {
  constructor(private title: Title) {}
  ngOnInit() {
    this.title.setTitle('Test App Title');
  }
}

@NgModule({declarations: [TitleApp], imports: [ServerModule], bootstrap: [TitleApp]})
class TitleAppModule {}

function createMyAsyncServerApp(standalone: boolean) {
  @Component({
    selector: 'app',
    template: '{{text}}<h1 [textContent]="h1"></h1>',
    standalone,
  })
  class MyAsyncServerApp {
    text = '';
    h1 = '';

    @HostListener('window:scroll')
    track() {
      console.error('scroll');
    }

    ngOnInit() {
      Promise.resolve(null).then(() =>
        setTimeout(() => {
          this.text = 'Works!';
          this.h1 = 'fine';
        }, 10),
      );
    }
  }
  return MyAsyncServerApp;
}

const MyAsyncServerApp = createMyAsyncServerApp(false);
const MyAsyncServerAppStandalone = getStandaloneBootstrapFn(createMyAsyncServerApp(true));

@NgModule({
  declarations: [MyAsyncServerApp],
  imports: [BrowserModule, ServerModule],
  bootstrap: [MyAsyncServerApp],
})
class AsyncServerModule {}

function createSVGComponent(standalone: boolean) {
  @Component({
    selector: 'app',
    template: '<svg><use xlink:href="#clear"></use></svg>',
    standalone,
  })
  class SVGComponent {}
  return SVGComponent;
}

const SVGComponent = createSVGComponent(false);
const SVGComponentStandalone = getStandaloneBootstrapFn(createSVGComponent(true));

@NgModule({
  declarations: [SVGComponent],
  imports: [BrowserModule, ServerModule],
  bootstrap: [SVGComponent],
})
class SVGServerModule {}

function createMyAnimationApp(standalone: boolean) {
  @Component({
    standalone,
    selector: 'app',
    template: `
  <div [@myAnimation]="state">
    <svg *ngIf="true"></svg>
    {{text}}
  </div>`,
    animations: [
      trigger('myAnimation', [
        state('void', style({'opacity': '0'})),
        state(
          'active',
          style({
            'opacity': '1', // simple supported property
            'font-weight': 'bold', // property with dashed name
            'transform': 'translate3d(0, 0, 0)', // not natively supported by Domino
          }),
        ),
        transition('void => *', [animate('0ms')]),
      ]),
    ],
  })
  class MyAnimationApp {
    state = 'active';
    constructor(private builder: AnimationBuilder) {}

    text = 'Works!';
  }
  return MyAnimationApp;
}

const MyAnimationApp = createMyAnimationApp(false);
const MyAnimationAppStandalone = getStandaloneBootstrapFn(createMyAnimationApp(true));

@NgModule({
  declarations: [MyAnimationApp],
  imports: [BrowserModule, ServerModule],
  bootstrap: [MyAnimationApp],
})
class AnimationServerModule {}

function createMyStylesApp(standalone: boolean) {
  @Component({
    standalone,
    selector: 'app',
    template: `<div>Works!</div>`,
    styles: ['div {color: blue; } :host { color: red; }'],
  })
  class MyStylesApp {}
  return MyStylesApp;
}

const MyStylesApp = createMyStylesApp(false);
const MyStylesAppStandalone = getStandaloneBootstrapFn(createMyStylesApp(true));

@NgModule({
  declarations: [MyStylesApp],
  imports: [BrowserModule, ServerModule],
  bootstrap: [MyStylesApp],
})
class ExampleStylesModule {}

function createMyTransferStateApp(standalone: boolean) {
  @Component({
    standalone,
    selector: 'app',
    template: `<div>Works!</div>`,
  })
  class MyStylesApp {
    state = coreInject(TransferState);
    constructor() {
      this.state.set(makeStateKey<string>('some-key'), 'some-value');
    }
  }
  return MyStylesApp;
}

const MyTransferStateApp = createMyTransferStateApp(false);
const MyTransferStateAppStandalone = getStandaloneBootstrapFn(createMyTransferStateApp(true));

@NgModule({
  declarations: [MyTransferStateApp],
  imports: [BrowserModule, ServerModule],
  bootstrap: [MyTransferStateApp],
})
class MyTransferStateModule {}

@NgModule({
  bootstrap: [MyServerApp],
  imports: [MyServerAppModule, ServerModule, HttpClientModule, HttpClientTestingModule],
})
export class HttpClientExampleModule {}

@Injectable()
export class MyHttpInterceptor implements HttpInterceptor {
  constructor(private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req);
  }
}

@NgModule({
  bootstrap: [MyServerApp],
  imports: [MyServerAppModule, ServerModule, HttpClientModule, HttpClientTestingModule],
  providers: [{provide: HTTP_INTERCEPTORS, multi: true, useClass: MyHttpInterceptor}],
})
export class HttpInterceptorExampleModule {}

@Component({selector: 'app', template: `<img [src]="'link'">`})
class ImageApp {}

@NgModule({declarations: [ImageApp], imports: [ServerModule], bootstrap: [ImageApp]})
class ImageExampleModule {}

function createShadowDomEncapsulationApp(standalone: boolean) {
  @Component({
    standalone,
    selector: 'app',
    template: 'Shadow DOM works',
    encapsulation: ViewEncapsulation.ShadowDom,
    styles: [':host { color: red; }'],
  })
  class ShadowDomEncapsulationApp {}
  return ShadowDomEncapsulationApp;
}

const ShadowDomEncapsulationApp = createShadowDomEncapsulationApp(false);
const ShadowDomEncapsulationAppStandalone = getStandaloneBootstrapFn(
  createShadowDomEncapsulationApp(true),
);

@NgModule({
  declarations: [ShadowDomEncapsulationApp],
  imports: [BrowserModule, ServerModule],
  bootstrap: [ShadowDomEncapsulationApp],
})
class ShadowDomExampleModule {}

function createFalseAttributesComponents(standalone: boolean) {
  @Component({
    standalone,
    selector: 'my-child',
    template: 'Works!',
  })
  class MyChildComponent {
    @Input() public attr!: boolean;
  }

  @Component({
    standalone,
    selector: 'app',
    template: '<my-child [attr]="false"></my-child>',
    imports: standalone ? [MyChildComponent] : [],
  })
  class MyHostComponent {}
  return [MyHostComponent, MyChildComponent];
}

const [MyHostComponent, MyChildComponent] = createFalseAttributesComponents(false);
const MyHostComponentStandalone = getStandaloneBootstrapFn(
  createFalseAttributesComponents(true)[0],
);

@NgModule({
  declarations: [MyHostComponent, MyChildComponent],
  bootstrap: [MyHostComponent],
  imports: [ServerModule, BrowserModule],
})
class FalseAttributesModule {}

function createMyInputComponent(standalone: boolean) {
  @Component({
    standalone,
    selector: 'app',
    template: '<input [name]="name">',
  })
  class MyInputComponent {
    @Input() name = '';
  }
  return MyInputComponent;
}

const MyInputComponent = createMyInputComponent(false);
const MyInputComponentStandalone = getStandaloneBootstrapFn(createMyInputComponent(true));

@NgModule({
  declarations: [MyInputComponent],
  bootstrap: [MyInputComponent],
  imports: [ServerModule, BrowserModule],
})
class NameModule {}

function createHTMLTypesApp(standalone: boolean) {
  @Component({
    standalone,
    selector: 'app',
    template: '<div [innerHTML]="html"></div>',
  })
  class HTMLTypesApp {
    html = '<b>foo</b> bar';
    constructor(@Inject(DOCUMENT) doc: Document) {}
  }
  return HTMLTypesApp;
}

const HTMLTypesApp = createHTMLTypesApp(false);
const HTMLTypesAppStandalone = getStandaloneBootstrapFn(createHTMLTypesApp(true));

@NgModule({
  declarations: [HTMLTypesApp],
  imports: [BrowserModule, ServerModule],
  bootstrap: [HTMLTypesApp],
})
class HTMLTypesModule {}

function createMyHiddenComponent(standalone: boolean) {
  @Component({
    standalone,
    selector: 'app',
    template: '<input [hidden]="true"><input [hidden]="false">',
  })
  class MyHiddenComponent {
    @Input() name = '';
  }
  return MyHiddenComponent;
}

const MyHiddenComponent = createMyHiddenComponent(false);
const MyHiddenComponentStandalone = getStandaloneBootstrapFn(createMyHiddenComponent(true));

@NgModule({
  declarations: [MyHiddenComponent],
  bootstrap: [MyHiddenComponent],
  imports: [ServerModule, BrowserModule],
})
class HiddenModule {}

(function () {
  if (getDOM().supportsDOMEvents) return; // NODE only

  describe('platform-server integration', () => {
    beforeEach(() => {
      destroyPlatform();
    });

    afterAll(() => {
      destroyPlatform();
    });

    it('should bootstrap', async () => {
      const platform = platformServer([
        {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
      ]);

      const moduleRef = await platform.bootstrapModule(ExampleModule);
      expect(isPlatformServer(moduleRef.injector.get(PLATFORM_ID))).toBe(true);
      const doc = moduleRef.injector.get(DOCUMENT);

      expect(doc.head).toBe(doc.querySelector('head')!);
      expect(doc.body).toBe(doc.querySelector('body')!);

      expect(doc.documentElement.textContent).toEqual('Works!');

      platform.destroy();
    });

    it('should allow multiple platform instances', async () => {
      const platform = platformServer([
        {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
      ]);

      const platform2 = platformServer([
        {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
      ]);

      await platform.bootstrapModule(ExampleModule).then((moduleRef) => {
        const doc = moduleRef.injector.get(DOCUMENT);
        expect(doc.documentElement.textContent).toEqual('Works!');
        platform.destroy();
      });

      await platform2.bootstrapModule(ExampleModule2).then((moduleRef) => {
        const doc = moduleRef.injector.get(DOCUMENT);
        expect(doc.documentElement.textContent).toEqual('Works too!');
        platform2.destroy();
      });
    });

    it('adds title to the document using Title service', async () => {
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {document: '<html><head><title></title></head><body><app></app></body></html>'},
        },
      ]);

      const ref = await platform.bootstrapModule(TitleAppModule);
      const state = ref.injector.get(PlatformState);
      const doc = ref.injector.get(DOCUMENT);
      const title = doc.querySelector('title')!;
      expect(title.textContent).toBe('Test App Title');
      expect(state.renderToString()).toContain('<title>Test App Title</title>');
    });

    it('should get base href from document', async () => {
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {document: '<html><head><base href="/"></head><body><app></app></body></html>'},
        },
      ]);
      const moduleRef = await platform.bootstrapModule(ExampleModule);
      const location = moduleRef.injector.get(PlatformLocation);
      expect(location.getBaseHrefFromDOM()).toEqual('/');
      platform.destroy();
    });

    it('adds styles with ng-app-id attribute', async () => {
      const platform = platformServer([
        {
          provide: INITIAL_CONFIG,
          useValue: {document: '<html><head></head><body><app></app></body></html>'},
        },
      ]);
      const ref = await platform.bootstrapModule(ExampleStylesModule);
      const doc = ref.injector.get(DOCUMENT);
      const head = doc.getElementsByTagName('head')[0];
      const styles: any[] = head.children as any;
      expect(styles.length).toBe(1);
      expect(styles[0].textContent).toContain('color: red');
      expect(styles[0].getAttribute('ng-app-id')).toBe('ng');
    });

    it('copies known properties to attributes', async () => {
      const platform = platformServer([
        {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
      ]);
      const ref = await platform.bootstrapModule(ImageExampleModule);
      const appRef: ApplicationRef = ref.injector.get(ApplicationRef);
      const app = appRef.components[0].location.nativeElement;
      const img = app.getElementsByTagName('img')[0] as any;
      expect(img.attributes['src'].value).toEqual('link');
    });

    describe('PlatformLocation', () => {
      it('is injectable', async () => {
        const platform = platformServer([
          {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
        ]);
        const appRef = await platform.bootstrapModule(ExampleModule);
        const location = appRef.injector.get(PlatformLocation);
        expect(location.pathname).toBe('/');
        platform.destroy();
      });
      it('is configurable via INITIAL_CONFIG', async () => {
        const platform = platformServer([
          {
            provide: INITIAL_CONFIG,
            useValue: {document: '<app></app>', url: 'http://test.com/deep/path?query#hash'},
          },
        ]);

        const appRef = await platform.bootstrapModule(ExampleModule);

        const location = appRef.injector.get(PlatformLocation);
        expect(location.pathname).toBe('/deep/path');
        expect(location.search).toBe('?query');
        expect(location.hash).toBe('#hash');
      });

      it('parses component pieces of a URL', async () => {
        const platform = platformServer([
          {
            provide: INITIAL_CONFIG,
            useValue: {document: '<app></app>', url: 'http://test.com:80/deep/path?query#hash'},
          },
        ]);

        const appRef = await platform.bootstrapModule(ExampleModule);

        const location = appRef.injector.get(PlatformLocation);
        expect(location.hostname).toBe('test.com');
        expect(location.protocol).toBe('http:');
        expect(location.port).toBe('');
        expect(location.pathname).toBe('/deep/path');
        expect(location.search).toBe('?query');
        expect(location.hash).toBe('#hash');
      });

      it('handles empty search and hash portions of the url', async () => {
        const platform = platformServer([
          {
            provide: INITIAL_CONFIG,
            useValue: {document: '<app></app>', url: 'http://test.com/deep/path'},
          },
        ]);

        const appRef = await platform.bootstrapModule(ExampleModule);

        const location = appRef.injector.get(PlatformLocation);
        expect(location.pathname).toBe('/deep/path');
        expect(location.search).toBe('');
        expect(location.hash).toBe('');
      });

      it('pushState causes the URL to update', async () => {
        const platform = platformServer([
          {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
        ]);

        const appRef = await platform.bootstrapModule(ExampleModule);
        const location = appRef.injector.get(PlatformLocation);
        location.pushState(null, 'Test', '/foo#bar');
        expect(location.pathname).toBe('/foo');
        expect(location.hash).toBe('#bar');
        platform.destroy();
      });

      it('allows subscription to the hash state', (done) => {
        const platform = platformServer([
          {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
        ]);
        platform.bootstrapModule(ExampleModule).then((appRef) => {
          const location: PlatformLocation = appRef.injector.get(PlatformLocation);
          expect(location.pathname).toBe('/');
          location.onHashChange((e: any) => {
            expect(e.type).toBe('hashchange');
            expect(e.oldUrl).toBe('/');
            expect(e.newUrl).toBe('/foo#bar');
            platform.destroy();
            done();
          });
          location.pushState(null, 'Test', '/foo#bar');
        });
      });
    });

    describe('render', () => {
      let doc: string;
      let expectedOutput =
        '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">Works!<h1>fine</h1></app></body></html>';

      beforeEach(() => {
        // PlatformConfig takes in a parsed document so that it can be cached across requests.
        doc = '<html><head></head><body><app></app></body></html>';
      });

      it('using long form should work', async () => {
        const platform = platformServer([{provide: INITIAL_CONFIG, useValue: {document: doc}}]);

        const moduleRef = await platform.bootstrapModule(AsyncServerModule);
        const applicationRef = moduleRef.injector.get(ApplicationRef);
        await whenStable(applicationRef);
        // Note: the `ng-server-context` is not present in this output, since
        // `renderModule` or `renderApplication` functions are not used here.
        const expectedOutput =
          '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER">' +
          'Works!<h1>fine</h1></app></body></html>';

        expect(platform.injector.get(PlatformState).renderToString()).toBe(expectedOutput);
      });

      // Run the set of tests with regular and standalone components.
      [true, false].forEach((isStandalone: boolean) => {
        it(`using ${isStandalone ? 'renderApplication' : 'renderModule'} should work`, async () => {
          const options = {document: doc};
          const bootstrap = isStandalone
            ? renderApplication(MyAsyncServerAppStandalone, options)
            : renderModule(AsyncServerModule, options);
          const output = await bootstrap;
          expect(output).toBe(expectedOutput);
        });

        it(
          `using ${isStandalone ? 'renderApplication' : 'renderModule'} ` +
            `should allow passing a document reference`,
          async () => {
            const document = TestBed.inject(DOCUMENT);

            // Append root element based on the app selector.
            const rootEl = document.createElement('app');
            document.body.appendChild(rootEl);

            // Append a special marker to verify that we use a correct instance
            // of the document for rendering.
            const markerEl = document.createComment('test marker');
            document.body.appendChild(markerEl);

            const options = {document};
            const bootstrap = isStandalone
              ? renderApplication(MyAsyncServerAppStandalone, {document})
              : renderModule(AsyncServerModule, options);
            const output = await bootstrap.finally(() => {
              rootEl.remove();
              markerEl.remove();
            });

            expect(output).toBe(
              '<html><head><title>fakeTitle</title></head>' +
                '<body><app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">' +
                'Works!<h1>fine</h1></app>' +
                '<!--test marker--></body></html>',
            );
          },
        );

        it('works with SVG elements', async () => {
          const options = {document: doc};
          const bootstrap = isStandalone
            ? renderApplication(SVGComponentStandalone, {...options})
            : renderModule(SVGServerModule, options);
          const output = await bootstrap;
          expect(output).toBe(
            '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">' +
              '<svg><use xlink:href="#clear"></use></svg></app></body></html>',
          );
        });

        it('works with animation', async () => {
          const options = {document: doc};
          const bootstrap = isStandalone
            ? renderApplication(MyAnimationAppStandalone, options)
            : renderModule(AnimationServerModule, options);
          const output = await bootstrap;
          expect(output).toContain('Works!');
          expect(output).toContain('ng-trigger-myAnimation');
          expect(output).toContain('opacity: 1;');
          expect(output).toContain('transform: translate3d(0, 0, 0);');
          expect(output).toContain('font-weight: bold;');
        });

        it('should handle ViewEncapsulation.ShadowDom', async () => {
          const options = {document: doc};
          const bootstrap = isStandalone
            ? renderApplication(ShadowDomEncapsulationAppStandalone, options)
            : renderModule(ShadowDomExampleModule, options);
          const output = await bootstrap;
          expect(output).not.toBe('');
          expect(output).toContain('color: red');
        });

        it('adds the `ng-server-context` attribute to host elements', async () => {
          const options = {
            document: doc,
          };
          const providers = [
            {
              provide: SERVER_CONTEXT,
              useValue: 'ssg',
            },
          ];
          const bootstrap = isStandalone
            ? renderApplication(MyStylesAppStandalone, {...options, platformProviders: providers})
            : renderModule(ExampleStylesModule, {...options, extraProviders: providers});
          const output = await bootstrap;
          expect(output).toMatch(
            /<app _nghost-ng-c\d+="" ng-version="0.0.0-PLACEHOLDER" ng-server-context="ssg">/,
          );
        });

        it('sanitizes the `serverContext` value', async () => {
          const options = {
            document: doc,
          };
          const providers = [
            {
              provide: SERVER_CONTEXT,
              useValue: '!!!Some extra chars&& --><!--',
            },
          ];
          const bootstrap = isStandalone
            ? renderApplication(MyStylesAppStandalone, {...options, platformProviders: providers})
            : renderModule(ExampleStylesModule, {...options, extraProviders: providers});
          // All symbols other than [a-zA-Z0-9\-] are removed
          const output = await bootstrap;
          expect(output).toMatch(/ng-server-context="Someextrachars----"/);
        });

        it(
          `using ${isStandalone ? 'renderApplication' : 'renderModule'} ` +
            `should serialize transfer state only once`,
          async () => {
            const options = {document: doc};
            const bootstrap = isStandalone
              ? renderApplication(MyTransferStateAppStandalone, options)
              : renderModule(MyTransferStateModule, options);
            const expectedOutput =
              '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other"><div>Works!</div></app>' +
              '<script id="ng-state" type="application/json">{"some-key":"some-value"}</script></body></html>';
            const output = await bootstrap;
            expect(output).toEqual(expectedOutput);
          },
        );

        it('uses `other` as the `serverContext` value when all symbols are removed after sanitization', async () => {
          const options = {
            document: doc,
          };
          const providers = [
            {
              provide: SERVER_CONTEXT,
              useValue: '!!! &&<>',
            },
          ];
          const bootstrap = isStandalone
            ? renderApplication(MyStylesAppStandalone, {...options, platformProviders: providers})
            : renderModule(ExampleStylesModule, {...options, extraProviders: providers});
          // All symbols other than [a-zA-Z0-9\-] are removed,
          // the `other` is used as the default.
          const output = await bootstrap;
          expect(output).toMatch(/ng-server-context="other"/);
        });

        it('appends SSR integrity marker comment when hydration is enabled', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: ``,
          })
          class SimpleApp {}

          const bootstrap = renderApplication(
            getStandaloneBootstrapFn(SimpleApp, [provideClientHydration()]),
            {document: doc},
          );
          // HttpClient cache and DOM hydration are enabled by default.
          const output = await bootstrap;
          expect(output).toContain(`<body><!--${SSR_CONTENT_INTEGRITY_MARKER}-->`);
        });

        it('should handle false values on attributes', async () => {
          const options = {document: doc};
          const bootstrap = isStandalone
            ? renderApplication(MyHostComponentStandalone, options)
            : renderModule(FalseAttributesModule, options);
          const output = await bootstrap;
          expect(output).toBe(
            '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">' +
              '<my-child ng-reflect-attr="false">Works!</my-child></app></body></html>',
          );
        });

        it('should handle element property "name"', async () => {
          const options = {document: doc};
          const bootstrap = isStandalone
            ? renderApplication(MyInputComponentStandalone, options)
            : renderModule(NameModule, options);
          const output = await bootstrap;
          expect(output).toBe(
            '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">' +
              '<input name=""></app></body></html>',
          );
        });

        it('should work with sanitizer to handle "innerHTML"', async () => {
          // Clear out any global states. These should be set when platform-server
          // is initialized.
          (global as any).Node = undefined;
          (global as any).Document = undefined;
          const options = {document: doc};
          const bootstrap = isStandalone
            ? renderApplication(HTMLTypesAppStandalone, options)
            : renderModule(HTMLTypesModule, options);
          const output = await bootstrap;
          expect(output).toBe(
            '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">' +
              '<div><b>foo</b> bar</div></app></body></html>',
          );
        });

        it('should handle element property "hidden"', async () => {
          const options = {document: doc};
          const bootstrap = isStandalone
            ? renderApplication(MyHiddenComponentStandalone, options)
            : renderModule(HiddenModule, options);
          const output = await bootstrap;
          expect(output).toBe(
            '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">' +
              '<input hidden=""><input></app></body></html>',
          );
        });

        it('should call render hook', async () => {
          const options = {document: doc};
          const bootstrap = isStandalone
            ? renderApplication(
                getStandaloneBootstrapFn(MyServerAppStandalone, RenderHookProviders),
                options,
              )
            : renderModule(RenderHookModule, options);
          const output = await bootstrap;
          // title should be added by the render hook.
          expect(output).toBe(
            '<html><head><title>RenderHook</title></head><body>' +
              '<app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">Works!</app></body></html>',
          );
        });

        it('should call multiple render hooks', async () => {
          const consoleSpy = spyOn(console, 'warn');
          const options = {document: doc};
          const bootstrap = isStandalone
            ? renderApplication(
                getStandaloneBootstrapFn(MyServerAppStandalone, MultiRenderHookProviders),
                options,
              )
            : renderModule(MultiRenderHookModule, options);
          const output = await bootstrap;
          // title should be added by the render hook.
          expect(output).toBe(
            '<html><head><title>RenderHook</title><meta name="description"></head>' +
              '<body><app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">Works!</app></body></html>',
          );
          expect(consoleSpy).toHaveBeenCalled();
        });

        it('should call async render hooks', async () => {
          const options = {document: doc};
          const bootstrap = isStandalone
            ? renderApplication(
                getStandaloneBootstrapFn(MyServerAppStandalone, AsyncRenderHookProviders),
                options,
              )
            : renderModule(AsyncRenderHookModule, options);
          const output = await bootstrap;
          // title should be added by the render hook.
          expect(output).toBe(
            '<html><head><title>AsyncRenderHook</title></head><body>' +
              '<app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">Works!</app></body></html>',
          );
        });

        it('should call multiple async and sync render hooks', async () => {
          const consoleSpy = spyOn(console, 'warn');
          const options = {document: doc};
          const bootstrap = isStandalone
            ? renderApplication(
                getStandaloneBootstrapFn(MyServerAppStandalone, AsyncMultiRenderHookProviders),
                options,
              )
            : renderModule(AsyncMultiRenderHookModule, options);
          const output = await bootstrap;
          // title should be added by the render hook.
          expect(output).toBe(
            '<html><head><meta name="description"><title>AsyncRenderHook</title></head>' +
              '<body><app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">Works!</app></body></html>',
          );
          expect(consoleSpy).toHaveBeenCalled();
        });

        it(
          `should wait for InitialRenderPendingTasks before serializing ` +
            `(standalone: ${isStandalone})`,
          async () => {
            const options = {document: doc};
            const bootstrap = isStandalone
              ? renderApplication(getStandaloneBootstrapFn(PendingTasksAppStandalone), options)
              : renderModule(PendingTasksAppModule, options);
            const output = await bootstrap;
            expect(output).toBe(
              '<html><head></head><body>' +
                '<app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">Completed: Yes</app>' +
                '</body></html>',
            );
          },
        );

        it(
          `should call onOnDestroy of a service after a successful render` +
            `(standalone: ${isStandalone})`,
          async () => {
            let wasServiceNgOnDestroyCalled = false;

            @Injectable({providedIn: 'root'})
            class DestroyableService {
              ngOnDestroy() {
                wasServiceNgOnDestroyCalled = true;
              }
            }

            const SuccessfulAppInitializerProviders = [
              {
                provide: APP_INITIALIZER,
                useFactory: () => {
                  inject(DestroyableService);
                  return () => Promise.resolve(); // Success in APP_INITIALIZER
                },
                multi: true,
              },
            ];

            @NgModule({
              providers: SuccessfulAppInitializerProviders,
              imports: [MyServerAppModule, ServerModule],
              bootstrap: [MyServerApp],
            })
            class ServerSuccessfulAppInitializerModule {}

            const ServerSuccessfulAppInitializerAppStandalone = getStandaloneBootstrapFn(
              createMyServerApp(true),
              SuccessfulAppInitializerProviders,
            );

            const options = {document: doc};
            const bootstrap = isStandalone
              ? renderApplication(ServerSuccessfulAppInitializerAppStandalone, options)
              : renderModule(ServerSuccessfulAppInitializerModule, options);
            await bootstrap;

            expect(getPlatform()).withContext('PlatformRef should be destroyed').toBeNull();
            expect(wasServiceNgOnDestroyCalled)
              .withContext('DestroyableService.ngOnDestroy() should be called')
              .toBeTrue();
          },
        );

        it(
          `should call onOnDestroy of a service after some APP_INITIALIZER fails ` +
            `(standalone: ${isStandalone})`,
          async () => {
            let wasServiceNgOnDestroyCalled = false;

            @Injectable({providedIn: 'root'})
            class DestroyableService {
              ngOnDestroy() {
                wasServiceNgOnDestroyCalled = true;
              }
            }

            const FailingAppInitializerProviders = [
              {
                provide: APP_INITIALIZER,
                useFactory: () => {
                  inject(DestroyableService);
                  return () => Promise.reject('Error in APP_INITIALIZER');
                },
                multi: true,
              },
            ];

            @NgModule({
              providers: FailingAppInitializerProviders,
              imports: [MyServerAppModule, ServerModule],
              bootstrap: [MyServerApp],
            })
            class ServerFailingAppInitializerModule {}

            const ServerFailingAppInitializerAppStandalone = getStandaloneBootstrapFn(
              createMyServerApp(true),
              FailingAppInitializerProviders,
            );

            const options = {document: doc};
            const bootstrap = isStandalone
              ? renderApplication(ServerFailingAppInitializerAppStandalone, options)
              : renderModule(ServerFailingAppInitializerModule, options);
            await expectAsync(bootstrap).toBeRejectedWith('Error in APP_INITIALIZER');

            expect(getPlatform()).withContext('PlatformRef should be destroyed').toBeNull();
            expect(wasServiceNgOnDestroyCalled)
              .withContext('DestroyableService.ngOnDestroy() should be called')
              .toBeTrue();
          },
        );

        it(
          `should call onOnDestroy of a service after an error happens in a root component's constructor ` +
            `(standalone: ${isStandalone})`,
          async () => {
            let wasServiceNgOnDestroyCalled = false;

            @Injectable({providedIn: 'root'})
            class DestroyableService {
              ngOnDestroy() {
                wasServiceNgOnDestroyCalled = true;
              }
            }

            @Component({
              standalone: isStandalone,
              selector: 'app',
              template: `Works!`,
            })
            class MyServerFailingConstructorApp {
              constructor() {
                inject(DestroyableService);
                throw 'Error in constructor of the root component';
              }
            }

            @NgModule({
              declarations: [MyServerFailingConstructorApp],
              imports: [MyServerAppModule, ServerModule],
              bootstrap: [MyServerFailingConstructorApp],
            })
            class MyServerFailingConstructorAppModule {}

            const MyServerFailingConstructorAppStandalone = getStandaloneBootstrapFn(
              MyServerFailingConstructorApp,
            );
            const options = {document: doc};
            const bootstrap = isStandalone
              ? renderApplication(MyServerFailingConstructorAppStandalone, options)
              : renderModule(MyServerFailingConstructorAppModule, options);
            await expectAsync(bootstrap).toBeRejectedWith(
              'Error in constructor of the root component',
            );
            expect(getPlatform()).withContext('PlatformRef should be destroyed').toBeNull();
            expect(wasServiceNgOnDestroyCalled)
              .withContext('DestroyableService.ngOnDestroy() should be called')
              .toBeTrue();
          },
        );
      });
    });

    describe('Router', () => {
      it('should wait for lazy routes before serializing', async () => {
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
          standalone: false,
          selector: 'app',
          template: `
          Works!
          <router-outlet />
        `,
        })
        class MyServerApp {}

        @NgModule({
          declarations: [MyServerApp],
          exports: [MyServerApp],
          imports: [BrowserModule, ServerModule, RouterOutlet],
          providers: [provideRouter(routes)],
          bootstrap: [MyServerApp],
        })
        class MyServerAppModule {}

        const options = {document: '<html><head></head><body><app></app></body></html>'};
        const output = await renderModule(MyServerAppModule, options);

        // Expect serialization to happen once a lazy-loaded route completes loading
        // and a lazy component is rendered.
        expect(output).toContain('<lazy>LazyCmp content</lazy>');
      });
    });

    describe('HttpClient', () => {
      it('can inject HttpClient', async () => {
        const platform = platformServer([
          {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
        ]);
        const ref = await platform.bootstrapModule(HttpClientExampleModule);
        expect(ref.injector.get(HttpClient) instanceof HttpClient).toBeTruthy();
      });

      it('can make HttpClient requests', async () => {
        const platform = platformServer([
          {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
        ]);
        await platform.bootstrapModule(HttpClientExampleModule).then((ref) => {
          const mock = ref.injector.get(HttpTestingController) as HttpTestingController;
          const http = ref.injector.get(HttpClient);
          ref.injector.get<NgZone>(NgZone).run(() => {
            http.get<string>('http://localhost/testing').subscribe((body: string) => {
              NgZone.assertInAngularZone();
              expect(body).toEqual('success!');
            });
            mock.expectOne('http://localhost/testing').flush('success!');
          });
        });
      });

      it('can use HttpInterceptor that injects HttpClient', async () => {
        const platform = platformServer([
          {provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}},
        ]);
        await platform.bootstrapModule(HttpInterceptorExampleModule).then((ref) => {
          const mock = ref.injector.get(HttpTestingController) as HttpTestingController;
          const http = ref.injector.get(HttpClient);
          ref.injector.get(NgZone).run(() => {
            http.get<string>('http://localhost/testing').subscribe((body: string) => {
              NgZone.assertInAngularZone();
              expect(body).toEqual('success!');
            });
            mock.expectOne('http://localhost/testing').flush('success!');
          });
        });
      });

      describe(`given 'url' is provided in 'INITIAL_CONFIG'`, () => {
        let mock: HttpTestingController;
        let ref: NgModuleRef<HttpInterceptorExampleModule>;
        let http: HttpClient;

        beforeEach(async () => {
          const platform = platformServer([
            {
              provide: INITIAL_CONFIG,
              useValue: {document: '<app></app>', url: 'http://localhost:4000/foo'},
            },
          ]);

          ref = await platform.bootstrapModule(HttpInterceptorExampleModule);
          mock = ref.injector.get(HttpTestingController);
          http = ref.injector.get(HttpClient);
        });

        it('should resolve relative request URLs to absolute', async () => {
          ref.injector.get(NgZone).run(() => {
            http.get('/testing').subscribe((body) => {
              NgZone.assertInAngularZone();
              expect(body).toEqual('success!');
            });
            mock.expectOne('http://localhost:4000/testing').flush('success!');
          });
        });

        it(`should not replace the baseUrl of a request when it's absolute`, async () => {
          ref.injector.get(NgZone).run(() => {
            http.get('http://localhost/testing').subscribe((body) => {
              NgZone.assertInAngularZone();
              expect(body).toEqual('success!');
            });
            mock.expectOne('http://localhost/testing').flush('success!');
          });
        });
      });
    });
  });
})();
