/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface MsgAny {
  action: string;
}

export interface MsgCheckForUpdates {
  action: 'CHECK_FOR_UPDATES';
  statusNonce: number;
}

export function isMsgCheckForUpdates(msg: MsgAny): msg is MsgCheckForUpdates {
  return msg.action === 'CHECK_FOR_UPDATES';
}

export interface MsgActivateUpdate {
  action: 'ACTIVATE_UPDATE';
  statusNonce: number;
}

export function isMsgActivateUpdate(msg: MsgAny): msg is MsgActivateUpdate {
  return msg.action === 'ACTIVATE_UPDATE';
}

export interface MsgCheckVersion {
  action: 'CHECK_VERSION';
  nonce: number;
}

export function isMsgCheckVersion(msg: MsgAny): msg is MsgCheckVersion {
  return msg.action === 'CHECK_VERSION';
}
