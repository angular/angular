import {
  describe,
  it,
  expect,
  beforeEach,
  ddescribe,
  iit,
  xit,
  inject
} from '@angular/core/testing/testing_internal';
import {AsyncTestCompleter} from '@angular/core/testing/testing_internal';

import {Observable, Subject, EventEmitter, PromiseWrapper, ObservableWrapper} from '../../src/facade/async';
import {from as mFrom} from 'most'

export function main() {
  describe("Observable", () => {
    describe("#core", () => {

      it("should call next with values", inject([AsyncTestCompleter], (async: any /** TODO #9100 */) => {

           let o = new Observable((sink: any /** TODO #9100 */) => { sink.next(1); });

           o.subscribe(v => {
             expect(v).toEqual(1);
             async.done();
           });

         }));

      it("should call next and then complete", inject([AsyncTestCompleter], (async: any /** TODO #9100 */) => {

           let o = new Observable((sink: any /** TODO #9100 */) => {
             sink.next(1);
             sink.complete();
           });
           let nexted = false;

           o.subscribe(v => { nexted = true; }, null, () => {
             expect(nexted).toBe(true);
             async.done();
           });

         }));

      it("should call error with errors", inject([AsyncTestCompleter], (async: any /** TODO #9100 */) => {

           let o = new Observable((sink: any /** TODO #9100 */) => { sink.error('oh noes!'); });

           o.subscribe(
               v => {

               },
               (err) => {
                 expect(err).toEqual('oh noes!');
                 async.done();
               });

         }));
    });
  });

  describe('Observable interop', () => {

    it('should support most.js observables', (done) => {

      let log = [];
      ObservableWrapper.subscribe(mFrom([1, 2, 3, 4]), (value) => {
        log.push(value);
      }, (err) => {}, () => {
        expect(log).toEqual([1,2,3,4]);
        done();
      });

    });


  });
}
