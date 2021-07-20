/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticProvider} from '@angular/core';

import {Injector, Metric, Options, PerfLogEvent, PerfLogFeatures, PerflogMetric, WebDriverExtension} from '../../index';
import {TraceEventFactory} from '../trace_event_factory';

(function() {
let commandLog: any[];
const eventFactory = new TraceEventFactory('timeline', 'pid0');

function createMetric(
    perfLogs: PerfLogEvent[], perfLogFeatures: PerfLogFeatures,
    {microMetrics, forceGc, captureFrames, receivedData, requestCount, ignoreNavigation}: {
      microMetrics?: {[key: string]: string},
      forceGc?: boolean,
      captureFrames?: boolean,
      receivedData?: boolean,
      requestCount?: boolean,
      ignoreNavigation?: boolean
    } = {}): Metric {
  commandLog = [];
  if (!perfLogFeatures) {
    perfLogFeatures =
        new PerfLogFeatures({render: true, gc: true, frameCapture: true, userTiming: true});
  }
  if (!microMetrics) {
    microMetrics = {};
  }
  const providers: StaticProvider[] = [
    Options.DEFAULT_PROVIDERS, PerflogMetric.PROVIDERS,
    {provide: Options.MICRO_METRICS, useValue: microMetrics}, {
      provide: PerflogMetric.SET_TIMEOUT,
      useValue: (fn: Function, millis: number) => {
        commandLog.push(['setTimeout', millis]);
        fn();
      },
    },
    {
      provide: WebDriverExtension,
      useValue: new MockDriverExtension(perfLogs, commandLog, perfLogFeatures)
    }
  ];
  if (forceGc != null) {
    providers.push({provide: Options.FORCE_GC, useValue: forceGc});
  }
  if (captureFrames != null) {
    providers.push({provide: Options.CAPTURE_FRAMES, useValue: captureFrames});
  }
  if (receivedData != null) {
    providers.push({provide: Options.RECEIVED_DATA, useValue: receivedData});
  }
  if (requestCount != null) {
    providers.push({provide: Options.REQUEST_COUNT, useValue: requestCount});
  }
  if (ignoreNavigation != null) {
    providers.push({provide: PerflogMetric.IGNORE_NAVIGATION, useValue: ignoreNavigation});
  }
  return Injector.create(providers).get(PerflogMetric);
}

describe('perflog metric', () => {
  function sortedKeys(stringMap: {[key: string]: any}) {
    const res: string[] = [];
    res.push(...Object.keys(stringMap));
    res.sort();
    return res;
  }

  it('should describe itself based on the perfLogFeatrues', () => {
    expect(sortedKeys(createMetric([[]], new PerfLogFeatures()).describe())).toEqual([
      'pureScriptTime', 'scriptTime'
    ]);

    expect(
        sortedKeys(createMetric([[]], new PerfLogFeatures({render: true, gc: false})).describe()))
        .toEqual(['pureScriptTime', 'renderTime', 'scriptTime']);

    expect(sortedKeys(createMetric([[]], null!).describe())).toEqual([
      'gcAmount', 'gcTime', 'majorGcTime', 'pureScriptTime', 'renderTime', 'scriptTime'
    ]);

    expect(sortedKeys(createMetric([[]], new PerfLogFeatures({render: true, gc: true}), {
                        forceGc: true
                      }).describe()))
        .toEqual([
          'forcedGcAmount', 'forcedGcTime', 'gcAmount', 'gcTime', 'majorGcTime', 'pureScriptTime',
          'renderTime', 'scriptTime'
        ]);


    expect(sortedKeys(createMetric([[]], new PerfLogFeatures({userTiming: true}), {
                        receivedData: true,
                        requestCount: true
                      }).describe()))
        .toEqual(['pureScriptTime', 'receivedData', 'requestCount', 'scriptTime']);
  });

  it('should describe itself based on micro metrics', () => {
    const description =
        createMetric([[]], null!, {microMetrics: {'myMicroMetric': 'someDesc'}}).describe();
    expect(description['myMicroMetric']).toEqual('someDesc');
  });

  it('should describe itself if frame capture is requested and available', () => {
    const description = createMetric([[]], new PerfLogFeatures({frameCapture: true}), {
                          captureFrames: true
                        }).describe();
    expect(description['frameTime.mean']).not.toContain('WARNING');
    expect(description['frameTime.best']).not.toContain('WARNING');
    expect(description['frameTime.worst']).not.toContain('WARNING');
    expect(description['frameTime.smooth']).not.toContain('WARNING');
  });

  it('should describe itself if frame capture is requested and not available', () => {
    const description = createMetric([[]], new PerfLogFeatures({frameCapture: false}), {
                          captureFrames: true
                        }).describe();
    expect(description['frameTime.mean']).toContain('WARNING');
    expect(description['frameTime.best']).toContain('WARNING');
    expect(description['frameTime.worst']).toContain('WARNING');
    expect(description['frameTime.smooth']).toContain('WARNING');
  });

  describe('beginMeasure', () => {
    it('should not force gc and mark the timeline', done => {
      const metric = createMetric([[]], null!);
      metric.beginMeasure().then((_) => {
        expect(commandLog).toEqual([['timeBegin', 'benchpress0']]);

        done();
      });
    });

    it('should force gc and mark the timeline', done => {
      const metric = createMetric([[]], null!, {forceGc: true});
      metric.beginMeasure().then((_) => {
        expect(commandLog).toEqual([['gc'], ['timeBegin', 'benchpress0']]);

        done();
      });
    });
  });

  describe('endMeasure', () => {
    it('should mark and aggregate events in between the marks', done => {
      const events = [[
        eventFactory.markStart('benchpress0', 0), eventFactory.start('script', 4),
        eventFactory.end('script', 6), eventFactory.markEnd('benchpress0', 10)
      ]];
      const metric = createMetric(events, null!);
      metric.beginMeasure().then((_) => metric.endMeasure(false)).then((data) => {
        expect(commandLog).toEqual([
          ['timeBegin', 'benchpress0'], ['timeEnd', 'benchpress0', null], 'readPerfLog'
        ]);
        expect(data['scriptTime']).toBe(2);

        done();
      });
    });

    it('should mark and aggregate events since navigationStart', done => {
      const events = [[
        eventFactory.markStart('benchpress0', 0), eventFactory.start('script', 4),
        eventFactory.end('script', 6), eventFactory.instant('navigationStart', 7),
        eventFactory.start('script', 8), eventFactory.end('script', 9),
        eventFactory.markEnd('benchpress0', 10)
      ]];
      const metric = createMetric(events, null!);
      metric.beginMeasure().then((_) => metric.endMeasure(false)).then((data) => {
        expect(data['scriptTime']).toBe(1);

        done();
      });
    });

    it('should ignore navigationStart if ignoreNavigation is set', done => {
      const events = [[
        eventFactory.markStart('benchpress0', 0), eventFactory.start('script', 4),
        eventFactory.end('script', 6), eventFactory.instant('navigationStart', 7),
        eventFactory.start('script', 8), eventFactory.end('script', 9),
        eventFactory.markEnd('benchpress0', 10)
      ]];
      const metric = createMetric(events, null!, {ignoreNavigation: true});
      metric.beginMeasure().then((_) => metric.endMeasure(false)).then((data) => {
        expect(data['scriptTime']).toBe(3);

        done();
      });
    });

    it('should restart timing', done => {
      const events = [
        [
          eventFactory.markStart('benchpress0', 0),
          eventFactory.markEnd('benchpress0', 1),
          eventFactory.markStart('benchpress1', 2),
        ],
        [eventFactory.markEnd('benchpress1', 3)]
      ];
      const metric = createMetric(events, null!);
      metric.beginMeasure()
          .then((_) => metric.endMeasure(true))
          .then((_) => metric.endMeasure(true))
          .then((_) => {
            expect(commandLog).toEqual([
              ['timeBegin', 'benchpress0'], ['timeEnd', 'benchpress0', 'benchpress1'],
              'readPerfLog', ['timeEnd', 'benchpress1', 'benchpress2'], 'readPerfLog'
            ]);

            done();
          });
    });

    it('should loop and aggregate until the end mark is present', done => {
      const events = [
        [eventFactory.markStart('benchpress0', 0), eventFactory.start('script', 1)],
        [eventFactory.end('script', 2)],
        [
          eventFactory.start('script', 3), eventFactory.end('script', 5),
          eventFactory.markEnd('benchpress0', 10)
        ]
      ];
      const metric = createMetric(events, null!);
      metric.beginMeasure().then((_) => metric.endMeasure(false)).then((data) => {
        expect(commandLog).toEqual([
          ['timeBegin', 'benchpress0'], ['timeEnd', 'benchpress0', null], 'readPerfLog',
          ['setTimeout', 100], 'readPerfLog', ['setTimeout', 100], 'readPerfLog'
        ]);
        expect(data['scriptTime']).toBe(3);

        done();
      });
    });

    it('should store events after the end mark for the next call', done => {
      const events = [
        [
          eventFactory.markStart('benchpress0', 0), eventFactory.markEnd('benchpress0', 1),
          eventFactory.markStart('benchpress1', 1), eventFactory.start('script', 1),
          eventFactory.end('script', 2)
        ],
        [
          eventFactory.start('script', 3), eventFactory.end('script', 5),
          eventFactory.markEnd('benchpress1', 6)
        ]
      ];
      const metric = createMetric(events, null!);
      metric.beginMeasure()
          .then((_) => metric.endMeasure(true))
          .then((data) => {
            expect(data['scriptTime']).toBe(0);
            return metric.endMeasure(true);
          })
          .then((data) => {
            expect(commandLog).toEqual([
              ['timeBegin', 'benchpress0'], ['timeEnd', 'benchpress0', 'benchpress1'],
              'readPerfLog', ['timeEnd', 'benchpress1', 'benchpress2'], 'readPerfLog'
            ]);
            expect(data['scriptTime']).toBe(3);

            done();
          });
    });

    describe('with forced gc', () => {
      let events: PerfLogEvent[][];
      beforeEach(() => {
        events = [[
          eventFactory.markStart('benchpress0', 0), eventFactory.start('script', 4),
          eventFactory.end('script', 6), eventFactory.markEnd('benchpress0', 10),
          eventFactory.markStart('benchpress1', 11),
          eventFactory.start('gc', 12, {'usedHeapSize': 2500}),
          eventFactory.end('gc', 15, {'usedHeapSize': 1000}),
          eventFactory.markEnd('benchpress1', 20)
        ]];
      });

      it('should measure forced gc', done => {
        const metric = createMetric(events, null!, {forceGc: true});
        metric.beginMeasure().then((_) => metric.endMeasure(false)).then((data) => {
          expect(commandLog).toEqual([
            ['gc'], ['timeBegin', 'benchpress0'], ['timeEnd', 'benchpress0', 'benchpress1'],
            'readPerfLog', ['gc'], ['timeEnd', 'benchpress1', null], 'readPerfLog'
          ]);
          expect(data['forcedGcTime']).toBe(3);
          expect(data['forcedGcAmount']).toBe(1.5);

          done();
        });
      });

      it('should restart after the forced gc if needed', done => {
        const metric = createMetric(events, null!, {forceGc: true});
        metric.beginMeasure().then((_) => metric.endMeasure(true)).then((data) => {
          expect(commandLog[5]).toEqual(['timeEnd', 'benchpress1', 'benchpress2']);

          done();
        });
      });
    });
  });

  describe('aggregation', () => {
    function aggregate(events: any[], {microMetrics, captureFrames, receivedData, requestCount}: {
      microMetrics?: {[key: string]: string},
      captureFrames?: boolean,
      receivedData?: boolean,
      requestCount?: boolean
    } = {}) {
      events.unshift(eventFactory.markStart('benchpress0', 0));
      events.push(eventFactory.markEnd('benchpress0', 10));
      const metric = createMetric([events], null!, {
        microMetrics: microMetrics,
        captureFrames: captureFrames,
        receivedData: receivedData,
        requestCount: requestCount
      });
      return metric.beginMeasure().then((_) => metric.endMeasure(false));
    }

    describe('frame metrics', () => {
      it('should calculate mean frame time', done => {
        aggregate(
            [
              eventFactory.markStart('frameCapture', 0), eventFactory.instant('frame', 1),
              eventFactory.instant('frame', 3), eventFactory.instant('frame', 4),
              eventFactory.markEnd('frameCapture', 5)
            ],
            {captureFrames: true})
            .then((data) => {
              expect(data['frameTime.mean']).toBe(((3 - 1) + (4 - 3)) / 2);
              done();
            });
      });

      it('should throw if no start event', done => {
        aggregate([eventFactory.instant('frame', 4), eventFactory.markEnd('frameCapture', 5)], {
          captureFrames: true
        }).catch((err): any => {
          expect(() => {
            throw err;
          }).toThrowError('missing start event for frame capture');
          done();
        });
      });

      it('should throw if no end event', done => {
        aggregate([eventFactory.markStart('frameCapture', 3), eventFactory.instant('frame', 4)], {
          captureFrames: true
        }).catch((err): any => {
          expect(() => {
            throw err;
          }).toThrowError('missing end event for frame capture');
          done();
        });
      });

      it('should throw if trying to capture twice', done => {
        aggregate(
            [eventFactory.markStart('frameCapture', 3), eventFactory.markStart('frameCapture', 4)],
            {captureFrames: true})
            .catch((err): any => {
              expect(() => {
                throw err;
              }).toThrowError('can capture frames only once per benchmark run');
              done();
            });
      });

      it('should throw if trying to capture when frame capture is disabled', done => {
        aggregate([eventFactory.markStart('frameCapture', 3)]).catch((err) => {
          expect(() => {
            throw err;
          })
              .toThrowError(
                  'found start event for frame capture, but frame capture was not requested in benchpress');
          done();
          return null;
        });
      });

      it('should throw if frame capture is enabled, but nothing is captured', done => {
        aggregate([], {captureFrames: true}).catch((err): any => {
          expect(() => {
            throw err;
          }).toThrowError('frame capture requested in benchpress, but no start event was found');
          done();
        });
      });

      it('should calculate best and worst frame time', done => {
        aggregate(
            [
              eventFactory.markStart('frameCapture', 0), eventFactory.instant('frame', 1),
              eventFactory.instant('frame', 9), eventFactory.instant('frame', 15),
              eventFactory.instant('frame', 18), eventFactory.instant('frame', 28),
              eventFactory.instant('frame', 32), eventFactory.markEnd('frameCapture', 10)
            ],
            {captureFrames: true})
            .then((data) => {
              expect(data['frameTime.worst']).toBe(10);
              expect(data['frameTime.best']).toBe(3);
              done();
            });
      });

      it('should calculate percentage of smoothness to be good', done => {
        aggregate(
            [
              eventFactory.markStart('frameCapture', 0), eventFactory.instant('frame', 1),
              eventFactory.instant('frame', 2), eventFactory.instant('frame', 3),
              eventFactory.markEnd('frameCapture', 4)
            ],
            {captureFrames: true})
            .then((data) => {
              expect(data['frameTime.smooth']).toBe(1.0);
              done();
            });
      });

      it('should calculate percentage of smoothness to be bad', done => {
        aggregate(
            [
              eventFactory.markStart('frameCapture', 0), eventFactory.instant('frame', 1),
              eventFactory.instant('frame', 2), eventFactory.instant('frame', 22),
              eventFactory.instant('frame', 23), eventFactory.instant('frame', 24),
              eventFactory.markEnd('frameCapture', 4)
            ],
            {captureFrames: true})
            .then((data) => {
              expect(data['frameTime.smooth']).toBe(0.75);
              done();
            });
      });
    });

    it('should report a single interval', done => {
      aggregate([eventFactory.start('script', 0), eventFactory.end('script', 5)]).then((data) => {
        expect(data['scriptTime']).toBe(5);
        done();
      });
    });

    it('should sum up multiple intervals', done => {
      aggregate([
        eventFactory.start('script', 0), eventFactory.end('script', 5),
        eventFactory.start('script', 10), eventFactory.end('script', 17)
      ]).then((data) => {
        expect(data['scriptTime']).toBe(12);
        done();
      });
    });

    it('should ignore not started intervals', done => {
      aggregate([eventFactory.end('script', 10)]).then((data) => {
        expect(data['scriptTime']).toBe(0);
        done();
      });
    });

    it('should ignore not ended intervals', done => {
      aggregate([eventFactory.start('script', 10)]).then((data) => {
        expect(data['scriptTime']).toBe(0);
        done();
      });
    });

    it('should ignore nested intervals', done => {
      aggregate([
        eventFactory.start('script', 0), eventFactory.start('script', 5),
        eventFactory.end('script', 10), eventFactory.end('script', 17)
      ]).then((data) => {
        expect(data['scriptTime']).toBe(17);
        done();
      });
    });

    it('should ignore events from different processed as the start mark', done => {
      const otherProcessEventFactory = new TraceEventFactory('timeline', 'pid1');
      const metric = createMetric(
          [[
            eventFactory.markStart('benchpress0', 0), eventFactory.start('script', 0, null),
            eventFactory.end('script', 5, null), otherProcessEventFactory.start('script', 10, null),
            otherProcessEventFactory.end('script', 17, null),
            eventFactory.markEnd('benchpress0', 20)
          ]],
          null!);
      metric.beginMeasure().then((_) => metric.endMeasure(false)).then((data) => {
        expect(data['scriptTime']).toBe(5);
        done();
      });
    });

    it('should mark a run as invalid if the start and end marks are different', done => {
      const otherProcessEventFactory = new TraceEventFactory('timeline', 'pid1');
      const metric = createMetric(
          [[
            eventFactory.markStart('benchpress0', 0), eventFactory.start('script', 0, null),
            eventFactory.end('script', 5, null), otherProcessEventFactory.start('script', 10, null),
            otherProcessEventFactory.end('script', 17, null),
            otherProcessEventFactory.markEnd('benchpress0', 20)
          ]],
          null!);
      metric.beginMeasure().then((_) => metric.endMeasure(false)).then((data) => {
        expect(data['invalid']).toBe(1);
        done();
      });
    });

    it('should support scriptTime metric', done => {
      aggregate([eventFactory.start('script', 0), eventFactory.end('script', 5)]).then((data) => {
        expect(data['scriptTime']).toBe(5);
        done();
      });
    });

    it('should support renderTime metric', done => {
      aggregate([eventFactory.start('render', 0), eventFactory.end('render', 5)]).then((data) => {
        expect(data['renderTime']).toBe(5);
        done();
      });
    });

    it('should support gcTime/gcAmount metric', done => {
      aggregate([
        eventFactory.start('gc', 0, {'usedHeapSize': 2500}),
        eventFactory.end('gc', 5, {'usedHeapSize': 1000})
      ]).then((data) => {
        expect(data['gcTime']).toBe(5);
        expect(data['gcAmount']).toBe(1.5);
        expect(data['majorGcTime']).toBe(0);
        done();
      });
    });

    it('should support majorGcTime metric', done => {
      aggregate([
        eventFactory.start('gc', 0, {'usedHeapSize': 2500}),
        eventFactory.end('gc', 5, {'usedHeapSize': 1000, 'majorGc': true})
      ]).then((data) => {
        expect(data['gcTime']).toBe(5);
        expect(data['majorGcTime']).toBe(5);
        done();
      });
    });

    it('should support pureScriptTime = scriptTime-gcTime-renderTime', done => {
      aggregate([
        eventFactory.start('script', 0), eventFactory.start('gc', 1, {'usedHeapSize': 1000}),
        eventFactory.end('gc', 4, {'usedHeapSize': 0}), eventFactory.start('render', 4),
        eventFactory.end('render', 5), eventFactory.end('script', 6)
      ]).then((data) => {
        expect(data['scriptTime']).toBe(6);
        expect(data['pureScriptTime']).toBe(2);
        done();
      });
    });

    describe('receivedData', () => {
      it('should report received data since last navigationStart', done => {
        aggregate(
            [
              eventFactory.instant('receivedData', 0, {'encodedDataLength': 1}),
              eventFactory.instant('navigationStart', 1),
              eventFactory.instant('receivedData', 2, {'encodedDataLength': 2}),
              eventFactory.instant('navigationStart', 3),
              eventFactory.instant('receivedData', 4, {'encodedDataLength': 4}),
              eventFactory.instant('receivedData', 5, {'encodedDataLength': 8})
            ],
            {receivedData: true})
            .then((data) => {
              expect(data['receivedData']).toBe(12);
              done();
            });
      });
    });

    describe('requestCount', () => {
      it('should report count of requests sent since last navigationStart', done => {
        aggregate(
            [
              eventFactory.instant('sendRequest', 0), eventFactory.instant('navigationStart', 1),
              eventFactory.instant('sendRequest', 2), eventFactory.instant('navigationStart', 3),
              eventFactory.instant('sendRequest', 4), eventFactory.instant('sendRequest', 5)
            ],
            {requestCount: true})
            .then((data) => {
              expect(data['requestCount']).toBe(2);
              done();
            });
      });
    });

    describe('microMetrics', () => {
      it('should report micro metrics', done => {
        aggregate(
            [
              eventFactory.markStart('mm1', 0),
              eventFactory.markEnd('mm1', 5),
            ],
            {microMetrics: {'mm1': 'micro metric 1'}})
            .then((data) => {
              expect(data['mm1']).toBe(5.0);
              done();
            });
      });

      it('should ignore micro metrics that were not specified', done => {
        aggregate([
          eventFactory.markStart('mm1', 0),
          eventFactory.markEnd('mm1', 5),
        ]).then((data) => {
          expect(data['mm1']).toBeFalsy();
          done();
        });
      });

      it('should report micro metric averages', done => {
        aggregate(
            [
              eventFactory.markStart('mm1*20', 0),
              eventFactory.markEnd('mm1*20', 5),
            ],
            {microMetrics: {'mm1': 'micro metric 1'}})
            .then((data) => {
              expect(data['mm1']).toBe(5 / 20);
              done();
            });
      });
    });
  });
});
})();

class MockDriverExtension extends WebDriverExtension {
  constructor(
      private _perfLogs: any[], private _commandLog: any[],
      private _perfLogFeatures: PerfLogFeatures) {
    super();
  }

  override timeBegin(name: string): Promise<any> {
    this._commandLog.push(['timeBegin', name]);
    return Promise.resolve(null);
  }

  override timeEnd(name: string, restartName: string|null): Promise<any> {
    this._commandLog.push(['timeEnd', name, restartName]);
    return Promise.resolve(null);
  }

  override perfLogFeatures(): PerfLogFeatures {
    return this._perfLogFeatures;
  }

  override readPerfLog(): Promise<any> {
    this._commandLog.push('readPerfLog');
    if (this._perfLogs.length > 0) {
      const next = this._perfLogs[0];
      this._perfLogs.shift();
      return Promise.resolve(next);
    } else {
      return Promise.resolve([]);
    }
  }

  override gc(): Promise<any> {
    this._commandLog.push(['gc']);
    return Promise.resolve(null);
  }
}
