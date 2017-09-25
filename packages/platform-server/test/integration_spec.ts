/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationBuilder, animate, style, transition, trigger} from '@angular/animations';
import {APP_BASE_HREF, PlatformLocation, isPlatformServer} from '@angular/common';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {ApplicationRef, CompilerFactory, Component, HostListener, Input, NgModule, NgModuleRef, NgZone, PLATFORM_ID, PlatformRef, ViewEncapsulation, destroyPlatform, getPlatform} from '@angular/core';
import {TestBed, async, inject} from '@angular/core/testing';
import {Http, HttpModule, Response, ResponseOptions, XHRBackend} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';
import {BrowserModule, DOCUMENT, StateKey, Title, TransferState, makeStateKey} from '@angular/platform-browser';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {BEFORE_APP_SERIALIZED, INITIAL_CONFIG, PlatformState, ServerModule, ServerTransferStateModule, platformDynamicServer, renderModule, renderModuleFactory} from '@angular/platform-server';
import {Subscription} from 'rxjs/Subscription';
import {filter} from 'rxjs/operator/filter';
import {first} from 'rxjs/operator/first';
import {toPromise} from 'rxjs/operator/toPromise';

@Component({selector: 'app', template: `Works!`})
class MyServerApp {
}

@NgModule({
  bootstrap: [MyServerApp],
  declarations: [MyServerApp],
  imports: [ServerModule],
  providers: [
    MockBackend,
    {provide: XHRBackend, useExisting: MockBackend},
  ]
})
class ExampleModule {
}

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

@NgModule({
  bootstrap: [MyServerApp],
  declarations: [MyServerApp],
  imports: [BrowserModule.withServerTransition({appId: 'render-hook'}), ServerModule],
  providers: [
    {provide: BEFORE_APP_SERIALIZED, useFactory: getTitleRenderHook, multi: true, deps: [DOCUMENT]},
  ]
})
class RenderHookModule {
}

@NgModule({
  bootstrap: [MyServerApp],
  declarations: [MyServerApp],
  imports: [BrowserModule.withServerTransition({appId: 'render-hook'}), ServerModule],
  providers: [
    {provide: BEFORE_APP_SERIALIZED, useFactory: getTitleRenderHook, multi: true, deps: [DOCUMENT]},
    {provide: BEFORE_APP_SERIALIZED, useValue: exceptionRenderHook, multi: true},
    {provide: BEFORE_APP_SERIALIZED, useFactory: getMetaRenderHook, multi: true, deps: [DOCUMENT]},
  ]
})
class MultiRenderHookModule {
}

@Component({selector: 'app', template: `Works too!`})
class MyServerApp2 {
}

@NgModule({declarations: [MyServerApp2], imports: [ServerModule], bootstrap: [MyServerApp2]})
class ExampleModule2 {
}

@Component({selector: 'app', template: ``})
class TitleApp {
  constructor(private title: Title) {}
  ngOnInit() { this.title.setTitle('Test App Title'); }
}

@NgModule({declarations: [TitleApp], imports: [ServerModule], bootstrap: [TitleApp]})
class TitleAppModule {
}

@Component({selector: 'app', template: '{{text}}<h1 [innerText]="h1"></h1>'})
class MyAsyncServerApp {
  text = '';
  h1 = '';

  @HostListener('window:scroll')
  track() { console.error('scroll'); }

  ngOnInit() {
    Promise.resolve(null).then(() => setTimeout(() => {
                                 this.text = 'Works!';
                                 this.h1 = 'fine';
                               }, 10));
  }
}

@NgModule({
  declarations: [MyAsyncServerApp],
  imports: [BrowserModule.withServerTransition({appId: 'async-server'}), ServerModule],
  bootstrap: [MyAsyncServerApp]
})
class AsyncServerModule {
}

@Component({selector: 'app', template: '<svg><use xlink:href="#clear"></use></svg>'})
class SVGComponent {
}

@NgModule({
  declarations: [SVGComponent],
  imports: [BrowserModule.withServerTransition({appId: 'svg-server'}), ServerModule],
  bootstrap: [SVGComponent]
})
class SVGServerModule {
}

@Component({
  selector: 'app',
  template: '<div @myAnimation>{{text}}</div>',
  animations: [trigger(
      'myAnimation',
      [transition('void => *', [style({'opacity': '0'}), animate(500, style({'opacity': '1'}))])])],
})
class MyAnimationApp {
  constructor(private builder: AnimationBuilder) {}

  text = 'Works!';
}

@NgModule({
  declarations: [MyAnimationApp],
  imports: [BrowserModule.withServerTransition({appId: 'anim-server'}), ServerModule],
  bootstrap: [MyAnimationApp]
})
class AnimationServerModule {
}

@Component({selector: 'app', template: `Works!`, styles: [':host { color: red; }']})
class MyStylesApp {
}

@NgModule({
  declarations: [MyStylesApp],
  imports: [BrowserModule.withServerTransition({appId: 'example-styles'}), ServerModule],
  bootstrap: [MyStylesApp]
})
class ExampleStylesModule {
}

@NgModule({
  bootstrap: [MyServerApp],
  declarations: [MyServerApp],
  imports: [HttpModule, ServerModule],
  providers: [
    MockBackend,
    {provide: XHRBackend, useExisting: MockBackend},
  ]
})
export class HttpBeforeExampleModule {
}

@NgModule({
  bootstrap: [MyServerApp],
  declarations: [MyServerApp],
  imports: [ServerModule, HttpModule],
  providers: [
    MockBackend,
    {provide: XHRBackend, useExisting: MockBackend},
  ]
})
export class HttpAfterExampleModule {
}

@NgModule({
  bootstrap: [MyServerApp],
  declarations: [MyServerApp],
  imports: [ServerModule, HttpClientModule, HttpClientTestingModule],
})
export class HttpClientExmapleModule {
}

@Component({selector: 'app', template: `<img [src]="'link'">`})
class ImageApp {
}

@NgModule({declarations: [ImageApp], imports: [ServerModule], bootstrap: [ImageApp]})
class ImageExampleModule {
}

@Component({
  selector: 'app',
  template: 'Native works',
  encapsulation: ViewEncapsulation.Native,
  styles: [':host { color: red; }']
})
class NativeEncapsulationApp {
}

@NgModule({
  declarations: [NativeEncapsulationApp],
  imports: [BrowserModule.withServerTransition({appId: 'test'}), ServerModule],
  bootstrap: [NativeEncapsulationApp]
})
class NativeExampleModule {
}

@Component({selector: 'my-child', template: 'Works!'})
class MyChildComponent {
  @Input() public attr: boolean;
}

@Component({selector: 'app', template: '<my-child [attr]="false"></my-child>'})
class MyHostComponent {
}

@NgModule({
  declarations: [MyHostComponent, MyChildComponent],
  bootstrap: [MyHostComponent],
  imports: [ServerModule, BrowserModule.withServerTransition({appId: 'false-attributes'})]
})
class FalseAttributesModule {
}

@Component({selector: 'app', template: '<input [name]="name">'})
class MyInputComponent {
  @Input()
  name = '';
}

@NgModule({
  declarations: [MyInputComponent],
  bootstrap: [MyInputComponent],
  imports: [ServerModule, BrowserModule.withServerTransition({appId: 'name-attributes'})]
})
class NameModule {
}

const TEST_KEY = makeStateKey<number>('test');
const STRING_KEY = makeStateKey<string>('testString');

@Component({selector: 'app', template: 'Works!'})
class TransferComponent {
  constructor(private transferStore: TransferState) {}
  ngOnInit() { this.transferStore.set(TEST_KEY, 10); }
}

@Component({selector: 'esc-app', template: 'Works!'})
class EscapedComponent {
  constructor(private transferStore: TransferState) {}
  ngOnInit() {
    this.transferStore.set(STRING_KEY, '</script><script>alert(\'Hello&\' + "World");');
  }
}

@NgModule({
  bootstrap: [TransferComponent],
  declarations: [TransferComponent],
  imports: [
    BrowserModule.withServerTransition({appId: 'transfer'}),
    ServerModule,
    ServerTransferStateModule,
  ]
})
class TransferStoreModule {
}

@NgModule({
  bootstrap: [EscapedComponent],
  declarations: [EscapedComponent],
  imports: [
    BrowserModule.withServerTransition({appId: 'transfer'}),
    ServerModule,
    ServerTransferStateModule,
  ]
})
class EscapedTransferStoreModule {
}

export function main() {
  if (getDOM().supportsDOMEvents()) return;  // NODE only

  describe('platform-server integration', () => {
    beforeEach(() => {
      if (getPlatform()) destroyPlatform();
    });

    it('should bootstrap', async(() => {
         const platform = platformDynamicServer(
             [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);

         platform.bootstrapModule(ExampleModule).then((moduleRef) => {
           expect(isPlatformServer(moduleRef.injector.get(PLATFORM_ID))).toBe(true);
           const doc = moduleRef.injector.get(DOCUMENT);

           expect(doc.head).toBe(getDOM().querySelector(doc, 'head'));
           expect(doc.body).toBe(getDOM().querySelector(doc, 'body'));

           expect(getDOM().getText(doc.documentElement)).toEqual('Works!');

           platform.destroy();
         });
       }));

    it('should allow multiple platform instances', async(() => {
         const platform = platformDynamicServer(
             [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);

         const platform2 = platformDynamicServer(
             [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);


         platform.bootstrapModule(ExampleModule).then((moduleRef) => {
           const doc = moduleRef.injector.get(DOCUMENT);
           expect(getDOM().getText(doc.documentElement)).toEqual('Works!');
           platform.destroy();
         });

         platform2.bootstrapModule(ExampleModule2).then((moduleRef) => {
           const doc = moduleRef.injector.get(DOCUMENT);
           expect(getDOM().getText(doc.documentElement)).toEqual('Works too!');
           platform2.destroy();
         });
       }));

    it('adds title to the document using Title service', async(() => {
         const platform = platformDynamicServer([{
           provide: INITIAL_CONFIG,
           useValue:
               {document: '<html><head><title></title></head><body><app></app></body></html>'}
         }]);
         platform.bootstrapModule(TitleAppModule).then(ref => {
           const state = ref.injector.get(PlatformState);
           const doc = ref.injector.get(DOCUMENT);
           const title = getDOM().querySelector(doc, 'title');
           expect(getDOM().getText(title)).toBe('Test App Title');
           expect(state.renderToString()).toContain('<title>Test App Title</title>');
         });
       }));

    it('should get base href from document', async(() => {
         const platform = platformDynamicServer([{
           provide: INITIAL_CONFIG,
           useValue:
               {document: '<html><head><base href="/"></head><body><app></app></body></html>'}
         }]);
         platform.bootstrapModule(ExampleModule).then((moduleRef) => {
           const location = moduleRef.injector.get(PlatformLocation);
           expect(location.getBaseHrefFromDOM()).toEqual('/');
           platform.destroy();
         });
       }));

    it('adds styles with ng-transition attribute', async(() => {
         const platform = platformDynamicServer([{
           provide: INITIAL_CONFIG,
           useValue: {document: '<html><head></head><body><app></app></body></html>'}
         }]);
         platform.bootstrapModule(ExampleStylesModule).then(ref => {
           const doc = ref.injector.get(DOCUMENT);
           const head = getDOM().getElementsByTagName(doc, 'head')[0];
           const styles: any[] = head.children as any;
           expect(styles.length).toBe(1);
           expect(getDOM().getText(styles[0])).toContain('color: red');
           expect(getDOM().getAttribute(styles[0], 'ng-transition')).toBe('example-styles');
         });
       }));

    it('copies known properties to attributes', async(() => {
         const platform = platformDynamicServer(
             [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
         platform.bootstrapModule(ImageExampleModule).then(ref => {
           const appRef: ApplicationRef = ref.injector.get(ApplicationRef);
           const app = appRef.components[0].location.nativeElement;
           const img = getDOM().getElementsByTagName(app, 'img')[0] as any;
           expect(img.attributes['src'].value).toEqual('link');
         });
       }));

    describe('PlatformLocation', () => {
      it('is injectable', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(ExampleModule).then(appRef => {
             const location: PlatformLocation = appRef.injector.get(PlatformLocation);
             expect(location.pathname).toBe('/');
             platform.destroy();
           });
         }));
      it('is configurable via INITIAL_CONFIG', () => {
        platformDynamicServer([{
          provide: INITIAL_CONFIG,
          useValue: {document: '<app></app>', url: 'http://test.com/deep/path?query#hash'}
        }])
            .bootstrapModule(ExampleModule)
            .then(appRef => {
              const location: PlatformLocation = appRef.injector.get(PlatformLocation);
              expect(location.pathname).toBe('/deep/path');
              expect(location.search).toBe('?query');
              expect(location.hash).toBe('#hash');
            });
      });
      it('handles empty search and hash portions of the url', () => {
        platformDynamicServer([{
          provide: INITIAL_CONFIG,
          useValue: {document: '<app></app>', url: 'http://test.com/deep/path'}
        }])
            .bootstrapModule(ExampleModule)
            .then(appRef => {
              const location: PlatformLocation = appRef.injector.get(PlatformLocation);
              expect(location.pathname).toBe('/deep/path');
              expect(location.search).toBe('');
              expect(location.hash).toBe('');
            });
      });
      it('pushState causes the URL to update', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(ExampleModule).then(appRef => {
             const location: PlatformLocation = appRef.injector.get(PlatformLocation);
             location.pushState(null, 'Test', '/foo#bar');
             expect(location.pathname).toBe('/foo');
             expect(location.hash).toBe('#bar');
             platform.destroy();
           });
         }));
      it('allows subscription to the hash state', done => {
        const platform =
            platformDynamicServer([{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
        platform.bootstrapModule(ExampleModule).then(appRef => {
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
      let called: boolean;
      let expectedOutput =
          '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER">Works!<h1 innertext="fine">fine</h1></app></body></html>';

      beforeEach(() => {
        // PlatformConfig takes in a parsed document so that it can be cached across requests.
        doc = '<html><head></head><body><app></app></body></html>';
        called = false;
      });
      afterEach(() => { expect(called).toBe(true); });

      it('using long from should work', async(() => {
           const platform =
               platformDynamicServer([{provide: INITIAL_CONFIG, useValue: {document: doc}}]);

           platform.bootstrapModule(AsyncServerModule)
               .then((moduleRef) => {
                 const applicationRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);
                 return toPromise.call(first.call(
                     filter.call(applicationRef.isStable, (isStable: boolean) => isStable)));
               })
               .then((b) => {
                 expect(platform.injector.get(PlatformState).renderToString()).toBe(expectedOutput);
                 platform.destroy();
                 called = true;
               });
         }));

      it('using renderModule should work', async(() => {
           renderModule(AsyncServerModule, {document: doc}).then(output => {
             expect(output).toBe(expectedOutput);
             called = true;
           });
         }));

      it('using renderModuleFactory should work',
         async(inject([PlatformRef], (defaultPlatform: PlatformRef) => {
           const compilerFactory: CompilerFactory =
               defaultPlatform.injector.get(CompilerFactory, null);
           const moduleFactory =
               compilerFactory.createCompiler().compileModuleSync(AsyncServerModule);
           renderModuleFactory(moduleFactory, {document: doc}).then(output => {
             expect(output).toBe(expectedOutput);
             called = true;
           });
         })));

      it('works with SVG elements', async(() => {
           renderModule(SVGServerModule, {document: doc}).then(output => {
             expect(output).toBe(
                 '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER">' +
                 '<svg><use xlink:href="#clear"></use></svg></app></body></html>');
             called = true;
           });
         }));

      it('works with animation', async(() => {
           renderModule(AnimationServerModule, {document: doc}).then(output => {
             expect(output).toContain('Works!');
             expect(output).toContain('ng-trigger-myAnimation');
             called = true;
           });
         }));

      it('should handle ViewEncapsulation.Native', async(() => {
           renderModule(NativeExampleModule, {document: doc}).then(output => {
             expect(output).not.toBe('');
             expect(output).toContain('color: red');
             called = true;
           });
         }));

      it('should handle false values on attributes', async(() => {
           renderModule(FalseAttributesModule, {document: doc}).then(output => {
             expect(output).toBe(
                 '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER">' +
                 '<my-child ng-reflect-attr="false">Works!</my-child></app></body></html>');
             called = true;
           });
         }));

      it('should handle element property "name"', async(() => {
           renderModule(NameModule, {document: doc}).then(output => {
             expect(output).toBe(
                 '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER">' +
                 '<input name=""></app></body></html>');
             called = true;
           });
         }));

      it('should call render hook', async(() => {
           renderModule(RenderHookModule, {document: doc}).then(output => {
             // title should be added by the render hook.
             expect(output).toBe(
                 '<html><head><title>RenderHook</title></head><body>' +
                 '<app ng-version="0.0.0-PLACEHOLDER">Works!</app></body></html>');
             called = true;
           });
         }));

      it('should call mutliple render hooks', async(() => {
           const consoleSpy = spyOn(console, 'warn');
           renderModule(MultiRenderHookModule, {document: doc}).then(output => {
             // title should be added by the render hook.
             expect(output).toBe(
                 '<html><head><title>RenderHook</title><meta name="description"></head>' +
                 '<body><app ng-version="0.0.0-PLACEHOLDER">Works!</app></body></html>');
             expect(consoleSpy).toHaveBeenCalled();
             called = true;
           });
         }));
    });

    describe('http', () => {
      it('can inject Http', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(ExampleModule).then(ref => {
             expect(ref.injector.get(Http) instanceof Http).toBeTruthy();
           });
         }));
      it('can make Http requests', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(ExampleModule).then(ref => {
             const mock = ref.injector.get(MockBackend);
             const http = ref.injector.get(Http);
             ref.injector.get(NgZone).run(() => {
               NgZone.assertInAngularZone();
               mock.connections.subscribe((mc: MockConnection) => {
                 NgZone.assertInAngularZone();
                 expect(mc.request.url).toBe('http://localhost/testing');
                 mc.mockRespond(new Response(new ResponseOptions({body: 'success!', status: 200})));
               });
               http.get('http://localhost/testing').subscribe(resp => {
                 NgZone.assertInAngularZone();
                 expect(resp.text()).toBe('success!');
               });
             });
           });
         }));
      it('requests are macrotasks', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(ExampleModule).then(ref => {
             const mock = ref.injector.get(MockBackend);
             const http = ref.injector.get(Http);
             expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeFalsy();
             ref.injector.get(NgZone).run(() => {
               NgZone.assertInAngularZone();
               mock.connections.subscribe((mc: MockConnection) => {
                 expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeTruthy();
                 mc.mockRespond(new Response(new ResponseOptions({body: 'success!', status: 200})));
               });
               http.get('http://localhost/testing').subscribe(resp => {
                 expect(resp.text()).toBe('success!');
               });
             });
           });
         }));
      it('works when HttpModule is included before ServerModule', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(HttpBeforeExampleModule).then(ref => {
             const mock = ref.injector.get(MockBackend);
             const http = ref.injector.get(Http);
             expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeFalsy();
             ref.injector.get(NgZone).run(() => {
               NgZone.assertInAngularZone();
               mock.connections.subscribe((mc: MockConnection) => {
                 expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeTruthy();
                 mc.mockRespond(new Response(new ResponseOptions({body: 'success!', status: 200})));
               });
               http.get('http://localhost/testing').subscribe(resp => {
                 expect(resp.text()).toBe('success!');
               });
             });
           });
         }));
      it('works when HttpModule is included after ServerModule', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(HttpAfterExampleModule).then(ref => {
             const mock = ref.injector.get(MockBackend);
             const http = ref.injector.get(Http);
             expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeFalsy();
             ref.injector.get(NgZone).run(() => {
               NgZone.assertInAngularZone();
               mock.connections.subscribe((mc: MockConnection) => {
                 expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeTruthy();
                 mc.mockRespond(new Response(new ResponseOptions({body: 'success!', status: 200})));
               });
               http.get('http://localhost/testing').subscribe(resp => {
                 expect(resp.text()).toBe('success!');
               });
             });
           });
         }));
      it('throws when given a relative URL', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(ExampleModule).then(ref => {
             const http = ref.injector.get(Http);
             expect(() => http.get('/testing'))
                 .toThrowError(
                     'URLs requested via Http on the server must be absolute. URL: /testing');
           });
         }));
    });
    describe('HttpClient', () => {
      it('can inject HttpClient', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(HttpClientExmapleModule).then(ref => {
             expect(ref.injector.get(HttpClient) instanceof HttpClient).toBeTruthy();
           });
         }));
      it('can make HttpClient requests', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(HttpClientExmapleModule).then(ref => {
             const mock = ref.injector.get(HttpTestingController) as HttpTestingController;
             const http = ref.injector.get(HttpClient);
             ref.injector.get(NgZone).run(() => {
               http.get('http://localhost/testing').subscribe(body => {
                 NgZone.assertInAngularZone();
                 expect(body).toEqual('success!');
               });
               mock.expectOne('http://localhost/testing').flush('success!');
             });
           });
         }));
      it('requests are macrotasks', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(HttpClientExmapleModule).then(ref => {
             const mock = ref.injector.get(HttpTestingController) as HttpTestingController;
             const http = ref.injector.get(HttpClient);
             ref.injector.get(NgZone).run(() => {
               http.get('http://localhost/testing').subscribe(body => {
                 expect(body).toEqual('success!');
               });
               expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeTruthy();
               mock.expectOne('http://localhost/testing').flush('success!');
               expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeFalsy();
             });
           });
         }));
    });

    describe('ServerTransferStoreModule', () => {
      let called = false;
      const defaultExpectedOutput =
          '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER">Works!</app><script id="transfer-state" type="application/json">{&q;test&q;:10}</script></body></html>';

      beforeEach(() => { called = false; });
      afterEach(() => { expect(called).toBe(true); });

      it('adds transfer script tag when using renderModule', async(() => {
           renderModule(TransferStoreModule, {document: '<app></app>'}).then(output => {
             expect(output).toBe(defaultExpectedOutput);
             called = true;
           });
         }));

      it('adds transfer script tag when using renderModuleFactory',
         async(inject([PlatformRef], (defaultPlatform: PlatformRef) => {
           const compilerFactory: CompilerFactory =
               defaultPlatform.injector.get(CompilerFactory, null);
           const moduleFactory =
               compilerFactory.createCompiler().compileModuleSync(TransferStoreModule);
           renderModuleFactory(moduleFactory, {document: '<app></app>'}).then(output => {
             expect(output).toBe(defaultExpectedOutput);
             called = true;
           });
         })));

      it('cannot break out of <script> tag in serialized output', async(() => {
           renderModule(EscapedTransferStoreModule, {
             document: '<esc-app></esc-app>'
           }).then(output => {
             expect(output).toBe(
                 '<html><head></head><body><esc-app ng-version="0.0.0-PLACEHOLDER">Works!</esc-app>' +
                 '<script id="transfer-state" type="application/json">' +
                 '{&q;testString&q;:&q;&l;/script&g;&l;script&g;' +
                 'alert(&s;Hello&a;&s; + \\&q;World\\&q;);&q;}</script></body></html>');
             called = true;
           });
         }));
    });
  });
}
