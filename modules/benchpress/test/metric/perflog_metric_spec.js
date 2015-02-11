import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import { List, ListWrapper } from 'angular2/src/facade/collection';
import { PromiseWrapper, Promise } from 'angular2/src/facade/async';

import { Metric, PerflogMetric, WebDriverExtension, bind, Injector } from 'benchpress/benchpress';

export function main() {
  var commandLog;

  function createMetric(perfLogs) {
    commandLog = [];
    return new Injector([
      PerflogMetric.BINDINGS,
      bind(PerflogMetric.SET_TIMEOUT).toValue( (fn, millis) => {
        ListWrapper.push(commandLog, ['setTimeout', millis]);
        fn();
      }),
      bind(WebDriverExtension).toValue(new MockDriverExtension(perfLogs, commandLog))
    ]).get(Metric);
  }

  describe('perflog metric', () => {

    it('should describe itself', () => {
      expect(createMetric([[]]).describe()['script']).toBe('script execution time in ms');
    });

    describe('beginMeasure', () => {

      it('should mark the timeline', (done) => {
        var metric = createMetric([[]]);
        metric.beginMeasure().then((_) => {
          expect(commandLog).toEqual([['timeBegin', 'benchpress0']]);

          done();
        });
      });

    });

    describe('endMeasure', () => {

      it('should mark and aggregate events in between the marks', (done) => {
        var events = [
          [
            markStartEvent('benchpress0'),
            startEvent('script', 4),
            endEvent('script', 6),
            markEndEvent('benchpress0')
          ]
        ];
        var metric = createMetric(events);
        metric.beginMeasure()
          .then( (_) => metric.endMeasure(false) )
          .then( (data) => {
            expect(commandLog).toEqual([
              ['timeBegin', 'benchpress0'],
              ['timeEnd', 'benchpress0', null],
              'readPerfLog'
            ]);
            expect(data['script']).toBe(2);

            done();
        });
      });

      it('should restart timing', (done) => {
        var events = [
          [
            markStartEvent('benchpress0'),
            markEndEvent('benchpress0'),
            markStartEvent('benchpress1'),
          ], [
            markEndEvent('benchpress1')
          ]
        ];
        var metric = createMetric(events);
        metric.beginMeasure()
          .then( (_) => metric.endMeasure(true) )
          .then( (_) => metric.endMeasure(true) )
          .then( (_) => {
            expect(commandLog).toEqual([
              ['timeBegin', 'benchpress0'],
              ['timeEnd', 'benchpress0', 'benchpress1'],
              'readPerfLog',
              ['timeEnd', 'benchpress1', 'benchpress2'],
              'readPerfLog'
            ]);

            done();
        });
      });

      it('should loop and aggregate until the end mark is present', (done) => {
        var events = [
          [ markStartEvent('benchpress0'), startEvent('script', 1) ],
          [ endEvent('script', 2) ],
          [ startEvent('script', 3), endEvent('script', 5), markEndEvent('benchpress0') ]
        ];
        var metric = createMetric(events);
        metric.beginMeasure()
          .then( (_) => metric.endMeasure(false) )
          .then( (data) => {
            expect(commandLog).toEqual([
              ['timeBegin', 'benchpress0'],
              ['timeEnd', 'benchpress0', null],
              'readPerfLog',
              [ 'setTimeout', 100 ],
              'readPerfLog',
              [ 'setTimeout', 100 ],
              'readPerfLog'
            ]);
            expect(data['script']).toBe(3);

            done();
        });
      });

      it('should store events after the end mark for the next call', (done) => {
        var events = [
          [ markStartEvent('benchpress0'), markEndEvent('benchpress0'), markStartEvent('benchpress1'),
            startEvent('script', 1), endEvent('script', 2) ],
          [ startEvent('script', 3), endEvent('script', 5), markEndEvent('benchpress1') ]
        ];
        var metric = createMetric(events);
        metric.beginMeasure()
          .then( (_) => metric.endMeasure(true) )
          .then( (data) => {
            expect(data['script']).toBe(0);
            return metric.endMeasure(true)
          })
          .then( (data) => {
            expect(commandLog).toEqual([
              ['timeBegin', 'benchpress0'],
              ['timeEnd', 'benchpress0', 'benchpress1'],
              'readPerfLog',
              ['timeEnd', 'benchpress1', 'benchpress2'],
              'readPerfLog'
            ]);
            expect(data['script']).toBe(3);

            done();
        });
      });

    });

    describe('aggregation', () => {

      function aggregate(events) {
        ListWrapper.insert(events, 0, markStartEvent('benchpress0'));
        ListWrapper.push(events, markEndEvent('benchpress0'));
        var metric = createMetric([events]);
        return metric
          .beginMeasure().then( (_) => metric.endMeasure(false) );
      }


      it('should report a single interval', (done) => {
        aggregate([
          startEvent('script', 0),
          endEvent('script', 5)
        ]).then((data) => {
          expect(data['script']).toBe(5);
          done();
        });
      });

      it('should sum up multiple intervals', (done) => {
        aggregate([
          startEvent('script', 0),
          endEvent('script', 5),
          startEvent('script', 10),
          endEvent('script', 17)
        ]).then((data) => {
          expect(data['script']).toBe(12);
          done();
        });
      });

      it('should ignore not started intervals', (done) => {
        aggregate([
          endEvent('script', 10)
        ]).then((data) => {
          expect(data['script']).toBe(0);
          done();
        });
      });

      it('should ignore not ended intervals', (done) => {
        aggregate([
          startEvent('script', 10)
        ]).then((data) => {
          expect(data['script']).toBe(0);
          done();
        });
      });

      ['script', 'gcTime', 'render'].forEach( (metricName) => {
        it(`should support ${metricName} metric`, (done) => {
          aggregate([
            startEvent(metricName, 0),
            endEvent(metricName, 5)
          ]).then((data) => {
            expect(data[metricName]).toBe(5);
            done();
          });
        });
      });

      it('should support gcAmount metric', (done) => {
        aggregate([
          startEvent('gc', 0),
          endEvent('gc', 5, {'amount': 10})
        ]).then((data) => {
          expect(data['gcAmount']).toBe(10);
          done();
        });
      });

      it('should subtract gcTime in script from script time', (done) => {
        aggregate([
          startEvent('script', 0),
          startEvent('gc', 1),
          endEvent('gc', 4, {'amount': 10}),
          endEvent('script', 5)
        ]).then((data) => {
          expect(data['script']).toBe(2);
          done();
        });
      });

      describe('gcTimeInScript / gcAmountInScript', () => {

        it('should use gc during script execution', (done) => {
          aggregate([
            startEvent('script', 0),
            startEvent('gc', 1),
            endEvent('gc', 4, {'amount': 10}),
            endEvent('script', 5)
          ]).then((data) => {
            expect(data['gcTimeInScript']).toBe(3);
            expect(data['gcAmountInScript']).toBe(10);
            done();
          });
        });

        it('should ignore gc outside of script execution', (done) => {
          aggregate([
            startEvent('gc', 1),
            endEvent('gc', 4, {'amount': 10}),
            startEvent('script', 0),
            endEvent('script', 5)
          ]).then((data) => {
            expect(data['gcTimeInScript']).toBe(0);
            expect(data['gcAmountInScript']).toBe(0);
            done();
          });
        });

      });

    });

  });
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

class MockDriverExtension extends WebDriverExtension {
  _perfLogs:List;
  _commandLog:List;
  constructor(perfLogs, commandLog) {
    super();
    this._perfLogs = perfLogs;
    this._commandLog = commandLog;
  }

  timeBegin(name):Promise {
    ListWrapper.push(this._commandLog, ['timeBegin', name]);
    return PromiseWrapper.resolve(null);
  }

  timeEnd(name, restartName):Promise {
    ListWrapper.push(this._commandLog, ['timeEnd', name, restartName]);
    return PromiseWrapper.resolve(null);
  }

  readPerfLog():Promise {
    ListWrapper.push(this._commandLog, 'readPerfLog');
    if (this._perfLogs.length > 0) {
      var next = this._perfLogs[0];
      ListWrapper.removeAt(this._perfLogs, 0);
      return PromiseWrapper.resolve(next);
    } else {
      return PromiseWrapper.resolve([]);
    }
  }
}
