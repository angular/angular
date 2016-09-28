/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SpyObject} from '@angular/core/testing/testing_internal';
import {ClientMessageBroker} from '@angular/platform-webworker/src/web_workers/shared/client_message_broker';

export class SpyMessageBroker extends SpyObject {
  constructor() { super(ClientMessageBroker); }
}
