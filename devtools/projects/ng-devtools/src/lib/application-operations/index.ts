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
  abstract viewSourceFromRouter(name: string, type: string, target: Frame): void;
  abstract setStorageItems(items: {[key: string]: unknown}): Promise<void>;
  abstract getStorageItems(items: string[]): Promise<{[key: string]: unknown}>;
  abstract removeStorageItems(items: string[]): Promise<void>;
}
