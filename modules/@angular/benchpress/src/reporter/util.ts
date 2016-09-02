/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StringMapWrapper} from '../facade/collection';
import {NumberWrapper} from '../facade/lang';
import {MeasureValues} from '../measure_values';
import {Statistic} from '../statistic';

export function formatNum(n: number) {
  return NumberWrapper.toFixed(n, 2);
}

export function sortedProps(obj: {[key: string]: any}) {
  var props: string[] = [];
  StringMapWrapper.forEach(obj, (value, prop) => props.push(prop));
  props.sort();
  return props;
}

export function formatStats(validSamples: MeasureValues[], metricName: string): string {
  var samples = validSamples.map(measureValues => measureValues.values[metricName]);
  var mean = Statistic.calculateMean(samples);
  var cv = Statistic.calculateCoefficientOfVariation(samples, mean);
  var formattedMean = formatNum(mean);
  // Note: Don't use the unicode character for +- as it might cause
  // hickups for consoles...
  return NumberWrapper.isNaN(cv) ? formattedMean : `${formattedMean}+-${Math.floor(cv)}%`;
}