/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SpyObject, proxy} from '@angular/core/testing/testing_internal';
import {ClientMessageBroker} from '@angular/platform-browser/src/web_workers/shared/client_message_broker';

export class SpyMessageBroker extends SpyObject {
  constructor() { super(ClientMessageBroker); }
}
