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
import {URLSearchParams} from 'angular2/src/http/url_search_params';

export function main() {
  describe('URLSearchParams', () => {
    it('should conform to spec', () => {
      var paramsString = "q=URLUtils.searchParams&topic=api";
      var searchParams = new URLSearchParams(paramsString);

      // Tests borrowed from example at
      // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
      // Compliant with spec described at https://url.spec.whatwg.org/#urlsearchparams
      expect(searchParams.has("topic")).toBe(true);
      expect(searchParams.has("foo")).toBe(false);
      expect(searchParams.get("topic")).toBe("api");
      expect(searchParams.getAll("topic")).toEqual(["api"]);
      expect(searchParams.get("foo")).toBe(null);
      searchParams.append("topic", "webdev");
      expect(searchParams.getAll("topic")).toEqual(["api", "webdev"]);
      expect(searchParams.toString()).toBe("q=URLUtils.searchParams&topic=api&topic=webdev");
      searchParams.delete("topic");
      expect(searchParams.toString()).toBe("q=URLUtils.searchParams");
    });
  });
}
