/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AUTO_STYLE} from '../../../src/animations';
import {buildAnimationAst} from '../dsl/animation_ast_builder';
import {buildAnimationTimelines} from '../dsl/animation_timeline_builder';
import {ElementInstructionMap} from '../dsl/element_instruction_map';
import {
  createAnimationFailed,
  missingOrDestroyedAnimation,
  missingPlayer,
  registerFailed,
} from '../error_helpers';
import {ENTER_CLASSNAME, LEAVE_CLASSNAME} from '../util';
import {warnRegister} from '../warning_helpers';
import {
  getOrSetDefaultValue,
  listenOnPlayer,
  makeAnimationEvent,
  normalizeKeyframes,
  optimizeGroupPlayer,
} from './shared';
const EMPTY_INSTRUCTION_MAP = /* @__PURE__ */ new ElementInstructionMap();
export class TimelineAnimationEngine {
  bodyNode;
  _driver;
  _normalizer;
  _animations = new Map();
  _playersById = new Map();
  players = [];
  constructor(bodyNode, _driver, _normalizer) {
    this.bodyNode = bodyNode;
    this._driver = _driver;
    this._normalizer = _normalizer;
  }
  register(id, metadata) {
    const errors = [];
    const warnings = [];
    const ast = buildAnimationAst(this._driver, metadata, errors, warnings);
    if (errors.length) {
      throw registerFailed(errors);
    } else {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        if (warnings.length) {
          warnRegister(warnings);
        }
      }
      this._animations.set(id, ast);
    }
  }
  _buildPlayer(i, preStyles, postStyles) {
    const element = i.element;
    const keyframes = normalizeKeyframes(this._normalizer, i.keyframes, preStyles, postStyles);
    return this._driver.animate(element, keyframes, i.duration, i.delay, i.easing, [], true);
  }
  create(id, element, options = {}) {
    const errors = [];
    const ast = this._animations.get(id);
    let instructions;
    const autoStylesMap = new Map();
    if (ast) {
      instructions = buildAnimationTimelines(
        this._driver,
        element,
        ast,
        ENTER_CLASSNAME,
        LEAVE_CLASSNAME,
        new Map(),
        new Map(),
        options,
        EMPTY_INSTRUCTION_MAP,
        errors,
      );
      instructions.forEach((inst) => {
        const styles = getOrSetDefaultValue(autoStylesMap, inst.element, new Map());
        inst.postStyleProps.forEach((prop) => styles.set(prop, null));
      });
    } else {
      errors.push(missingOrDestroyedAnimation());
      instructions = [];
    }
    if (errors.length) {
      throw createAnimationFailed(errors);
    }
    autoStylesMap.forEach((styles, element) => {
      styles.forEach((_, prop) => {
        styles.set(prop, this._driver.computeStyle(element, prop, AUTO_STYLE));
      });
    });
    const players = instructions.map((i) => {
      const styles = autoStylesMap.get(i.element);
      return this._buildPlayer(i, new Map(), styles);
    });
    const player = optimizeGroupPlayer(players);
    this._playersById.set(id, player);
    player.onDestroy(() => this.destroy(id));
    this.players.push(player);
    return player;
  }
  destroy(id) {
    const player = this._getPlayer(id);
    player.destroy();
    this._playersById.delete(id);
    const index = this.players.indexOf(player);
    if (index >= 0) {
      this.players.splice(index, 1);
    }
  }
  _getPlayer(id) {
    const player = this._playersById.get(id);
    if (!player) {
      throw missingPlayer(id);
    }
    return player;
  }
  listen(id, element, eventName, callback) {
    // triggerName, fromState, toState are all ignored for timeline animations
    const baseEvent = makeAnimationEvent(element, '', '', '');
    listenOnPlayer(this._getPlayer(id), eventName, baseEvent, callback);
    return () => {};
  }
  command(id, element, command, args) {
    if (command == 'register') {
      this.register(id, args[0]);
      return;
    }
    if (command == 'create') {
      const options = args[0] || {};
      this.create(id, element, options);
      return;
    }
    const player = this._getPlayer(id);
    switch (command) {
      case 'play':
        player.play();
        break;
      case 'pause':
        player.pause();
        break;
      case 'reset':
        player.reset();
        break;
      case 'restart':
        player.restart();
        break;
      case 'finish':
        player.finish();
        break;
      case 'init':
        player.init();
        break;
      case 'setPosition':
        player.setPosition(parseFloat(args[0]));
        break;
      case 'destroy':
        this.destroy(id);
        break;
    }
  }
}
//# sourceMappingURL=timeline_animation_engine.js.map
