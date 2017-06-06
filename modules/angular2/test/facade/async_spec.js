import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'angular2/test_lib';

import {PromiseWrapper} from 'angular2/src/facade/async';

export function main() {
  ddescribe('PromiseWrapper', () => {
    it('should report uncaught error in Promises', () => {
      PromiseWrapper.reject('error');
    });

    it('should work in the same in JS and Dart', (done) => {
      var rejected = PromiseWrapper.reject('error');

      // rejected.then(function(_) { ... }); would produce the same result, ie fail in Dart only
      PromiseWrapper.then(rejected,
        function(_) { return 'resolved'; },
        null
      );

      PromiseWrapper.then(rejected,
        function(_) {
          throw 'failure: error expected';
        },
        function(e) {
          expect(e).toEqual('error');
          done();
        }
      );
    });
 });
}
