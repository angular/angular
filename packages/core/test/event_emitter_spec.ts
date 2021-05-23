/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {filter} from 'rxjs/operators';

import {EventEmitter} from '../src/event_emitter';

{
  describe('EventEmitter', () => {
    let emitter: EventEmitter<any>;

    beforeEach(() => {
      emitter = new EventEmitter();
    });

    it('should call the next callback', done => {
      emitter.subscribe({
        next: (value: any) => {
          expect(value).toEqual(99);
          done();
        }
      });
      emitter.emit(99);
    });

    it('should call the throw callback', done => {
      emitter.subscribe({
        next: () => {},
        error: (error: any) => {
          expect(error).toEqual('Boom');
          done();
        }
      });
      emitter.error('Boom');
    });

    it('should work when no throw callback is provided', done => {
      emitter.subscribe({
        next: () => {},
        error: (_: any) => {
          done();
        }
      });
      emitter.error('Boom');
    });

    it('should call the return callback', done => {
      emitter.subscribe({
        next: () => {},
        error: (_: any) => {},
        complete: () => {
          done();
        }
      });
      emitter.complete();
    });

    it('should subscribe to the wrapper synchronously', () => {
      let called = false;
      emitter.subscribe({
        next: (value: any) => {
          called = true;
        }
      });
      emitter.emit(99);

      expect(called).toBe(true);
    });

    it('delivers next and error events synchronously', done => {
      const log: any[] /** TODO #9100 */ = [];

      emitter.subscribe({
        next: (x: any) => {
          log.push(x);
          expect(log).toEqual([1, 2]);
        },
        error: (err: any) => {
          log.push(err);
          expect(log).toEqual([1, 2, 3, 4]);
          done();
        }
      });
      log.push(1);
      emitter.emit(2);
      log.push(3);
      emitter.error(4);
      log.push(5);
    });

    it('delivers next and complete events synchronously', () => {
      const log: any[] /** TODO #9100 */ = [];

      emitter.subscribe({
        next: (x: any) => {
          log.push(x);
          expect(log).toEqual([1, 2]);
        },
        error: null,
        complete: () => {
          log.push(4);
          expect(log).toEqual([1, 2, 3, 4]);
        }
      });
      log.push(1);
      emitter.emit(2);
      log.push(3);
      emitter.complete();
      log.push(5);
      expect(log).toEqual([1, 2, 3, 4, 5]);
    });

    it('delivers events asynchronously when forced to async mode', done => {
      const e = new EventEmitter(true);
      const log: any[] /** TODO #9100 */ = [];
      e.subscribe((x: any) => {
        log.push(x);
        expect(log).toEqual([1, 3, 2]);
        done();
      });
      log.push(1);
      e.emit(2);
      log.push(3);
    });

    it('reports whether it has subscribers', () => {
      const e = new EventEmitter(false);
      expect(e.observers.length > 0).toBe(false);
      e.subscribe({next: () => {}});
      expect(e.observers.length > 0).toBe(true);
    });

    it('remove a subscriber subscribed directly to EventEmitter', () => {
      const sub = emitter.subscribe();
      expect(emitter.observers.length).toBe(1);
      sub.unsubscribe();
      expect(emitter.observers.length).toBe(0);
    });

    it('remove a subscriber subscribed after applying operators with pipe()', () => {
      const sub = emitter.pipe(filter(() => true)).subscribe();
      expect(emitter.observers.length).toBe(1);
      sub.unsubscribe();
      expect(emitter.observers.length).toBe(0);
    });

    it('unsubscribing a subscriber invokes the dispose method', done => {
      const sub = emitter.subscribe();
      sub.add(() => done());
      sub.unsubscribe();
    });

    it('unsubscribing a subscriber after applying operators with pipe() invokes the dispose method',
       done => {
         const sub = emitter.pipe(filter(() => true)).subscribe();
         sub.add(() => done());
         sub.unsubscribe();
       });

    it('error thrown inside an Rx chain propagates to the error handler and disposes the chain',
       () => {
         let errorPropagated = false;
         emitter
             .pipe(
                 filter(() => {
                   throw new Error();
                 }),
                 )
             .subscribe(
                 () => {},
                 err => errorPropagated = true,
             );

         emitter.next(1);

         expect(errorPropagated).toBe(true);
         expect(emitter.observers.length).toBe(0);
       });

    it('error sent by EventEmitter should dispose the Rx chain and remove subscribers', () => {
      let errorPropagated = false;
      emitter.pipe(filter(() => true))
          .subscribe(
              () => {},
              err => errorPropagated = true,
          );

      emitter.error(1);

      expect(errorPropagated).toBe(true);
      expect(emitter.observers.length).toBe(0);
    });

    // TODO: vsavkin: add tests cases
    // should call dispose on the subscription if generator returns {done:true}
    // should call dispose on the subscription on throw
    // should call dispose on the subscription on return
  });
}
