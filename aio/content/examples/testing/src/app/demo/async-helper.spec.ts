// tslint:disable-next-line:no-unused-variable
import {fakeAsync, tick, waitForAsync} from '@angular/core/testing';
import {interval, of} from 'rxjs';
import {delay, take} from 'rxjs/operators';

describe('Angular async helper', () => {
  describe('async', () => {
    let actuallyDone = false;

    beforeEach(() => {
      actuallyDone = false;
    });

    afterEach(() => {
      expect(actuallyDone).toBe(true, 'actuallyDone should be true');
    });

    it('should run normal test', () => {
      actuallyDone = true;
    });

    it('should run normal async test', (done: DoneFn) => {
      setTimeout(() => {
        actuallyDone = true;
        done();
      }, 0);
    });

    it('should run async test with task', waitForAsync(() => {
         setTimeout(() => {
           actuallyDone = true;
         }, 0);
       }));

    it('should run async test with task', waitForAsync(() => {
         const id = setInterval(() => {
           actuallyDone = true;
           clearInterval(id);
         }, 100);
       }));

    it('should run async test with successful promise', waitForAsync(() => {
         const p = new Promise(resolve => {
           setTimeout(resolve, 10);
         });
         p.then(() => {
           actuallyDone = true;
         });
       }));

    it('should run async test with failed promise', waitForAsync(() => {
         const p = new Promise((resolve, reject) => {
           setTimeout(reject, 10);
         });
         p.catch(() => {
           actuallyDone = true;
         });
       }));

    // Use done. Can also use async or fakeAsync.
    it('should run async test with successful delayed Observable', (done: DoneFn) => {
      const source = of(true).pipe(delay(10));
      source.subscribe(val => actuallyDone = true, err => fail(err), done);
    });

    it('should run async test with successful delayed Observable', waitForAsync(() => {
         const source = of(true).pipe(delay(10));
         source.subscribe(val => actuallyDone = true, err => fail(err));
       }));

    it('should run async test with successful delayed Observable', fakeAsync(() => {
         const source = of(true).pipe(delay(10));
         source.subscribe(val => actuallyDone = true, err => fail(err));

         tick(10);
       }));
  });

  describe('fakeAsync', () => {
    // #docregion fake-async-test-tick
    it('should run timeout callback with delay after call tick with millis', fakeAsync(() => {
         let called = false;
         setTimeout(() => {
           called = true;
         }, 100);
         tick(100);
         expect(called).toBe(true);
       }));
    // #enddocregion fake-async-test-tick

    // #docregion fake-async-test-tick-new-macro-task-sync
    it('should run new macro task callback with delay after call tick with millis',
       fakeAsync(() => {
         function nestedTimer(cb: () => any): void {
           setTimeout(() => setTimeout(() => cb()));
         }
         const callback = jasmine.createSpy('callback');
         nestedTimer(callback);
         expect(callback).not.toHaveBeenCalled();
         tick(0);
         // the nested timeout will also be triggered
         expect(callback).toHaveBeenCalled();
       }));
    // #enddocregion fake-async-test-tick-new-macro-task-sync

    // #docregion fake-async-test-tick-new-macro-task-async
    it('should not run new macro task callback with delay after call tick with millis',
       fakeAsync(() => {
         function nestedTimer(cb: () => any): void {
           setTimeout(() => setTimeout(() => cb()));
         }
         const callback = jasmine.createSpy('callback');
         nestedTimer(callback);
         expect(callback).not.toHaveBeenCalled();
         tick(0, {processNewMacroTasksSynchronously: false});
         // the nested timeout will not be triggered
         expect(callback).not.toHaveBeenCalled();
         tick(0);
         expect(callback).toHaveBeenCalled();
       }));
    // #enddocregion fake-async-test-tick-new-macro-task-async

    // #docregion fake-async-test-date
    it('should get Date diff correctly in fakeAsync', fakeAsync(() => {
         const start = Date.now();
         tick(100);
         const end = Date.now();
         expect(end - start).toBe(100);
       }));
    // #enddocregion fake-async-test-date

    // #docregion fake-async-test-rxjs
    it('should get Date diff correctly in fakeAsync with rxjs scheduler', fakeAsync(() => {
         // need to add `import 'zone.js/plugins/zone-patch-rxjs-fake-async'
         // to patch rxjs scheduler
         let result = null;
         of('hello').pipe(delay(1000)).subscribe(v => {
           result = v;
         });
         expect(result).toBeNull();
         tick(1000);
         expect(result).toBe('hello');

         const start = new Date().getTime();
         let dateDiff = 0;
         interval(1000).pipe(take(2)).subscribe(() => dateDiff = (new Date().getTime() - start));

         tick(1000);
         expect(dateDiff).toBe(1000);
         tick(1000);
         expect(dateDiff).toBe(2000);
       }));
    // #enddocregion fake-async-test-rxjs
  });

  // #docregion fake-async-test-clock
  describe('use jasmine.clock()', () => {
    // need to config __zone_symbol__fakeAsyncPatchLock flag
    // before loading zone.js/testing
    beforeEach(() => {
      jasmine.clock().install();
    });
    afterEach(() => {
      jasmine.clock().uninstall();
    });
    it('should auto enter fakeAsync', () => {
      // is in fakeAsync now, don't need to call fakeAsync(testFn)
      let called = false;
      setTimeout(() => {
        called = true;
      }, 100);
      jasmine.clock().tick(100);
      expect(called).toBe(true);
    });
  });
  // #enddocregion fake-async-test-clock

  describe('test jsonp', () => {
    function jsonp(url: string, callback: () => void) {
      // do a jsonp call which is not zone aware
    }
    // need to config __zone_symbol__supportWaitUnResolvedChainedPromise flag
    // before loading zone.js/testing
    it('should wait until promise.then is called', waitForAsync(() => {
         let finished = false;
         new Promise<void>(res => {
           jsonp('localhost:8080/jsonp', () => {
             // success callback and resolve the promise
             finished = true;
             res();
           });
         }).then(() => {
           // async will wait until promise.then is called
           // if __zone_symbol__supportWaitUnResolvedChainedPromise is set
           expect(finished).toBe(true);
         });
       }));
  });
});
