import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {print} from 'angular2/src/facade/lang';
import {bind, provide, Provider} from 'angular2/src/core/di';

import {WebDriverAdapter} from '../web_driver_adapter';
import {Metric} from '../metric';

/**
 * A metric that hooks into Angular testability callbacks to measure the time
 * taken to get a stable UI since window.performance.navigationStart.
 */
export class AngularLoadTimeMetric extends Metric {
  // TODO(tbosch): use static values when our transpiler supports them
  static get BINDINGS(): Provider[] { return _PROVIDERS; }

  _performanceTiming: Promise<{[key: string]: number}>;

  /**
   * @param driverExtension
   **/
  constructor(private _driver: WebDriverAdapter) { super(); }

  describe(): {[key: string]: any} {
    // See https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming
    var res = {
      'angular.stable':
          'load time in ms, from window.performance.navigationStart to a stable Angular UI',
      'interactiveDom': 'domInteractive - navigationStart',
      'completeDom': 'domComplete - navigationStart',
      'load': 'loadEventEnd - navigationStart'
    };
    return res;
  }

  beginMeasure(): Promise<any> {
    // Note: Safari iOS >=8.1 <9.0 does not support timing APIs:
    // https://github.com/addyosmani/timing.js/issues/9
    // http://caniuse.com/#search=performance.timing
    this._performanceTiming = this._driver.executeAsyncScript(`
      var callback = arguments[0];

      function reportPerformanceTiming() {
        var now = Date.now();
        var angularStableTime;
        // Let the page preventively record its stable time, for cases where the page
        // loads quicker than we're able to inject this script (~ below 400ms on Chrome).
        if (window.benchpressAngularStableTime) {
          console.log('window.benchpressAngularStableTime - now = ' +
              (window.benchpressAngularStableTime - now) + 'ms');
          angularStableTime = window.benchpressAngularStableTime;
        } else {
          angularStableTime = now;
        }
        var data = JSON.parse(JSON.stringify(window.performance.timing));
        data['angular.stable'] = angularStableTime;
        callback(data);
      }

      function setup() {
        var testabilities =
            window.getAllAngularTestabilities && window.getAllAngularTestabilities() ||
            typeof(angular) != 'undefined' && [angular.getTestability(document.body)];
        if (!testabilities) return false;

        testabilities.forEach(function(t) { t.whenStable(reportPerformanceTiming) });
        return true;
      }

      if (!setup()) {
        var intervalId = setInterval(function() {
          if (setup()) clearInterval(intervalId);
        }, 30);
      }
    `);
    return PromiseWrapper.resolve(null);
  }

  endMeasure(restart: boolean): Promise<{[key: string]: number}> {
    var result: Promise<{[key: string]: number}> = this._performanceTiming.then((data) => {
      var navigationStart: number = data['navigationStart'];
      var values: {[key: string]: number} = {
        'angular.stable': data['angular.stable'] - navigationStart,
        'interactiveDom': data['domInteractive'] - navigationStart,
        'completeDom': data['domComplete'] - navigationStart,
        'load': data['loadEventEnd'] - navigationStart
      };
      return values;
    });
    return result;
  }
}

var _PROVIDERS = [
  bind(AngularLoadTimeMetric)
      .toFactory((driver) => new AngularLoadTimeMetric(driver), [WebDriverAdapter]),
];
