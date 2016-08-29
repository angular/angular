/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StringMapWrapper} from '@angular/facade/src/collection';

import {Options} from './common_options';
import {Metric} from './metric';
import {Validator} from './validator';


/**
 * SampleDescription merges all available descriptions about a sample
 */
export class SampleDescription {
  // TODO(tbosch): use static values when our transpiler supports them
  static get PROVIDERS(): any[] { return _PROVIDERS; }
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

var _PROVIDERS = [{
  provide: SampleDescription,
  useFactory: (metric, id, forceGc, userAgent, validator, defaultDesc, userDesc) =>
                  new SampleDescription(
                      id,
                      [
                        {'forceGc': forceGc, 'userAgent': userAgent}, validator.describe(),
                        defaultDesc, userDesc
                      ],
                      metric.describe()),
  deps: [
    Metric, Options.SAMPLE_ID, Options.FORCE_GC, Options.USER_AGENT, Validator,
    Options.DEFAULT_DESCRIPTION, Options.SAMPLE_DESCRIPTION
  ]
}];
