import {
  AsyncTestCompleter,
  describe,
  it,
  iit,
  ddescribe,
  expect,
  inject,
  beforeEach,
  SpyObject
} from 'angular2/testing_internal';

import {GeneratedUrlSegment} from 'angular2/src/router/rules/recognizer';
import {RegexRecognizer} from 'angular2/src/router/rules/regex_recognizer';
import {parser, Url} from 'angular2/src/router/rules/url_parser';

export function main() {
  describe('RegexRecognizer', () => {

    it('should throw when given an invalid regex', () => {
      expect(() => new RegexRecognizer('[abc', emptySerializer))
          .toThrowError('Invalid regular expression: /[abc/: Unterminated character class');
    });

    it('should parse a single param using capture groups', () => {
      var rec = new RegexRecognizer('^(.+)$', emptySerializer);
      var url = parser.parse('hello');
      var match = rec.recognize(url);
      expect(match.allParams).toEqual({ '0': 'hello', '1': 'hello' });
    });

    it('should parse multiple params using capture groups', () => {
      var rec = new RegexRecognizer('^(.+)\\.(.+)$', emptySerializer);
      var url = parser.parse('hello.goodbye');
      var match = rec.recognize(url);
      expect(match.allParams).toEqual({ '0': 'hello.goodbye', '1': 'hello', '2': 'goodbye' });
    });

    function emptySerializer(params) {
      return new GeneratedUrlSegment('', []);
    }
  });
}
