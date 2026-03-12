/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import {CodeExamplesMap} from '../interfaces/index';

export const PREVIEWS_COMPONENTS = new InjectionToken<CodeExamplesMap>('PREVIEWS_COMPONENTS');
