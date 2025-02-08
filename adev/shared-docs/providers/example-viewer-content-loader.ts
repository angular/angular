/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import {ExampleViewerContentLoader} from '../interfaces/index';

export const EXAMPLE_VIEWER_CONTENT_LOADER = new InjectionToken<ExampleViewerContentLoader>(
  'EXAMPLE_VIEWER_CONTENT_LOADER',
);
