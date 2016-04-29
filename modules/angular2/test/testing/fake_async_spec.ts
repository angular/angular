import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  fakeAsync,
  flushMicrotasks,
  iit,
  inject,
  it,
  Log,
  tick,
  xit
} from 'angular2/testing_internal';
import {TimerWrapper, PromiseWrapper} from 'angular2/src/facade/async';
import {BaseException} from 'angular2/src/facade/exceptions';
import {Parser} from 'angular2/src/compiler/expression_parser/parser';

export function main() {
  describe('fake async', () => {
    it('should run synchronous code', () => {
      var ran = false;
      fakeAsync(() => { ran = true; })();

      expect(ran).toEqual(true);
    });

    it('should pass arguments to the wrapped function', () => {
      fakeAsync((foo, bar) => {
        expect(foo).toEqual('foo');
        expect(bar).toEqual('bar');
      })('foo', 'bar');
    });

    it('should work with inject()',
       fakeAsync(inject([Parser], (parser) => { expect(parser).toBeAnInstanceOf(Parser); })));

    it('should throw on nested calls', () => {
      expect(() => { fakeAsync(() => { fakeAsync(() => null)(); })(); })
          .toThrowError('fakeAsync() calls can not be nested');
    });

    it('should flush microtasks before returning', () => {
      var thenRan = false;

      fakeAsync(() => { PromiseWrapper.resolve(null).then(_ => { thenRan = true; }); })();

      expect(thenRan).toEqual(true);
    });


    it('should propagate the return value',
       () => { expect(fakeAsync(() => 'foo')()).toEqual('foo'); });

    describe('Promise', () => {
      it('should run asynchronous code', fakeAsync(() => {
           var thenRan = false;
           PromiseWrapper.resolve(null).then((_) => { thenRan = true; });

           expect(thenRan).toEqual(false);

           flushMicrotasks();
           expect(thenRan).toEqual(true);
         }));

      it('should run chained thens', fakeAsync(() => {
           var log = new Log();

           PromiseWrapper.resolve(null).then((_) => log.add(1)).then((_) => log.add(2));

           expect(log.result()).toEqual('');

           flushMicrotasks();
           expect(log.result()).toEqual('1; 2');
         }));

      it('should run Promise created in Promise', fakeAsync(() => {
           var log = new Log();

           PromiseWrapper.resolve(null).then((_) => {
             log.add(1);
             PromiseWrapper.resolve(null).then((_) => log.add(2));
           });

           expect(log.result()).toEqual('');

           flushMicrotasks();
           expect(log.result()).toEqual('1; 2');
         }));

      // TODO(vicb): check why this doesn't work in JS - linked to open issues on GH ?
      xit('should complain if the test throws an exception during async calls', () => {
        expect(() => {
          fakeAsync(() => {
            PromiseWrapper.resolve(null).then((_) => { throw new BaseException('async'); });
            flushMicrotasks();
          })();
        }).toThrowError('async');
      });

      it('should complain if a test throws an exception', () => {
        expect(() => { fakeAsync(() => { throw new BaseException('sync'); })(); })
            .toThrowError('sync');
      });

    });

    describe('timers', () => {
      it('should run queued zero duration timer on zero tick', fakeAsync(() => {
           var ran = false;
           TimerWrapper.setTimeout(() => {ran = true}, 0);

           expect(ran).toEqual(false);

           tick();
           expect(ran).toEqual(true);
         }));


      it('should run queued timer after sufficient clock ticks', fakeAsync(() => {
           var ran = false;
           TimerWrapper.setTimeout(() => { ran = true; }, 10);

           tick(6);
           expect(ran).toEqual(false);

           tick(6);
           expect(ran).toEqual(true);
         }));

      it('should run queued timer only once', fakeAsync(() => {
           var cycles = 0;
           TimerWrapper.setTimeout(() => { cycles++; }, 10);

           tick(10);
           expect(cycles).toEqual(1);

           tick(10);
           expect(cycles).toEqual(1);

           tick(10);
           expect(cycles).toEqual(1);
         }));

      it('should not run cancelled timer', fakeAsync(() => {
           var ran = false;
           var id = TimerWrapper.setTimeout(() => { ran = true; }, 10);
           TimerWrapper.clearTimeout(id);

           tick(10);
           expect(ran).toEqual(false);
         }));

      it('should throw an error on dangling timers', () => {
        expect(() => { fakeAsync(() => { TimerWrapper.setTimeout(() => {}, 10); })(); })
            .toThrowError('1 timer(s) still in the queue.');
      });

      it('should throw an error on dangling periodic timers', () => {
        expect(() => { fakeAsync(() => { TimerWrapper.setInterval(() => {}, 10); })(); })
            .toThrowError('1 periodic timer(s) still in the queue.');
      });

      it('should run periodic timers', fakeAsync(() => {
           var cycles = 0;
           var id = TimerWrapper.setInterval(() => { cycles++; }, 10);

           tick(10);
           expect(cycles).toEqual(1);

           tick(10);
           expect(cycles).toEqual(2);

           tick(10);
           expect(cycles).toEqual(3);

           TimerWrapper.clearInterval(id);
         }));

      it('should not run cancelled periodic timer', fakeAsync(() => {
           var ran = false;
           var id = TimerWrapper.setInterval(() => { ran = true; }, 10);
           TimerWrapper.clearInterval(id);

           tick(10);
           expect(ran).toEqual(false);
         }));

      it('should be able to cancel periodic timers from a callback', fakeAsync(() => {
           var cycles = 0;
           var id;

           id = TimerWrapper.setInterval(() => {
             cycles++;
             TimerWrapper.clearInterval(id);
           }, 10);

           tick(10);
           expect(cycles).toEqual(1);

           tick(10);
           expect(cycles).toEqual(1);
         }));

      it('should process microtasks before timers', fakeAsync(() => {
           var log = new Log();

           PromiseWrapper.resolve(null).then((_) => log.add('microtask'));

           TimerWrapper.setTimeout(() => log.add('timer'), 9);

           var id = TimerWrapper.setInterval(() => log.add('periodic timer'), 10);

           expect(log.result()).toEqual('');

           tick(10);
           expect(log.result()).toEqual('microtask; timer; periodic timer');

           TimerWrapper.clearInterval(id);
         }));

      it('should process micro-tasks created in timers before next timers', fakeAsync(() => {
           var log = new Log();

           PromiseWrapper.resolve(null).then((_) => log.add('microtask'));

           TimerWrapper.setTimeout(() => {
             log.add('timer');
             PromiseWrapper.resolve(null).then((_) => log.add('t microtask'));
           }, 9);

           var id = TimerWrapper.setInterval(() => {
             log.add('periodic timer');
             PromiseWrapper.resolve(null).then((_) => log.add('pt microtask'));
           }, 10);

           tick(10);
           expect(log.result())
               .toEqual('microtask; timer; t microtask; periodic timer; pt microtask');

           tick(10);
           expect(log.result())
               .toEqual(
                   'microtask; timer; t microtask; periodic timer; pt microtask; periodic timer; pt microtask');

           TimerWrapper.clearInterval(id);
         }));
    });

    describe('outside of the fakeAsync zone', () => {
      it('calling flushMicrotasks should throw', () => {
        expect(() => { flushMicrotasks(); })
            .toThrowError('The code should be running in the fakeAsync zone to call this function');
      });

      it('calling tick should throw', () => {
        expect(() => { tick(); })
            .toThrowError('The code should be running in the fakeAsync zone to call this function');
      });
    });
  });
}
