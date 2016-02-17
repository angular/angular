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
  xit
} from 'angular2/testing_internal';

import {StringMapWrapper} from 'angular2/src/facade/collection';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {isPresent, isBlank, Json} from 'angular2/src/facade/lang';

import {
  Metric,
  MultiMetric,
  PerflogMetric,
  UserMetric,
  WebDriverAdapter,
  WebDriverExtension,
  PerfLogFeatures,
  bind,
  provide,
  Injector,
  Options
} from 'benchpress/common';

import {TraceEventFactory} from '../trace_event_factory';

export function main() {
  var commandLog: any[];
  var eventFactory = new TraceEventFactory('timeline', 'pid0');

  function createMetric(perfLogs, perfLogFeatures,
                        {userMetrics, forceGc, captureFrames, receivedData, requestCount}: {
                          userMetrics?: {[key: string]: string},
                          forceGc?: boolean,
                          captureFrames?: boolean,
                          receivedData?: boolean,
                          requestCount?: boolean
                        } = {}) {
    commandLog = [];
    if (isBlank(perfLogFeatures)) {
      perfLogFeatures =
          new PerfLogFeatures({render: true, gc: true, frameCapture: true, userTiming: true});
    }
    if (isBlank(userMetrics)) {
      userMetrics = StringMapWrapper.create();
    }
    var bindings = [
      provide(WebDriverAdapter,
              {useFactory: () => new MockDriverAdapter([], [], 'Tracing.dataCollected')}),
      Options.DEFAULT_PROVIDERS,
      MultiMetric.createBindings([UserMetric]),
      UserMetric.createBindings(userMetrics)
    ];
    return Injector.resolveAndCreate(bindings).get(UserMetric);
  }

  describe('user metric', () => {

    function sortedKeys(stringMap) {
      var res = [];
      StringMapWrapper.forEach(stringMap, (_, key) => { res.push(key); });
      res.sort();
      return res;
    }

    it('should describe itself based on microMetrics', () => {
      expect(createMetric([[]], new PerfLogFeatures(), {userMetrics: {'loadTime': 'time to load'}})
                 .describe())
          .toEqual({'loadTime': 'time to load'});
    });

    describe('endMeasure', () => {
      it('should stop measuring when all properties have numeric values',
         inject([AsyncTestCompleter], (async) => {
           var metric = createMetric(
               [[]], new PerfLogFeatures(),
               {userMetrics: {'loadTime': 'time to load', 'content': 'time to see content'}});
           metric.beginMeasure()
               .then((_) => metric.endMeasure())
               .then((values) => {
                 expect(values.loadTime).toBe(25);
                 expect(values.content).toBe(250);
                 async.done();
               });

           (<any>metric)._wdAdapter.data.loadTime = 25;
           // Wait before setting 2nd property.
           setTimeout(() => { (<any>metric)._wdAdapter.data.content = 250; }, 50);

         }), 600);
    });
  });
}

class MockDriverAdapter extends WebDriverAdapter {
  data: any = {};
  constructor(private _log: any[], private _events: any[], private _messageMethod: string) {
    super();
  }

  executeScript(script: string): any {
    // Just handles `return window.propName` scripts
    if (!(/^return window\..*$/).test(script)) return;
    return Promise.resolve(this.data[/^return window\.(.*)$/.exec(script)[1]]);
  }
}
