/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationOperations} from 'ng-devtools';
import {DirectivePosition, ElementPosition} from 'protocol';

export class DemoApplicationOperations extends ApplicationOperations {
  override viewSource(position: ElementPosition): void {
    console.warn('viewSource() is not implemented because the demo app runs in an Iframe');
    throw new Error('Not implemented in demo app.');
  }
  override selectDomElement(position: ElementPosition): void {
    console.warn('selectDomElement() is not implemented because the demo app runs in an Iframe');
    throw new Error('Not implemented in demo app.');
  }
  override inspect(directivePosition: DirectivePosition, keyPath: string[]): void {
    console.warn('inspect() is not implemented because the demo app runs in an Iframe');
    return;
  }
}
