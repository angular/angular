/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationEvent} from './animation_event';

export abstract class AnimationDebugger {
  debugFlagRequired?: boolean;
  abstract debug(element: any, phase: string, data: any, debugFlagValue?: any): void;
}
