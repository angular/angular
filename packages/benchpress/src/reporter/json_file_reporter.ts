/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, InjectionToken} from '@angular/core';

import {Options} from '../common_options';
import {MeasureValues} from '../measure_values';
import {Reporter} from '../reporter';
import {SampleDescription} from '../sample_description';

import {formatStats, sortedProps} from './util';


/**
 * A reporter that writes results into a json file.
 */
@Injectable()
export class JsonFileReporter extends Reporter {
  static PATH = new InjectionToken('JsonFileReporter.path');
  static PROVIDERS = [
    {
      provide: JsonFileReporter,
      deps: [SampleDescription, JsonFileReporter.PATH, Options.WRITE_FILE, Options.NOW]
    },
    {provide: JsonFileReporter.PATH, useValue: '.'}
  ];

  constructor(
      private _description: SampleDescription, @Inject(JsonFileReporter.PATH) private _path: string,
      @Inject(Options.WRITE_FILE) private _writeFile: Function,
      @Inject(Options.NOW) private _now: Function) {
    super();
  }

  reportMeasureValues(measureValues: MeasureValues): Promise<any> {
    return Promise.resolve(null);
  }

  reportSample(completeSample: MeasureValues[], validSample: MeasureValues[]): Promise<any> {
    const stats: {[key: string]: string} = {};
    sortedProps(this._description.metrics).forEach((metricName) => {
      stats[metricName] = formatStats(validSample, metricName);
    });
    const content = JSON.stringify(
        {
          'description': this._description,
          'stats': stats,
          'completeSample': completeSample,
          'validSample': validSample,
        },
        null, 2);
    const filePath = `${this._path}/${this._description.id}_${this._now().getTime()}.json`;
    return this._writeFile(filePath, content);
  }
}
