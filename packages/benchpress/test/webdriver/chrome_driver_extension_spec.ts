/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, describe, expect, fit, inject, it} from '@angular/core/testing/src/testing_internal';

import {ChromeDriverExtension, Injector, Options, WebDriverAdapter, WebDriverExtension} from '../../index';
import {TraceEventFactory} from '../trace_event_factory';

{
  describe('chrome driver extension', () => {
    const CHROME45_USER_AGENT =
        '"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2499.0 Safari/537.36"';

    let log: any[];
    let extension: ChromeDriverExtension;

    const blinkEvents = new TraceEventFactory('blink.console', 'pid0');
    const v8Events = new TraceEventFactory('v8', 'pid0');
    const v8EventsOtherProcess = new TraceEventFactory('v8', 'pid1');
    const chromeTimelineEvents =
        new TraceEventFactory('disabled-by-default-devtools.timeline', 'pid0');
    const chrome45TimelineEvents = new TraceEventFactory('devtools.timeline', 'pid0');
    const chromeTimelineV8Events = new TraceEventFactory('devtools.timeline,v8', 'pid0');
    const chromeBlinkTimelineEvents = new TraceEventFactory('blink,devtools.timeline', 'pid0');
    const chromeBlinkUserTimingEvents = new TraceEventFactory('blink.user_timing', 'pid0');
    const benchmarkEvents = new TraceEventFactory('benchmark', 'pid0');
    const normEvents = new TraceEventFactory('timeline', 'pid0');

    function createExtension(
        perfRecords: any[]|null = null, userAgent: string|null = null,
        messageMethod = 'Tracing.dataCollected'): WebDriverExtension {
      if (!perfRecords) {
        perfRecords = [];
      }
      if (userAgent == null) {
        userAgent = CHROME45_USER_AGENT;
      }
      log = [];
      extension = Injector
                      .create([
                        ChromeDriverExtension.PROVIDERS, {
                          provide: WebDriverAdapter,
                          useValue: new MockDriverAdapter(log, perfRecords, messageMethod)
                        },
                        {provide: Options.USER_AGENT, useValue: userAgent},
                        {provide: Options.RAW_PERFLOG_PATH, useValue: null}
                      ])
                      .get(ChromeDriverExtension);
      return extension;
    }

    it('should force gc via window.gc()',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension().gc().then((_) => {
           expect(log).toEqual([['executeScript', 'window.gc()']]);
           async.done();
         });
       }));

    it('should clear the perf logs and mark the timeline via performance.mark() on the first call',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension().timeBegin('someName').then(() => {
           expect(log).toEqual([
             ['logs', 'performance'], ['executeScript', `performance.mark('someName-bpstart');`]
           ]);
           async.done();
         });
       }));

    it('should mark the timeline via performance.mark() on the second call',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const ext = createExtension();
         ext.timeBegin('someName')
             .then((_) => {
               log.splice(0, log.length);
               ext.timeBegin('someName');
             })
             .then(() => {
               expect(log).toEqual([['executeScript', `performance.mark('someName-bpstart');`]]);
               async.done();
             });
       }));

    it('should mark the timeline via performance.mark()',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension().timeEnd('someName', null).then((_) => {
           expect(log).toEqual([['executeScript', `performance.mark('someName-bpend');`]]);
           async.done();
         });
       }));

    it('should mark the timeline via performance.mark() with start and end of a test',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension().timeEnd('name1', 'name2').then((_) => {
           expect(log).toEqual([
             ['executeScript', `performance.mark('name1-bpend');performance.mark('name2-bpstart');`]
           ]);
           async.done();
         });
       }));

    it('should normalize times to ms and forward ph and pid event properties',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension([chromeTimelineV8Events.complete('FunctionCall', 1100, 5500, null)])
             .readPerfLog()
             .then((events) => {
               expect(events).toEqual([
                 normEvents.complete('script', 1.1, 5.5, null),
               ]);
               async.done();
             });
       }));

    it('should normalize "tdur" to "dur"',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const event: any = chromeTimelineV8Events.create('X', 'FunctionCall', 1100, null);
         event['tdur'] = 5500;
         createExtension([event]).readPerfLog().then((events) => {
           expect(events).toEqual([
             normEvents.complete('script', 1.1, 5.5, null),
           ]);
           async.done();
         });
       }));

    it('should report FunctionCall events as "script"',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension([chromeTimelineV8Events.start('FunctionCall', 0)])
             .readPerfLog()
             .then((events) => {
               expect(events).toEqual([
                 normEvents.start('script', 0),
               ]);
               async.done();
             });
       }));

    it('should report EvaluateScript events as "script"',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension([chromeTimelineV8Events.start('EvaluateScript', 0)])
             .readPerfLog()
             .then((events) => {
               expect(events).toEqual([
                 normEvents.start('script', 0),
               ]);
               async.done();
             });
       }));

    it('should report minor gc', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension([
           chromeTimelineV8Events.start('MinorGC', 1000, {'usedHeapSizeBefore': 1000}),
           chromeTimelineV8Events.end('MinorGC', 2000, {'usedHeapSizeAfter': 0}),
         ])
             .readPerfLog()
             .then((events) => {
               expect(events.length).toEqual(2);
               expect(events[0]).toEqual(
                   normEvents.start('gc', 1.0, {'usedHeapSize': 1000, 'majorGc': false}));
               expect(events[1]).toEqual(
                   normEvents.end('gc', 2.0, {'usedHeapSize': 0, 'majorGc': false}));
               async.done();
             });
       }));

    it('should report major gc', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension(
             [
               chromeTimelineV8Events.start('MajorGC', 1000, {'usedHeapSizeBefore': 1000}),
               chromeTimelineV8Events.end('MajorGC', 2000, {'usedHeapSizeAfter': 0}),
             ],
             )
             .readPerfLog()
             .then((events) => {
               expect(events.length).toEqual(2);
               expect(events[0]).toEqual(
                   normEvents.start('gc', 1.0, {'usedHeapSize': 1000, 'majorGc': true}));
               expect(events[1]).toEqual(
                   normEvents.end('gc', 2.0, {'usedHeapSize': 0, 'majorGc': true}));
               async.done();
             });
       }));

    ['Layout', 'UpdateLayerTree', 'Paint'].forEach((recordType) => {
      it(`should report ${recordType} as "render"`,
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           createExtension(
               [
                 chrome45TimelineEvents.start(recordType, 1234),
                 chrome45TimelineEvents.end(recordType, 2345)
               ],
               )
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

    it(`should report UpdateLayoutTree as "render"`,
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension(
             [
               chromeBlinkTimelineEvents.start('UpdateLayoutTree', 1234),
               chromeBlinkTimelineEvents.end('UpdateLayoutTree', 2345)
             ],
             )
             .readPerfLog()
             .then((events) => {
               expect(events).toEqual([
                 normEvents.start('render', 1.234),
                 normEvents.end('render', 2.345),
               ]);
               async.done();
             });
       }));

    it('should ignore FunctionCalls from webdriver',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension([chromeTimelineV8Events.start(
                             'FunctionCall', 0, {'data': {'scriptName': 'InjectedScript'}})])
             .readPerfLog()
             .then((events) => {
               expect(events).toEqual([]);
               async.done();
             });
       }));

    it('should ignore FunctionCalls with empty scriptName',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension(
             [chromeTimelineV8Events.start('FunctionCall', 0, {'data': {'scriptName': ''}})])
             .readPerfLog()
             .then((events) => {
               expect(events).toEqual([]);
               async.done();
             });
       }));

    it('should report navigationStart',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension([chromeBlinkUserTimingEvents.instant('navigationStart', 1234)])
             .readPerfLog()
             .then((events) => {
               expect(events).toEqual([normEvents.instant('navigationStart', 1.234)]);
               async.done();
             });
       }));

    it('should report receivedData', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension(
             [chrome45TimelineEvents.instant(
                 'ResourceReceivedData', 1234, {'data': {'encodedDataLength': 987}})],
             )
             .readPerfLog()
             .then((events) => {
               expect(events).toEqual(
                   [normEvents.instant('receivedData', 1.234, {'encodedDataLength': 987})]);
               async.done();
             });
       }));

    it('should report sendRequest', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension(
             [chrome45TimelineEvents.instant(
                 'ResourceSendRequest', 1234,
                 {'data': {'url': 'http://here', 'requestMethod': 'GET'}})],
             )
             .readPerfLog()
             .then((events) => {
               expect(events).toEqual([normEvents.instant(
                   'sendRequest', 1.234, {'url': 'http://here', 'method': 'GET'})]);
               async.done();
             });
       }));

    describe('readPerfLog (common)', () => {
      it('should execute a dummy script before reading them',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           // TODO(tbosch): This seems to be a bug in ChromeDriver:
           // Sometimes it does not report the newest events of the performance log
           // to the WebDriver client unless a script is executed...
           createExtension([]).readPerfLog().then((_) => {
             expect(log).toEqual([['executeScript', '1+1'], ['logs', 'performance']]);
             async.done();
           });
         }));

      ['Rasterize', 'CompositeLayers'].forEach((recordType) => {
        it(`should report ${recordType} as "render"`,
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             createExtension(
                 [
                   chromeTimelineEvents.start(recordType, 1234),
                   chromeTimelineEvents.end(recordType, 2345)
                 ],
                 )
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

      describe('frame metrics', () => {
        it('should report ImplThreadRenderingStats as frame event',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             createExtension([benchmarkEvents.instant(
                                 'BenchmarkInstrumentation::ImplThreadRenderingStats', 1100,
                                 {'data': {'frame_count': 1}})])
                 .readPerfLog()
                 .then((events) => {
                   expect(events).toEqual([
                     normEvents.instant('frame', 1.1),
                   ]);
                   async.done();
                 });
           }));

        it('should not report ImplThreadRenderingStats with zero frames',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             createExtension([benchmarkEvents.instant(
                                 'BenchmarkInstrumentation::ImplThreadRenderingStats', 1100,
                                 {'data': {'frame_count': 0}})])
                 .readPerfLog()
                 .then((events) => {
                   expect(events).toEqual([]);
                   async.done();
                 });
           }));

        it('should throw when ImplThreadRenderingStats contains more than one frame',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             createExtension([benchmarkEvents.instant(
                                 'BenchmarkInstrumentation::ImplThreadRenderingStats', 1100,
                                 {'data': {'frame_count': 2}})])
                 .readPerfLog()
                 .catch((err): any => {
                   expect(() => {
                     throw err;
                   }).toThrowError('multi-frame render stats not supported');
                   async.done();
                 });
           }));
      });

      it('should report begin timestamps',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           createExtension([blinkEvents.create('S', 'someName', 1000)])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([normEvents.markStart('someName', 1.0)]);
                 async.done();
               });
         }));

      it('should report end timestamps',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           createExtension([blinkEvents.create('F', 'someName', 1000)])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([normEvents.markEnd('someName', 1.0)]);
                 async.done();
               });
         }));

      it('should throw an error on buffer overflow',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           createExtension(
               [
                 chromeTimelineEvents.start('FunctionCall', 1234),
               ],
               CHROME45_USER_AGENT, 'Tracing.bufferUsage')
               .readPerfLog()
               .catch((err): any => {
                 expect(() => {
                   throw err;
                 }).toThrowError('The DevTools trace buffer filled during the test!');
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
  constructor(private _log: any[], private _events: any[], private _messageMethod: string) {
    super();
  }

  executeScript(script: string) {
    this._log.push(['executeScript', script]);
    return Promise.resolve(null);
  }

  logs(type: string): Promise<any[]> {
    this._log.push(['logs', type]);
    if (type === 'performance') {
      return Promise.resolve(this._events.map(
          (event) => ({
            'message': JSON.stringify(
                {'message': {'method': this._messageMethod, 'params': event}}, null, 2)
          })));
    } else {
      return null!;
    }
  }
}
