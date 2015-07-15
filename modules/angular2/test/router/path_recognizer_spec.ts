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
} from 'angular2/test_lib';

import {PathRecognizer} from 'angular2/src/router/path_recognizer';
import {SyncRouteHandler} from 'angular2/src/router/sync_route_handler';

class DummyClass {
  constructor() {}
}

var mockRouteHandler = new SyncRouteHandler(DummyClass);

export function main() {
  describe('PathRecognizer', () => {
    describe('matrix params', () => {
      it('should recognize a trailing matrix value on a path value and assign it to the params return value',
         () => {
           var rec = new PathRecognizer('/hello/:id', mockRouteHandler);
           var params = rec.parseParams('/hello/matias;key=value');

           expect(params['id']).toEqual('matias');
           expect(params['key']).toEqual('value');
         });

      it('should recognize and parse multiple matrix params separated by a colon value', () => {
        var rec = new PathRecognizer('/jello/:sid', mockRouteHandler);
        var params = rec.parseParams('/jello/man;color=red;height=20');

        expect(params['sid']).toEqual('man');
        expect(params['color']).toEqual('red');
        expect(params['height']).toEqual('20');
      });

      it('should recognize a matrix param value on a static path value', () => {
        var rec = new PathRecognizer('/static/man', mockRouteHandler);
        var params = rec.parseParams('/static/man;name=dave');
        expect(params['name']).toEqual('dave');
      });

      it('should not parse matrix params when a wildcard segment is used', () => {
        var rec = new PathRecognizer('/wild/*everything', mockRouteHandler);
        var params = rec.parseParams('/wild/super;variable=value');
        expect(params['everything']).toEqual('super;variable=value');
      });

      it('should set matrix param values to true when no value is present within the path string',
         () => {
           var rec = new PathRecognizer('/path', mockRouteHandler);
           var params = rec.parseParams('/path;one;two;three=3');
           expect(params['one']).toEqual(true);
           expect(params['two']).toEqual(true);
           expect(params['three']).toEqual('3');
         });

      it('should ignore earlier instances of matrix params and only consider the ones at the end of the path',
         () => {
           var rec = new PathRecognizer('/one/two/three', mockRouteHandler);
           var params = rec.parseParams('/one;a=1/two;b=2/three;c=3');
           expect(params).toEqual({'c': '3'});
         });
    });
  });
}
