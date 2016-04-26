import {BaseException} from 'angular2/src/facade/exceptions';

import {Identifiers} from './identifiers';
import * as o from './output/output_ast';

import {ListWrapper, Map, StringMapWrapper} from 'angular2/src/facade/collection';

import {AnimationStateEvent} from 'angular2/src/core/animation/animation_state_event';

import {
  AnimationParseError,
  parseAnimationEvent,
  parseAnimationMetadata,
  ParsedAnimationResult,
} from 'angular2/src/compiler/animation/animation_parser';
import {CompileDirectiveMetadata} from "./compile_metadata";

import {
  AnimationAst,
  AnimationKeyframeAst,
  AnimationStylesAst,
  AnimationSequenceAst,
  AnimationGroupAst,
  AnimationStepAst,
  AnimationAstVisitor
} from 'angular2/src/compiler/animation/animation_ast';

export class CompileAnimation {
  constructor(public event: AnimationStateEvent, public statements: o.Statement[], public animationFactory: o.Expression) {}
}

export class AnimationCompiler {
  compileComponent(component: CompileDirectiveMetadata): CompileAnimation[] {
    var compiledAnimations: CompileAnimation[] = [];
    var index = 0;
    component.template.animations.forEach(metadata => {
      var eventResults = parseAnimationEvent(metadata.name);
      var animationResults = parseAnimationMetadata(metadata.animation);
      var errors: AnimationParseError[] =
        ListWrapper.concat(eventResults.errors, animationResults.errors);
      if (errors.length > 0) {
        var errorMessage = '';
        errors.forEach((error: AnimationParseError) => { errorMessage += "\n- " + error.msg; });
        // todo (matsko): include the component name when throwing
        throw new BaseException(
          `Unable to parse the animation sequence for "${metadata.name}" due to the following errors: ` +
          errorMessage);
      }
      var ast = animationResults.ast;
      var factoryName = `animationFactory_${component.type.name}_${index}`;
      var visitor = new _AnimationBuilder(factoryName);
      var statements = <o.Statement[]>[];
      var factory = visitor.build(ast, statements);
      compiledAnimations.push(new CompileAnimation(eventResults.event, statements, factory));
      index++;
    });
    return compiledAnimations;
  }
}

var _ANIMATION_FACTORY_ELEMENT_VAR = o.variable('element');
var _ANIMATION_FACTORY_RENDERER_VAR = o.variable('renderer');

class _AnimationBuilder implements AnimationAstVisitor {
  constructor(public factoryName: string) {}

  visitAnimationStyles(ast: AnimationStylesAst,
                               context: any): o.Expression {
    var stylesMapEntries = StringMapWrapper.keys(ast.styles).map(key => [key, o.literal(ast.styles[key])]);
    return o.importExpr(Identifiers.AnimationStyles).instantiate([
      o.literalMap(stylesMapEntries)]);
  }

  visitAnimationKeyframe(ast: AnimationKeyframeAst,
                         context: any): o.Expression {
    var stylesExprs = ast.styles.map(styleEntry => styleEntry.visit(this, context));
    return o.importExpr(Identifiers.AnimationKeyframe).instantiate([
      o.literal(ast.position),
      o.literalArr(stylesExprs)]);
  }

  visitAnimationStep(ast: AnimationStepAst,
                            context: any): o.Expression {
    var startingStyles = ast.startingStyles.map(styleAst => this.visitAnimationStyles(styleAst, context));
    var keyframes = ast.keyframes.map(keyframeEntry => keyframeEntry.visit(this, context));
    return _ANIMATION_FACTORY_RENDERER_VAR.callMethod('animate', [
      _ANIMATION_FACTORY_ELEMENT_VAR,
      o.literalArr(startingStyles),
      o.literalArr(keyframes),
      o.literal(ast.duration),
      o.literal(ast.delay),
      o.literal(ast.easing)
    ]);
  }

  visitAnimationSequence(ast: AnimationSequenceAst,
                         context: any): o.Expression {
    var playerExprs = ast.steps.map(step => step.visit(this, context));
    return o.importExpr(Identifiers.AnimationSequencePlayer).instantiate([
      o.literalArr(playerExprs)]);
  }

  visitAnimationGroup(ast: AnimationGroupAst, context: any): o.Expression {
    var playerExprs = ast.steps.map(step => step.visit(this, context));
    return o.importExpr(Identifiers.AnimationGroupPlayer).instantiate([
      o.literalArr(playerExprs)]);
  }

  build(ast: AnimationAst, statements: o.Statement[]): o.Expression {
    var playerExpr = ast.visit(this, statements);

    statements.push(o.fn([
      new o.FnParam(_ANIMATION_FACTORY_RENDERER_VAR.name, o.importType(Identifiers.Renderer)),
      new o.FnParam(_ANIMATION_FACTORY_ELEMENT_VAR.name, o.DYNAMIC_TYPE)
    ], [new o.ReturnStatement(playerExpr)]).toDeclStmt(this.factoryName));

    return o.variable(this.factoryName);
  }
}
