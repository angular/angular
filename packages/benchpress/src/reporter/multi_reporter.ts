/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, Injector} from '@angular/core';

import {MeasureValues} from '../measure_values';
import {Reporter} from '../reporter';

export class MultiReporter extends Reporter {
  static provideWith(childTokens: any[]): any[] {
    return [
      {
        provide: _CHILDREN,
        useFactory: (injector: Injector) => childTokens.map(token => injector.get(token)),
        deps: [Injector],
      },
      {
        provide: MultiReporter,
        useFactory: (children: Reporter[]) => new MultiReporter(children),
        deps: [_CHILDREN]
      }
    ];
  }

  constructor(private _reporters: Reporter[]) {
    super();
  }

  override reportMeasureValues(values: MeasureValues): Promise<any[]> {
    return Promise.all(this._reporters.map(reporter => reporter.reportMeasureValues(values)));
  }

  override reportSample(completeSample: MeasureValues[], validSample: MeasureValues[]):
      Promise<any[]> {
    return Promise.all(
        this._reporters.map(reporter => reporter.reportSample(completeSample, validSample)));
  }
}

const _CHILDREN = new InjectionToken('MultiReporter.children');
