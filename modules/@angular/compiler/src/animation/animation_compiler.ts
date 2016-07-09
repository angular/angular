/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AUTO_STYLE} from '@angular/core';

import {ANY_STATE, DEFAULT_STATE, EMPTY_STATE} from '../../core_private';
import {CompileDirectiveMetadata} from '../compile_metadata';
import {ListWrapper, Map, StringMapWrapper} from '../facade/collection';
import {BaseException} from '../facade/exceptions';
import {isArray, isBlank, isPresent} from '../facade/lang';
import {Identifiers} from '../identifiers';
import * as o from '../output/output_ast';
import * as t from '../template_ast';

import {AnimationAst, AnimationAstVisitor, AnimationEntryAst, AnimationGroupAst, AnimationKeyframeAst, AnimationSequenceAst, AnimationStateAst, AnimationStateDeclarationAst, AnimationStateTransitionAst, AnimationStepAst, AnimationStylesAst} from './animation_ast';
import {AnimationParseError, ParsedAnimationResult, parseAnimationEntry} from './animation_parser';

export class CompiledAnimation {
  constructor(
      public name: string, public statesMapStatement: o.Statement,
      public statesVariableName: string, public fnStatement: o.Statement,
      public fnVariable: o.Expression) {}
}

export class AnimationCompiler {
  compileComponent(component: CompileDirectiveMetadata, template: t.TemplateAst[]):
      CompiledAnimation[] {
    var compiledAnimations: CompiledAnimation[] = [];
    var groupedErrors: string[] = [];
    var triggerLookup: {[key: string]: CompiledAnimation} = {};
    var componentName = component.type.name;

    component.template.animations.forEach(entry => {
      var result = parseAnimationEntry(entry);
      var triggerName = entry.name;
      if (result.errors.length > 0) {
        var errorMessage =
            `Unable to parse the animation sequence for "${triggerName}" due to the following errors:`;
        result.errors.forEach(
            (error: AnimationParseError) => { errorMessage += '\n-- ' + error.msg; });
        groupedErrors.push(errorMessage);
      }

      if (triggerLookup[triggerName]) {
        groupedErrors.push(
            `The animation trigger "${triggerName}" has already been registered on "${componentName}"`);
      } else {
        var factoryName = `${componentName}_${entry.name}`;
        var visitor = new _AnimationBuilder(triggerName, factoryName);
        var compileResult = visitor.build(result.ast);
        compiledAnimations.push(compileResult);
        triggerLookup[entry.name] = compileResult;
      }
    });

    _validateAnimationProperties(compiledAnimations, template).forEach(entry => {
      groupedErrors.push(entry.msg);
    });

    if (groupedErrors.length > 0) {
      var errorMessageStr =
          `Animation parsing for ${component.type.name} has failed due to the following errors:`;
      groupedErrors.forEach(error => errorMessageStr += `\n- ${error}`);
      throw new BaseException(errorMessageStr);
    }

    return compiledAnimations;
  }
}

var _ANIMATION_FACTORY_ELEMENT_VAR = o.variable('element');
var _ANIMATION_DEFAULT_STATE_VAR = o.variable('defaultStateStyles');
var _ANIMATION_FACTORY_VIEW_VAR = o.variable('view');
var _ANIMATION_FACTORY_RENDERER_VAR = _ANIMATION_FACTORY_VIEW_VAR.prop('renderer');
var _ANIMATION_CURRENT_STATE_VAR = o.variable('currentState');
var _ANIMATION_NEXT_STATE_VAR = o.variable('nextState');
var _ANIMATION_PLAYER_VAR = o.variable('player');
var _ANIMATION_START_STATE_STYLES_VAR = o.variable('startStateStyles');
var _ANIMATION_END_STATE_STYLES_VAR = o.variable('endStateStyles');
var _ANIMATION_COLLECTED_STYLES = o.variable('collectedStyles');
var EMPTY_MAP = o.literalMap([]);

class _AnimationBuilder implements AnimationAstVisitor {
  private _fnVarName: string;
  private _statesMapVarName: string;
  private _statesMapVar: any;

  constructor(public animationName: string, factoryName: string) {
    this._fnVarName = factoryName + '_factory';
    this._statesMapVarName = factoryName + '_states';
    this._statesMapVar = o.variable(this._statesMapVarName);
  }

  visitAnimationStyles(ast: AnimationStylesAst, context: _AnimationBuilderContext): o.Expression {
    var stylesArr: any[] = [];
    if (context.isExpectingFirstStyleStep) {
      stylesArr.push(_ANIMATION_START_STATE_STYLES_VAR);
      context.isExpectingFirstStyleStep = false;
    }

    ast.styles.forEach(entry => {
      stylesArr.push(
          o.literalMap(StringMapWrapper.keys(entry).map(key => [key, o.literal(entry[key])])));
    });

    return o.importExpr(Identifiers.AnimationStyles).instantiate([
      o.importExpr(Identifiers.collectAndResolveStyles).callFn([
        _ANIMATION_COLLECTED_STYLES, o.literalArr(stylesArr)
      ])
    ]);
  }

  visitAnimationKeyframe(ast: AnimationKeyframeAst, context: _AnimationBuilderContext):
      o.Expression {
    return o.importExpr(Identifiers.AnimationKeyframe).instantiate([
      o.literal(ast.offset), ast.styles.visit(this, context)
    ]);
  }

  visitAnimationStep(ast: AnimationStepAst, context: _AnimationBuilderContext): o.Expression {
    if (context.endStateAnimateStep === ast) {
      return this._visitEndStateAnimation(ast, context);
    }

    var startingStylesExpr = ast.startingStyles.visit(this, context);
    var keyframeExpressions =
        ast.keyframes.map(keyframeEntry => keyframeEntry.visit(this, context));
    return this._callAnimateMethod(ast, startingStylesExpr, o.literalArr(keyframeExpressions));
  }

  /** @internal */
  _visitEndStateAnimation(ast: AnimationStepAst, context: _AnimationBuilderContext): o.Expression {
    var startingStylesExpr = ast.startingStyles.visit(this, context);
    var keyframeExpressions = ast.keyframes.map(keyframe => keyframe.visit(this, context));
    var keyframesExpr = o.importExpr(Identifiers.balanceAnimationKeyframes).callFn([
      _ANIMATION_COLLECTED_STYLES, _ANIMATION_END_STATE_STYLES_VAR,
      o.literalArr(keyframeExpressions)
    ]);

    return this._callAnimateMethod(ast, startingStylesExpr, keyframesExpr);
  }

  /** @internal */
  _callAnimateMethod(ast: AnimationStepAst, startingStylesExpr: any, keyframesExpr: any) {
    return _ANIMATION_FACTORY_RENDERER_VAR.callMethod('animate', [
      _ANIMATION_FACTORY_ELEMENT_VAR, startingStylesExpr, keyframesExpr, o.literal(ast.duration),
      o.literal(ast.delay), o.literal(ast.easing)
    ]);
  }

  visitAnimationSequence(ast: AnimationSequenceAst, context: _AnimationBuilderContext):
      o.Expression {
    var playerExprs = ast.steps.map(step => step.visit(this, context));
    return o.importExpr(Identifiers.AnimationSequencePlayer).instantiate([o.literalArr(
        playerExprs)]);
  }

  visitAnimationGroup(ast: AnimationGroupAst, context: _AnimationBuilderContext): o.Expression {
    var playerExprs = ast.steps.map(step => step.visit(this, context));
    return o.importExpr(Identifiers.AnimationGroupPlayer).instantiate([o.literalArr(playerExprs)]);
  }

  visitAnimationStateDeclaration(
      ast: AnimationStateDeclarationAst, context: _AnimationBuilderContext): void {
    var flatStyles: {[key: string]: string | number} = {};
    _getStylesArray(ast).forEach(entry => {
      StringMapWrapper.forEach(entry, (value: string, key: string) => { flatStyles[key] = value; });
    });
    context.stateMap.registerState(ast.stateName, flatStyles);
  }

  visitAnimationStateTransition(
      ast: AnimationStateTransitionAst, context: _AnimationBuilderContext): any {
    var steps = ast.animation.steps;
    var lastStep = steps[steps.length - 1];
    if (_isEndStateAnimateStep(lastStep)) {
      context.endStateAnimateStep = <AnimationStepAst>lastStep;
    }

    context.isExpectingFirstStyleStep = true;

    var stateChangePreconditions: o.Expression[] = [];

    ast.stateChanges.forEach(stateChange => {
      stateChangePreconditions.push(
          _compareToAnimationStateExpr(_ANIMATION_CURRENT_STATE_VAR, stateChange.fromState)
              .and(_compareToAnimationStateExpr(_ANIMATION_NEXT_STATE_VAR, stateChange.toState)));

      if (stateChange.fromState != ANY_STATE) {
        context.stateMap.registerState(stateChange.fromState);
      }

      if (stateChange.toState != ANY_STATE) {
        context.stateMap.registerState(stateChange.toState);
      }
    });

    var animationPlayerExpr = ast.animation.visit(this, context);

    var reducedStateChangesPrecondition = stateChangePreconditions.reduce((a, b) => a.or(b));
    var precondition =
        _ANIMATION_PLAYER_VAR.equals(o.NULL_EXPR).and(reducedStateChangesPrecondition);

    return new o.IfStmt(precondition, [_ANIMATION_PLAYER_VAR.set(animationPlayerExpr).toStmt()]);
  }

  visitAnimationEntry(ast: AnimationEntryAst, context: _AnimationBuilderContext): any {
    // visit each of the declarations first to build the context state map
    ast.stateDeclarations.forEach(def => def.visit(this, context));

    // this should always be defined even if the user overrides it
    context.stateMap.registerState(DEFAULT_STATE, {});

    var statements: o.Statement[] = [];
    statements.push(_ANIMATION_FACTORY_VIEW_VAR
                        .callMethod(
                            'cancelActiveAnimation',
                            [
                              _ANIMATION_FACTORY_ELEMENT_VAR, o.literal(this.animationName),
                              _ANIMATION_NEXT_STATE_VAR.equals(o.literal(EMPTY_STATE))
                            ])
                        .toStmt());


    statements.push(_ANIMATION_COLLECTED_STYLES.set(EMPTY_MAP).toDeclStmt());
    statements.push(_ANIMATION_PLAYER_VAR.set(o.NULL_EXPR).toDeclStmt());

    statements.push(
        _ANIMATION_DEFAULT_STATE_VAR.set(this._statesMapVar.key(o.literal(DEFAULT_STATE)))
            .toDeclStmt());

    statements.push(
        _ANIMATION_START_STATE_STYLES_VAR.set(this._statesMapVar.key(_ANIMATION_CURRENT_STATE_VAR))
            .toDeclStmt());

    statements.push(new o.IfStmt(
        _ANIMATION_START_STATE_STYLES_VAR.equals(o.NULL_EXPR),
        [_ANIMATION_START_STATE_STYLES_VAR.set(_ANIMATION_DEFAULT_STATE_VAR).toStmt()]));

    statements.push(
        _ANIMATION_END_STATE_STYLES_VAR.set(this._statesMapVar.key(_ANIMATION_NEXT_STATE_VAR))
            .toDeclStmt());

    statements.push(new o.IfStmt(
        _ANIMATION_END_STATE_STYLES_VAR.equals(o.NULL_EXPR),
        [_ANIMATION_END_STATE_STYLES_VAR.set(_ANIMATION_DEFAULT_STATE_VAR).toStmt()]));

    var RENDER_STYLES_FN = o.importExpr(Identifiers.renderStyles);

    // before we start any animation we want to clear out the starting
    // styles from the element's style property (since they were placed
    // there at the end of the last animation
    statements.push(
        RENDER_STYLES_FN
            .callFn([
              _ANIMATION_FACTORY_ELEMENT_VAR, _ANIMATION_FACTORY_RENDERER_VAR,
              o.importExpr(Identifiers.clearStyles).callFn([_ANIMATION_START_STATE_STYLES_VAR])
            ])
            .toStmt());

    ast.stateTransitions.forEach(transAst => statements.push(transAst.visit(this, context)));

    // this check ensures that the animation factory always returns a player
    // so that the onDone callback can be used for tracking
    statements.push(new o.IfStmt(
        _ANIMATION_PLAYER_VAR.equals(o.NULL_EXPR),
        [_ANIMATION_PLAYER_VAR.set(o.importExpr(Identifiers.NoOpAnimationPlayer).instantiate([]))
             .toStmt()]));

    // once complete we want to apply the styles on the element
    // since the destination state's values should persist once
    // the animation sequence has completed.
    statements.push(
        _ANIMATION_PLAYER_VAR
            .callMethod(
                'onDone',
                [o.fn(
                    [], [RENDER_STYLES_FN
                             .callFn([
                               _ANIMATION_FACTORY_ELEMENT_VAR, _ANIMATION_FACTORY_RENDERER_VAR,
                               o.importExpr(Identifiers.prepareFinalAnimationStyles).callFn([
                                 _ANIMATION_START_STATE_STYLES_VAR, _ANIMATION_END_STATE_STYLES_VAR
                               ])
                             ])
                             .toStmt()])])
            .toStmt());

    statements.push(_ANIMATION_FACTORY_VIEW_VAR
                        .callMethod(
                            'queueAnimation',
                            [
                              _ANIMATION_FACTORY_ELEMENT_VAR, o.literal(this.animationName),
                              _ANIMATION_PLAYER_VAR
                            ])
                        .toStmt());

    return o.fn(
        [
          new o.FnParam(
              _ANIMATION_FACTORY_VIEW_VAR.name,
              o.importType(Identifiers.AppView, [o.DYNAMIC_TYPE])),
          new o.FnParam(_ANIMATION_FACTORY_ELEMENT_VAR.name, o.DYNAMIC_TYPE),
          new o.FnParam(_ANIMATION_CURRENT_STATE_VAR.name, o.DYNAMIC_TYPE),
          new o.FnParam(_ANIMATION_NEXT_STATE_VAR.name, o.DYNAMIC_TYPE)
        ],
        statements);
  }

  build(ast: AnimationAst): CompiledAnimation {
    var context = new _AnimationBuilderContext();
    var fnStatement = ast.visit(this, context).toDeclStmt(this._fnVarName);
    var fnVariable = o.variable(this._fnVarName);

    var lookupMap: any[] = [];
    StringMapWrapper.forEach(
        context.stateMap.states, (value: {[key: string]: string}, stateName: string) => {
          var variableValue = EMPTY_MAP;
          if (isPresent(value)) {
            let styleMap: any[] = [];
            StringMapWrapper.forEach(value, (value: string, key: string) => {
              styleMap.push([key, o.literal(value)]);
            });
            variableValue = o.literalMap(styleMap);
          }
          lookupMap.push([stateName, variableValue]);
        });

    var compiledStatesMapExpr = this._statesMapVar.set(o.literalMap(lookupMap)).toDeclStmt();
    return new CompiledAnimation(
        this.animationName, compiledStatesMapExpr, this._statesMapVarName, fnStatement, fnVariable);
  }
}

class _AnimationBuilderContext {
  stateMap = new _AnimationBuilderStateMap();
  endStateAnimateStep: AnimationStepAst = null;
  isExpectingFirstStyleStep = false;
}

class _AnimationBuilderStateMap {
  private _states: {[key: string]: {[prop: string]: string | number}} = {};
  get states() { return this._states; }
  registerState(name: string, value: {[prop: string]: string | number} = null): void {
    var existingEntry = this._states[name];
    if (isBlank(existingEntry)) {
      this._states[name] = value;
    }
  }
}

function _compareToAnimationStateExpr(value: o.Expression, animationState: string): o.Expression {
  var emptyStateLiteral = o.literal(EMPTY_STATE);
  switch (animationState) {
    case EMPTY_STATE:
      return value.equals(emptyStateLiteral);

    case ANY_STATE:
      return o.literal(true);

    default:
      return value.equals(o.literal(animationState));
  }
}

function _isEndStateAnimateStep(step: AnimationAst): boolean {
  // the final animation step is characterized by having only TWO
  // keyframe values and it must have zero styles for both keyframes
  if (step instanceof AnimationStepAst && step.duration > 0 && step.keyframes.length == 2) {
    var styles1 = _getStylesArray(step.keyframes[0])[0];
    var styles2 = _getStylesArray(step.keyframes[1])[0];
    return StringMapWrapper.isEmpty(styles1) && StringMapWrapper.isEmpty(styles2);
  }
  return false;
}

function _getStylesArray(obj: any): {[key: string]: any}[] {
  return obj.styles.styles;
}

function _validateAnimationProperties(
    compiledAnimations: CompiledAnimation[], template: t.TemplateAst[]): AnimationParseError[] {
  var visitor = new _AnimationTemplatePropertyVisitor(compiledAnimations);
  t.templateVisitAll(visitor, template);
  return visitor.errors;
}

class _AnimationTemplatePropertyVisitor implements t.TemplateAstVisitor {
  private _animationRegistry: {[key: string]: boolean} = {};

  public errors: AnimationParseError[] = [];

  constructor(animations: CompiledAnimation[]) {
    animations.forEach(entry => { this._animationRegistry[entry.name] = true; });
  }

  visitElement(ast: t.ElementAst, ctx: any): any {
    ast.inputs.forEach(input => {
      if (input.type == t.PropertyBindingType.Animation) {
        var animationName = input.name;
        if (!isPresent(this._animationRegistry[animationName])) {
          this.errors.push(
              new AnimationParseError(`couldn't find an animation entry for ${animationName}`));
        }
      }
    });
    t.templateVisitAll(this, ast.children);
  }

  visitBoundText(ast: t.BoundTextAst, ctx: any): any {}
  visitText(ast: t.TextAst, ctx: any): any {}
  visitEmbeddedTemplate(ast: t.EmbeddedTemplateAst, ctx: any): any {}
  visitNgContent(ast: t.NgContentAst, ctx: any): any {}
  visitAttr(ast: t.AttrAst, ctx: any): any {}
  visitDirective(ast: t.DirectiveAst, ctx: any): any {}
  visitEvent(ast: t.BoundEventAst, ctx: any): any {}
  visitReference(ast: t.ReferenceAst, ctx: any): any {}
  visitVariable(ast: t.VariableAst, ctx: any): any {}
  visitDirectiveProperty(ast: t.BoundDirectivePropertyAst, ctx: any): any {}
  visitElementProperty(ast: t.BoundElementPropertyAst, ctx: any): any {}
}
