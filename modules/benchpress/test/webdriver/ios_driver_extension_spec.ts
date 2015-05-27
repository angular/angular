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
import {Json, isBlank, isPresent} from 'angular2/src/facade/lang';

import {
  WebDriverExtension,
  IOsDriverExtension,
  WebDriverAdapter,
  Injector,
  bind
} from 'benchpress/common';

import {TraceEventFactory} from '../trace_event_factory';

export function main() {
  describe('ios driver extension', () => {
    var log;
    var extension;

    var normEvents = new TraceEventFactory('timeline', 'pid0');

    function createExtension(perfRecords = null) {
      if (isBlank(perfRecords)) {
        perfRecords = [];
      }
      log = [];
      extension = Injector.resolveAndCreate([
                            IOsDriverExtension.BINDINGS,
                            bind(WebDriverAdapter).toValue(new MockDriverAdapter(log, perfRecords))
                          ])
                      .get(IOsDriverExtension);
      return extension;
    }

    it('should throw on forcing gc', () => {
      expect(() => createExtension().gc()).toThrowError('Force GC is not supported on iOS');
    });

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

      it('should report FunctionCall records as "script"', inject([AsyncTestCompleter], (async) => {
           createExtension([durationRecord('FunctionCall', 1, 5)])
               .readPerfLog()
               .then((events) => {
                 expect(events)
                     .toEqual([normEvents.start('script', 1), normEvents.end('script', 5)]);
                 async.done();
               });
         }));

      it('should ignore FunctionCalls from webdriver', inject([AsyncTestCompleter], (async) => {
           createExtension([internalScriptRecord(1, 5)])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([]);
                 async.done();
               });
         }));

      it('should report begin time', inject([AsyncTestCompleter], (async) => {
           createExtension([timeBeginRecord('someName', 12)])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([normEvents.markStart('someName', 12)]);
                 async.done();
               });
         }));

      it('should report end timestamps', inject([AsyncTestCompleter], (async) => {
           createExtension([timeEndRecord('someName', 12)])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([normEvents.markEnd('someName', 12)]);
                 async.done();
               });
         }));

      ['RecalculateStyles', 'Layout', 'UpdateLayerTree', 'Paint', 'Rasterize', 'CompositeLayers']
          .forEach((recordType) => {
            it(`should report ${recordType}`, inject([AsyncTestCompleter], (async) => {
                 createExtension([durationRecord(recordType, 0, 1)])
                     .readPerfLog()
                     .then((events) => {
                       expect(events).toEqual([
                         normEvents.start('render', 0),
                         normEvents.end('render', 1),
                       ]);
                       async.done();
                     });
               }));
          });


      it('should walk children', inject([AsyncTestCompleter], (async) => {
           createExtension([durationRecord('FunctionCall', 1, 5, [timeBeginRecord('someName', 2)])])
               .readPerfLog()
               .then((events) => {
                 expect(events).toEqual([
                   normEvents.start('script', 1),
                   normEvents.markStart('someName', 2),
                   normEvents.end('script', 5)
                 ]);
                 async.done();
               });
         }));

      it('should match safari browsers', () => {
        expect(createExtension().supports({'browserName': 'safari'})).toBe(true);

        expect(createExtension().supports({'browserName': 'Safari'})).toBe(true);
      });

    });

  });
}

function timeBeginRecord(name, time) {
  return {'type': 'Time', 'startTime': time, 'data': {'message': name}};
}

function timeEndRecord(name, time) {
  return {'type': 'TimeEnd', 'startTime': time, 'data': {'message': name}};
}

function durationRecord(type, startTime, endTime, children = null) {
  if (isBlank(children)) {
    children = [];
  }
  return {'type': type, 'startTime': startTime, 'endTime': endTime, 'children': children};
}

function internalScriptRecord(startTime, endTime) {
  return {
    'type': 'FunctionCall',
    'startTime': startTime,
    'endTime': endTime,
    'data': {'scriptName': 'InjectedScript'}
  };
}

class MockDriverAdapter extends WebDriverAdapter {
  constructor(private _log: List<any>, private _perfRecords: List<any>) { super(); }

  executeScript(script) {
    ListWrapper.push(this._log, ['executeScript', script]);
    return PromiseWrapper.resolve(null);
  }

  logs(type) {
    ListWrapper.push(this._log, ['logs', type]);
    if (type === 'performance') {
      return PromiseWrapper.resolve(this._perfRecords.map(function(record) {
        return {
          'message': Json.stringify(
              {'message': {'method': 'Timeline.eventRecorded', 'params': {'record': record}}})
        };
      }));
    } else {
      return null;
    }
  }
}
