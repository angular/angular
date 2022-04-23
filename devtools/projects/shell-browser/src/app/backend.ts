/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initializeMessageBus} from 'ng-devtools-backend';

import {unHighlight} from '../../../ng-devtools-backend/src/lib/highlighter';

import {initializeExtendedWindowOperations} from './chrome-window-extensions';
import {SamePageMessageBus} from './same-page-message-bus';

const messageBus =
    new SamePageMessageBus('angular-devtools-backend', 'angular-devtools-content-script');

let initialized = false;
messageBus.on('handshake', () => {
  if (initialized) {
    return;
  }
  initialized = true;
  initializeMessageBus(messageBus);
  initializeExtendedWindowOperations();

  let inspectorRunning = false;
  messageBus.on('inspectorStart', () => {
    inspectorRunning = true;
  });

  messageBus.on('inspectorEnd', () => {
    inspectorRunning = false;
  });

  // handles case when mouse leaves chrome extension too quickly. unHighlight() is not a very
  // expensive function and has an if check so it's DOM api call is not called more than necessary
  document.addEventListener('mousemove', () => {
    if (!inspectorRunning) {
      unHighlight();
    }
  }, false);
});
