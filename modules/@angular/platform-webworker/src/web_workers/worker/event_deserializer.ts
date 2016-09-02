/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// no deserialization is necessary in TS.
// This is only here to match dart interface
export function deserializeGenericEvent(serializedEvent: {[key: string]: any}):
    {[key: string]: any} {
  return serializedEvent;
}
