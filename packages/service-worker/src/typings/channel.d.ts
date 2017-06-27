/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare class BroadcastChannel extends EventTarget {
  readonly name: string;
  constructor(name: string);
  postMessage(value: Object): void;
}