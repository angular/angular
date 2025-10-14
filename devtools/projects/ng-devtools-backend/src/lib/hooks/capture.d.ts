/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ProfilerFrame } from '../../../../protocol';
export declare const start: (onFrame: (frame: ProfilerFrame) => void) => void;
export declare const stop: () => ProfilerFrame;
