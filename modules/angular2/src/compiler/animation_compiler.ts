import {BaseException} from 'angular2/src/facade/exceptions';

import {Identifiers} from './identifiers';
import * as o from './output/output_ast';

import {ListWrapper, Map, StringMapWrapper} from 'angular2/src/facade/collection';

import {isPresent, isBlank} from 'angular2/src/facade/lang';

import {AUTO_STYLE} from 'angular2/src/core/metadata/animations';
import {ANY_STATE, EMPTY_STATE} from 'angular2/src/core/animation/animation_state_event';

import {
  AnimationParseError,
  ParsedAnimationResult,
  parseAnimationEntry
} from 'angular2/src/compiler/animation/animation_parser';
import {CompileDirectiveMetadata} from "./compile_metadata";

import {
  AnimationAst,
  AnimationEntryAst,
  AnimationStateAst,
  AnimationStateDeclarationAst,
  AnimationStateTransitionAst,
  AnimationKeyframeAst,
  AnimationStylesAst,
  AnimationSequenceAst,
  AnimationGroupAst,
  AnimationStepAst,
  AnimationAstVisitor
} from 'angular2/src/compiler/animation/animation_ast';

export class CompileAnimation {
  constructor(public name: string, public fnStatement: o.Statement, public fnVariable: o.Expression) {}
}

export class AnimationCompiler {
  compileComponent(component: CompileDirectiveMetadata): CompileAnimation[] {
    var compiledAnimations: CompileAnimation[] = [];
    var index = 0;
    component.template.animations.forEach(entry => {
      var result = parseAnimationEntry(entry);
      if (result.errors.length > 0) {
        var errorMessage = '';
        result.errors.forEach((error: AnimationParseError) => { errorMessage += "\n- " + error.msg; });
        // todo (matsko): include the component name when throwing
        throw new BaseException(
          `Unable to parse the animation sequence for "${entry.name}" due to the following errors: ` +
          errorMessage);
      }

      var factoryName = `${component.type.name}_${entry.name}_${index}`;
      index++;

      var visitor = new _AnimationBuilder(entry.name, factoryName);
      compiledAnimations.push(visitor.build(result.ast));
    });
    return compiledAnimations;
  }
}

var _ANIMATION_FACTORY_ELEMENT_VAR = o.variable('element');
var _ANIMATION_FACTORY_RENDERER_VAR = o.variable('renderer');
var _ANIMATION_CURRENT_STATE_VAR = o.variable('currentState');
var _ANIMATION_NEXT_STATE_VAR = o.variable('nextState');
var _ANIMATION_PLAYER_VAR = o.variable('player');
var _ANIMATION_START_STATE_STYLES_VAR = o.variable('startStateStyles');
var _ANIMATION_FINAL_STATE_STYLES_VAR = o.variable('finalStateStyles');

class _AnimationBuilder implements AnimationAstVisitor {
  constructor(public animationName, public factoryName: string) {}

  visitAnimationStyles(ast: AnimationStylesAst,
                               stateMap: _AnimationBuilderStateMap): o.Expression {
    var stylesEntries = ast.styles.map(entry => {
      return o.literalMap(StringMapWrapper.keys(entry).map(key => [key, o.literal(entry[key])]));
    });
    return o.importExpr(Identifiers.AnimationStyles).instantiate([o.literalArr(stylesEntries)]);
  }

  visitAnimationKeyframe(ast: AnimationKeyframeAst,
                         stateMap: _AnimationBuilderStateMap): o.Expression {
    return o.importExpr(Identifiers.AnimationKeyframe).instantiate([
      o.literal(ast.offset),
      ast.styles.visit(this, stateMap)
    ]);
  }

  visitAnimationStep(ast: AnimationStepAst, stateMap: _AnimationBuilderStateMap): o.Expression {
    var startingStyles = ast.startingStyles.visit(this, stateMap);
    var keyframes = ast.keyframes.map(keyframeEntry => keyframeEntry.visit(this, stateMap));
    return _ANIMATION_FACTORY_RENDERER_VAR.callMethod('animate', [
      _ANIMATION_FACTORY_ELEMENT_VAR,
      startingStyles,
      o.literalArr(keyframes),
      o.literal(ast.duration),
      o.literal(ast.delay),
      o.literal(ast.easing)
    ]);
  }

  visitAnimationSequence(ast: AnimationSequenceAst,
                         stateMap: _AnimationBuilderStateMap): o.Expression {
    var playerExprs = ast.steps.map(step => step.visit(this, stateMap));
    return o.importExpr(Identifiers.AnimationSequencePlayer).instantiate([
      o.literalArr(playerExprs)]);
  }

  visitAnimationGroup(ast: AnimationGroupAst, stateMap: _AnimationBuilderStateMap): o.Expression {
    var playerExprs = ast.steps.map(step => step.visit(this, stateMap));
    return o.importExpr(Identifiers.AnimationGroupPlayer).instantiate([
      o.literalArr(playerExprs)]);
  }

  visitAnimationStateDeclaration(ast: AnimationStateDeclarationAst, stateMap: _AnimationBuilderStateMap): void {
    var flatStyles: {[key: string]: string|number} = {};
    ast.styles.styles.forEach(entry => {
      StringMapWrapper.forEach(entry, (value, key) => {
        if (value != AUTO_STYLE) {
          flatStyles[key] = value;
        }
      });
    });
    stateMap.registerState(ast.stateName, flatStyles);
  }

  visitAnimationStateTransition(ast: AnimationStateTransitionAst, stateMap: _AnimationBuilderStateMap): any {
    var playerExpr = ast.animation.visit(this, stateMap);
    stateMap.registerState(ast.fromState);
    stateMap.registerState(ast.toState);
    var START_STATE_REF_VAR = o.variable(_normalizeStateVariableName(ast.fromState));
    var FINAL_STATE_REF_VAR = o.variable(_normalizeStateVariableName(ast.toState));
    return new o.IfStmt(
      _ANIMATION_PLAYER_VAR.equals(o.NULL_EXPR)
      .and(_compareToAnimationStateExpr(_ANIMATION_CURRENT_STATE_VAR, ast.fromState))
      .and(_compareToAnimationStateExpr(_ANIMATION_NEXT_STATE_VAR, ast.toState)), [
        _ANIMATION_START_STATE_STYLES_VAR.set(
          o.importExpr(Identifiers.AnimationStyleUtil)
            .callMethod('clearStyles', [_ANIMATION_START_STATE_STYLES_VAR])
        ).toStmt(),
        _ANIMATION_FACTORY_RENDERER_VAR.callMethod('setElementStyles', [
          _ANIMATION_START_STATE_STYLES_VAR]).toStmt(),
        _ANIMATION_FINAL_STATE_STYLES_VAR.set(FINAL_STATE_REF_VAR).toStmt(),
        _ANIMATION_PLAYER_VAR.set(playerExpr).toStmt()
      ]);
  }

  visitAnimationEntry(ast: AnimationEntryAst, stateMap: _AnimationBuilderStateMap): any {
    var EMPTY_MAP = o.literalMap([]);

    var statements = [];
    statements.push(_ANIMATION_PLAYER_VAR.set(o.NULL_EXPR).toDeclStmt());
    statements.push(_ANIMATION_START_STATE_STYLES_VAR.set(EMPTY_MAP).toDeclStmt());
    statements.push(_ANIMATION_FINAL_STATE_STYLES_VAR.set(EMPTY_MAP).toDeclStmt());

    var transitionStatements = [];
    ast.definitions.forEach(def => {
      var result = def.visit(this, stateMap);
      // the declaration state will be applied later
      if (!(def instanceof AnimationStateDeclarationAst)) {
        transitionStatements.push(result);
      }
    });

    var stateStatements = [];
    StringMapWrapper.forEach(stateMap.states, (value, stateName) => {
      var variableValue = EMPTY_MAP;
      if (isPresent(value)) {
        let styleMap = [];
        StringMapWrapper.forEach(value, (value, key) => {
          styleMap.push([key, o.literal(value)]);
        });
        variableValue = o.literalMap(styleMap);
      }
      value = o.variable(stateName).set(variableValue).toDeclStmt();
      stateStatements.push(value);
    });

    statements = statements.concat(stateStatements);
    statements = statements.concat(transitionStatements);

    statements.push(
      new o.IfStmt(_ANIMATION_PLAYER_VAR.equals(o.NULL_EXPR), [
        _ANIMATION_PLAYER_VAR.set(
          o.importExpr(Identifiers.NoOpAnimationPlayer).instantiate([])
        ).toStmt()
      ]));

    statements.push(
      _ANIMATION_PLAYER_VAR.callMethod('onDone', [
        o.fn([], [
          _ANIMATION_FACTORY_RENDERER_VAR.callMethod('setElementStyles', [
            _ANIMATION_FACTORY_ELEMENT_VAR,
            o.importExpr(Identifiers.AnimationStyleUtil).callMethod('balanceStyles', [
              _ANIMATION_START_STATE_STYLES_VAR,
              _ANIMATION_FINAL_STATE_STYLES_VAR
            ])
          ]).toStmt()
        ])
      ]).toStmt());

    statements.push(new o.ReturnStatement(_ANIMATION_PLAYER_VAR));

    return o.fn([
      new o.FnParam(_ANIMATION_FACTORY_RENDERER_VAR.name, o.importType(Identifiers.Renderer)),
      new o.FnParam(_ANIMATION_FACTORY_ELEMENT_VAR.name, o.DYNAMIC_TYPE),
      new o.FnParam(_ANIMATION_CURRENT_STATE_VAR.name, o.DYNAMIC_TYPE),
      new o.FnParam(_ANIMATION_NEXT_STATE_VAR.name, o.DYNAMIC_TYPE)
    ], statements);
  }

  build(ast: AnimationAst): CompileAnimation {
    var stateMap = new _AnimationBuilderStateMap();
    var fnStatement = ast.visit(this, stateMap).toDeclStmt(this.factoryName);
    var fnVariable = o.variable(this.factoryName);
    return new CompileAnimation(this.animationName, fnStatement, fnVariable);
  }
}

class _AnimationBuilderStateMap {
  private _states: {[key: string]: {[prop: string]: string|number}} = {};
  get states() { return this._states; }
  registerState(name: string, value: {[prop: string]: string|number} = null): void {
    name = _normalizeStateVariableName(name);
    var existingEntry = this._states[name];
    if (isBlank(existingEntry)) {
      this._states[name] = value;
    }
  }
}

function _normalizeStateVariableName(stateName: string): string {
  // we do this so that if a state value contains a reserved word in
  // JS/Dart then the browser won't freak out if a variable is defined
  return stateName + 'State';
}

function _compareToAnimationStateExpr(value: o.Expression, animationState: string): o.Expression {
  if (animationState == EMPTY_STATE) {
    return value.equals(o.importExpr(Identifiers.uninitialized));
  } else if (animationState == ANY_STATE) {
    return o.not(value.equals(o.importExpr(Identifiers.uninitialized)));
  } else {
    return value.equals(o.literal(animationState));
  }
}
