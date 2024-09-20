/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

import {MeasureValues} from '../measure_values';
import {SampleDescription} from '../sample_description';

import {formatNum, formatStats, sortedProps} from './util';

export const COLUMN_WIDTH = new InjectionToken<number>('TextReporterBase.columnWidth');
export const defaultColumnWidth = 18;

export class TextReporterBase {
  private _metricNames: string[];

  constructor(
    private _columnWidth: number,
    private _sampleDescription: SampleDescription,
  ) {
    this._metricNames = sortedProps(_sampleDescription.metrics);
  }

  description(): string {
    let text = `BENCHMARK ${this._sampleDescription.id}\n`;
    text += 'Description:\n';
    const props = sortedProps(this._sampleDescription.description);
    props.forEach((prop) => {
      text += `- ${prop}: ${this._sampleDescription.description[prop]}\n`;
    });
    text += 'Metrics:\n';
    this._metricNames.forEach((metricName) => {
      text += `- ${metricName}: ${this._sampleDescription.metrics[metricName]}\n`;
    });
    text += '\n';
    text += `${this.metricsHeader()}\n`;
    text += `${this._stringRow(
      this._metricNames.map((_) => ''),
      '-',
    )}\n`;
    return text;
  }

  metricsHeader(): string {
    return this._stringRow(this._metricNames);
  }

  sampleMetrics(measureValues: MeasureValues): string {
    const formattedValues = this._metricNames.map((metricName) => {
      const value = measureValues.values[metricName];
      return formatNum(value);
    });
    return this._stringRow(formattedValues);
  }

  separator(): string {
    return this._stringRow(
      this._metricNames.map((_) => ''),
      '=',
    );
  }

  sampleStats(validSamples: MeasureValues[]): string {
    return this._stringRow(
      this._metricNames.map((metricName) => formatStats(validSamples, metricName)),
    );
  }

  private _stringRow(parts: string[], fill = ' ') {
    return parts.map((part) => part.padStart(this._columnWidth, fill)).join(' | ');
  }
}
