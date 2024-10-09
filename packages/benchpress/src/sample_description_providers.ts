/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Note: The providers are split into a separate file to avoid
// introducing a transitive dependency on the DI injection code
// from `@angular/core` whenever scripts like the benchmark compare script
// attempt to just use the `JsonReport` type.

import {Options} from './common_options';
import {Metric} from './metric';
import {SampleDescription} from './sample_description';
import {Validator} from './validator';

export const sampleDescriptionProviders = [
  {
    provide: SampleDescription,
    useFactory: (
      metric: Metric,
      id: string,
      forceGc: boolean,
      userAgent: string,
      validator: Validator,
      defaultDesc: {[key: string]: string},
      userDesc: {[key: string]: string},
    ) =>
      new SampleDescription(
        id,
        [{'forceGc': forceGc, 'userAgent': userAgent}, validator.describe(), defaultDesc, userDesc],
        metric.describe(),
      ),
    deps: [
      Metric,
      Options.SAMPLE_ID,
      Options.FORCE_GC,
      Options.USER_AGENT,
      Validator,
      Options.DEFAULT_DESCRIPTION,
      Options.SAMPLE_DESCRIPTION,
    ],
  },
];
