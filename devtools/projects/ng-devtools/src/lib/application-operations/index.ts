/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Frame} from '../application-environment';
import {DirectivePosition, ElementPosition, SignalNodePosition} from '../../../../protocol';

export abstract class ApplicationOperations {
  abstract viewSource(position: ElementPosition, target: Frame, directiveIndex?: number): void;
  abstract selectDomElement(position: ElementPosition, target: Frame): void;
  abstract inspect(directivePosition: DirectivePosition, objectPath: string[], target: Frame): void;
  abstract inspectSignal(position: SignalNodePosition, target: Frame): void;

  /** Sets a breakpoint on a signal consumer function. @returns Promise resolving to true if set successfully, false otherwise. */
  abstract setSignalBreakpoint(position: SignalNodePosition, target: Frame): Promise<boolean>;

  /** Removes a breakpoint from a signal consumer function. @returns Promise resolving to true if removed successfully, false otherwise. */
  abstract removeSignalBreakpoint(position: SignalNodePosition, target: Frame): Promise<boolean>;

  /** Fetches all active signal breakpoints for the inspected tab/frame. */
  abstract getActiveSignalBreakpoints(target: Frame): Promise<SignalNodePosition[]>;
  abstract viewSourceFromRouter(name: string, type: string, target: Frame): void;
  abstract setStorageItems(items: {[key: string]: unknown}): Promise<void>;
  abstract getStorageItems(items: string[]): Promise<{[key: string]: unknown}>;
  abstract removeStorageItems(items: string[]): Promise<void>;
}
