/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

describe('Microtasks', function() {
  if (!global.Promise) return;

  function scheduleFn(task: Task) {
    Promise.resolve().then(<any>task.invoke);
  }

  it('should execute microtasks enqueued in the root zone', function(done) {
    const log: number[] = [];

    Zone.current.scheduleMicroTask('test', () => log.push(1), undefined, scheduleFn);
    Zone.current.scheduleMicroTask('test', () => log.push(2), undefined, scheduleFn);
    Zone.current.scheduleMicroTask('test', () => log.push(3), undefined, scheduleFn);

    setTimeout(function() {
      expect(log).toEqual([1, 2, 3]);
      done();
    }, 10);
  });

  it('should correctly scheduleMacroTask microtasks vs macrotasks', function(done) {
    const log = ['+root'];

    Zone.current.scheduleMicroTask('test', () => log.push('root.mit'), undefined, scheduleFn);

    setTimeout(function() {
      log.push('+mat1');
      Zone.current.scheduleMicroTask('test', () => log.push('mat1.mit'), undefined, scheduleFn);
      log.push('-mat1');
    }, 10);

    setTimeout(function() {
      log.push('mat2');
    }, 30);

    setTimeout(function() {
      expect(log).toEqual(['+root', '-root', 'root.mit', '+mat1', '-mat1', 'mat1.mit', 'mat2']);
      done();
    }, 40);

    log.push('-root');
  });

  it('should execute Promise wrapCallback in the zone where they are scheduled', function(done) {
    const resolvedPromise = Promise.resolve(null);

    const testZone = Zone.current.fork({name: ''});

    testZone.run(function() {
      resolvedPromise.then(function() {
        expect(Zone.current.name).toBe(testZone.name);
        done();
      });
    });
  });

  it('should execute Promise wrapCallback in the zone where they are scheduled even if resolved ' +
         'in different zone.',
     function(done) {
       let resolve: Function;
       const promise = new Promise(function(rs) {
         resolve = rs;
       });

       const testZone = Zone.current.fork({name: 'test'});

       testZone.run(function() {
         promise.then(function() {
           expect(Zone.current).toBe(testZone);
           done();
         });
       });

       Zone.current.fork({name: 'test'}).run(function() {
         resolve(null);
       });
     });

  describe('Promise', function() {
    it('should go through scheduleTask', function(done) {
      let called = false;
      const testZone = Zone.current.fork({
        name: 'test',
        onScheduleTask: function(delegate: ZoneDelegate, current: Zone, target: Zone, task: Task):
            Task {
              called = true;
              delegate.scheduleTask(target, task);
              return task;
            }
      });

      testZone.run(function() {
        Promise.resolve('value').then(function() {
          expect(called).toEqual(true);
          done();
        });
      });
    });
  });
});
