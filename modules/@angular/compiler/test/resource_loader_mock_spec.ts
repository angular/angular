/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockResourceLoader} from '@angular/compiler/testing/resource_loader_mock';
import {AsyncTestCompleter, beforeEach, describe, expect, inject, it} from '@angular/core/testing/testing_internal';
import {isPresent} from '../src/facade/lang';

export function main() {
  describe('MockResourceLoader', () => {
    var resourceLoader: MockResourceLoader;

    beforeEach(() => { resourceLoader = new MockResourceLoader(); });

    function expectResponse(
        request: Promise<string>, url: string, response: string, done: () => void = null) {
      function onResponse(text: string): string {
        if (response === null) {
          throw `Unexpected response ${url} -> ${text}`;
        } else {
          expect(text).toEqual(response);
          if (isPresent(done)) done();
        }
        return text;
      }

      function onError(error: string): string {
        if (response !== null) {
          throw `Unexpected error ${url}`;
        } else {
          expect(error).toEqual(`Failed to load ${url}`);
          if (isPresent(done)) done();
        }
        return error;
      }

      request.then(onResponse, onError);
    }

    it('should return a response from the definitions',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         var url = '/foo';
         var response = 'bar';
         resourceLoader.when(url, response);
         expectResponse(resourceLoader.get(url), url, response, () => async.done());
         resourceLoader.flush();
       }));

    it('should return an error from the definitions',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         var url = '/foo';
         var response: any /** TODO #9100 */ = null;
         resourceLoader.when(url, response);
         expectResponse(resourceLoader.get(url), url, response, () => async.done());
         resourceLoader.flush();
       }));

    it('should return a response from the expectations',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         var url = '/foo';
         var response = 'bar';
         resourceLoader.expect(url, response);
         expectResponse(resourceLoader.get(url), url, response, () => async.done());
         resourceLoader.flush();
       }));

    it('should return an error from the expectations',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         var url = '/foo';
         var response: any /** TODO #9100 */ = null;
         resourceLoader.expect(url, response);
         expectResponse(resourceLoader.get(url), url, response, () => async.done());
         resourceLoader.flush();
       }));

    it('should not reuse expectations', () => {
      var url = '/foo';
      var response = 'bar';
      resourceLoader.expect(url, response);
      resourceLoader.get(url);
      resourceLoader.get(url);
      expect(() => { resourceLoader.flush(); }).toThrowError('Unexpected request /foo');
    });

    it('should return expectations before definitions',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         var url = '/foo';
         resourceLoader.when(url, 'when');
         resourceLoader.expect(url, 'expect');
         expectResponse(resourceLoader.get(url), url, 'expect');
         expectResponse(resourceLoader.get(url), url, 'when', () => async.done());
         resourceLoader.flush();
       }));

    it('should throw when there is no definitions or expectations', () => {
      resourceLoader.get('/foo');
      expect(() => { resourceLoader.flush(); }).toThrowError('Unexpected request /foo');
    });

    it('should throw when flush is called without any pending requests', () => {
      expect(() => { resourceLoader.flush(); }).toThrowError('No pending requests to flush');
    });

    it('should throw on unsatisfied expectations', () => {
      resourceLoader.expect('/foo', 'bar');
      resourceLoader.when('/bar', 'foo');
      resourceLoader.get('/bar');
      expect(() => { resourceLoader.flush(); }).toThrowError('Unsatisfied requests: /foo');
    });
  });
}
