/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OpaqueToken} from '@angular/core';

import {Options} from './common_options';
import {StringMapWrapper} from './facade/collection';
import {Metric} from './metric';
import {Validator} from './validator';


/**
 * SampleDescription merges all available descriptions about a sample
 */
export class SampleDescription {
  static PROVIDERS = [{
    provide: SampleDescription,
    useFactory:
        (metric: Metric, id: string, forceGc: boolean, userAgent: string, validator: Validator,
         defaultDesc: {[key: string]: string}, userDesc: {[key: string]: string}) =>
            new SampleDescription(
                id,
                [
                  {'forceGc': forceGc, 'userAgent': userAgent}, validator.describe(), defaultDesc,
                  userDesc
                ],
                metric.describe()),
    deps: [
      Metric, Options.SAMPLE_ID, Options.FORCE_GC, Options.USER_AGENT, Validator,
      Options.DEFAULT_DESCRIPTION, Options.SAMPLE_DESCRIPTION
    ]
  }];
  description: {[key: string]: any};

  constructor(
      public id: string, descriptions: Array<{[key: string]: any}>,
      public metrics: {[key: string]: any}) {
    this.description = {};
    descriptions.forEach(description => {
      StringMapWrapper.forEach(description, (value, prop) => this.description[prop] = value);
    });
  }

  toJson() { return {'id': this.id, 'description': this.description, 'metrics': this.metrics}; }
}
