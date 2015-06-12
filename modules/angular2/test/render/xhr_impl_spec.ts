import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit
} from 'angular2/test_lib';

import {XHRImpl} from 'angular2/src/render/xhr_impl';
import {PromiseWrapper} from 'angular2/src/facade/async';

export function main() {
  describe('XHRImpl', () => {
    var xhr: XHRImpl;
    var url200 = '/base/modules/angular2/test/services/static_assets/200.html';
    var url404 = '/base/modules/angular2/test/services/static_assets/404.html';

    beforeEach(() => { xhr = new XHRImpl(); });

    it('should resolve the Promise with the file content on success',
       inject([AsyncTestCompleter], (async) => {
         xhr.get(url200).then((text) => {
           expect(text.trim()).toEqual('<p>hey</p>');
           async.done();
         });
       }));

    it('should reject the Promise on failure', inject([AsyncTestCompleter], (async) => {
         PromiseWrapper.catchError(xhr.get(url404), (e) => {
           expect(e).toEqual(`Failed to load ${url404}`);
           async.done();
           return null;
         });
       }));
  });
}
