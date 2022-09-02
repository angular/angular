/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectivePosition, ElementPosition} from 'protocol';

export abstract class ApplicationOperations {
  abstract viewSource(position: ElementPosition, directiveIndex?: number): void;
  abstract selectDomElement(position: ElementPosition): void;
  abstract inspect(directivePosition: DirectivePosition, objectPath: string[]): void;
}
