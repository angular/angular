/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, StaticProvider} from '@angular/core';
import {AsyncTestCompleter, describe, expect, inject, it} from '@angular/core/testing/src/testing_internal';

import {Options, PerfLogEvent, PerfLogFeatures, UserMetric, WebDriverAdapter} from '../../index';

(function() {
let wdAdapter: MockDriverAdapter;

function createMetric(
    perfLogs: PerfLogEvent[], perfLogFeatures: PerfLogFeatures,
    {userMetrics}: {userMetrics?: {[key: string]: string}} = {}): UserMetric {
  if (!perfLogFeatures) {
    perfLogFeatures =
        new PerfLogFeatures({render: true, gc: true, frameCapture: true, userTiming: true});
  }
  if (!userMetrics) {
    userMetrics = {};
  }
  wdAdapter = new MockDriverAdapter();
  const providers: StaticProvider[] = [
    Options.DEFAULT_PROVIDERS, UserMetric.PROVIDERS,
    {provide: Options.USER_METRICS, useValue: userMetrics},
    {provide: WebDriverAdapter, useValue: wdAdapter}
  ];
  return Injector.create(providers).get(UserMetric);
}

describe('user metric', () => {
  it('should describe itself based on userMetrics', () => {
    expect(createMetric([[]], new PerfLogFeatures(), {
             userMetrics: {'loadTime': 'time to load'}
           }).describe())
        .toEqual({'loadTime': 'time to load'});
  });

  describe('endMeasure', () => {
    it('should stop measuring when all properties have numeric values',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const metric = createMetric(
             [[]], new PerfLogFeatures(),
             {userMetrics: {'loadTime': 'time to load', 'content': 'time to see content'}});
         metric.beginMeasure().then(() => metric.endMeasure(true)).then(values => {
           expect(values['loadTime']).toBe(25);
           expect(values['content']).toBe(250);
           async.done();
         });

         wdAdapter.data['loadTime'] = 25;
         // Wait before setting 2nd property.
         setTimeout(() => {
           wdAdapter.data['content'] = 250;
         }, 50);
       }), 600);
  });
});
})();

class MockDriverAdapter extends WebDriverAdapter {
  data: any = {};

  executeScript(script: string): any {
    // Just handles `return window.propName` ignores `delete window.propName`.
    if (script.indexOf('return window.') == 0) {
      const metricName = script.substring('return window.'.length);
      return Promise.resolve(this.data[metricName]);
    } else if (script.indexOf('delete window.') == 0) {
      return Promise.resolve(null);
    } else {
      return Promise.reject(`Unexpected syntax: ${script}`);
    }
  }
}
