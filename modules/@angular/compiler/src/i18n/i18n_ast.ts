/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceSpan} from "../parse_util";

export interface I18nNode {
  visit(visitor: Visitor, context?: any): any;
}

export class Text implements I18nNode {
  constructor(public value: string, public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any {
    return visitor.visitText(this, context);
  }
}

export class Container implements I18nNode {
  constructor(public children: I18nNode[], public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any {
    return visitor.visitContainer(this, context);
  }
}

export class Icu implements I18nNode {
  constructor(public expression: string, public type: string, public cases: {[k: string]: I18nNode}, public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any {
    return visitor.visitIcu(this, context);
  }
}

export class TagPlaceholder {
  constructor(public name: string, public attrs: {[k: string]: string}, public children: I18nNode[], public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any {
    return visitor.visitTagPlaceholder(this, context);
  }
}

export class Placeholder {
  constructor(public value: string, public name: string = '', public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any {
    return visitor.visitPlaceholder(this, context);
  }
}

export class IcuPlaceholder {
  constructor(public value: Icu, public name: string = '', public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any {
    return visitor.visitIcuPlaceholder(this, context);
  }
}

export interface Visitor {
  visitText(text: Text, context?: any): any;
  visitContainer(container: Container, context?: any): any;
  visitIcu(icu: Icu, context?: any): any;
  visitTagPlaceholder(ph: TagPlaceholder, context?: any): any;
  visitPlaceholder(ph: Placeholder, context?: any): any;
  visitIcuPlaceholder(ph: IcuPlaceholder, context?: any): any;
}




