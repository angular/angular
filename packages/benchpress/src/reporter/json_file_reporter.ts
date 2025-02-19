/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Inject, Injectable, InjectionToken} from '@angular/core';

import {Options} from '../common_options';
import {MeasureValues} from '../measure_values';
import {Reporter} from '../reporter';
import {SampleDescription} from '../sample_description';

import {JsonReport} from './json_file_reporter_types';
import {COLUMN_WIDTH, defaultColumnWidth, TextReporterBase} from './text_reporter_base';
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
      deps: [
        SampleDescription,
        COLUMN_WIDTH,
        JsonFileReporter.PATH,
        Options.WRITE_FILE,
        Options.NOW,
      ],
    },
    {provide: COLUMN_WIDTH, useValue: defaultColumnWidth},
    {provide: JsonFileReporter.PATH, useValue: '.'},
  ];

  constructor(
    private _description: SampleDescription,
    @Inject(COLUMN_WIDTH) private _columnWidth: number,
    @Inject(JsonFileReporter.PATH) private _path: string,
    @Inject(Options.WRITE_FILE) private _writeFile: Function,
    @Inject(Options.NOW) private _now: Function,
  ) {
    super();

    this.textReporter = new TextReporterBase(this._columnWidth, this._description);
  }

  private textReporter: TextReporterBase;

  override reportMeasureValues(measureValues: MeasureValues): Promise<any> {
    return Promise.resolve(null);
  }

  override reportSample(
    completeSample: MeasureValues[],
    validSample: MeasureValues[],
  ): Promise<any> {
    const stats: {[key: string]: string} = {};
    sortedProps(this._description.metrics).forEach((metricName) => {
      stats[metricName] = formatStats(validSample, metricName);
    });
    const content = JSON.stringify(
      <JsonReport>{
        'description': this._description,
        'metricsText': this.textReporter.metricsHeader(),
        'stats': stats,
        'statsText': this.textReporter.sampleStats(validSample),
        'validSampleTexts': validSample.map((s) => this.textReporter.sampleMetrics(s)),
        'completeSample': completeSample,
        'validSample': validSample,
      },
      null,
      2,
    );
    const filePath = `${this._path}/${this._description.id}_${this._now().getTime()}.json`;
    return this._writeFile(filePath, content);
  }
}
