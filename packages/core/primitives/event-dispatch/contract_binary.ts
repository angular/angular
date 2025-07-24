/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {bootstrapAppScopedEarlyEventContract} from './src/bootstrap_app_scoped';

(window as any)['__jsaction_bootstrap'] = bootstrapAppScopedEarlyEventContract;
