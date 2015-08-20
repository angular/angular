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
import {BaseRequestOptions, RequestOptions} from 'http/src/base_request_options';
import {RequestMethods, RequestModesOpts} from 'http/src/enums';

export function main() {
  describe('BaseRequestOptions', () => {
    it('should create a new object when calling merge', () => {
      var options1 = new BaseRequestOptions();
      var options2 = options1.merge(new RequestOptions({method: RequestMethods.DELETE}));
      expect(options2).not.toBe(options1);
      expect(options2.method).toBe(RequestMethods.DELETE);
    });

    it('should retain previously merged values when merging again', () => {
      var options1 = new BaseRequestOptions();
      var options2 = options1.merge(new RequestOptions({method: RequestMethods.DELETE}));
      var options3 = options2.merge(new RequestOptions({mode: RequestModesOpts.NoCors}));
      expect(options3.mode).toBe(RequestModesOpts.NoCors);
      expect(options3.method).toBe(RequestMethods.DELETE);
    });
  });
}
