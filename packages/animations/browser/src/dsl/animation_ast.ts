/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimateTimings, AnimationOptions, ɵStyleData} from '@angular/animations';

const EMPTY_ANIMATION_OPTIONS: AnimationOptions = {};

export interface AstVisitor {
  visitTrigger(ast: TriggerAst, context: any): any;
  visitState(ast: StateAst, context: any): any;
  visitTransition(ast: TransitionAst, context: any): any;
  visitSequence(ast: SequenceAst, context: any): any;
  visitGroup(ast: GroupAst, context: any): any;
  visitAnimate(ast: AnimateAst, context: any): any;
  visitStyle(ast: StyleAst, context: any): any;
  visitKeyframes(ast: KeyframesAst, context: any): any;
  visitReference(ast: ReferenceAst, context: any): any;
  visitAnimateChild(ast: AnimateChildAst, context: any): any;
  visitAnimateRef(ast: AnimateRefAst, context: any): any;
  visitQuery(ast: QueryAst, context: any): any;
  visitStagger(ast: StaggerAst, context: any): any;
  visitTiming(ast: TimingAst, context: any): any;
}

export abstract class Ast {
  abstract visit(ast: AstVisitor, context: any): any;
  public options: AnimationOptions = EMPTY_ANIMATION_OPTIONS;

  get params(): {[name: string]: any}|null { return this.options['params'] || null; }
}

export class TriggerAst extends Ast {
  public queryCount: number = 0;
  public depCount: number = 0;

  constructor(public name: string, public states: StateAst[], public transitions: TransitionAst[]) {
    super();
  }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitTrigger(this, context); }
}

export class StateAst extends Ast {
  constructor(public name: string, public style: StyleAst) { super(); }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitState(this, context); }
}

export class TransitionAst extends Ast {
  public queryCount: number = 0;
  public depCount: number = 0;

  constructor(
      public matchers: ((fromState: string, toState: string) => boolean)[], public animation: Ast) {
    super();
  }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitTransition(this, context); }
}

export class SequenceAst extends Ast {
  constructor(public steps: Ast[]) { super(); }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitSequence(this, context); }
}

export class GroupAst extends Ast {
  constructor(public steps: Ast[]) { super(); }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitGroup(this, context); }
}

export class AnimateAst extends Ast {
  constructor(public timings: TimingAst, public style: StyleAst|KeyframesAst) { super(); }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitAnimate(this, context); }
}

export class StyleAst extends Ast {
  public isEmptyStep = false;

  constructor(
      public styles: (ɵStyleData|string)[], public easing: string|null,
      public offset: number|null) {
    super();
  }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitStyle(this, context); }
}

export class KeyframesAst extends Ast {
  constructor(public styles: StyleAst[]) { super(); }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitKeyframes(this, context); }
}

export class ReferenceAst extends Ast {
  constructor(public animation: Ast) { super(); }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitReference(this, context); }
}

export class AnimateChildAst extends Ast {
  constructor() { super(); }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitAnimateChild(this, context); }
}

export class AnimateRefAst extends Ast {
  constructor(public animation: ReferenceAst) { super(); }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitAnimateRef(this, context); }
}

export class QueryAst extends Ast {
  public originalSelector: string;

  constructor(
      public selector: string, public limit: number, public optional: boolean,
      public includeSelf: boolean, public animation: Ast) {
    super();
  }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitQuery(this, context); }
}

export class StaggerAst extends Ast {
  constructor(public timings: AnimateTimings, public animation: Ast) { super(); }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitStagger(this, context); }
}

export class TimingAst extends Ast {
  constructor(
      public duration: number, public delay: number = 0, public easing: string|null = null) {
    super();
  }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitTiming(this, context); }
}

export class DynamicTimingAst extends TimingAst {
  constructor(public value: string) { super(0, 0, ''); }

  visit(visitor: AstVisitor, context: any): any { return visitor.visitTiming(this, context); }
}
