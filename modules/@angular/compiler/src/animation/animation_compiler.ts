/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StringMapWrapper} from '../facade/collection';
import {isPresent} from '../facade/lang';
import {Identifiers, resolveIdentifier} from '../identifiers';
import * as o from '../output/output_ast';
import {ANY_STATE, DEFAULT_STATE, EMPTY_STATE} from '../private_import_core';

import {AnimationAst, AnimationAstVisitor, AnimationEntryAst, AnimationGroupAst, AnimationKeyframeAst, AnimationSequenceAst, AnimationStateDeclarationAst, AnimationStateTransitionAst, AnimationStepAst, AnimationStylesAst} from './animation_ast';

export class AnimationEntryCompileResult {
  constructor(public name: string, public statements: o.Statement[], public fnExp: o.Expression) {}
}

export class AnimationCompiler {
  compile(factoryNamePrefix: string, parsedAnimations: AnimationEntryAst[]):
      AnimationEntryCompileResult[] {
    return parsedAnimations.map(entry => {
      const factoryName = `${factoryNamePrefix}_${entry.name}`;
      const visitor = new _AnimationBuilder(entry.name, factoryName);
      return visitor.build(entry);
    });
  }
}

var _ANIMATION_FACTORY_ELEMENT_VAR = o.variable('element');
var _ANIMATION_DEFAULT_STATE_VAR = o.variable('defaultStateStyles');
var _ANIMATION_FACTORY_VIEW_VAR = o.variable('view');
var _ANIMATION_FACTORY_RENDERER_VAR = _ANIMATION_FACTORY_VIEW_VAR.prop('renderer');
var _ANIMATION_CURRENT_STATE_VAR = o.variable('currentState');
var _ANIMATION_NEXT_STATE_VAR = o.variable('nextState');
var _ANIMATION_PLAYER_VAR = o.variable('player');
var _ANIMATION_TIME_VAR = o.variable('totalTime');
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

    return o.importExpr(resolveIdentifier(Identifiers.AnimationStyles)).instantiate([
      o.importExpr(resolveIdentifier(Identifiers.collectAndResolveStyles)).callFn([
        _ANIMATION_COLLECTED_STYLES, o.literalArr(stylesArr)
      ])
    ]);
  }

  visitAnimationKeyframe(ast: AnimationKeyframeAst, context: _AnimationBuilderContext):
      o.Expression {
    return o.importExpr(resolveIdentifier(Identifiers.AnimationKeyframe)).instantiate([
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
    return this._callAnimateMethod(
        ast, startingStylesExpr, o.literalArr(keyframeExpressions), context);
  }

  /** @internal */
  _visitEndStateAnimation(ast: AnimationStepAst, context: _AnimationBuilderContext): o.Expression {
    var startingStylesExpr = ast.startingStyles.visit(this, context);
    var keyframeExpressions = ast.keyframes.map(keyframe => keyframe.visit(this, context));
    var keyframesExpr =
        o.importExpr(resolveIdentifier(Identifiers.balanceAnimationKeyframes)).callFn([
          _ANIMATION_COLLECTED_STYLES, _ANIMATION_END_STATE_STYLES_VAR,
          o.literalArr(keyframeExpressions)
        ]);

    return this._callAnimateMethod(ast, startingStylesExpr, keyframesExpr, context);
  }

  /** @internal */
  _callAnimateMethod(
      ast: AnimationStepAst, startingStylesExpr: any, keyframesExpr: any,
      context: _AnimationBuilderContext) {
    context.totalTransitionTime += ast.duration + ast.delay;
    return _ANIMATION_FACTORY_RENDERER_VAR.callMethod('animate', [
      _ANIMATION_FACTORY_ELEMENT_VAR, startingStylesExpr, keyframesExpr, o.literal(ast.duration),
      o.literal(ast.delay), o.literal(ast.easing)
    ]);
  }

  visitAnimationSequence(ast: AnimationSequenceAst, context: _AnimationBuilderContext):
      o.Expression {
    var playerExprs = ast.steps.map(step => step.visit(this, context));
    return o.importExpr(resolveIdentifier(Identifiers.AnimationSequencePlayer)).instantiate([
      o.literalArr(playerExprs)
    ]);
  }

  visitAnimationGroup(ast: AnimationGroupAst, context: _AnimationBuilderContext): o.Expression {
    var playerExprs = ast.steps.map(step => step.visit(this, context));
    return o.importExpr(resolveIdentifier(Identifiers.AnimationGroupPlayer)).instantiate([
      o.literalArr(playerExprs)
    ]);
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

    context.totalTransitionTime = 0;
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

    var animationStmt = _ANIMATION_PLAYER_VAR.set(animationPlayerExpr).toStmt();
    var totalTimeStmt = _ANIMATION_TIME_VAR.set(o.literal(context.totalTransitionTime)).toStmt();

    return new o.IfStmt(precondition, [animationStmt, totalTimeStmt]);
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
    statements.push(_ANIMATION_TIME_VAR.set(o.literal(0)).toDeclStmt());

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

    var RENDER_STYLES_FN = o.importExpr(resolveIdentifier(Identifiers.renderStyles));

    // before we start any animation we want to clear out the starting
    // styles from the element's style property (since they were placed
    // there at the end of the last animation
    statements.push(RENDER_STYLES_FN
                        .callFn([
                          _ANIMATION_FACTORY_ELEMENT_VAR, _ANIMATION_FACTORY_RENDERER_VAR,
                          o.importExpr(resolveIdentifier(Identifiers.clearStyles))
                              .callFn([_ANIMATION_START_STATE_STYLES_VAR])
                        ])
                        .toStmt());

    ast.stateTransitions.forEach(transAst => statements.push(transAst.visit(this, context)));

    // this check ensures that the animation factory always returns a player
    // so that the onDone callback can be used for tracking
    statements.push(new o.IfStmt(
        _ANIMATION_PLAYER_VAR.equals(o.NULL_EXPR),
        [_ANIMATION_PLAYER_VAR
             .set(o.importExpr(resolveIdentifier(Identifiers.NoOpAnimationPlayer)).instantiate([]))
             .toStmt()]));

    // once complete we want to apply the styles on the element
    // since the destination state's values should persist once
    // the animation sequence has completed.
    statements.push(
        _ANIMATION_PLAYER_VAR
            .callMethod(
                'onDone',
                [o.fn(
                    [],
                    [RENDER_STYLES_FN
                         .callFn([
                           _ANIMATION_FACTORY_ELEMENT_VAR, _ANIMATION_FACTORY_RENDERER_VAR,
                           o.importExpr(resolveIdentifier(Identifiers.prepareFinalAnimationStyles))
                               .callFn([
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
                              _ANIMATION_PLAYER_VAR, _ANIMATION_TIME_VAR,
                              _ANIMATION_CURRENT_STATE_VAR, _ANIMATION_NEXT_STATE_VAR
                            ])
                        .toStmt());

    return o.fn(
        [
          new o.FnParam(
              _ANIMATION_FACTORY_VIEW_VAR.name,
              o.importType(resolveIdentifier(Identifiers.AppView), [o.DYNAMIC_TYPE])),
          new o.FnParam(_ANIMATION_FACTORY_ELEMENT_VAR.name, o.DYNAMIC_TYPE),
          new o.FnParam(_ANIMATION_CURRENT_STATE_VAR.name, o.DYNAMIC_TYPE),
          new o.FnParam(_ANIMATION_NEXT_STATE_VAR.name, o.DYNAMIC_TYPE)
        ],
        statements);
  }

  build(ast: AnimationAst): AnimationEntryCompileResult {
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

    const compiledStatesMapStmt = this._statesMapVar.set(o.literalMap(lookupMap)).toDeclStmt();
    const statements: o.Statement[] = [compiledStatesMapStmt, fnStatement];

    return new AnimationEntryCompileResult(this.animationName, statements, fnVariable);
  }
}

class _AnimationBuilderContext {
  stateMap = new _AnimationBuilderStateMap();
  endStateAnimateStep: AnimationStepAst = null;
  isExpectingFirstStyleStep = false;
  totalTransitionTime = 0;
}

class _AnimationBuilderStateMap {
  private _states: {[key: string]: {[prop: string]: string | number}} = {};
  get states() { return this._states; }
  registerState(name: string, value: {[prop: string]: string | number} = null): void {
    var existingEntry = this._states[name];
    if (!existingEntry) {
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
