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

import {List, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {isPresent, isBlank} from 'angular2/src/facade/lang';

import {
  Metric,
  PerflogMetric,
  WebDriverExtension,
  PerfLogFeatures,
  bind,
  Injector,
  Options
} from 'benchpress/common';

import {TraceEventFactory} from '../trace_event_factory';

export function main() {
  var commandLog;
  var eventFactory = new TraceEventFactory('timeline', 'pid0');

  function createMetric(perfLogs, microMetrics = null, perfLogFeatures = null, forceGc = null,
                        captureFrames = null) {
    commandLog = [];
    if (isBlank(perfLogFeatures)) {
      perfLogFeatures = new PerfLogFeatures({render: true, gc: true, frameCapture: true});
    }
    if (isBlank(microMetrics)) {
      microMetrics = StringMapWrapper.create();
    }
    var bindings = [
      Options.DEFAULT_BINDINGS,
      PerflogMetric.BINDINGS,
      bind(Options.MICRO_METRICS).toValue(microMetrics),
      bind(PerflogMetric.SET_TIMEOUT)
          .toValue((fn, millis) => {
            ListWrapper.push(commandLog, ['setTimeout', millis]);
            fn();
          }),
      bind(WebDriverExtension)
          .toValue(new MockDriverExtension(perfLogs, commandLog, perfLogFeatures))
    ];
    if (isPresent(forceGc)) {
      ListWrapper.push(bindings, bind(Options.FORCE_GC).toValue(forceGc));
    }
    if (isPresent(captureFrames)) {
      ListWrapper.push(bindings, bind(Options.CAPTURE_FRAMES).toValue(captureFrames));
    }
    return Injector.resolveAndCreate(bindings).get(PerflogMetric);
  }

  describe('perflog metric', () => {

    function sortedKeys(stringMap) {
      var res = [];
      StringMapWrapper.forEach(stringMap, (_, key) => { ListWrapper.push(res, key); });
      res.sort();
      return res;
    }

    it('should describe itself based on the perfLogFeatrues', () => {
      expect(sortedKeys(createMetric([[]], null, new PerfLogFeatures()).describe()))
          .toEqual(['pureScriptTime', 'scriptTime']);

      expect(sortedKeys(createMetric([[]], null, new PerfLogFeatures({render: true, gc: false}))
                            .describe()))
          .toEqual(['pureScriptTime', 'renderTime', 'scriptTime']);

      expect(sortedKeys(createMetric([[]]).describe()))
          .toEqual(
              ['gcAmount', 'gcTime', 'majorGcTime', 'pureScriptTime', 'renderTime', 'scriptTime']);

      expect(
          sortedKeys(createMetric([[]], null, new PerfLogFeatures({render: true, gc: true}), true)
                         .describe()))
          .toEqual([
            'forcedGcAmount',
            'forcedGcTime',
            'gcAmount',
            'gcTime',
            'majorGcTime',
            'pureScriptTime',
            'renderTime',
            'scriptTime'
          ]);
    });

    it('should describe itself based on micro metrics', () => {
      var description = createMetric([[]], {'myMicroMetric': 'someDesc'}).describe();
      expect(description['myMicroMetric']).toEqual('someDesc');
    });

    it('should describe itself if frame capture is requested and available', () => {
      var description =
          createMetric([[]], null, new PerfLogFeatures({frameCapture: true}), null, true)
              .describe();
      expect(description['meanFrameTime']).not.toContain('WARNING');
    });

    it('should describe itself if frame capture is requested and not available', () => {
      var description =
          createMetric([[]], null, new PerfLogFeatures({frameCapture: false}), null, true)
              .describe();
      expect(description['meanFrameTime']).toContain('WARNING');
    });

    describe('beginMeasure', () => {

      it('should not force gc and mark the timeline', inject([AsyncTestCompleter], (async) => {
           var metric = createMetric([[]]);
           metric.beginMeasure().then((_) => {
             expect(commandLog).toEqual([['timeBegin', 'benchpress0']]);

             async.done();
           });
         }));

      it('should force gc and mark the timeline', inject([AsyncTestCompleter], (async) => {
           var metric = createMetric([[]], null, null, true);
           metric.beginMeasure().then((_) => {
             expect(commandLog).toEqual([['gc'], ['timeBegin', 'benchpress0']]);

             async.done();
           });
         }));

    });

    describe('endMeasure', () => {

      it('should mark and aggregate events in between the marks',
         inject([AsyncTestCompleter], (async) => {
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
               .then((_) => metric.endMeasure(false))
               .then((data) => {
                 expect(commandLog)
                     .toEqual([
                       ['timeBegin', 'benchpress0'],
                       ['timeEnd', 'benchpress0', null],
                       'readPerfLog'
                     ]);
                 expect(data['scriptTime']).toBe(2);

                 async.done();
               });
         }));

      it('should restart timing', inject([AsyncTestCompleter], (async) => {
           var events = [
             [
               eventFactory.markStart('benchpress0', 0),
               eventFactory.markEnd('benchpress0', 1),
               eventFactory.markStart('benchpress1', 2),
             ],
             [eventFactory.markEnd('benchpress1', 3)]
           ];
           var metric = createMetric(events);
           metric.beginMeasure()
               .then((_) => metric.endMeasure(true))
               .then((_) => metric.endMeasure(true))
               .then((_) => {
                 expect(commandLog)
                     .toEqual([
                       ['timeBegin', 'benchpress0'],
                       ['timeEnd', 'benchpress0', 'benchpress1'],
                       'readPerfLog',
                       ['timeEnd', 'benchpress1', 'benchpress2'],
                       'readPerfLog'
                     ]);

                 async.done();
               });
         }));

      it('should loop and aggregate until the end mark is present',
         inject([AsyncTestCompleter], (async) => {
           var events = [
             [eventFactory.markStart('benchpress0', 0), eventFactory.start('script', 1)],
             [eventFactory.end('script', 2)],
             [
               eventFactory.start('script', 3),
               eventFactory.end('script', 5),
               eventFactory.markEnd('benchpress0', 10)
             ]
           ];
           var metric = createMetric(events);
           metric.beginMeasure()
               .then((_) => metric.endMeasure(false))
               .then((data) => {
                 expect(commandLog)
                     .toEqual([
                       ['timeBegin', 'benchpress0'],
                       ['timeEnd', 'benchpress0', null],
                       'readPerfLog',
                       ['setTimeout', 100],
                       'readPerfLog',
                       ['setTimeout', 100],
                       'readPerfLog'
                     ]);
                 expect(data['scriptTime']).toBe(3);

                 async.done();
               });
         }));

      it('should store events after the end mark for the next call',
         inject([AsyncTestCompleter], (async) => {
           var events = [
             [
               eventFactory.markStart('benchpress0', 0),
               eventFactory.markEnd('benchpress0', 1),
               eventFactory.markStart('benchpress1', 1),
               eventFactory.start('script', 1),
               eventFactory.end('script', 2)
             ],
             [
               eventFactory.start('script', 3),
               eventFactory.end('script', 5),
               eventFactory.markEnd('benchpress1', 6)
             ]
           ];
           var metric = createMetric(events);
           metric.beginMeasure()
               .then((_) => metric.endMeasure(true))
               .then((data) => {
                 expect(data['scriptTime']).toBe(0);
                 return metric.endMeasure(true)
               })
               .then((data) => {
                 expect(commandLog)
                     .toEqual([
                       ['timeBegin', 'benchpress0'],
                       ['timeEnd', 'benchpress0', 'benchpress1'],
                       'readPerfLog',
                       ['timeEnd', 'benchpress1', 'benchpress2'],
                       'readPerfLog'
                     ]);
                 expect(data['scriptTime']).toBe(3);

                 async.done();
               });
         }));

      describe('with forced gc', () => {
        var events;
        beforeEach(() => {
          events = [
            [
              eventFactory.markStart('benchpress0', 0),
              eventFactory.start('script', 4),
              eventFactory.end('script', 6),
              eventFactory.markEnd('benchpress0', 10),
              eventFactory.markStart('benchpress1', 11),
              eventFactory.start('gc', 12, {'usedHeapSize': 2500}),
              eventFactory.end('gc', 15, {'usedHeapSize': 1000}),
              eventFactory.markEnd('benchpress1', 20)
            ]
          ];
        });

        it('should measure forced gc', inject([AsyncTestCompleter], (async) => {
             var metric = createMetric(events, null, null, true);
             metric.beginMeasure()
                 .then((_) => metric.endMeasure(false))
                 .then((data) => {
                   expect(commandLog)
                       .toEqual([
                         ['gc'],
                         ['timeBegin', 'benchpress0'],
                         ['timeEnd', 'benchpress0', 'benchpress1'],
                         'readPerfLog',
                         ['gc'],
                         ['timeEnd', 'benchpress1', null],
                         'readPerfLog'
                       ]);
                   expect(data['forcedGcTime']).toBe(3);
                   expect(data['forcedGcAmount']).toBe(1.5);

                   async.done();
                 });
           }));

        it('should restart after the forced gc if needed', inject([AsyncTestCompleter], (async) => {
             var metric = createMetric(events, null, null, true);
             metric.beginMeasure()
                 .then((_) => metric.endMeasure(true))
                 .then((data) => {
                   expect(commandLog[5]).toEqual(['timeEnd', 'benchpress1', 'benchpress2']);

                   async.done();
                 });
           }));

      });

    });

    describe('aggregation', () => {

      function aggregate(events, microMetrics = null, captureFrames = null) {
        ListWrapper.insert(events, 0, eventFactory.markStart('benchpress0', 0));
        ListWrapper.push(events, eventFactory.markEnd('benchpress0', 10));
        var metric = createMetric([events], microMetrics, null, null, captureFrames);
        return metric.beginMeasure().then((_) => metric.endMeasure(false));
      }

      describe('frame metrics', () => {
        it('should calculate mean frame time', inject([AsyncTestCompleter], (async) => {
             aggregate([
               eventFactory.markStart('frameCapture', 0),
               eventFactory.instant('frame', 1),
               eventFactory.instant('frame', 3),
               eventFactory.instant('frame', 4),
               eventFactory.markEnd('frameCapture', 5)
             ],
                       null, true)
                 .then((data) => {
                   expect(data['meanFrameTime']).toBe(((3 - 1) + (4 - 3)) / 2);
                   async.done();
                 });
           }));

        it('should throw if no start event', inject([AsyncTestCompleter], (async) => {
             PromiseWrapper.catchError(
                 aggregate(
                     [eventFactory.instant('frame', 4), eventFactory.markEnd('frameCapture', 5)],
                     null, true),
                 (err) => {
                   expect(() => { throw err; })
                       .toThrowError('missing start event for frame capture');
                   async.done();
                 });
           }));

        it('should throw if no end event', inject([AsyncTestCompleter], (async) => {
             PromiseWrapper.catchError(
                 aggregate(
                     [eventFactory.markStart('frameCapture', 3), eventFactory.instant('frame', 4)],
                     null, true),
                 (err) => {
                   expect(() => { throw err; }).toThrowError('missing end event for frame capture');
                   async.done();
                 });
           }));

        it('should throw if trying to capture twice', inject([AsyncTestCompleter], (async) => {
             PromiseWrapper.catchError(
                 aggregate([
                   eventFactory.markStart('frameCapture', 3),
                   eventFactory.markStart('frameCapture', 4)
                 ],
                           null, true),
                 (err) => {
                   expect(() => { throw err; })
                       .toThrowError('can capture frames only once per benchmark run');
                   async.done();
                 });
           }));

        it('should throw if trying to capture when frame capture is disabled',
           inject([AsyncTestCompleter], (async) => {
             PromiseWrapper.catchError(aggregate([eventFactory.markStart('frameCapture', 3)]), (err) => {
               expect(() => { throw err; })
                   .toThrowError(
                       'found start event for frame capture, but frame capture was not requested in benchpress');
               async.done();
             });
           }));

        it('should throw if frame capture is enabled, but nothing is captured',
           inject([AsyncTestCompleter], (async) => {
             PromiseWrapper.catchError(aggregate([], null, true), (err) => {
               expect(() => { throw err; })
                   .toThrowError(
                       'frame capture requested in benchpress, but no start event was found');
               async.done();
             });
           }));


      });

      it('should report a single interval', inject([AsyncTestCompleter], (async) => {
           aggregate([eventFactory.start('script', 0), eventFactory.end('script', 5)])
               .then((data) => {
                 expect(data['scriptTime']).toBe(5);
                 async.done();
               });
         }));

      it('should sum up multiple intervals', inject([AsyncTestCompleter], (async) => {
           aggregate([
             eventFactory.start('script', 0),
             eventFactory.end('script', 5),
             eventFactory.start('script', 10),
             eventFactory.end('script', 17)
           ])
               .then((data) => {
                 expect(data['scriptTime']).toBe(12);
                 async.done();
               });
         }));

      it('should ignore not started intervals', inject([AsyncTestCompleter], (async) => {
           aggregate([eventFactory.end('script', 10)])
               .then((data) => {
                 expect(data['scriptTime']).toBe(0);
                 async.done();
               });
         }));

      it('should ignore not ended intervals', inject([AsyncTestCompleter], (async) => {
           aggregate([eventFactory.start('script', 10)])
               .then((data) => {
                 expect(data['scriptTime']).toBe(0);
                 async.done();
               });
         }));

      it('should ignore nested intervals', inject([AsyncTestCompleter], (async) => {
           aggregate([
             eventFactory.start('script', 0),
             eventFactory.start('script', 5),
             eventFactory.end('script', 10),
             eventFactory.end('script', 17)
           ])
               .then((data) => {
                 expect(data['scriptTime']).toBe(17);
                 async.done();
               });
         }));

      it('should ignore events from different processed as the start mark',
         inject([AsyncTestCompleter], (async) => {
           var otherProcessEventFactory = new TraceEventFactory('timeline', 'pid1');
           var metric = createMetric([
             [
               eventFactory.markStart('benchpress0', 0),
               eventFactory.start('script', 0, null),
               eventFactory.end('script', 5, null),
               otherProcessEventFactory.start('script', 10, null),
               otherProcessEventFactory.end('script', 17, null),
               eventFactory.markEnd('benchpress0', 20)
             ]
           ]);
           metric.beginMeasure()
               .then((_) => metric.endMeasure(false))
               .then((data) => {
                 expect(data['scriptTime']).toBe(5);
                 async.done();
               });
         }));

      it('should support scriptTime metric', inject([AsyncTestCompleter], (async) => {
           aggregate([eventFactory.start('script', 0), eventFactory.end('script', 5)])
               .then((data) => {
                 expect(data['scriptTime']).toBe(5);
                 async.done();
               });
         }));

      it('should support renderTime metric', inject([AsyncTestCompleter], (async) => {
           aggregate([eventFactory.start('render', 0), eventFactory.end('render', 5)])
               .then((data) => {
                 expect(data['renderTime']).toBe(5);
                 async.done();
               });
         }));

      it('should support gcTime/gcAmount metric', inject([AsyncTestCompleter], (async) => {
           aggregate([
             eventFactory.start('gc', 0, {'usedHeapSize': 2500}),
             eventFactory.end('gc', 5, {'usedHeapSize': 1000})
           ])
               .then((data) => {
                 expect(data['gcTime']).toBe(5);
                 expect(data['gcAmount']).toBe(1.5);
                 expect(data['majorGcTime']).toBe(0);
                 async.done();
               });
         }));

      it('should support majorGcTime metric', inject([AsyncTestCompleter], (async) => {
           aggregate([
             eventFactory.start('gc', 0, {'usedHeapSize': 2500}),
             eventFactory.end('gc', 5, {'usedHeapSize': 1000, 'majorGc': true})
           ])
               .then((data) => {
                 expect(data['gcTime']).toBe(5);
                 expect(data['majorGcTime']).toBe(5);
                 async.done();
               });
         }));

      it('should support pureScriptTime = scriptTime-gcTime-renderTime',
         inject([AsyncTestCompleter], (async) => {
           aggregate([
             eventFactory.start('script', 0),
             eventFactory.start('gc', 1, {'usedHeapSize': 1000}),
             eventFactory.end('gc', 4, {'usedHeapSize': 0}),
             eventFactory.start('render', 4),
             eventFactory.end('render', 5),
             eventFactory.end('script', 6)
           ])
               .then((data) => {
                 expect(data['scriptTime']).toBe(6);
                 expect(data['pureScriptTime']).toBe(2);
                 async.done();
               });
         }));

      describe('microMetrics', () => {

        it('should report micro metrics', inject([AsyncTestCompleter], (async) => {
             aggregate([
               eventFactory.markStart('mm1', 0),
               eventFactory.markEnd('mm1', 5),
             ],
                       {'mm1': 'micro metric 1'})
                 .then((data) => {
                   expect(data['mm1']).toBe(5.0);
                   async.done();
                 });
           }));

        it('should ignore micro metrics that were not specified',
           inject([AsyncTestCompleter], (async) => {
             aggregate([
               eventFactory.markStart('mm1', 0),
               eventFactory.markEnd('mm1', 5),
             ])
                 .then((data) => {
                   expect(data['mm1']).toBeFalsy();
                   async.done();
                 });
           }));

        it('should report micro metric averages', inject([AsyncTestCompleter], (async) => {
             aggregate([
               eventFactory.markStart('mm1*20', 0),
               eventFactory.markEnd('mm1*20', 5),
             ],
                       {'mm1': 'micro metric 1'})
                 .then((data) => {
                   expect(data['mm1']).toBe(5 / 20);
                   async.done();
                 });
           }));

      });

    });

  });
}

class MockDriverExtension extends WebDriverExtension {
  constructor(private _perfLogs: List<any>, private _commandLog: List<any>,
              private _perfLogFeatures: PerfLogFeatures) {
    super();
  }

  timeBegin(name): Promise<any> {
    ListWrapper.push(this._commandLog, ['timeBegin', name]);
    return PromiseWrapper.resolve(null);
  }

  timeEnd(name, restartName): Promise<any> {
    ListWrapper.push(this._commandLog, ['timeEnd', name, restartName]);
    return PromiseWrapper.resolve(null);
  }

  perfLogFeatures(): PerfLogFeatures { return this._perfLogFeatures; }

  readPerfLog(): Promise<any> {
    ListWrapper.push(this._commandLog, 'readPerfLog');
    if (this._perfLogs.length > 0) {
      var next = this._perfLogs[0];
      ListWrapper.removeAt(this._perfLogs, 0);
      return PromiseWrapper.resolve(next);
    } else {
      return PromiseWrapper.resolve([]);
    }
  }

  gc(): Promise<any> {
    ListWrapper.push(this._commandLog, ['gc']);
    return PromiseWrapper.resolve(null);
  }
}
