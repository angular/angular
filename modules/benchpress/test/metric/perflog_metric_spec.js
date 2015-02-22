import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import { List, ListWrapper } from 'angular2/src/facade/collection';
import { PromiseWrapper, Promise } from 'angular2/src/facade/async';

import { Metric, PerflogMetric, WebDriverExtension, bind, Injector } from 'benchpress/benchpress';

import { TraceEventFactory } from '../trace_event_factory';

export function main() {
  var commandLog;
  var eventFactory = new TraceEventFactory('timeline', 'pid0');

  function createMetric(perfLogs) {
    commandLog = [];
    return new Injector([
      PerflogMetric.BINDINGS,
      bind(PerflogMetric.SET_TIMEOUT).toValue( (fn, millis) => {
        ListWrapper.push(commandLog, ['setTimeout', millis]);
        fn();
      }),
      bind(WebDriverExtension).toValue(new MockDriverExtension(perfLogs, commandLog))
    ]).get(PerflogMetric);
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
            eventFactory.markStart('benchpress0', 0),
            eventFactory.start('script', 4),
            eventFactory.end('script', 6),
            eventFactory.markEnd('benchpress0', 10)
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
            eventFactory.markStart('benchpress0', 0),
            eventFactory.markEnd('benchpress0', 1),
            eventFactory.markStart('benchpress1', 2),
          ], [
            eventFactory.markEnd('benchpress1', 3)
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
          [ eventFactory.markStart('benchpress0', 0), eventFactory.start('script', 1) ],
          [ eventFactory.end('script', 2) ],
          [ eventFactory.start('script', 3), eventFactory.end('script', 5), eventFactory.markEnd('benchpress0', 10) ]
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
          [ eventFactory.markStart('benchpress0', 0), eventFactory.markEnd('benchpress0', 1), eventFactory.markStart('benchpress1', 1),
            eventFactory.start('script', 1), eventFactory.end('script', 2) ],
          [ eventFactory.start('script', 3), eventFactory.end('script', 5), eventFactory.markEnd('benchpress1', 6) ]
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
        ListWrapper.insert(events, 0, eventFactory.markStart('benchpress0', 0));
        ListWrapper.push(events, eventFactory.markEnd('benchpress0', 10));
        var metric = createMetric([events]);
        return metric
          .beginMeasure().then( (_) => metric.endMeasure(false) );
      }


      it('should report a single interval', (done) => {
        aggregate([
          eventFactory.start('script', 0),
          eventFactory.end('script', 5)
        ]).then((data) => {
          expect(data['script']).toBe(5);
          done();
        });
      });

      it('should sum up multiple intervals', (done) => {
        aggregate([
          eventFactory.start('script', 0),
          eventFactory.end('script', 5),
          eventFactory.start('script', 10),
          eventFactory.end('script', 17)
        ]).then((data) => {
          expect(data['script']).toBe(12);
          done();
        });
      });

      it('should ignore not started intervals', (done) => {
        aggregate([
          eventFactory.end('script', 10)
        ]).then((data) => {
          expect(data['script']).toBe(0);
          done();
        });
      });

      it('should ignore not ended intervals', (done) => {
        aggregate([
          eventFactory.start('script', 10)
        ]).then((data) => {
          expect(data['script']).toBe(0);
          done();
        });
      });

      it('should ignore events from different processed as the start mark', (done) => {
        var otherProcessEventFactory = new TraceEventFactory('timeline', 'pid1');
        var metric = createMetric([[
          eventFactory.markStart('benchpress0', 0),
          eventFactory.start('script', 0, null),
          eventFactory.end('script', 5, null),
          otherProcessEventFactory.start('script', 10, null),
          otherProcessEventFactory.end('script', 17, null),
          eventFactory.markEnd('benchpress0', 20)
        ]]);
        metric.beginMeasure()
          .then( (_) => metric.endMeasure(false) )
          .then((data) => {
            expect(data['script']).toBe(5);
            done();
          });
      });

      ['script', 'gcTime', 'render'].forEach( (metricName) => {
        it(`should support ${metricName} metric`, (done) => {
          aggregate([
            eventFactory.start(metricName, 0),
            eventFactory.end(metricName, 5)
          ]).then((data) => {
            expect(data[metricName]).toBe(5);
            done();
          });
        });
      });

      it('should support gcAmount metric', (done) => {
        aggregate([
          eventFactory.start('gc', 0, {'usedHeapSize': 2500}),
          eventFactory.end('gc', 5, {'usedHeapSize': 1000})
        ]).then((data) => {
          expect(data['gcAmount']).toBe(1.5);
          done();
        });
      });

      it('should subtract gcTime in script from script time', (done) => {
        aggregate([
          eventFactory.start('script', 0),
          eventFactory.start('gc', 1, {'usedHeapSize': 1000}),
          eventFactory.end('gc', 4, {'usedHeapSize': 0}),
          eventFactory.end('script', 5)
        ]).then((data) => {
          expect(data['script']).toBe(2);
          done();
        });
      });

      describe('gcTimeInScript / gcAmountInScript', () => {

        it('should detect gc during script execution with begin/end events', (done) => {
          aggregate([
            eventFactory.start('script', 0),
            eventFactory.start('gc', 1, {'usedHeapSize': 10000}),
            eventFactory.end('gc', 4, {'usedHeapSize': 0}),
            eventFactory.end('script', 5)
          ]).then((data) => {
            expect(data['gcTimeInScript']).toBe(3);
            expect(data['gcAmountInScript']).toBe(10.0);
            done();
          });
        });

        it('should detect gc during script execution with complete events', (done) => {
          aggregate([
            eventFactory.complete('script', 0, 5),
            eventFactory.start('gc', 1, {'usedHeapSize': 10000}),
            eventFactory.end('gc', 4, {'usedHeapSize': 0})
          ]).then((data) => {
            expect(data['gcTimeInScript']).toBe(3);
            expect(data['gcAmountInScript']).toBe(10.0);
            done();
          });
        });

        it('should ignore gc outside of script execution', (done) => {
          aggregate([
            eventFactory.start('gc', 1, {'usedHeapSize': 10}),
            eventFactory.end('gc', 4, {'usedHeapSize': 0}),
            eventFactory.start('script', 0),
            eventFactory.end('script', 5)
          ]).then((data) => {
            expect(data['gcTimeInScript']).toEqual(0.0);
            expect(data['gcAmountInScript']).toEqual(0.0);
            done();
          });
        });

      });

    });

  });
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
