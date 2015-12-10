import {
  AsyncTestCompleter,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/testing_internal';

import {StringMapWrapper} from 'angular2/src/facade/collection';
import {PromiseCompleter, PromiseWrapper, Promise} from 'angular2/src/facade/async';

import {
  Metric,
  AngularLoadTimeMetric,
  WebDriverAdapter,
  bind,
  Injector,
  Options
} from 'benchpress/common';

export function main() {
  var driver: MockDriverAdapter;

  function createMetric(): Metric {
    driver = new MockDriverAdapter();
    var bindings = [
      Options.DEFAULT_PROVIDERS,
      AngularLoadTimeMetric.BINDINGS,
      bind(WebDriverAdapter).toValue(driver)
    ];
    return Injector.resolveAndCreate(bindings).get(AngularLoadTimeMetric);
  }

  describe('AngularLoadTimeMetric', () => {

    function sortedKeys(stringMap) {
      var res = [];
      StringMapWrapper.forEach(stringMap, (_, key) => { res.push(key); });
      res.sort();
      return res;
    }

    iit('should describe itself', () => {
      expect(sortedKeys(createMetric().describe()))
          .toEqual(['angular.stable', 'completeDom', 'interactiveDom', 'load']);

      describe('beginMeasure', () => {
        iit('should set up an async script', inject([AsyncTestCompleter], (async) => {
              var metric = createMetric();
              metric.beginMeasure().then((_) => {
                expect(driver.executeScriptAsyncCompleter).toEqual(null);
                async.done();
              });
            }));
      });

      describe('endMeasure', () => {
        iit('should report performance data', inject([AsyncTestCompleter], (async) => {
              var metric = createMetric();
              metric.beginMeasure().then((_) => {
                driver.executeScriptAsyncCompleter.resolve({
                  'navigationStart': 1000,
                  'angular.stable': 1001,
                  'domInteractive': 1002,
                  'domComplete': 1003,
                  'loadEventEnd': 1004
                });
                var restartFlag = false;
                metric.endMeasure(restartFlag)
                    .then((data) => {
                      var expectedData =
                          {'angular.stable': 1, 'interactiveDom': 2, 'completeDom': 3, 'load': 4};
                      expect(data).toEqual(expectedData);
                      async.done();
                    });
              });
            }));
      });
    });
  });
}

class MockDriverAdapter extends WebDriverAdapter {
  executeScriptAsyncCompleter: PromiseCompleter<any>;

  executeScriptAsync(script: string): Promise<any> {
    this.executeScriptAsyncCompleter = PromiseWrapper.completer();
    return this.executeScriptAsyncCompleter.promise;
  }
}
