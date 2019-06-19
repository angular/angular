// tslint:disable-next-line:no-unused-variable
import { async, fakeAsync, tick } from '@angular/core/testing';
import { interval, of } from 'rxjs';
import { delay, take } from 'rxjs/operators';

describe('Angular async helper', () => {

  describe('async', () => {
    let actuallyDone = false;

    beforeEach(() => { actuallyDone = false; });

    afterEach(() => { expect(actuallyDone).toBe(true, 'actuallyDone should be true'); });

    it('should run normal test', () => { actuallyDone = true; });

    it('should run normal async test', (done: DoneFn) => {
      setTimeout(() => {
        actuallyDone = true;
        done();
      }, 0);
    });

    it('should run async test with task',
       async(() => { setTimeout(() => { actuallyDone = true; }, 0); }));

    it('should run async test with task', async(() => {
      const id = setInterval(() => {
        actuallyDone = true;
        clearInterval(id);
      }, 100);
    }));

    it('should run async test with successful promise', async(() => {
      const p = new Promise(resolve => { setTimeout(resolve, 10); });
      p.then(() => { actuallyDone = true; });
    }));

    it('should run async test with failed promise', async(() => {
      const p = new Promise((resolve, reject) => { setTimeout(reject, 10); });
      p.catch(() => { actuallyDone = true; });
    }));

    // Use done. Can also use async or fakeAsync.
    it('should run async test with successful delayed Observable', (done: DoneFn) => {
      const source = of (true).pipe(delay(10));
      source.subscribe(val => actuallyDone = true, err => fail(err), done);
    });

    it('should run async test with successful delayed Observable', async(() => {
      const source = of (true).pipe(delay(10));
      source.subscribe(val => actuallyDone = true, err => fail(err));
    }));

    it('should run async test with successful delayed Observable', fakeAsync(() => {
      const source = of (true).pipe(delay(10));
      source.subscribe(val => actuallyDone = true, err => fail(err));

      tick(10);
    }));
  });

  describe('fakeAsync', () => {
    // #docregion fake-async-test-tick
    it('should run timeout callback with delay after call tick with millis', fakeAsync(() => {
        let called = false;
        setTimeout(() => { called = true; }, 100);
        tick(100);
        expect(called).toBe(true);
      }));
    // #enddocregion fake-async-test-tick

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
        // rxjs 스케쥴러를 사용하기 위해 `import 'zone.js/dist/zone-patch-rxjs-fake-async'를 추가해야 합니다.
        let result = null;
        of ('hello').pipe(delay(1000)).subscribe(v => { result = v; });
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
    // zone.js/dist/zone-testing 패키지를 로드하기 전에 __zone_symbol_fakeAsyncPatchLock 플래그 설정이 필요합니다.
    beforeEach(() => { jasmine.clock().install(); });
    afterEach(() => { jasmine.clock().uninstall(); });
    it('should auto enter fakeAsync', () => {
      // 이 코드는 fakeAsync 테스트 존 안에서 실행됩니다.
      // 이 때 fakeAsync()를 명시적으로 실행할 필요는 없습니다.
      let called = false;
      setTimeout(() => { called = true; }, 100);
      jasmine.clock().tick(100);
      expect(called).toBe(true);
    });
  });
  // #enddocregion fake-async-test-clock

  // #docregion async-test-promise-then
  describe('test jsonp', () => {
    function jsonp(url: string, callback: Function) {
      // do a jsonp call which is not zone aware
    }
    // need to config __zone_symbol__supportWaitUnResolvedChainedPromise flag
    // before loading zone.js/dist/zone-testing
    it('should wait until promise.then is called', async(() => {
         let finished = false;
         new Promise((res, rej) => {
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
  // #enddocregion async-test-promise-then

});
