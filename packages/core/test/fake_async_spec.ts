/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {discardPeriodicTasks, fakeAsync, flush, flushMicrotasks, inject, tick} from '../testing';
import {Log} from '../testing/src/testing_internal';
import {EventManager} from '@angular/platform-browser';

const resolvedPromise = Promise.resolve(null);
const ProxyZoneSpec: {assertPresent: () => void} = (Zone as any)['ProxyZoneSpec'];

describe('fake async', () => {
  it('should run synchronous code', () => {
    let ran = false;
    fakeAsync(() => {
      ran = true;
    })();

    expect(ran).toEqual(true);
  });

  it('should pass arguments to the wrapped function', () => {
    fakeAsync((foo: string, bar: string) => {
      expect(foo).toEqual('foo');
      expect(bar).toEqual('bar');
    })('foo', 'bar');
  });

  it('should work with inject()', fakeAsync(
    inject([EventManager], (eventManager: EventManager) => {
      expect(eventManager).toBeInstanceOf(EventManager);
    }),
  ));

  it('should throw on nested calls', () => {
    expect(() => {
      fakeAsync(() => {
        fakeAsync((): null => null)();
      })();
    }).toThrowError('fakeAsync() calls can not be nested');
  });

  it('should flush microtasks before returning', () => {
    let thenRan = false;

    fakeAsync(() => {
      resolvedPromise.then((_) => {
        thenRan = true;
      });
    })();

    expect(thenRan).toEqual(true);
  });

  it('should propagate the return value', () => {
    expect(fakeAsync(() => 'foo')()).toEqual('foo');
  });

  describe('Promise', () => {
    it('should run asynchronous code', fakeAsync(() => {
      let thenRan = false;
      resolvedPromise.then((_) => {
        thenRan = true;
      });

      expect(thenRan).toEqual(false);

      flushMicrotasks();
      expect(thenRan).toEqual(true);
    }));

    it('should run chained thens', fakeAsync(() => {
      const log = new Log<number>();

      resolvedPromise.then((_) => log.add(1)).then((_) => log.add(2));

      expect(log.result()).toEqual('');

      flushMicrotasks();
      expect(log.result()).toEqual('1; 2');
    }));

    it('should run Promise created in Promise', fakeAsync(() => {
      const log = new Log<number>();

      resolvedPromise.then((_) => {
        log.add(1);
        resolvedPromise.then((_) => log.add(2));
      });

      expect(log.result()).toEqual('');

      flushMicrotasks();
      expect(log.result()).toEqual('1; 2');
    }));

    it('should complain if the test throws an exception during async calls', () => {
      expect(() => {
        fakeAsync(() => {
          resolvedPromise.then((_) => {
            throw new Error('async');
          });
          flushMicrotasks();
        })();
      }).toThrow();
    });

    it('should complain if a test throws an exception', () => {
      expect(() => {
        fakeAsync(() => {
          throw new Error('sync');
        })();
      }).toThrowError('sync');
    });
  });

  describe('timers', () => {
    it('should run queued zero duration timer on zero tick', fakeAsync(() => {
      let ran = false;
      setTimeout(() => {
        ran = true;
      }, 0);

      expect(ran).toEqual(false);

      tick();
      expect(ran).toEqual(true);
    }));

    it('should run queued timer after sufficient clock ticks', fakeAsync(() => {
      let ran = false;
      setTimeout(() => {
        ran = true;
      }, 10);

      tick(6);
      expect(ran).toEqual(false);

      tick(6);
      expect(ran).toEqual(true);
    }));

    it('should run new macro tasks created by timer callback', fakeAsync(() => {
      function nestedTimer(callback: () => any): void {
        setTimeout(() => setTimeout(() => callback()));
      }
      const callback = jasmine.createSpy('callback');
      nestedTimer(callback);
      expect(callback).not.toHaveBeenCalled();
      tick(0);
      expect(callback).toHaveBeenCalled();
    }));

    it('should not queue nested timer on tick with processNewMacroTasksSynchronously=false', fakeAsync(() => {
      function nestedTimer(callback: () => any): void {
        setTimeout(() => setTimeout(() => callback()));
      }
      const callback = jasmine.createSpy('callback');
      nestedTimer(callback);
      expect(callback).not.toHaveBeenCalled();
      tick(0, {processNewMacroTasksSynchronously: false});
      expect(callback).not.toHaveBeenCalled();
      flush();
      expect(callback).toHaveBeenCalled();
    }));

    it('should run queued timer only once', fakeAsync(() => {
      let cycles = 0;
      setTimeout(() => {
        cycles++;
      }, 10);

      tick(10);
      expect(cycles).toEqual(1);

      tick(10);
      expect(cycles).toEqual(1);

      tick(10);
      expect(cycles).toEqual(1);
    }));

    it('should not run cancelled timer', fakeAsync(() => {
      let ran = false;
      const id = setTimeout(() => {
        ran = true;
      }, 10);
      clearTimeout(id);

      tick(10);
      expect(ran).toEqual(false);
    }));

    it('should throw an error on dangling timers', () => {
      expect(() => {
        fakeAsync(
          () => {
            setTimeout(() => {}, 10);
          },
          {flush: false},
        )();
      }).toThrowError('1 timer(s) still in the queue.');
    });

    it('should throw an error on dangling periodic timers', () => {
      expect(() => {
        fakeAsync(
          () => {
            setInterval(() => {}, 10);
          },
          {flush: false},
        )();
      }).toThrowError('1 periodic timer(s) still in the queue.');
    });

    it('should run periodic timers', fakeAsync(() => {
      let cycles = 0;
      const id = setInterval(() => {
        cycles++;
      }, 10);

      tick(10);
      expect(cycles).toEqual(1);

      tick(10);
      expect(cycles).toEqual(2);

      tick(10);
      expect(cycles).toEqual(3);
      clearInterval(id);
    }));

    it('should not run cancelled periodic timer', fakeAsync(() => {
      let ran = false;
      const id = setInterval(() => {
        ran = true;
      }, 10);
      clearInterval(id);

      tick(10);
      expect(ran).toEqual(false);
    }));

    it('should be able to cancel periodic timers from a callback', fakeAsync(() => {
      let cycles = 0;
      const id = setInterval(() => {
        cycles++;
        clearInterval(id);
      }, 10);

      tick(10);
      expect(cycles).toEqual(1);

      tick(10);
      expect(cycles).toEqual(1);
    }));

    it('should clear periodic timers', fakeAsync(() => {
      let cycles = 0;
      setInterval(() => {
        cycles++;
      }, 10);

      tick(10);
      expect(cycles).toEqual(1);

      discardPeriodicTasks();

      // Tick once to clear out the timer which already started.
      tick(10);
      expect(cycles).toEqual(2);

      tick(10);
      // Nothing should change
      expect(cycles).toEqual(2);
    }));

    it('should process microtasks before timers', fakeAsync(() => {
      const log = new Log();

      resolvedPromise.then((_) => log.add('microtask'));

      setTimeout(() => log.add('timer'), 9);

      const id = setInterval(() => log.add('periodic timer'), 10);

      expect(log.result()).toEqual('');

      tick(10);
      expect(log.result()).toEqual('microtask; timer; periodic timer');
      clearInterval(id);
    }));

    it('should process micro-tasks created in timers before next timers', fakeAsync(() => {
      const log = new Log();

      resolvedPromise.then((_) => log.add('microtask'));

      setTimeout(() => {
        log.add('timer');
        resolvedPromise.then((_) => log.add('t microtask'));
      }, 9);

      const id = setInterval(() => {
        log.add('periodic timer');
        resolvedPromise.then((_) => log.add('pt microtask'));
      }, 10);

      tick(10);
      expect(log.result()).toEqual('microtask; timer; t microtask; periodic timer; pt microtask');

      tick(10);
      expect(log.result()).toEqual(
        'microtask; timer; t microtask; periodic timer; pt microtask; periodic timer; pt microtask',
      );
      clearInterval(id);
    }));

    it('should flush tasks', fakeAsync(() => {
      let ran = false;
      setTimeout(() => {
        ran = true;
      }, 10);

      flush();
      expect(ran).toEqual(true);
    }));

    it('should flush multiple tasks', fakeAsync(() => {
      let ran = false;
      let ran2 = false;
      setTimeout(() => {
        ran = true;
      }, 10);
      setTimeout(() => {
        ran2 = true;
      }, 30);

      let elapsed = flush();

      expect(ran).toEqual(true);
      expect(ran2).toEqual(true);
      expect(elapsed).toEqual(30);
    }));

    it('should move periodic tasks', fakeAsync(() => {
      let ran = false;
      let count = 0;
      setInterval(() => {
        count++;
      }, 10);
      setTimeout(() => {
        ran = true;
      }, 35);

      let elapsed = flush();

      expect(count).toEqual(3);
      expect(ran).toEqual(true);
      expect(elapsed).toEqual(35);

      discardPeriodicTasks();
    }));
  });

  describe('outside of the fakeAsync zone', () => {
    it('calling flushMicrotasks should throw', () => {
      expect(() => {
        flushMicrotasks();
      }).toThrowError('The code should be running in the fakeAsync zone to call this function');
    });

    it('calling tick should throw', () => {
      expect(() => {
        tick();
      }).toThrowError('The code should be running in the fakeAsync zone to call this function');
    });

    it('calling flush should throw', () => {
      expect(() => {
        flush();
      }).toThrowError('The code should be running in the fakeAsync zone to call this function');
    });

    it('calling discardPeriodicTasks should throw', () => {
      expect(() => {
        discardPeriodicTasks();
      }).toThrowError('The code should be running in the fakeAsync zone to call this function');
    });
  });

  describe('only one `fakeAsync` zone per test', () => {
    let zoneInBeforeEach: Zone;
    let zoneInTest1: Zone;
    beforeEach(fakeAsync(() => {
      zoneInBeforeEach = Zone.current;
    }));

    it('should use the same zone as in beforeEach', fakeAsync(() => {
      zoneInTest1 = Zone.current;
      expect(zoneInTest1).toBe(zoneInBeforeEach);
    }));
  });
});

describe('ProxyZone', () => {
  beforeEach(() => {
    ProxyZoneSpec.assertPresent();
  });

  afterEach(() => {
    ProxyZoneSpec.assertPresent();
  });

  it('should allow fakeAsync zone to retroactively set a zoneSpec outside of fakeAsync', () => {
    ProxyZoneSpec.assertPresent();
    let state: string = 'not run';
    const testZone = Zone.current.fork({name: 'test-zone'});
    fakeAsync(() => {
      testZone.run(() => {
        Promise.resolve('works').then((v) => (state = v));
        expect(state).toEqual('not run');
        flushMicrotasks();
        expect(state).toEqual('works');
      });
    })();
    expect(state).toEqual('works');
  });
});
