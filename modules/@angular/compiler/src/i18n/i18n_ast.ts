/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceSpan} from '../parse_util';

export class Message {
  /**
   * @param nodes message AST
   * @param placeholders maps placeholder names to static content
   * @param placeholderToMsgIds maps placeholder names to translatable message IDs (used for ICU
   *                            messages)
   * @param meaning
   * @param description
   */
  constructor(
      public nodes: Node[], public placeholders: {[name: string]: string},
      public placeholderToMsgIds: {[name: string]: string}, public meaning: string,
      public description: string) {}
}

export interface Node { visit(visitor: Visitor, context?: any): any; }

export class Text implements Node {
  constructor(public value: string, public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any { return visitor.visitText(this, context); }
}

export class Container implements Node {
  constructor(public children: Node[], public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any { return visitor.visitContainer(this, context); }
}

export class Icu implements Node {
  constructor(
      public expression: string, public type: string, public cases: {[k: string]: Node},
      public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any { return visitor.visitIcu(this, context); }
}

export class TagPlaceholder implements Node {
  constructor(
      public tag: string, public attrs: {[k: string]: string}, public startName: string,
      public closeName: string, public children: Node[], public isVoid: boolean,
      public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any { return visitor.visitTagPlaceholder(this, context); }
}

export class Placeholder implements Node {
  constructor(public value: string, public name: string = '', public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any { return visitor.visitPlaceholder(this, context); }
}

export class IcuPlaceholder implements Node {
  constructor(public value: Icu, public name: string = '', public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any { return visitor.visitIcuPlaceholder(this, context); }
}

export interface Visitor {
  visitText(text: Text, context?: any): any;
  visitContainer(container: Container, context?: any): any;
  visitIcu(icu: Icu, context?: any): any;
  visitTagPlaceholder(ph: TagPlaceholder, context?: any): any;
  visitPlaceholder(ph: Placeholder, context?: any): any;
  visitIcuPlaceholder(ph: IcuPlaceholder, context?: any): any;
}
