import {describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import { ListWrapper } from 'angular2/src/facade/collection';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { Json, perfRecords, isBlank } from 'angular2/src/facade/lang';

import {
  WebDriverExtension, ChromeDriverExtension,
  WebDriverAdapter, Injector, bind
} from 'benchpress/benchpress';

export function main() {
  describe('chrome driver extension', () => {
    var log;
    var extension;

    function createExtension(perfRecords = null) {
      if (isBlank(perfRecords)) {
        perfRecords = [];
      }
      log = [];
      extension = new Injector([
        ChromeDriverExtension.BINDINGS,
        bind(WebDriverAdapter).toValue(new MockDriverAdapter(log, perfRecords))
      ]).get(WebDriverExtension);
      return extension;
    }

    it('should force gc via window.gc()', (done) => {
      createExtension().gc().then( (_) => {
        expect(log).toEqual([['executeScript', 'window.gc()']]);
        done();
      });
    });

    it('should mark the timeline via console.timeStamp()', (done) => {
      createExtension().timeBegin('someName').then( (_) => {
        expect(log).toEqual([['executeScript', `console.timeStamp('begin_someName');`]]);
        done();
      });
    });

    it('should mark the timeline via console.timeEnd()', (done) => {
      createExtension().timeEnd('someName').then( (_) => {
        expect(log).toEqual([['executeScript', `console.timeStamp('end_someName');`]]);
        done();
      });
    });

    it('should mark the timeline via console.time() and console.timeEnd()', (done) => {
      createExtension().timeEnd('name1', 'name2').then( (_) => {
        expect(log).toEqual([['executeScript', `console.timeStamp('end_name1');console.timeStamp('begin_name2');`]]);
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

      it('should report FunctionCall records as "script"', (done) => {
        createExtension([
          durationRecord('FunctionCall', 1, 5)
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([
            startEvent('script', 1),
            endEvent('script', 5)
          ]);
          done();
        });
      });

      it('should ignore FunctionCalls from webdriver', (done) => {
        createExtension([
          internalScriptRecord(1, 5)
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([]);
          done();
        });
      });

      it('should report begin timestamps', (done) => {
        createExtension([
          timeStampRecord('begin_someName')
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([
            markStartEvent('someName')
          ]);
          done();
        });
      });

      it('should report end timestamps', (done) => {
        createExtension([
          timeStampRecord('end_someName')
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([
            markEndEvent('someName')
          ]);
          done();
        });
      });

      it('should report gc', (done) => {
        createExtension([
          gcRecord(1, 3, 21)
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([
            startEvent('gc', 1),
            endEvent('gc', 3, {'amount': 21}),
          ]);
          done();
        });
      });

      ['RecalculateStyles', 'Layout', 'UpdateLayerTree', 'Paint', 'Rasterize', 'CompositeLayers'].forEach( (recordType) => {
        it(`should report ${recordType}`, (done) => {
          createExtension([
            durationRecord(recordType, 0, 1)
          ]).readPerfLog().then( (events) => {
            expect(events).toEqual([
              startEvent('render', 0),
              endEvent('render', 1),
            ]);
            done();
          });
        });
      });


      it('should walk children', (done) => {
        createExtension([
          durationRecord('FunctionCall', 1, 5, [
            timeStampRecord('begin_someName')
          ])
        ]).readPerfLog().then( (events) => {
          expect(events).toEqual([
            startEvent('script', 1),
            markStartEvent('someName'),
            endEvent('script', 5)
          ]);
          done();
        });
      });

    });

  });
}

function timeStampRecord(name) {
  return {
    'type': 'TimeStamp',
    'data': {
      'message': name
    }
  };
}

function durationRecord(type, startTime, endTime, children = null) {
  if (isBlank(children)) {
    children = [];
  }
  return {
    'type': type,
    'startTime': startTime,
    'endTime': endTime,
    'children': children
  };
}

function internalScriptRecord(startTime, endTime) {
  return {
    'type': 'FunctionCall',
    'startTime': startTime,
    'endTime': endTime,
    'data': {
      'scriptName': 'InjectedScript'
    }
  };
}

function gcRecord(startTime, endTime, gcAmount) {
  return {
    'type': 'GCEvent',
    'startTime': startTime,
    'endTime': endTime,
    'data': {
      'usedHeapSizeDelta': gcAmount
    }
  };
}

function markStartEvent(type) {
  return {
    'name': type,
    'ph': 'b'
  }
}

function markEndEvent(type) {
  return {
    'name': type,
    'ph': 'e'
  }
}

function startEvent(type, time) {
  return {
    'name': type,
    'ts': time,
    'ph': 'B'
  }
}

function endEvent(type, time, args = null) {
  return {
    'name': type,
    'ts': time,
    'ph': 'E',
    'args': args
  }
}

class MockDriverAdapter extends WebDriverAdapter {
  _log:List;
  _perfRecords:List;
  constructor(log, perfRecords) {
    super();
    this._log = log;
    this._perfRecords = perfRecords;
  }

  executeScript(script) {
    ListWrapper.push(this._log, ['executeScript', script]);
    return PromiseWrapper.resolve(null);
  }

  logs(type) {
    ListWrapper.push(this._log, ['logs', type]);
    if (type === 'performance') {
      return PromiseWrapper.resolve(this._perfRecords.map(function(record) {
        return {
          'message': Json.stringify({
            'message': {
              'method': 'Timeline.eventRecorded',
              'params': {
                'record': record
              }
            }
          })
        };
      }));
    } else {
      return null;
    }
  }

}
