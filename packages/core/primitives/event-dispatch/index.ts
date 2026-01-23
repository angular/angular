/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {Attribute} from './src/attribute';
export {getDefaulted as getActionCache} from './src/cache';
export type {EarlyJsactionDataContainer} from './src/earlyeventcontract';
export {EventContractContainer} from './src/event_contract_container';
export {EventDispatcher, EventPhase, registerDispatcher} from './src/event_dispatcher';
export {EventInfoWrapper} from './src/event_info';
export {isEarlyEventType, isCaptureEventType} from './src/event_type';
export {EventContract} from './src/eventcontract';
export {
  bootstrapAppScopedEarlyEventContract,
  clearAppScopedEarlyEventContract,
  getAppScopedQueuedEventInfos,
  registerAppScopedDispatcher,
  removeAllAppScopedEventListeners,
} from './src/bootstrap_app_scoped';
