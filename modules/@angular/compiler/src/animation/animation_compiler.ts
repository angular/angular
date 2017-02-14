/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {isPresent} from '../facade/lang';
import {Identifiers, createIdentifier} from '../identifiers';
import * as o from '../output/output_ast';
import {ANY_STATE, DEFAULT_STATE, EMPTY_STATE} from '../private_import_core';

import {AnimationAst, AnimationAstVisitor, AnimationEntryAst, AnimationGroupAst, AnimationKeyframeAst, AnimationSequenceAst, AnimationStateDeclarationAst, AnimationStateTransitionAst, AnimationStateTransitionFnExpression, AnimationStepAst, AnimationStylesAst} from './animation_ast';

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

const _ANIMATION_FACTORY_ELEMENT_VAR = o.variable('element');
const _ANIMATION_DEFAULT_STATE_VAR = o.variable('defaultStateStyles');
const _ANIMATION_FACTORY_VIEW_VAR = o.variable('view');
const _ANIMATION_FACTORY_VIEW_CONTEXT = _ANIMATION_FACTORY_VIEW_VAR.prop('animationContext');
const _ANIMATION_FACTORY_RENDERER_VAR = _ANIMATION_FACTORY_VIEW_VAR.prop('renderer');
const _ANIMATION_CURRENT_STATE_VAR = o.variable('currentState');
const _ANIMATION_NEXT_STATE_VAR = o.variable('nextState');
const _ANIMATION_PLAYER_VAR = o.variable('player');
const _ANIMATION_TIME_VAR = o.variable('totalTime');
const _ANIMATION_START_STATE_STYLES_VAR = o.variable('startStateStyles');
const _ANIMATION_END_STATE_STYLES_VAR = o.variable('endStateStyles');
const _ANIMATION_COLLECTED_STYLES = o.variable('collectedStyles');
const _PREVIOUS_ANIMATION_PLAYERS = o.variable('previousPlayers');
const _EMPTY_MAP = o.literalMap([]);
const _EMPTY_ARRAY = o.literalArr([]);

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
    const stylesArr: any[] = [];
    if (context.isExpectingFirstStyleStep) {
      stylesArr.push(_ANIMATION_START_STATE_STYLES_VAR);
      context.isExpectingFirstStyleStep = false;
    }

    ast.styles.forEach(entry => {
      const entries =
          Object.keys(entry).map((key): [string, o.Expression] => [key, o.literal(entry[key])]);
      stylesArr.push(o.literalMap(entries, null, true));
    });

    return o.importExpr(createIdentifier(Identifiers.AnimationStyles)).instantiate([
      o.importExpr(createIdentifier(Identifiers.collectAndResolveStyles)).callFn([
        _ANIMATION_COLLECTED_STYLES, o.literalArr(stylesArr)
      ])
    ]);
  }

  visitAnimationKeyframe(ast: AnimationKeyframeAst, context: _AnimationBuilderContext):
      o.Expression {
    return o.importExpr(createIdentifier(Identifiers.AnimationKeyframe)).instantiate([
      o.literal(ast.offset), ast.styles.visit(this, context)
    ]);
  }

  visitAnimationStep(ast: AnimationStepAst, context: _AnimationBuilderContext): o.Expression {
    if (context.endStateAnimateStep === ast) {
      return this._visitEndStateAnimation(ast, context);
    }

    const startingStylesExpr = ast.startingStyles.visit(this, context);
    const keyframeExpressions =
        ast.keyframes.map(keyframeEntry => keyframeEntry.visit(this, context));
    return this._callAnimateMethod(
        ast, startingStylesExpr, o.literalArr(keyframeExpressions), context);
  }

  /** @internal */
  _visitEndStateAnimation(ast: AnimationStepAst, context: _AnimationBuilderContext): o.Expression {
    const startingStylesExpr = ast.startingStyles.visit(this, context);
    const keyframeExpressions = ast.keyframes.map(keyframe => keyframe.visit(this, context));
    const keyframesExpr =
        o.importExpr(createIdentifier(Identifiers.balanceAnimationKeyframes)).callFn([
          _ANIMATION_COLLECTED_STYLES, _ANIMATION_END_STATE_STYLES_VAR,
          o.literalArr(keyframeExpressions)
        ]);

    return this._callAnimateMethod(ast, startingStylesExpr, keyframesExpr, context);
  }

  /** @internal */
  _callAnimateMethod(
      ast: AnimationStepAst, startingStylesExpr: any, keyframesExpr: any,
      context: _AnimationBuilderContext) {
    let previousStylesValue: o.Expression = _EMPTY_ARRAY;
    if (context.isExpectingFirstAnimateStep) {
      previousStylesValue = _PREVIOUS_ANIMATION_PLAYERS;
      context.isExpectingFirstAnimateStep = false;
    }
    context.totalTransitionTime += ast.duration + ast.delay;
    return _ANIMATION_FACTORY_RENDERER_VAR.callMethod('animate', [
      _ANIMATION_FACTORY_ELEMENT_VAR, startingStylesExpr, keyframesExpr, o.literal(ast.duration),
      o.literal(ast.delay), o.literal(ast.easing), previousStylesValue
    ]);
  }

  visitAnimationSequence(ast: AnimationSequenceAst, context: _AnimationBuilderContext):
      o.Expression {
    const playerExprs = ast.steps.map(step => step.visit(this, context));
    return o.importExpr(createIdentifier(Identifiers.AnimationSequencePlayer)).instantiate([
      o.literalArr(playerExprs)
    ]);
  }

  visitAnimationGroup(ast: AnimationGroupAst, context: _AnimationBuilderContext): o.Expression {
    const playerExprs = ast.steps.map(step => step.visit(this, context));
    return o.importExpr(createIdentifier(Identifiers.AnimationGroupPlayer)).instantiate([
      o.literalArr(playerExprs)
    ]);
  }

  visitAnimationStateDeclaration(
      ast: AnimationStateDeclarationAst, context: _AnimationBuilderContext): void {
    const flatStyles: {[key: string]: string | number} = {};
    _getStylesArray(ast).forEach(
        entry => { Object.keys(entry).forEach(key => { flatStyles[key] = entry[key]; }); });
    context.stateMap.registerState(ast.stateName, flatStyles);
  }

  visitAnimationStateTransition(
      ast: AnimationStateTransitionAst, context: _AnimationBuilderContext): any {
    const steps = ast.animation.steps;
    const lastStep = steps[steps.length - 1];
    if (_isEndStateAnimateStep(lastStep)) {
      context.endStateAnimateStep = <AnimationStepAst>lastStep;
    }

    context.totalTransitionTime = 0;
    context.isExpectingFirstStyleStep = true;
    context.isExpectingFirstAnimateStep = true;

    const stateChangePreconditions: o.Expression[] = [];

    ast.stateChanges.forEach(stateChange => {
      if (stateChange instanceof AnimationStateTransitionFnExpression) {
        stateChangePreconditions.push(o.importExpr({reference: stateChange.fn}).callFn([
          _ANIMATION_CURRENT_STATE_VAR, _ANIMATION_NEXT_STATE_VAR
        ]));
      } else {
        stateChangePreconditions.push(
            _compareToAnimationStateExpr(_ANIMATION_CURRENT_STATE_VAR, stateChange.fromState)
                .and(_compareToAnimationStateExpr(_ANIMATION_NEXT_STATE_VAR, stateChange.toState)));

        if (stateChange.fromState != ANY_STATE) {
          context.stateMap.registerState(stateChange.fromState);
        }

        if (stateChange.toState != ANY_STATE) {
          context.stateMap.registerState(stateChange.toState);
        }
      }
    });

    const animationPlayerExpr = ast.animation.visit(this, context);

    const reducedStateChangesPrecondition = stateChangePreconditions.reduce((a, b) => a.or(b));
    const precondition =
        _ANIMATION_PLAYER_VAR.equals(o.NULL_EXPR).and(reducedStateChangesPrecondition);

    const animationStmt = _ANIMATION_PLAYER_VAR.set(animationPlayerExpr).toStmt();
    const totalTimeStmt = _ANIMATION_TIME_VAR.set(o.literal(context.totalTransitionTime)).toStmt();

    return new o.IfStmt(precondition, [animationStmt, totalTimeStmt]);
  }

  visitAnimationEntry(ast: AnimationEntryAst, context: _AnimationBuilderContext): any {
    // visit each of the declarations first to build the context state map
    ast.stateDeclarations.forEach(def => def.visit(this, context));

    // this should always be defined even if the user overrides it
    context.stateMap.registerState(DEFAULT_STATE, {});

    const statements: o.Statement[] = [];
    statements.push(_PREVIOUS_ANIMATION_PLAYERS
                        .set(_ANIMATION_FACTORY_VIEW_CONTEXT.callMethod(
                            'getAnimationPlayers',
                            [
                              _ANIMATION_FACTORY_ELEMENT_VAR,
                              _ANIMATION_NEXT_STATE_VAR.equals(o.literal(EMPTY_STATE))
                                  .conditional(o.NULL_EXPR, o.literal(this.animationName))
                            ]))
                        .toDeclStmt());

    statements.push(_ANIMATION_COLLECTED_STYLES.set(_EMPTY_MAP).toDeclStmt());
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

    const RENDER_STYLES_FN = o.importExpr(createIdentifier(Identifiers.renderStyles));

    ast.stateTransitions.forEach(transAst => statements.push(transAst.visit(this, context)));

    // this check ensures that the animation factory always returns a player
    // so that the onDone callback can be used for tracking
    statements.push(new o.IfStmt(
        _ANIMATION_PLAYER_VAR.equals(o.NULL_EXPR),
        [_ANIMATION_PLAYER_VAR
             .set(o.importExpr(createIdentifier(Identifiers.NoOpAnimationPlayer)).instantiate([]))
             .toStmt()]));

    // once complete we want to apply the styles on the element
    // since the destination state's values should persist once
    // the animation sequence has completed.
    statements.push(
        _ANIMATION_PLAYER_VAR
            .callMethod(
                'onDone',
                [o
                     .fn([],
                         [
                           _ANIMATION_PLAYER_VAR.callMethod('destroy', []).toStmt(),
                           RENDER_STYLES_FN
                               .callFn([
                                 _ANIMATION_FACTORY_ELEMENT_VAR, _ANIMATION_FACTORY_RENDERER_VAR,
                                 o.importExpr(
                                      createIdentifier(Identifiers.prepareFinalAnimationStyles))
                                     .callFn(
                                         [
                                           _ANIMATION_START_STATE_STYLES_VAR,
                                           _ANIMATION_END_STATE_STYLES_VAR
                                         ])
                               ])
                               .toStmt()
                         ])])
            .toStmt());

    statements.push(o.importExpr(createIdentifier(Identifiers.AnimationSequencePlayer))
                        .instantiate([_PREVIOUS_ANIMATION_PLAYERS])
                        .callMethod('destroy', [])
                        .toStmt());

    // before we start any animation we want to clear out the starting
    // styles from the element's style property (since they were placed
    // there at the end of the last animation
    statements.push(RENDER_STYLES_FN
                        .callFn([
                          _ANIMATION_FACTORY_ELEMENT_VAR, _ANIMATION_FACTORY_RENDERER_VAR,
                          o.importExpr(createIdentifier(Identifiers.clearStyles))
                              .callFn([_ANIMATION_START_STATE_STYLES_VAR])
                        ])
                        .toStmt());

    statements.push(_ANIMATION_FACTORY_VIEW_CONTEXT
                        .callMethod(
                            'queueAnimation',
                            [
                              _ANIMATION_FACTORY_ELEMENT_VAR, o.literal(this.animationName),
                              _ANIMATION_PLAYER_VAR
                            ])
                        .toStmt());

    statements.push(new o.ReturnStatement(
        o.importExpr(createIdentifier(Identifiers.AnimationTransition)).instantiate([
          _ANIMATION_PLAYER_VAR, _ANIMATION_FACTORY_ELEMENT_VAR, o.literal(this.animationName),
          _ANIMATION_CURRENT_STATE_VAR, _ANIMATION_NEXT_STATE_VAR, _ANIMATION_TIME_VAR
        ])));

    return o.fn(
        [
          new o.FnParam(
              _ANIMATION_FACTORY_VIEW_VAR.name,
              o.importType(createIdentifier(Identifiers.AppView), [o.DYNAMIC_TYPE])),
          new o.FnParam(_ANIMATION_FACTORY_ELEMENT_VAR.name, o.DYNAMIC_TYPE),
          new o.FnParam(_ANIMATION_CURRENT_STATE_VAR.name, o.DYNAMIC_TYPE),
          new o.FnParam(_ANIMATION_NEXT_STATE_VAR.name, o.DYNAMIC_TYPE)
        ],
        statements, o.importType(createIdentifier(Identifiers.AnimationTransition)));
  }

  build(ast: AnimationAst): AnimationEntryCompileResult {
    const context = new _AnimationBuilderContext();
    const fnStatement = ast.visit(this, context).toDeclStmt(this._fnVarName);
    const fnVariable = o.variable(this._fnVarName);

    const lookupMap: any[] = [];
    Object.keys(context.stateMap.states).forEach(stateName => {
      const value = context.stateMap.states[stateName];
      let variableValue = _EMPTY_MAP;
      if (isPresent(value)) {
        const styleMap: any[] = [];
        Object.keys(value).forEach(key => { styleMap.push([key, o.literal(value[key])]); });
        variableValue = o.literalMap(styleMap, null, true);
      }
      lookupMap.push([stateName, variableValue]);
    });

    const compiledStatesMapStmt =
        this._statesMapVar.set(o.literalMap(lookupMap, null, true)).toDeclStmt();
    const statements: o.Statement[] = [compiledStatesMapStmt, fnStatement];

    return new AnimationEntryCompileResult(this.animationName, statements, fnVariable);
  }
}

class _AnimationBuilderContext {
  stateMap = new _AnimationBuilderStateMap();
  endStateAnimateStep: AnimationStepAst = null;
  isExpectingFirstStyleStep = false;
  isExpectingFirstAnimateStep = false;
  totalTransitionTime = 0;
}

class _AnimationBuilderStateMap {
  private _states: {[key: string]: {[prop: string]: string | number}} = {};
  get states() { return this._states; }
  registerState(name: string, value: {[prop: string]: string | number} = null): void {
    const existingEntry = this._states[name];
    if (!existingEntry) {
      this._states[name] = value;
    }
  }
}

function _compareToAnimationStateExpr(value: o.Expression, animationState: string): o.Expression {
  const emptyStateLiteral = o.literal(EMPTY_STATE);
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
    const styles1 = _getStylesArray(step.keyframes[0])[0];
    const styles2 = _getStylesArray(step.keyframes[1])[0];
    return Object.keys(styles1).length === 0 && Object.keys(styles2).length === 0;
  }
  return false;
}

function _getStylesArray(obj: any): {[key: string]: any}[] {
  return obj.styles.styles;
}
