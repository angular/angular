export abstract class AnimationAst {
  public startTime: number = 0;
  public playTime: number = 0;
  abstract visit(visitor: AnimationAstVisitor, context: any): any;
}

export interface AnimationAstVisitor {
  visitAnimationStep(ast: AnimationStepAst, context: any): any;
  visitAnimationSequence(ast: AnimationSequenceAst, context: any): any;
  visitAnimationGroup(ast: AnimationGroupAst, context: any): any;
  visitAnimationKeyframe(ast: AnimationKeyframeAst, context: any): any;
  visitAnimationStyles(ast: AnimationStylesAst, context: any): any;
}

export class AnimationStepAst extends AnimationAst {
  constructor(public startingStyles: AnimationStylesAst[],
              public keyframes: AnimationKeyframeAst[],
              public duration: number,
              public delay: number,
              public easing: string) {
    super();
  }
  visit(visitor: AnimationAstVisitor, context: any): any {
    return visitor.visitAnimationStep(this, context);
  }
}

export class AnimationStylesAst extends AnimationAst {
  constructor(public styles: {[key: string]: string | number}) { super(); }
  visit(visitor: AnimationAstVisitor, context: any): any {
    return visitor.visitAnimationStyles(this, context);
  }
}

export class AnimationKeyframeAst extends AnimationAst {
  constructor(public position: number, public styles: AnimationStylesAst[]) { super(); }
  visit(visitor: AnimationAstVisitor, context: any): any {
    return visitor.visitAnimationKeyframe(this, context);
  }
}

export abstract class AnimationWithStepsAst extends AnimationAst {
  constructor(public steps: AnimationAst[]) { super(); }
}

export class AnimationGroupAst extends AnimationWithStepsAst {
  constructor(steps: AnimationAst[]) { super(steps); }
  visit(visitor: AnimationAstVisitor, context: any): any {
    return visitor.visitAnimationGroup(this, context);
  }
}

export class AnimationSequenceAst extends AnimationWithStepsAst {
  constructor(steps: AnimationAst[]) { super(steps); }
  visit(visitor: AnimationAstVisitor, context: any): any {
    return visitor.visitAnimationSequence(this, context);
  }
}
