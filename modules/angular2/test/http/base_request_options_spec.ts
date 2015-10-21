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
} from 'angular2/testing_internal';
import {BaseRequestOptions, RequestOptions} from 'angular2/src/http/base_request_options';
import {RequestMethods} from 'angular2/src/http/enums';

export function main() {
  describe('BaseRequestOptions', () => {
    it('should create a new object when calling merge', () => {
      var options1 = new BaseRequestOptions();
      var options2 = options1.merge(new RequestOptions({method: RequestMethods.Delete}));
      expect(options2).not.toBe(options1);
      expect(options2.method).toBe(RequestMethods.Delete);
    });

    it('should retain previously merged values when merging again', () => {
      var options1 = new BaseRequestOptions();
      var options2 = options1.merge(new RequestOptions({method: RequestMethods.Delete}));
      expect(options2.method).toBe(RequestMethods.Delete);
    });
  });
}
