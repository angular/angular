/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Only needed to satisfy the check in core/src/util/decorators.ts
// TODO(alexeagle): maybe remove that check?
require('reflect-metadata');

require('zone.js/dist/zone-node.js');
require('zone.js/dist/long-stack-trace-zone.js');

import {lockRunMode} from '@angular/core';
// Need to lock the mode explicitely as this test is not using Angular's testing framework.
lockRunMode();
