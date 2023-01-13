/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ifEnvSupports} from '../test-util';

describe('AsyncTestZoneSpec', function() {
  let log: string[];
  const AsyncTestZoneSpec = (Zone as any)['AsyncTestZoneSpec'];

  function finishCallback() {
    log.push('finish');
  }

  function failCallback() {
    log.push('fail');
  }

  function emptyRun() {
    // Jasmine will throw if there are no tests.
    it('should pass', () => {});
  }

  beforeEach(() => {
    log = [];
  });

  it('should call finish after zone is run in sync call', (done) => {
    let finished = false;
    const testZoneSpec = new AsyncTestZoneSpec(() => {
      expect(finished).toBe(true);
      done();
    }, failCallback, 'name');

    const atz = Zone.current.fork(testZoneSpec);

    atz.run(function() {
      finished = true;
    });
  });

  it('should call finish after a setTimeout is done', (done) => {
    let finished = false;

    const testZoneSpec = new AsyncTestZoneSpec(
        () => {
          expect(finished).toBe(true);
          done();
        },
        () => {
          done.fail('async zone called failCallback unexpectedly');
        },
        'name');

    const atz = Zone.current.fork(testZoneSpec);

    atz.run(function() {
      setTimeout(() => {
        finished = true;
      }, 10);
    });
  });

  it('should call finish after microtasks are done', (done) => {
    let finished = false;

    const testZoneSpec = new AsyncTestZoneSpec(
        () => {
          expect(finished).toBe(true);
          done();
        },
        () => {
          done.fail('async zone called failCallback unexpectedly');
        },
        'name');

    const atz = Zone.current.fork(testZoneSpec);

    atz.run(function() {
      Promise.resolve().then(() => {
        finished = true;
      });
    });
  });

  it('should call finish after both micro and macrotasks are done', (done) => {
    let finished = false;

    const testZoneSpec = new AsyncTestZoneSpec(
        () => {
          expect(finished).toBe(true);
          done();
        },
        () => {
          done.fail('async zone called failCallback unexpectedly');
        },
        'name');

    const atz = Zone.current.fork(testZoneSpec);

    atz.run(function() {
      new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 10);
      }).then(() => {
        finished = true;
      });
    });
  });

  it('should call finish after both macro and microtasks are done', (done) => {
    let finished = false;

    const testZoneSpec = new AsyncTestZoneSpec(
        () => {
          expect(finished).toBe(true);
          done();
        },
        () => {
          done.fail('async zone called failCallback unexpectedly');
        },
        'name');

    const atz = Zone.current.fork(testZoneSpec);

    atz.run(function() {
      Promise.resolve().then(() => {
        setTimeout(() => {
          finished = true;
        }, 10);
      });
    });
  });

  it('should not call done multiple times in sync test', (done) => {
    const testFn = () => {
      Zone.current.run(() => {});
      Zone.current.run(() => {});
    };
    let doneCalledCount = 0;
    const testZoneSpec = new AsyncTestZoneSpec(() => {
      doneCalledCount++;
    }, () => {}, 'name');

    const atz = Zone.current.fork(testZoneSpec);

    atz.run(testFn);
    setTimeout(() => {
      expect(doneCalledCount).toBe(1);
      done();
    });
  });

  it('should not call done multiple times in async test with nested zone', (done) => {
    const testFn = () => {
      Promise.resolve(1).then(() => {});
    };
    let doneCalledCount = 0;
    const testZoneSpec = new AsyncTestZoneSpec(() => {
      doneCalledCount++;
    }, () => {}, 'name');

    const atz = Zone.current.fork(testZoneSpec);
    const c1 = atz.fork({
      name: 'child1',
      onHasTask: (delegate, current, target, hasTaskState) => {
        return delegate.hasTask(target, hasTaskState);
      }
    });
    const c2 = c1.fork({
      name: 'child2',
      onHasTask: (delegate, current, target, hasTaskState) => {
        return delegate.hasTask(target, hasTaskState);
      }
    });

    c2.run(testFn);
    setTimeout(() => {
      expect(doneCalledCount).toBe(1);
      done();
    }, 50);
  });

  it('should not call done multiple times when proxy zone captures previously ' +
         'captured microtasks',
     (done) => {
       const ProxyZoneSpec = (Zone as any)['ProxyZoneSpec'];
       const proxyZoneSpec = new ProxyZoneSpec(null) as ProxyZoneSpec;
       const proxyZone = Zone.current.fork(proxyZoneSpec);

       // This simulates a simple `beforeEach` patched, running in the proxy zone,
       // but not necessarily waiting for the promise to be resolved. This can
       // be the case e.g. in the AngularJS upgrade tests where the bootstrap is
       // performed in the before each, but the waiting is done in the actual `it` specs.
       proxyZone.run(() => {
         Promise.resolve().then(() => {});
       });

       let doneCalledCount = 0;
       const testFn = () => {
         // When a test executes with `waitForAsync`, the proxy zone delegates to the async
         // test zone, potentially also capturing tasks leaking from `beforeEach`.
         proxyZoneSpec.setDelegate(testZoneSpec);
       };

       const testZoneSpec = new AsyncTestZoneSpec(() => {
         // reset the proxy zone delegate after test completion.
         proxyZoneSpec.setDelegate(null);
         doneCalledCount++;
       }, () => done.fail('Error occurred in the async test zone.'), 'name');

       const atz = Zone.current.fork(testZoneSpec);
       atz.run(testFn);

       setTimeout(() => {
         expect(doneCalledCount).toBe(1);
         done();
       }, 50);
     });


  describe('event tasks', ifEnvSupports('document', () => {
             let button: HTMLButtonElement;
             beforeEach(function() {
               button = document.createElement('button');
               document.body.appendChild(button);
             });
             afterEach(function() {
               document.body.removeChild(button);
             });

             it('should call finish because an event task is considered as sync', (done) => {
               let finished = false;

               const testZoneSpec = new AsyncTestZoneSpec(
                   () => {
                     expect(finished).toBe(true);
                     done();
                   },
                   () => {
                     done.fail('async zone called failCallback unexpectedly');
                   },
                   'name');

               const atz = Zone.current.fork(testZoneSpec);

               atz.run(function() {
                 const listener = () => {
                   finished = true;
                 };
                 button.addEventListener('click', listener);

                 const clickEvent = document.createEvent('Event');
                 clickEvent.initEvent('click', true, true);

                 button.dispatchEvent(clickEvent);
               });
             });

             it('should call finish after an event task is done asynchronously', (done) => {
               let finished = false;

               const testZoneSpec = new AsyncTestZoneSpec(
                   () => {
                     expect(finished).toBe(true);
                     done();
                   },
                   () => {
                     done.fail('async zone called failCallback unexpectedly');
                   },
                   'name');

               const atz = Zone.current.fork(testZoneSpec);

               atz.run(function() {
                 button.addEventListener('click', () => {
                   setTimeout(() => {
                     finished = true;
                   }, 10);
                 });

                 const clickEvent = document.createEvent('Event');
                 clickEvent.initEvent('click', true, true);

                 button.dispatchEvent(clickEvent);
               });
             });
           }, emptyRun));

  describe('XHRs', ifEnvSupports('XMLHttpRequest', () => {
             it('should wait for XHRs to complete', function(done) {
               let req: XMLHttpRequest;
               let finished = false;

               const testZoneSpec = new AsyncTestZoneSpec(
                   () => {
                     expect(finished).toBe(true);
                     done();
                   },
                   (err: Error) => {
                     done.fail('async zone called failCallback unexpectedly');
                   },
                   'name');

               const atz = Zone.current.fork(testZoneSpec);

               atz.run(function() {
                 req = new XMLHttpRequest();

                 req.onreadystatechange = () => {
                   if (req.readyState === XMLHttpRequest.DONE) {
                     finished = true;
                   }
                 };

                 req.open('get', '/', true);
                 req.send();
               });
             });

             it('should fail if an xhr fails', function(done) {
               let req: XMLHttpRequest;

               const testZoneSpec = new AsyncTestZoneSpec(
                   () => {
                     done.fail('expected failCallback to be called');
                   },
                   (err: Error) => {
                     expect(err.message).toEqual('bad url failure');
                     done();
                   },
                   'name');

               const atz = Zone.current.fork(testZoneSpec);

               atz.run(function() {
                 req = new XMLHttpRequest();
                 req.onload = () => {
                   if (req.status != 200) {
                     throw new Error('bad url failure');
                   }
                 };
                 req.open('get', '/bad-url', true);
                 req.send();
               });
             });
           }, emptyRun));

  it('should not fail if setInterval is used and canceled', (done) => {
    const testZoneSpec = new AsyncTestZoneSpec(
        () => {
          done();
        },
        (err: Error) => {
          done.fail('async zone called failCallback unexpectedly');
        },
        'name');

    const atz = Zone.current.fork(testZoneSpec);

    atz.run(function() {
      let id = setInterval(() => {
        clearInterval(id);
      }, 100);
    });
  });

  it('should fail if an error is thrown asynchronously', (done) => {
    const testZoneSpec = new AsyncTestZoneSpec(
        () => {
          done.fail('expected failCallback to be called');
        },
        (err: Error) => {
          expect(err.message).toEqual('my error');
          done();
        },
        'name');

    const atz = Zone.current.fork(testZoneSpec);

    atz.run(function() {
      setTimeout(() => {
        throw new Error('my error');
      }, 10);
    });
  });

  it('should fail if a promise rejection is unhandled', (done) => {
    const testZoneSpec = new AsyncTestZoneSpec(
        () => {
          done.fail('expected failCallback to be called');
        },
        (err: Error) => {
          expect(err.message).toEqual('Uncaught (in promise): my reason');
          // Without the `runInTestZone` function, the callback continues to execute
          // in the async test zone. We don't want to trigger new tasks upon
          // the failure callback already being invoked (`jasmine.done` schedules tasks)
          Zone.root.run(() => done());
        },
        'name');

    const atz = Zone.current.fork(testZoneSpec);

    atz.run(function() {
      Promise.reject('my reason');
    });
  });

  const asyncTest: any = (Zone as any)[Zone.__symbol__('asyncTest')];

  function wrapAsyncTest(fn: Function, doneFn?: Function) {
    return function(this: unknown, done: Function) {
      const asyncWrapper = asyncTest(fn);
      return asyncWrapper.apply(this, [function(this: unknown) {
                                  if (doneFn) {
                                    doneFn();
                                  }
                                  return done.apply(this, arguments);
                                }]);
    };
  }

  describe('async', () => {
    describe('non zone aware async task in promise should be detected', () => {
      let finished = false;
      const _global: any =
          typeof window !== 'undefined' && window || typeof self !== 'undefined' && self || global;
      beforeEach(() => {
        _global[Zone.__symbol__('supportWaitUnResolvedChainedPromise')] = true;
      });
      afterEach(() => {
        _global[Zone.__symbol__('supportWaitUnResolvedChainedPromise')] = false;
      });
      it('should be able to detect non zone aware async task in promise',
         wrapAsyncTest(
             () => {
               new Promise((res, rej) => {
                 const g: any = typeof window === 'undefined' ? global : window;
                 g[Zone.__symbol__('setTimeout')](res, 100);
               }).then(() => {
                 finished = true;
               });
             },
             () => {
               expect(finished).toBe(true);
             }));
    });


    describe('test without beforeEach', () => {
      const logs: string[] = [];
      it('should automatically done after async tasks finished',
         wrapAsyncTest(
             () => {
               setTimeout(() => {
                 logs.push('timeout');
               }, 100);
             },
             () => {
               expect(logs).toEqual(['timeout']);
               logs.splice(0);
             }));

      it('should automatically done after all nested async tasks finished',
         wrapAsyncTest(
             () => {
               setTimeout(() => {
                 logs.push('timeout');
                 setTimeout(() => {
                   logs.push('nested timeout');
                 }, 100);
               }, 100);
             },
             () => {
               expect(logs).toEqual(['timeout', 'nested timeout']);
               logs.splice(0);
             }));

      it('should automatically done after multiple async tasks finished',
         wrapAsyncTest(
             () => {
               setTimeout(() => {
                 logs.push('1st timeout');
               }, 100);

               setTimeout(() => {
                 logs.push('2nd timeout');
               }, 100);
             },
             () => {
               expect(logs).toEqual(['1st timeout', '2nd timeout']);
               logs.splice(0);
             }));
    });

    describe('test with sync beforeEach', () => {
      const logs: string[] = [];

      beforeEach(() => {
        logs.splice(0);
        logs.push('beforeEach');
      });

      it('should automatically done after async tasks finished',
         wrapAsyncTest(
             () => {
               setTimeout(() => {
                 logs.push('timeout');
               }, 100);
             },
             () => {
               expect(logs).toEqual(['beforeEach', 'timeout']);
             }));
    });

    describe('test with async beforeEach', () => {
      const logs: string[] = [];

      beforeEach(wrapAsyncTest(() => {
        setTimeout(() => {
          logs.splice(0);
          logs.push('beforeEach');
        }, 100);
      }));

      it('should automatically done after async tasks finished',
         wrapAsyncTest(
             () => {
               setTimeout(() => {
                 logs.push('timeout');
               }, 100);
             },
             () => {
               expect(logs).toEqual(['beforeEach', 'timeout']);
             }));

      it('should automatically done after all nested async tasks finished',
         wrapAsyncTest(
             () => {
               setTimeout(() => {
                 logs.push('timeout');
                 setTimeout(() => {
                   logs.push('nested timeout');
                 }, 100);
               }, 100);
             },
             () => {
               expect(logs).toEqual(['beforeEach', 'timeout', 'nested timeout']);
             }));

      it('should automatically done after multiple async tasks finished',
         wrapAsyncTest(
             () => {
               setTimeout(() => {
                 logs.push('1st timeout');
               }, 100);

               setTimeout(() => {
                 logs.push('2nd timeout');
               }, 100);
             },
             () => {
               expect(logs).toEqual(['beforeEach', '1st timeout', '2nd timeout']);
             }));
    });

    describe('test with async beforeEach and sync afterEach', () => {
      const logs: string[] = [];

      beforeEach(wrapAsyncTest(() => {
        setTimeout(() => {
          expect(logs).toEqual([]);
          logs.push('beforeEach');
        }, 100);
      }));

      afterEach(() => {
        logs.splice(0);
      });

      it('should automatically done after async tasks finished',
         wrapAsyncTest(
             () => {
               setTimeout(() => {
                 logs.push('timeout');
               }, 100);
             },
             () => {
               expect(logs).toEqual(['beforeEach', 'timeout']);
             }));
    });

    describe('test with async beforeEach and async afterEach', () => {
      const logs: string[] = [];

      beforeEach(wrapAsyncTest(() => {
        setTimeout(() => {
          expect(logs).toEqual([]);
          logs.push('beforeEach');
        }, 100);
      }));

      afterEach(wrapAsyncTest(() => {
        setTimeout(() => {
          logs.splice(0);
        }, 100);
      }));

      it('should automatically done after async tasks finished',
         wrapAsyncTest(
             () => {
               setTimeout(() => {
                 logs.push('timeout');
               }, 100);
             },
             () => {
               expect(logs).toEqual(['beforeEach', 'timeout']);
             }));
    });
  });
});
