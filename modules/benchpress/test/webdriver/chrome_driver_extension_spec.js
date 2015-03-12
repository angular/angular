import {describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import { ListWrapper } from 'angular2/src/facade/collection';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { Json, isBlank } from 'angular2/src/facade/lang';

import {
  WebDriverExtension, ChromeDriverExtension,
  WebDriverAdapter, Injector, bind
} from 'benchpress/common';

import { TraceEventFactory } from '../trace_event_factory';

export function main() {
  describe('chrome driver extension', () => {
    var log;
    var extension;

    var blinkEvents = new TraceEventFactory('blink.console', 'pid0');
    var v8Events = new TraceEventFactory('v8', 'pid0');
    var v8EventsOtherProcess = new TraceEventFactory('v8', 'pid1');
    var chromeTimelineEvents = new TraceEventFactory('disabled-by-default-devtools.timeline', 'pid0');
    var normEvents = new TraceEventFactory('timeline', 'pid0');

    function createExtension(perfRecords = null, messageMethod = 'Tracing.dataCollected') {
      if (isBlank(perfRecords)) {
        perfRecords = [];
      }
      log = [];
      extension = new Injector([
        ChromeDriverExtension.BINDINGS,
        bind(WebDriverAdapter).toValue(new MockDriverAdapter(log, perfRecords, messageMethod))
      ]).get(ChromeDriverExtension);
      return extension;
    }

    it('should force gc via window.gc()', (done) => {
      createExtension().gc().then( (_) => {
        expect(log).toEqual([['executeScript', 'window.gc()']]);
        done();
      });
    });

    it('should mark the timeline via console.time()', (done) => {
      createExtension().timeBegin('someName').then( (_) => {
        expect(log).toEqual([['executeScript', `console.time('someName');`]]);
        done();
      });
    });

    it('should mark the timeline via console.timeEnd()', (done) => {
      createExtension().timeEnd('someName').then( (_) => {
        expect(log).toEqual([['executeScript', `console.timeEnd('someName');`]]);
        done();
      });
    });

    it('should mark the timeline via console.time() and console.timeEnd()', (done) => {
      createExtension().timeEnd('name1', 'name2').then( (_) => {
        expect(log).toEqual([['executeScript', `console.timeEnd('name1');console.time('name2');`]]);
        done();
      });
    });

    describe('readPerfLog', () => {

      it('should execute a dummy script before reading them', (done) => {
        // TODO(tbosch): This seems to be a bug in ChromeDriver:
        // Sometimes it does not report the newest events of the performance log
        // to the WebDriver client unless a script is executed...
        createExtension([]).readPerfLog().then( (_) => {
          expect(log).toEqual([ [ 'executeScript', '1+1' ], [ 'logs', 'performance' ] ]);
          done();
        });
      });

      it('should normalize times to ms and forward ph and pid event properties', (done) => {
        createExtension([
          chromeTimelineEvents.complete('FunctionCall', 1100, 5500, null)
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([
            normEvents.complete('script', 1.1, 5.5, null),
          ]);
          done();
        });
      });

      it('should normalize "tdur" to "dur"', (done) => {
        var event = chromeTimelineEvents.create('X', 'FunctionCall', 1100, null);
        event['tdur'] = 5500;
        createExtension([event]).readPerfLog().then( (events) => {
          expect(events).toEqual([
            normEvents.complete('script', 1.1, 5.5, null),
          ]);
          done();
        });
      });

      it('should report FunctionCall events as "script"', (done) => {
        createExtension([
          chromeTimelineEvents.start('FunctionCall', 0)
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([
            normEvents.start('script', 0),
          ]);
          done();
        });
      });

      it('should ignore FunctionCalls from webdriver', (done) => {
        createExtension([
          chromeTimelineEvents.start('FunctionCall', 0, {'data': {'scriptName': 'InjectedScript'}})
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([]);
          done();
        });
      });

      it('should report begin timestamps', (done) => {
        createExtension([
          blinkEvents.create('S', 'someName', 1000)
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([
            normEvents.markStart('someName', 1.0)
          ]);
          done();
        });
      });

      it('should report end timestamps', (done) => {
        createExtension([
          blinkEvents.create('F', 'someName', 1000)
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([
            normEvents.markEnd('someName', 1.0)
          ]);
          done();
        });
      });

      it('should report gc', (done) => {
        createExtension([
          chromeTimelineEvents.start('GCEvent', 1000, {'usedHeapSizeBefore': 1000}),
          chromeTimelineEvents.end('GCEvent', 2000, {'usedHeapSizeAfter': 0}),
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([
            normEvents.start('gc', 1.0, {'usedHeapSize': 1000}),
            normEvents.end('gc', 2.0, {'usedHeapSize': 0, 'majorGc': false}),
          ]);
          done();
        });
      });

      it('should report major gc', (done) => {
        createExtension([
          chromeTimelineEvents.start('GCEvent', 1000, {'usedHeapSizeBefore': 1000}),
          v8EventsOtherProcess.start('majorGC', 1100, null),
          v8EventsOtherProcess.end('majorGC', 1200, null),
          chromeTimelineEvents.end('GCEvent', 2000, {'usedHeapSizeAfter': 0}),
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([
            normEvents.start('gc', 1.0, {'usedHeapSize': 1000}),
            normEvents.end('gc', 2.0, {'usedHeapSize': 0, 'majorGc': false}),
          ]);
          done();
        });
      });

      it('should ignore major gc from different processes', (done) => {
        createExtension([
          chromeTimelineEvents.start('GCEvent', 1000, {'usedHeapSizeBefore': 1000}),
          v8Events.start('majorGC', 1100, null),
          v8Events.end('majorGC', 1200, null),
          chromeTimelineEvents.end('GCEvent', 2000, {'usedHeapSizeAfter': 0}),
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([
            normEvents.start('gc', 1.0, {'usedHeapSize': 1000}),
            normEvents.end('gc', 2.0, {'usedHeapSize': 0, 'majorGc': true}),
          ]);
          done();
        });
      });

      ['RecalculateStyles', 'Layout', 'UpdateLayerTree', 'Paint', 'Rasterize', 'CompositeLayers'].forEach( (recordType) => {
        it(`should report ${recordType} as "render"`, (done) => {
          createExtension([
            chromeTimelineEvents.start(recordType, 1234),
            chromeTimelineEvents.end(recordType, 2345)
          ]).readPerfLog().then( (events) => {
            expect(events).toEqual([
              normEvents.start('render', 1.234),
              normEvents.end('render', 2.345),
            ]);
            done();
          });
        });
      });

      it('should throw an error on buffer overflow', (done) => {
        PromiseWrapper.catchError(createExtension([
          chromeTimelineEvents.start('FunctionCall', 1234),
        ], 'Tracing.bufferUsage').readPerfLog(), (err) => {
          expect( () => {
            throw err;
          }).toThrowError('The DevTools trace buffer filled during the test!');
          done();
        });
      });

      it('should match chrome browsers', () => {
        expect(createExtension().supports({
          'browserName': 'chrome'
        })).toBe(true);

        expect(createExtension().supports({
          'browserName': 'Chrome'
        })).toBe(true);
      });

    });

  });
}

class MockDriverAdapter extends WebDriverAdapter {
  _log:List;
  _events:List;
  _messageMethod:string;
  constructor(log, events, messageMethod) {
    super();
    this._log = log;
    this._events = events;
    this._messageMethod = messageMethod;
  }

  executeScript(script) {
    ListWrapper.push(this._log, ['executeScript', script]);
    return PromiseWrapper.resolve(null);
  }

  logs(type) {
    ListWrapper.push(this._log, ['logs', type]);
    if (type === 'performance') {
      return PromiseWrapper.resolve(this._events.map( (event) => {
        return {
          'message': Json.stringify({
            'message': {
              'method': this._messageMethod,
              'params': event
            }
          })
        };
      }));
    } else {
      return null;
    }
  }

}
