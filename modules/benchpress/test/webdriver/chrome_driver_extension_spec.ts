import {
  afterEach,
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/test_lib';

import {ListWrapper} from 'angular2/src/facade/collection';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {Json, isBlank} from 'angular2/src/facade/lang';

import {
  WebDriverExtension,
  ChromeDriverExtension,
  WebDriverAdapter,
  Injector,
  bind
} from 'benchpress/common';

import {TraceEventFactory} from '../trace_event_factory';

export function main() {
  describe('chrome driver extension', () => {
    var log;
    var extension;

    var blinkEvents = new TraceEventFactory('blink.console', 'pid0');
    var v8Events = new TraceEventFactory('v8', 'pid0');
    var v8EventsOtherProcess = new TraceEventFactory('v8', 'pid1');
    var chromeTimelineEvents =
        new TraceEventFactory('disabled-by-default-devtools.timeline', 'pid0');
    var benchmarkEvents = new TraceEventFactory('benchmark', 'pid0');
    var normEvents = new TraceEventFactory('timeline', 'pid0');

    function createExtension(perfRecords = null, messageMethod = 'Tracing.dataCollected') {
      if (isBlank(perfRecords)) {
        perfRecords = [];
      }
      log = [];
      extension = Injector.resolveAndCreate([
                            ChromeDriverExtension.BINDINGS,
                            bind(WebDriverAdapter)
                                .toValue(new MockDriverAdapter(log, perfRecords, messageMethod))
                          ])
                      .get(ChromeDriverExtension);
      return extension;
    }

    it('should force gc via window.gc()', inject([AsyncTestCompleter], (async) => {
         createExtension().gc().then((_) => {
           expect(log).toEqual([['executeScript', 'window.gc()']]);
           async.done();
         });
       }));

    it('should mark the timeline via console.time()', inject([AsyncTestCompleter], (async) => {
         createExtension()
             .timeBegin('someName')
             .then((_) => {
               expect(log).toEqual([['executeScript', `console.time('someName');`]]);
               async.done();
             });
       }));

    it('should mark the timeline via console.timeEnd()', inject([AsyncTestCompleter], (async) => {
         createExtension()
             .timeEnd('someName')
             .then((_) => {
               expect(log).toEqual([['executeScript', `console.timeEnd('someName');`]]);
               async.done();
             });
       }));

    it('should mark the timeline via console.time() and console.timeEnd()',
       inject([AsyncTestCompleter], (async) => {
         createExtension()
             .timeEnd('name1', 'name2')
             .then((_) => {
               expect(log).toEqual(
                   [['executeScript', `console.timeEnd('name1');console.time('name2');`]]);
               async.done();
             });
       }));

    describe('readPerfLog', () => {

      it('should execute a dummy script before reading them',
         inject([AsyncTestCompleter], (async) => {
           // TODO(tbosch): This seems to be a bug in ChromeDriver:
           // Sometimes it does not report the newest events of the performance log
           // to the WebDriver client unless a script is executed...
           createExtension([]).readPerfLog().then((_) => {
             expect(log).toEqual([['executeScript', '1+1'], ['logs', 'performance']]);
             async.done();
           });
         }));

      it('should normalize times to ms and forward ph and pid event properties',
         inject([AsyncTestCompleter], (async) => {
           createExtension([chromeTimelineEvents.complete('FunctionCall', 1100, 5500, null)])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([
                   normEvents.complete('script', 1.1, 5.5, null),
                 ]);
                 async.done();
               });
         }));
      describe('frame metrics', () => {
        it('should report ImplThreadRenderingStats as frame event',
           inject([AsyncTestCompleter], (async) => {
             createExtension([
               benchmarkEvents.instant('BenchmarkInstrumentation::ImplThreadRenderingStats', 1100,
                                       {'data': {'frame_count': 1}})
             ])
                 .readPerfLog()
                 .then((events) => {
                   expect(events).toEqual([
                     normEvents.create('i', 'frame', 1.1),
                   ]);
                   async.done();
                 });
           }));

        it('should not report ImplThreadRenderingStats with zero frames',
           inject([AsyncTestCompleter], (async) => {
             createExtension([
               benchmarkEvents.instant('BenchmarkInstrumentation::ImplThreadRenderingStats', 1100,
                                       {'data': {'frame_count': 0}})
             ])
                 .readPerfLog()
                 .then((events) => {
                   expect(events).toEqual([]);
                   async.done();
                 });
           }));

        it('should throw when ImplThreadRenderingStats contains more than one frame',
           inject([AsyncTestCompleter], (async) => {
             PromiseWrapper.catchError(
                 createExtension([
                   benchmarkEvents.instant('BenchmarkInstrumentation::ImplThreadRenderingStats',
                                           1100, {'data': {'frame_count': 2}})
                 ]).readPerfLog(),
                 (err) => {
                   expect(() => { throw err; })
                       .toThrowError('multi-frame render stats not supported');
                   async.done();
                 });
           }));
      });

      it('should normalize "tdur" to "dur"', inject([AsyncTestCompleter], (async) => {
           var event = chromeTimelineEvents.create('X', 'FunctionCall', 1100, null);
           event['tdur'] = 5500;
           createExtension([event]).readPerfLog().then((events) => {
             expect(events).toEqual([
               normEvents.complete('script', 1.1, 5.5, null),
             ]);
             async.done();
           });
         }));

      it('should report FunctionCall events as "script"', inject([AsyncTestCompleter], (async) => {
           createExtension([chromeTimelineEvents.start('FunctionCall', 0)])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([
                   normEvents.start('script', 0),
                 ]);
                 async.done();
               });
         }));

      it('should ignore FunctionCalls from webdriver', inject([AsyncTestCompleter], (async) => {
           createExtension([
             chromeTimelineEvents.start('FunctionCall', 0,
                                        {'data': {'scriptName': 'InjectedScript'}})
           ])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([]);
                 async.done();
               });
         }));

      it('should report begin timestamps', inject([AsyncTestCompleter], (async) => {
           createExtension([blinkEvents.create('S', 'someName', 1000)])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([normEvents.markStart('someName', 1.0)]);
                 async.done();
               });
         }));

      it('should report end timestamps', inject([AsyncTestCompleter], (async) => {
           createExtension([blinkEvents.create('F', 'someName', 1000)])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([normEvents.markEnd('someName', 1.0)]);
                 async.done();
               });
         }));

      it('should report gc', inject([AsyncTestCompleter], (async) => {
           createExtension([
             chromeTimelineEvents.start('GCEvent', 1000, {'usedHeapSizeBefore': 1000}),
             chromeTimelineEvents.end('GCEvent', 2000, {'usedHeapSizeAfter': 0}),
           ])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([
                   normEvents.start('gc', 1.0, {'usedHeapSize': 1000}),
                   normEvents.end('gc', 2.0, {'usedHeapSize': 0, 'majorGc': false}),
                 ]);
                 async.done();
               });
         }));

      it('should report major gc', inject([AsyncTestCompleter], (async) => {
           createExtension([
             chromeTimelineEvents.start('GCEvent', 1000, {'usedHeapSizeBefore': 1000}),
             v8EventsOtherProcess.start('majorGC', 1100, null),
             v8EventsOtherProcess.end('majorGC', 1200, null),
             chromeTimelineEvents.end('GCEvent', 2000, {'usedHeapSizeAfter': 0}),
           ])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([
                   normEvents.start('gc', 1.0, {'usedHeapSize': 1000}),
                   normEvents.end('gc', 2.0, {'usedHeapSize': 0, 'majorGc': false}),
                 ]);
                 async.done();
               });
         }));

      it('should ignore major gc from different processes',
         inject([AsyncTestCompleter], (async) => {
           createExtension([
             chromeTimelineEvents.start('GCEvent', 1000, {'usedHeapSizeBefore': 1000}),
             v8Events.start('majorGC', 1100, null),
             v8Events.end('majorGC', 1200, null),
             chromeTimelineEvents.end('GCEvent', 2000, {'usedHeapSizeAfter': 0}),
           ])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([
                   normEvents.start('gc', 1.0, {'usedHeapSize': 1000}),
                   normEvents.end('gc', 2.0, {'usedHeapSize': 0, 'majorGc': true}),
                 ]);
                 async.done();
               });
         }));

      ['RecalculateStyles', 'Layout', 'UpdateLayerTree', 'Paint', 'Rasterize', 'CompositeLayers']
          .forEach((recordType) => {
            it(`should report ${recordType} as "render"`, inject([AsyncTestCompleter], (async) => {
                 createExtension([
                   chromeTimelineEvents.start(recordType, 1234),
                   chromeTimelineEvents.end(recordType, 2345)
                 ])
                     .readPerfLog()
                     .then((events) => {
                       expect(events).toEqual([
                         normEvents.start('render', 1.234),
                         normEvents.end('render', 2.345),
                       ]);
                       async.done();
                     });
               }));
          });

      it('should throw an error on buffer overflow', inject([AsyncTestCompleter], (async) => {
           PromiseWrapper.catchError(
               createExtension([
                 chromeTimelineEvents.start('FunctionCall', 1234),
               ],
                               'Tracing.bufferUsage')
                   .readPerfLog(),
               (err) => {
                 expect(() => { throw err; })
                     .toThrowError('The DevTools trace buffer filled during the test!');
                 async.done();
               });
         }));

      it('should match chrome browsers', () => {
        expect(createExtension().supports({'browserName': 'chrome'})).toBe(true);

        expect(createExtension().supports({'browserName': 'Chrome'})).toBe(true);
      });

    });

  });
}

class MockDriverAdapter extends WebDriverAdapter {
  constructor(private _log: List<any>, private _events: List<any>, private _messageMethod: string) {
    super();
  }

  executeScript(script) {
    ListWrapper.push(this._log, ['executeScript', script]);
    return PromiseWrapper.resolve(null);
  }

  logs(type) {
    ListWrapper.push(this._log, ['logs', type]);
    if (type === 'performance') {
      return PromiseWrapper.resolve(this._events.map((event) => {
        return {
          'message': Json.stringify({'message': {'method': this._messageMethod, 'params': event}})
        };
      }));
    } else {
      return null;
    }
  }
}
