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

import * as asts from './animation_ast';

export class AnimationEntryCompileResult {
  constructor(public name: string, public statements: o.Statement[], public fnExp: o.Expression) {}
}

export class AnimationCompiler {
  compile(factoryNamePrefix: string, parsedAnimations: asts.AnimationEntryAst[]):
      AnimationEntryCompileResult[] {
    return parsedAnimations.map(entry => {
      const factoryName = `${factoryNamePrefix}_${entry.name}`;
      const visitor = new _AnimationBuilder(entry.name, factoryName);
      return visitor.build(entry);
    });
  }
}

const _ANIMATION_ELEMENT_VAR = o.variable('element');
const _ANIMATION_ELEMENT_ID_MAP = o.variable('elementIdMap');
const _ANIMATION_DEFAULT_STATE_VAR = o.variable('defaultStateStyles');
const _ANIMATION_FACTORY_VIEW_VAR = o.variable('view');
const _ANIMATION_VIEW_CONTEXT = _ANIMATION_FACTORY_VIEW_VAR.prop('animationContext');
const _ANIMATION_RENDERER_VAR = _ANIMATION_FACTORY_VIEW_VAR.prop('renderer');
const _ANIMATION_CURRENT_STATE_VAR = o.variable('currentState');
const _ANIMATION_NEXT_STATE_VAR = o.variable('nextState');
const _ANIMATION_PLAYER_VAR = o.variable('player');
const _ANIMATION_TIME_VAR = o.variable('totalTime');
const _ANIMATION_START_STATE_STYLES_VAR = o.variable('startStateStyles');
const _ANIMATION_END_STATE_STYLES_VAR = o.variable('endStateStyles');
const _ANIMATION_COLLECTED_STYLES = o.variable('collectedStyles');
const _PREVIOUS_PLAYER_RESULT = o.variable('previousPlayerResult');
const _PREVIOUS_ANIMATION_PLAYER = o.variable('previousPlayer');
const _PREVIOUS_ANIMATION_LEAF_PLAYERS = o.variable('previousPlayerLeafs');
const _ANIMATION_QUERIED_ELEMENT_ID = o.variable('elementId');
const _ANIMATION_QUERIES_VAR = o.variable('queries');
const _ANIMATION_STEPS = o.variable('s');
const _EMPTY_MAP = o.literalMap([]);
const _EMPTY_ARRAY = o.literalArr([]);

class _AnimationBuilder implements asts.AnimationAstVisitor {
  private _fnVarName: string;
  private _statesMapVarName: string;
  private _statesMapVar: any;

  constructor(public animationName: string, factoryName: string) {
    this._fnVarName = factoryName + '_factory';
    this._statesMapVarName = factoryName + '_states';
    this._statesMapVar = o.variable(this._statesMapVarName);
  }

  visitAnimationStyles(ast: asts.AnimationStylesAst, context: _AnimationBuilderContext):
      o.Expression {
    const stylesArr: any[] = [];

    // starting state styles are only seeded in for the
    // first animation on the trigger element
    if (context.isExpectingFirstStyleStep && context.parentQueryIndex === 0) {
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
        _ANIMATION_COLLECTED_STYLES, _ANIMATION_QUERIED_ELEMENT_ID, o.literalArr(stylesArr)
      ])
    ]);
  }

  visitAnimationKeyframe(ast: asts.AnimationKeyframeAst, context: _AnimationBuilderContext):
      o.Expression {
    return o.importExpr(createIdentifier(Identifiers.AnimationKeyframe)).instantiate([
      o.literal(ast.offset), ast.styles.visit(this, context)
    ]);
  }

  visitAnimationStep(ast: asts.AnimationStepAst, context: _AnimationBuilderContext): o.Expression {
    if (ast.isRestoreStep) {
      return this._visitAnimationRestoreStep(ast, context);
    }

    const startingStylesExpr = ast.startingStyles.visit(this, context);
    const keyframeExpressions =
        ast.keyframes.map(keyframeEntry => keyframeEntry.visit(this, context));

    return this._callAnimateMethod(
        ast, startingStylesExpr, o.literalArr(keyframeExpressions), context);
  }

  visitAnimationChildStep(ast: asts.AnimationChildStepAst, context: _AnimationBuilderContext): o.Expression {
      return o.importExpr(createIdentifier(Identifiers.fetchElementAnimation))
        .callFn([
          _ANIMATION_ELEMENT_VAR,
          _ANIMATION_VIEW_CONTEXT,
          o.literal(ast.duration),
          o.literal(ast.delay),
          o.literal(ast.easing),
          _ANIMATION_COLLECTED_STYLES
        ]);
  }

  private _visitAnimationRestoreStep(ast: asts.AnimationStepAst, context: _AnimationBuilderContext):
      o.Expression {
    const startingStylesExpr = ast.startingStyles.visit(this, context);
    const keyframeExpressions = ast.keyframes.map(keyframe => keyframe.visit(this, context));
    const keyframesExpr =
        o.importExpr(createIdentifier(Identifiers.balanceAnimationKeyframes)).callFn([
          _ANIMATION_COLLECTED_STYLES, _ANIMATION_QUERIED_ELEMENT_ID, _ANIMATION_END_STATE_STYLES_VAR,
          o.literalArr(keyframeExpressions)
        ]);

    return this._callAnimateMethod(ast, startingStylesExpr, keyframesExpr, context);
  }

  private _callAnimateMethod(
      ast: asts.AnimationStepAst, startingStylesExpr: any, keyframesExpr: any,
      context: _AnimationBuilderContext): o.Expression {
    let previousStylesValue: o.Expression = _EMPTY_ARRAY;

    // the very first animation per query always gets a collection of the players passed in
    if (ast.startTime === 0) {
      previousStylesValue = _PREVIOUS_ANIMATION_LEAF_PLAYERS;
    }
    context.totalTransitionTime += ast.duration + ast.delay;
    const exp = _ANIMATION_RENDERER_VAR.callMethod('animate', [
      _ANIMATION_ELEMENT_VAR, startingStylesExpr, keyframesExpr, o.literal(ast.duration),
      o.literal(ast.delay), o.literal(ast.easing), previousStylesValue
    ]);
    const index = context.animateSteps.length;
    context.animateSteps.push(_ANIMATION_STEPS.key(exp).set(exp).toStmt());
    return _ANIMATION_STEPS.key(o.literal(index));
  }

  visitAnimationSequence(ast: asts.AnimationSequenceAst, context: _AnimationBuilderContext):
      o.Expression {
    // The code below will turn a sequence of animations that contains
    // two or more repeated zero-value players into grouped items.
    // It's important that all zero-duration && zero-delay players
    // are merged into one group. Doing so will eliminate any pauses
    // between a player ending and the next one starting (which would
    // cause flickers) both with and without web-workers being used.
    //
    // [ 1 0 0 1 0 0 ] => [ 1 0 1 0 ]
    const playerExprs: o.Expression[] = [];
    let zeroPlayTimePlayers: o.Expression[] = [];
    for (let i = 0; i < ast.steps.length; i++) {
      const step = ast.steps[i];
      const player = step.visit(this, context);
      if (step.playTime == 0) {
        zeroPlayTimePlayers.push(player);
      } else {
        if (zeroPlayTimePlayers.length) {
          playerExprs.push(this._combinePlayersIntoGroup(zeroPlayTimePlayers));
          // do not optimize with `length = 0` since the array
          // persists within the group data structure
          zeroPlayTimePlayers = [];
        }
        playerExprs.push(player);
      }
    }

    if (zeroPlayTimePlayers.length) {
      playerExprs.push(this._combinePlayersIntoGroup(zeroPlayTimePlayers));
    }

    return o.importExpr(createIdentifier(Identifiers.AnimationSequencePlayer)).instantiate([
      o.literalArr(playerExprs)
    ]);
  }

  private _combinePlayersIntoGroup(playerExprs: o.Expression[]): o.Expression {
    return playerExprs.length == 1 ? playerExprs[0] : this._createAnimationGroup(playerExprs);
  }

  visitAnimationGroup(ast: asts.AnimationGroupAst, context: _AnimationBuilderContext):
      o.Expression {
    return this._createAnimationGroup(ast.steps.map(step => step.visit(this, context)));
  }

  private _createAnimationGroup(playerExprs: o.Expression[]) {
    return o.importExpr(createIdentifier(Identifiers.AnimationGroupPlayer)).instantiate([
      o.literalArr(playerExprs)
    ]);
  }

  visitAnimationQuery(ast: asts.AnimationQueryAst, context: _AnimationBuilderContext): any {
    var idAsNum = parseInt(ast.id);
    var previousQueryId = context.parentQueryIndex;
    context.parentQueryIndex = idAsNum;
    var innerAnimationExpr = ast.animation.visit(this, context);
    context.parentQueryIndex = previousQueryId;

    // collecting parent players should only happen BEFORE the very first
    // animation step has occurred.
    const collectParentPlayers = ast.startTime == 0;

    return o.importExpr(createIdentifier(Identifiers.animateQuery)).callFn([
      _ANIMATION_VIEW_CONTEXT,
      o.literal(context.entryAst.name),
      _ANIMATION_ELEMENT_ID_MAP,
      _ANIMATION_QUERIES_VAR.key(o.literal(idAsNum)),
      o.literal(collectParentPlayers),
      o.fn([
        new o.FnParam(_ANIMATION_ELEMENT_VAR.name, o.DYNAMIC_TYPE),
        new o.FnParam(_ANIMATION_QUERIED_ELEMENT_ID.name, o.NUMBER_TYPE),
        new o.FnParam(_PREVIOUS_ANIMATION_LEAF_PLAYERS.name, o.NUMBER_TYPE)
      ], [
        new o.ReturnStatement(innerAnimationExpr)
      ])
    ]);
  }

  visitAnimationStateDeclaration(
      ast: asts.AnimationStateDeclarationAst, context: _AnimationBuilderContext): void {
    const flatStyles: {[key: string]: string | number} = {};
    _getStylesArray(ast).forEach(
        entry => { Object.keys(entry).forEach(key => { flatStyles[key] = entry[key]; }); });
    context.stateMap.registerState(ast.stateName, flatStyles);
  }

  visitAnimationStateTransition(
      ast: asts.AnimationStateTransitionAst, context: _AnimationBuilderContext): any {
    context.totalTransitionTime = 0;
    context.isExpectingFirstStyleStep = true;
    context.parentQueryIndex = 0;

    const stateChangePreconditions: o.Expression[] = [];

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

    context.animateSteps = [];
    const animationPlayerExpr = ast.animation.visit(this, context);

    const reducedStateChangesPrecondition = stateChangePreconditions.reduce((a, b) => a.or(b));
    const precondition =
        _ANIMATION_PLAYER_VAR.equals(o.NULL_EXPR).and(reducedStateChangesPrecondition);

    const animationClosure = o.fn([], [
      _ANIMATION_PLAYER_VAR.set(animationPlayerExpr).toStmt(),
      _ANIMATION_TIME_VAR.set(o.literal(context.totalTransitionTime)).toStmt()
    ]);

    return new o.IfStmt(precondition, [
      ...context.animateSteps,
      new o.ReturnStatement(animationClosure)
    ]);
  }

  visitAnimationEntry(ast: asts.AnimationEntryAst, context: _AnimationBuilderContext): any {
    // visit each of the declarations first to build the context state map
    ast.stateDeclarations.forEach(def => def.visit(this, context));

    // this should always be defined even if the user overrides it
    context.stateMap.registerState(DEFAULT_STATE, {});
    context.entryAst = ast;

    const RENDER_STYLES_FN = o.importExpr(createIdentifier(Identifiers.renderStyles));
    const statements: o.Statement[] = [];

    statements.push(_ANIMATION_COLLECTED_STYLES.set(_EMPTY_ARRAY).toDeclStmt());
    statements.push(_ANIMATION_ELEMENT_ID_MAP.set(o.importExpr(createIdentifier(Identifiers.AnimationElementIdMap)).instantiate([_ANIMATION_ELEMENT_VAR])).toDeclStmt());
    statements.push(_ANIMATION_QUERIED_ELEMENT_ID.set(o.literal(0)).toDeclStmt());
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

    // this check ensures that the animation factory always returns a player
    // so that the onDone callback can be used for tracking

    statements.push(_PREVIOUS_PLAYER_RESULT
      .set(_ANIMATION_VIEW_CONTEXT.callMethod(
        'getAnimationPlayers',
        [
          _ANIMATION_ELEMENT_VAR,
          _ANIMATION_NEXT_STATE_VAR.equals(o.literal(EMPTY_STATE)).conditional(o.NULL_EXPR, o.literal(this.animationName))
        ]))
      .toDeclStmt());

    statements.push(_PREVIOUS_ANIMATION_PLAYER.set(_PREVIOUS_PLAYER_RESULT.key(o.literal(0))).toDeclStmt());
    statements.push(_PREVIOUS_ANIMATION_LEAF_PLAYERS.set(_PREVIOUS_PLAYER_RESULT.key(o.literal(1))).toDeclStmt());

    ast.stateTransitions.forEach(transAst => statements.push(transAst.visit(this, context)));

    statements.push(new o.IfStmt(
      _ANIMATION_PLAYER_VAR.equals(o.NULL_EXPR),
      [_ANIMATION_PLAYER_VAR
        .set(o.importExpr(createIdentifier(Identifiers.NoOpAnimationPlayer)).instantiate([]))
        .toStmt()]));

    // once complete we want to apply the styles on the element
    // since the destination state's values should persist once
    // the animation sequence has completed.
    statements.push(
        _ANIMATION_PLAYER_VAR.callMethod('onDone', [o.fn([], [
          _ANIMATION_PLAYER_VAR.callMethod('destroy', []).toStmt(),
          RENDER_STYLES_FN
            .callFn([
              _ANIMATION_ELEMENT_VAR, _ANIMATION_RENDERER_VAR,
              o.importExpr(
                createIdentifier(Identifiers.prepareFinalAnimationStyles))
                .callFn([
                  _ANIMATION_START_STATE_STYLES_VAR,
                  _ANIMATION_END_STATE_STYLES_VAR
                ])
            ])
            .toStmt()
        ])
        ]).toStmt());

    statements.push(_PREVIOUS_ANIMATION_PLAYER.callMethod('destroy', []).toStmt());

    // before we start any animation we want to clear out the starting
    // styles from the element's style property (since they were placed
    // there at the end of the last animation
    statements.push(RENDER_STYLES_FN
      .callFn([
        _ANIMATION_ELEMENT_VAR, _ANIMATION_RENDERER_VAR,
        o.importExpr(createIdentifier(Identifiers.clearStyles))
          .callFn([_ANIMATION_START_STATE_STYLES_VAR])
      ])
      .toStmt());

    statements.push(_ANIMATION_VIEW_CONTEXT
                        .callMethod(
                            'queueAnimation',
                            [
                              _ANIMATION_FACTORY_VIEW_VAR,
                              _ANIMATION_ELEMENT_VAR, o.literal(this.animationName),
                              _ANIMATION_PLAYER_VAR
                            ])
                        .toStmt());

    statements.push(new o.ReturnStatement(
      o.importExpr(createIdentifier(Identifiers.AnimationTransition)).instantiate([
        _ANIMATION_PLAYER_VAR, o.literal(this.animationName), _ANIMATION_CURRENT_STATE_VAR, _ANIMATION_NEXT_STATE_VAR,
        _ANIMATION_TIME_VAR
      ])));

    return o.fn(
        [
          new o.FnParam(
              _ANIMATION_FACTORY_VIEW_VAR.name,
              o.importType(createIdentifier(Identifiers.AppView), [o.DYNAMIC_TYPE])),
          new o.FnParam(_ANIMATION_ELEMENT_VAR.name, o.DYNAMIC_TYPE),
          new o.FnParam(_ANIMATION_QUERIES_VAR.name, o.DYNAMIC_TYPE),
          new o.FnParam(_ANIMATION_CURRENT_STATE_VAR.name, o.DYNAMIC_TYPE),
          new o.FnParam(_ANIMATION_NEXT_STATE_VAR.name, o.DYNAMIC_TYPE)
        ],
        statements, o.importType(createIdentifier(Identifiers.AnimationTransition)));
  }

  build(ast: asts.AnimationAst): AnimationEntryCompileResult {
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
  animateSteps: o.Statement[] = [];
  stateMap = new _AnimationBuilderStateMap();
  isExpectingFirstStyleStep = false;
  totalTransitionTime = 0;
  parentQueryIndex = 0;
  entryAst: asts.AnimationEntryAst = null;
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

function _getStylesArray(obj: any): {[key: string]: any}[] {
  return obj.styles.styles;
}
