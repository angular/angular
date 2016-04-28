import {
  describe,
  it,
  expect,
  beforeEach,
  ddescribe,
  iit,
  xit,
  el,
  SpyObject,
  AsyncTestCompleter,
  inject
} from 'angular2/testing_internal';

import {Observable, Subject, EventEmitter, PromiseWrapper} from 'angular2/src/facade/async';

export function main() {
  describe("Observable", () => {
    describe("#core", () => {

      it("should call next with values", inject([AsyncTestCompleter], (async) => {

           let o = new Observable(sink => { sink.next(1); });

           o.subscribe(v => {
             expect(v).toEqual(1);
             async.done();
           });

         }));

      it("should call next and then complete", inject([AsyncTestCompleter], (async) => {

           let o = new Observable(sink => {
             sink.next(1);
             sink.complete();
           });
           let nexted = false;

           o.subscribe(v => { nexted = true; }, null, () => {
             expect(nexted).toBe(true);
             async.done();
           });

         }));

      it("should call error with errors", inject([AsyncTestCompleter], (async) => {

           let o = new Observable(sink => { sink.error('oh noes!'); });

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
}
