/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ifEnvSupports, ifEnvSupportsWithDone, supportPatchXHROnProperty, zoneSymbol} from '../test-util';
declare const global: any;
const wtfMock = global.wtfMock;

describe('XMLHttpRequest', function() {
  let testZone: Zone;

  beforeEach(() => {
    testZone = Zone.current.fork({name: 'test'});
  });

  it('should intercept XHRs and treat them as MacroTasks', function(done) {
    let req: XMLHttpRequest;
    let onStable: any;
    const testZoneWithWtf = Zone.current.fork((Zone as any)['wtfZoneSpec']).fork({
      name: 'TestZone',
      onHasTask: (delegate: ZoneDelegate, curr: Zone, target: Zone, hasTask: HasTaskState) => {
        if (!hasTask.macroTask) {
          onStable && onStable();
        }
      }
    });

    testZoneWithWtf.run(() => {
      req = new XMLHttpRequest();
      const logs: string[] = [];
      req.onload = () => {
        logs.push('onload');
      };
      onStable = function() {
        expect(wtfMock.log[wtfMock.log.length - 2])
            .toEqual('> Zone:invokeTask:XMLHttpRequest.send("<root>::ProxyZone::WTF::TestZone")');
        expect(wtfMock.log[wtfMock.log.length - 1])
            .toEqual('< Zone:invokeTask:XMLHttpRequest.send');
        if (supportPatchXHROnProperty()) {
          expect(wtfMock.log[wtfMock.log.length - 3])
              .toMatch(/\< Zone\:invokeTask.*addEventListener\:load/);
          expect(wtfMock.log[wtfMock.log.length - 4])
              .toMatch(/\> Zone\:invokeTask.*addEventListener\:load/);
        }
        // if browser can patch onload
        if ((req as any)[zoneSymbol('loadfalse')]) {
          expect(logs).toEqual(['onload']);
        }
        done();
      };

      req.open('get', '/', true);
      req.send();
      const lastScheduled = wtfMock.log[wtfMock.log.length - 1];
      expect(lastScheduled).toMatch('# Zone:schedule:macroTask:XMLHttpRequest.send');
    }, null, undefined, 'unit-test');
  });

  it('should not trigger Zone callback of internal onreadystatechange', function(done) {
    const scheduleSpy = jasmine.createSpy('schedule');
    const xhrZone = Zone.current.fork({
      name: 'xhr',
      onScheduleTask: (delegate: ZoneDelegate, currentZone: Zone, targetZone, task: Task) => {
        if (task.type === 'eventTask') {
          scheduleSpy(task.source);
        }
        return delegate.scheduleTask(targetZone, task);
      }
    });

    xhrZone.run(() => {
      const req = new XMLHttpRequest();
      req.onload = function() {
        expect(Zone.current.name).toEqual('xhr');
        if (supportPatchXHROnProperty()) {
          expect(scheduleSpy).toHaveBeenCalled();
        }
        done();
      };
      req.open('get', '/', true);
      req.send();
    });
  });

  it('should work with onreadystatechange', function(done) {
    let req: XMLHttpRequest;

    testZone.run(function() {
      req = new XMLHttpRequest();
      req.onreadystatechange = function() {
        // Make sure that the wrapCallback will only be called once
        req.onreadystatechange = null as any;
        expect(Zone.current).toBe(testZone);
        done();
      };
      req.open('get', '/', true);
    });

    req!.send();
  });

  it('should run onload listeners before internal readystatechange', function(done) {
    const logs: string[] = [];
    const xhrZone = Zone.current.fork({
      name: 'xhr',
      onInvokeTask: (delegate, curr, target, task, applyThis, applyArgs) => {
        logs.push('invokeTask ' + task.source);
        return delegate.invokeTask(target, task, applyThis, applyArgs);
      }
    });

    xhrZone.run(function() {
      const req = new XMLHttpRequest();
      req.onload = function() {
        logs.push('onload');
        (window as any)[Zone.__symbol__('setTimeout')](() => {
          expect(logs).toEqual([
            'invokeTask XMLHttpRequest.addEventListener:load', 'onload',
            'invokeTask XMLHttpRequest.send'
          ])
          done();
        });
      };
      req.open('get', '/', true);
      req.send();
    });
  });

  it('should invoke xhr task even onload listener throw error', function(done) {
    const oriWindowError = window.onerror;
    const logs: string[] = [];
    window.onerror = function(err: any) {
      logs.push(err);
    };
    try {
      const xhrZone = Zone.current.fork({
        name: 'xhr',
        onInvokeTask: (delegate, curr, target, task, applyThis, applyArgs) => {
          logs.push('invokeTask ' + task.source);
          return delegate.invokeTask(target, task, applyThis, applyArgs);
        },
        onHasTask: (delegate, curr, target, hasTaskState) => {
          if (hasTaskState.change === 'macroTask') {
            logs.push('hasTask ' + hasTaskState.macroTask);
          }
          return delegate.hasTask(target, hasTaskState);
        }
      });

      xhrZone.run(function() {
        const req = new XMLHttpRequest();
        req.onload = function() {
          logs.push('onload');
          throw new Error('test');
        };
        const unhandledRejection = (e: PromiseRejectionEvent) => {
          fail('should not be here');
        };
        window.addEventListener('unhandledrejection', unhandledRejection);
        req.addEventListener('load', () => {
          logs.push('onload1');
          (window as any)[Zone.__symbol__('setTimeout')](() => {
            expect(logs).toEqual([
              'hasTask true', 'invokeTask XMLHttpRequest.addEventListener:load', 'onload',
              'invokeTask XMLHttpRequest.addEventListener:load', 'onload1',
              'invokeTask XMLHttpRequest.send', 'hasTask false', 'Uncaught Error: test'
            ]);
            window.removeEventListener('unhandledrejection', unhandledRejection);
            window.onerror = oriWindowError;
            done();
          });
        });
        req.open('get', '/', true);
        req.send();
      });
    } catch (e: any) {
      window.onerror = oriWindowError;
    }
  });

  it('should return null when access ontimeout first time without error', function() {
    let req: XMLHttpRequest = new XMLHttpRequest();
    expect(req.ontimeout).toBe(null);
  });

  const supportsOnProgress = function() {
    return 'onprogress' in (new XMLHttpRequest());
  };

  (<any>supportsOnProgress).message = 'XMLHttpRequest.onprogress';

  describe('onprogress', ifEnvSupports(supportsOnProgress, function() {
             it('should work with onprogress', function(done) {
               let req: XMLHttpRequest;
               testZone.run(function() {
                 req = new XMLHttpRequest();
                 req.onprogress = function() {
                   // Make sure that the wrapCallback will only be called once
                   req.onprogress = null as any;
                   expect(Zone.current).toBe(testZone);
                   done();
                 };
                 req.open('get', '/', true);
               });

               req!.send();
             });

             it('should allow canceling of an XMLHttpRequest', function(done) {
               const spy = jasmine.createSpy('spy');
               let req: XMLHttpRequest;
               let pending = false;

               const trackingTestZone = Zone.current.fork({
                 name: 'tracking test zone',
                 onHasTask:
                     (delegate: ZoneDelegate, current: Zone, target: Zone,
                      hasTaskState: HasTaskState) => {
                       if (hasTaskState.change == 'macroTask') {
                         pending = hasTaskState.macroTask;
                       }
                       delegate.hasTask(target, hasTaskState);
                     }
               });

               trackingTestZone.run(function() {
                 req = new XMLHttpRequest();
                 req.onreadystatechange = function() {
                   if (req.readyState === XMLHttpRequest.DONE) {
                     if (req.status !== 0) {
                       spy();
                     }
                   }
                 };
                 req.open('get', '/', true);

                 req.send();
                 req.abort();
               });

               setTimeout(function() {
                 expect(spy).not.toHaveBeenCalled();
                 expect(pending).toEqual(false);
                 done();
               }, 0);
             });

             it('should allow aborting an XMLHttpRequest after its completed', function(done) {
               let req: XMLHttpRequest;

               testZone.run(function() {
                 req = new XMLHttpRequest();
                 req.onreadystatechange = function() {
                   if (req.readyState === XMLHttpRequest.DONE) {
                     if (req.status !== 0) {
                       setTimeout(function() {
                         req.abort();
                         done();
                       }, 0);
                     }
                   }
                 };
                 req.open('get', '/', true);

                 req.send();
               });
             });
           }));

  it('should preserve other setters', function() {
    const req = new XMLHttpRequest();
    req.open('get', '/', true);
    req.send();
    try {
      req.responseType = 'document';
      expect(req.responseType).toBe('document');
    } catch (e) {
      // Android browser: using this setter throws, this should be preserved
      expect((e as Error).message).toBe('INVALID_STATE_ERR: DOM Exception 11');
    }
  });

  it('should work with synchronous XMLHttpRequest', function() {
    const log: HasTaskState[] = [];
    Zone.current
        .fork({
          name: 'sync-xhr-test',
          onHasTask: function(
              delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState) {
            log.push(hasTaskState);
            delegate.hasTask(target, hasTaskState);
          }
        })
        .run(() => {
          const req = new XMLHttpRequest();
          req.open('get', '/', false);
          req.send();
        });
    expect(log).toEqual([]);
  });

  it('should preserve static constants', function() {
    expect(XMLHttpRequest.UNSENT).toEqual(0);
    expect(XMLHttpRequest.OPENED).toEqual(1);
    expect(XMLHttpRequest.HEADERS_RECEIVED).toEqual(2);
    expect(XMLHttpRequest.LOADING).toEqual(3);
    expect(XMLHttpRequest.DONE).toEqual(4);
  });

  it('should work properly when send request multiple times on single xmlRequest instance',
     function(done) {
       testZone.run(function() {
         const req = new XMLHttpRequest();
         req.open('get', '/', true);
         req.send();
         req.onload = function() {
           req.onload = null as any;
           req.open('get', '/', true);
           req.onload = function() {
             done();
           };
           expect(() => {
             req.send();
           }).not.toThrow();
         };
       });
     });

  it('should keep taskcount correctly when abort was called multiple times before request is done',
     function(done) {
       testZone.run(function() {
         const req = new XMLHttpRequest();

         req.open('get', '/', true);
         req.send();

         let count = 0;
         const listener = function(ev: any) {
           if (req.readyState >= 2) {
             const isInitial = count++ === 0;

             expect(() => {
               // this triggers a synchronous dispatch of the state change event.
               req.abort();
             }).not.toThrow();

             req.removeEventListener('readystatechange', listener);

             if (isInitial) {
               done();
             }
           }
         };
         req.addEventListener('readystatechange', listener);
       });
     });

  it('should close xhr request if error happened when connect', function(done) {
    const logs: boolean[] = [];
    Zone.current
        .fork({
          name: 'xhr',
          onHasTask:
              (delegate: ZoneDelegate, curr: Zone, target: Zone, taskState: HasTaskState) => {
                if (taskState.change === 'macroTask') {
                  logs.push(taskState.macroTask);
                }
                return delegate.hasTask(target, taskState);
              }
        })
        .run(function() {
          const req = new XMLHttpRequest();
          req.open('get', 'http://notexists.url', true);
          req.send();
          req.addEventListener('error', () => {
            expect(logs).toEqual([true, false]);
            done();
          });
        });
  });

  it('should trigger readystatechange if xhr request trigger cors error', (done) => {
    const req = new XMLHttpRequest();
    let err: any = null;
    try {
      req.open('get', 'file:///test', true);
    } catch (err) {
      // in IE, open will throw Access is denied error
      done();
      return;
    }
    req.addEventListener('readystatechange', function(ev) {
      if (req.readyState === 4) {
        const xhrScheduled = (req as any)[zoneSymbol('xhrScheduled')];
        const task = (req as any)[zoneSymbol('xhrTask')];
        if (xhrScheduled === false) {
          expect(task.state).toEqual('scheduling');
          setTimeout(() => {
            if (err) {
              expect(task.state).toEqual('unknown');
            } else {
              expect(task.state).toEqual('notScheduled');
            }
            done();
          });
        } else {
          expect(task.state).toEqual('scheduled');
          done();
        }
      }
    });
    try {
      req.send();
    } catch (error) {
      err = error;
    }
  });

  it('should invoke task if xhr request trigger cors error', (done) => {
    const logs: string[] = [];
    const zone = Zone.current.fork({
      name: 'xhr',
      onHasTask: (delegate: ZoneDelegate, curr: Zone, target: Zone, hasTask: HasTaskState) => {
        logs.push(JSON.stringify(hasTask));
      }
    });
    const req = new XMLHttpRequest();
    try {
      req.open('get', 'file:///test', true);
    } catch (err) {
      // in IE, open will throw Access is denied error
      done();
      return;
    }
    zone.run(() => {
      let isError = false;
      let timerId = null;
      try {
        timerId = (window as any)[zoneSymbol('setTimeout')](() => {
          expect(logs).toEqual([
            `{"microTask":false,"macroTask":true,"eventTask":false,"change":"macroTask"}`,
            `{"microTask":false,"macroTask":false,"eventTask":false,"change":"macroTask"}`
          ]);
          done();
        }, 500);
        req.send();
      } catch (error) {
        isError = true;
        (window as any)[zoneSymbol('clearTimeout')](timerId);
        done();
      }
    });
  });

  it('should not throw error when get XMLHttpRequest.prototype.onreadystatechange the first time',
     function() {
       const func = function() {
         testZone.run(function() {
           const req = new XMLHttpRequest();
           req.onreadystatechange;
         });
       };
       expect(func).not.toThrow();
     });

  it('should be in the zone when use XMLHttpRequest.addEventListener', function(done) {
    testZone.run(function() {
      // sometimes this case will cause timeout
      // so we set it longer
      const interval = (<any>jasmine).DEFAULT_TIMEOUT_INTERVAL;
      (<any>jasmine).DEFAULT_TIMEOUT_INTERVAL = 5000;
      const req = new XMLHttpRequest();
      req.open('get', '/', true);
      req.addEventListener('readystatechange', function() {
        if (req.readyState === 4) {
          // expect(Zone.current.name).toEqual('test');
          (<any>jasmine).DEFAULT_TIMEOUT_INTERVAL = interval;
          done();
        }
      });
      req.send();
    });
  });

  it('should return origin listener when call xhr.onreadystatechange',
     ifEnvSupportsWithDone(supportPatchXHROnProperty, function(done: Function) {
       testZone.run(function() {
         // sometimes this case will cause timeout
         // so we set it longer
         const req = new XMLHttpRequest();
         req.open('get', '/', true);
         const interval = (<any>jasmine).DEFAULT_TIMEOUT_INTERVAL;
         (<any>jasmine).DEFAULT_TIMEOUT_INTERVAL = 5000;
         const listener = req.onreadystatechange = function() {
           if (req.readyState === 4) {
             (<any>jasmine).DEFAULT_TIMEOUT_INTERVAL = interval;
             done();
           }
         };
         expect(req.onreadystatechange).toBe(listener);
         req.onreadystatechange = function() {
           return listener.call(this);
         };
         req.send();
       });
     }));
});
