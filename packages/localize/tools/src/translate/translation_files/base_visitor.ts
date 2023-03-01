/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Attribute, Comment, Element, Expansion, ExpansionCase, Text, Visitor} from '@angular/compiler';

/**
 * A simple base class for the  `Visitor` interface, which is a noop for every method.
 *
 * Sub-classes only need to override the methods that they care about.
 */
export class BaseVisitor implements Visitor {
  visitElement(_element: Element, _context: any): any {}
  visitAttribute(_attribute: Attribute, _context: any): any {}
  visitText(_text: Text, _context: any): any {}
  visitComment(_comment: Comment, _context: any): any {}
  visitExpansion(_expansion: Expansion, _context: any): any {}
  visitExpansionCase(_expansionCase: ExpansionCase, _context: any): any {}
}
