/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Events, MessageBus} from 'protocol';

import {subscribeToClientEvents} from './client-event-subscribers';

export const initializeMessageBus = (messageBus: MessageBus<Events>) => {
  subscribeToClientEvents(messageBus);
};
