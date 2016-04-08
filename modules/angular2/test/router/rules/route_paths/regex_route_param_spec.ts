import {AsyncTestCompleter, describe, it, iit, ddescribe, expect, inject, beforeEach, SpyObject} from 'angular2/testing_internal';

import {GeneratedUrl} from 'angular2/src/router/rules/route_paths/route_path';
import {RegexRoutePath} from 'angular2/src/router/rules/route_paths/regex_route_path';
import {parser, Url} from 'angular2/src/router/url_parser';

function emptySerializer(params) {
  return new GeneratedUrl('', {});
}

export function main() {
  describe('RegexRoutePath', () => {

    it('should throw when given an invalid regex',
       () => { expect(() => new RegexRoutePath('[abc', emptySerializer)).toThrowError(); });

    it('should parse a single param using capture groups', () => {
      var rec = new RegexRoutePath('^(.+)$', emptySerializer);
      var url = parser.parse('hello');
      var match = rec.matchUrl(url);
      expect(match.allParams).toEqual({'0': 'hello', '1': 'hello'});
    });

    it('should parse multiple params using capture groups', () => {
      var rec = new RegexRoutePath('^(.+)\\.(.+)$', emptySerializer);
      var url = parser.parse('hello.goodbye');
      var match = rec.matchUrl(url);
      expect(match.allParams).toEqual({'0': 'hello.goodbye', '1': 'hello', '2': 'goodbye'});
    });

    it('should generate a url by calling the provided serializer', () => {
      function serializer(params) {
        return new GeneratedUrl(`/a/${params['a']}/b/${params['b']}`, {});
      }
      var rec = new RegexRoutePath('/a/(.+)/b/(.+)$', serializer);
      var params = {a: 'one', b: 'two'};
      var url = rec.generateUrl(params);
      expect(url.urlPath).toEqual('/a/one/b/two');
    });
  });
}
