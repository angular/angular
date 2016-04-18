import {Component, provide} from 'angular2/core';
import {UrlResolver, XHR} from 'angular2/compiler';
import {
  AsyncTestCompleter,
  beforeEach,
  beforeEachProviders,
  ComponentFixture,
  ddescribe,
  describe,
  expect,
  fakeAsync,
  iit,
  inject,
  it,
  TestComponentBuilder,
  tick,
  xit
} from 'angular2/testing_internal';
import {BaseException} from 'angular2/src/facade/exceptions';
import {CachedXHR} from 'angular2/src/platform/browser/xhr_cache';
import {setTemplateCache} from './xhr_cache_setter';

export function main() {
  describe('CachedXHR', () => {
    var xhr: CachedXHR;

    function createCachedXHR(): CachedXHR {
      setTemplateCache({'test.html': '<div>Hello</div>'});
      return new CachedXHR();
    }
    beforeEachProviders(() => [
      provide(UrlResolver, {useClass: TestUrlResolver}),
      provide(XHR, {useFactory: createCachedXHR})
    ]);

    it('should throw exception if $templateCache is not found', () => {
      setTemplateCache(null);
      expect(() => { xhr = new CachedXHR(); })
          .toThrowErrorWith('CachedXHR: Template cache was not found in $templateCache.');
    });

    it('should resolve the Promise with the cached file content on success',
       inject([AsyncTestCompleter], (async) => {
         setTemplateCache({'test.html': '<div>Hello</div>'});
         xhr = new CachedXHR();
         xhr.get('test.html')
             .then((text) => {
               expect(text).toEqual('<div>Hello</div>');
               async.done();
             });
       }));

    it('should reject the Promise on failure', inject([AsyncTestCompleter], (async) => {
         xhr = new CachedXHR();
         xhr.get('unknown.html')
             .then((text) => { throw new BaseException('Not expected to succeed.'); })
             .catch((error) => { async.done(); });
       }));

    it('should allow fakeAsync Tests to load components with templateUrl synchronously',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         let fixture: ComponentFixture;
         tcb.createAsync(TestComponent).then((f) => { fixture = f; });

         // This should initialize the fixture.
         tick();

         expect(fixture.debugElement.children[0].nativeElement).toHaveText('Hello');
       })));
  });
}

@Component({selector: 'test-cmp', templateUrl: 'test.html'})
class TestComponent {
}

class TestUrlResolver extends UrlResolver {
  resolve(baseUrl: string, url: string): string {
    // Don't use baseUrl to get the same URL as templateUrl.
    // This is to remove any difference between Dart and TS tests.
    return url;
  }
}
