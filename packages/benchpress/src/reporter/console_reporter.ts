/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Inject, Injectable, InjectionToken} from '@angular/core';

import {MeasureValues} from '../measure_values';
import {Reporter} from '../reporter';
import {SampleDescription} from '../sample_description';

import {COLUMN_WIDTH, defaultColumnWidth, TextReporterBase} from './text_reporter_base';

/**
 * A reporter for the console
 */
@Injectable()
export class ConsoleReporter extends Reporter {
  static PRINT = new InjectionToken('ConsoleReporter.print');
  static PROVIDERS = [
    {provide: ConsoleReporter, deps: [COLUMN_WIDTH, SampleDescription, ConsoleReporter.PRINT]},
    {provide: COLUMN_WIDTH, useValue: defaultColumnWidth},
    {
      provide: ConsoleReporter.PRINT,
      useValue: function (v: any) {
        // tslint:disable-next-line:no-console
        console.log(v);
      },
    },
  ];

  private textReporter: TextReporterBase;

  constructor(
    @Inject(COLUMN_WIDTH) private _columnWidth: number,
    private _sampleDescription: SampleDescription,
    @Inject(ConsoleReporter.PRINT) private _print: Function,
  ) {
    super();
    this.textReporter = new TextReporterBase(this._columnWidth, this._sampleDescription);
    this._print(this.textReporter.description());
  }

  override reportMeasureValues(measureValues: MeasureValues): Promise<any> {
    this._print(this.textReporter.sampleMetrics(measureValues));
    return Promise.resolve(null);
  }

  override reportSample(
    _completeSample: MeasureValues[],
    validSamples: MeasureValues[],
  ): Promise<any> {
    this._print(this.textReporter.separator());
    this._print(this.textReporter.sampleStats(validSamples));
    return Promise.resolve(null);
  }
}
