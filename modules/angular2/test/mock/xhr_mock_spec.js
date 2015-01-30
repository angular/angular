import {describe, beforeEach, it, expect, ddescribe, iit, el, IS_DARTIUM} from 'angular2/test_lib';
import {XHRMock} from 'angular2/src/mock/xhr_mock';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {isPresent} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';

export function main() {
  describe('XHRMock', () => {
    var xhr;

    beforeEach(() => {
      xhr = new XHRMock();
    });

    function expectResponse(request: Promise, url: string, response: string, done = null) {
      function onResponse(text: string) {
        if (response === null) {
          throw `Unexpected response ${url} -> ${text}`;
        } else {
          expect(text).toEqual(response);
          if (isPresent(done)) done();
        }
      }

      function onError(error: string) {
        if (response !== null) {
          throw `Unexpected error ${url}`;
        } else {
          expect(error).toEqual(`Failed to load ${url}`);
          if (isPresent(done)) done();
        }
      }

      PromiseWrapper.then(request, onResponse, onError);
    }

    it('should return a response from the definitions', (done) => {
      var url = '/foo';
      var response = 'bar';
      xhr.when(url, response);
      expectResponse(xhr.get(url), url, response, done);
      xhr.flush();
    });

    it('should return an error from the definitions', (done) => {
      var url = '/foo';
      var response = null;
      xhr.when(url, response);
      expectResponse(xhr.get(url), url, response, done);
      xhr.flush();
    });

    it('should return a response from the expectations', (done) => {
      var url = '/foo';
      var response = 'bar';
      xhr.expect(url, response);
      expectResponse(xhr.get(url), url, response, done);
      xhr.flush();
    });

    it('should return an error from the expectations', (done) => {
      var url = '/foo';
      var response = null;
      xhr.expect(url, response);
      expectResponse(xhr.get(url), url, response, done);
      xhr.flush();
    });

    it('should not reuse expectations', () => {
      var url = '/foo';
      var response = 'bar';
      xhr.expect(url, response);
      xhr.get(url);
      xhr.get(url);
      expect(() => {
        xhr.flush();
      }).toThrowError('Unexpected request /foo');
    });

    it('should return expectations before definitions', (done) => {
      var url = '/foo';
      xhr.when(url, 'when');
      xhr.expect(url, 'expect');
      expectResponse(xhr.get(url), url, 'expect');
      expectResponse(xhr.get(url), url, 'when', done);
      xhr.flush();
    });

    it('should throw when there is no definitions or expectations', () => {
      xhr.get('/foo');
      expect(() => {
        xhr.flush();
      }).toThrowError('Unexpected request /foo');
    });

    it('should throw when flush is called without any pending requests', () => {
      expect(() => {
        xhr.flush();
      }).toThrowError('No pending requests to flush');
    });

    it('should throw on unstatisfied expectations', () => {
      xhr.expect('/foo', 'bar');
      xhr.when('/bar', 'foo');
      xhr.get('/bar');
      expect(() => {
        xhr.flush();
      }).toThrowError('Unsatisfied requests: /foo');
    });
  });
}
