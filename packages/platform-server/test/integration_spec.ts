/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {animate, style, transition, trigger} from '@angular/animations';
import {APP_BASE_HREF, PlatformLocation, isPlatformServer} from '@angular/common';
import {ApplicationRef, CompilerFactory, Component, HostListener, Input, NgModule, NgModuleRef, NgZone, PLATFORM_ID, PlatformRef, ViewEncapsulation, destroyPlatform, getPlatform} from '@angular/core';
import {TestBed, async, inject} from '@angular/core/testing';
import {Http, HttpModule, Response, ResponseOptions, XHRBackend} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';
import {BrowserModule, DOCUMENT, Title} from '@angular/platform-browser';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {INITIAL_CONFIG, PlatformState, ServerModule, platformDynamicServer, renderModule, renderModuleFactory} from '@angular/platform-server';
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
           expect((<any>doc)._window).toEqual({});

           expect(getDOM().getText(doc)).toEqual('Works!');

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
           expect(getDOM().getText(doc)).toEqual('Works!');
           platform.destroy();
         });

         platform2.bootstrapModule(ExampleModule2).then((moduleRef) => {
           const doc = moduleRef.injector.get(DOCUMENT);
           expect(getDOM().getText(doc)).toEqual('Works too!');
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
           expect(img.attribs['src']).toEqual('link');
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
          '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER">Works!<h1 innerText="fine">fine</h1></app></body></html>';

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
             expect(output).toBe(
                 '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER">' +
                 '<div>Works!</div></app></body></html>');
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
           renderModule(FalseAttributesModule, {document: doc}).then((output) => {
             expect(output).toBe(
                 '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER">' +
                 '<my-child ng-reflect-attr="false">Works!</my-child></app></body></html>');
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
  });
}
