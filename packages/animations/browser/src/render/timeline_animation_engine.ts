/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationMetadata, AnimationMetadataType, AnimationOptions, AnimationPlayer, AUTO_STYLE, ɵStyleDataMap} from '@angular/animations';

import {Ast} from '../dsl/animation_ast';
import {buildAnimationAst} from '../dsl/animation_ast_builder';
import {buildAnimationTimelines} from '../dsl/animation_timeline_builder';
import {AnimationTimelineInstruction} from '../dsl/animation_timeline_instruction';
import {ElementInstructionMap} from '../dsl/element_instruction_map';
import {AnimationStyleNormalizer} from '../dsl/style_normalization/animation_style_normalizer';
import {createAnimationFailed, missingOrDestroyedAnimation, missingPlayer, registerFailed} from '../error_helpers';
import {ENTER_CLASSNAME, LEAVE_CLASSNAME} from '../util';
import {warnRegister} from '../warning_helpers';

import {AnimationDriver} from './animation_driver';
import {getOrSetDefaultValue, listenOnPlayer, makeAnimationEvent, normalizeKeyframes, optimizeGroupPlayer} from './shared';

const EMPTY_INSTRUCTION_MAP = new ElementInstructionMap();

export class TimelineAnimationEngine {
  private _animations = new Map<string, Ast<AnimationMetadataType>>();
  private _playersById = new Map<string, AnimationPlayer>();
  public players: AnimationPlayer[] = [];

  constructor(
      public bodyNode: any, private _driver: AnimationDriver,
      private _normalizer: AnimationStyleNormalizer) {}

  register(id: string, metadata: AnimationMetadata|AnimationMetadata[]) {
    const errors: Error[] = [];
    const warnings: string[] = [];
    const ast = buildAnimationAst(this._driver, metadata, errors, warnings);
    if (errors.length) {
      throw registerFailed(errors);
    } else {
      if (warnings.length) {
        warnRegister(warnings);
      }
      this._animations.set(id, ast);
    }
  }

  private _buildPlayer(
      i: AnimationTimelineInstruction, preStyles: ɵStyleDataMap,
      postStyles?: ɵStyleDataMap): AnimationPlayer {
    const element = i.element;
    const keyframes = normalizeKeyframes(
        this._driver, this._normalizer, element, i.keyframes, preStyles, postStyles);
    return this._driver.animate(element, keyframes, i.duration, i.delay, i.easing, [], true);
  }

  create(id: string, element: any, options: AnimationOptions = {}): AnimationPlayer {
    const errors: Error[] = [];
    const ast = this._animations.get(id);
    let instructions: AnimationTimelineInstruction[];

    const autoStylesMap = new Map<any, ɵStyleDataMap>();

    if (ast) {
      instructions = buildAnimationTimelines(
          this._driver, element, ast, ENTER_CLASSNAME, LEAVE_CLASSNAME, new Map(), new Map(),
          options, EMPTY_INSTRUCTION_MAP, errors);
      instructions.forEach(inst => {
        const styles = getOrSetDefaultValue(
            autoStylesMap, inst.element, new Map<string, string|number|null>());
        inst.postStyleProps.forEach(prop => styles.set(prop, null));
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

    const players = instructions.map(i => {
      const styles = autoStylesMap.get(i.element);
      return this._buildPlayer(i, new Map(), styles);
    });
    const player = optimizeGroupPlayer(players);
    this._playersById.set(id, player);
    player.onDestroy(() => this.destroy(id));

    this.players.push(player);
    return player;
  }

  destroy(id: string) {
    const player = this._getPlayer(id);
    player.destroy();
    this._playersById.delete(id);
    const index = this.players.indexOf(player);
    if (index >= 0) {
      this.players.splice(index, 1);
    }
  }

  private _getPlayer(id: string): AnimationPlayer {
    const player = this._playersById.get(id);
    if (!player) {
      throw missingPlayer(id);
    }
    return player;
  }

  listen(id: string, element: string, eventName: string, callback: (event: any) => any):
      () => void {
    // triggerName, fromState, toState are all ignored for timeline animations
    const baseEvent = makeAnimationEvent(element, '', '', '');
    listenOnPlayer(this._getPlayer(id), eventName, baseEvent, callback);
    return () => {};
  }

  command(id: string, element: any, command: string, args: any[]): void {
    if (command == 'register') {
      this.register(id, args[0] as AnimationMetadata | AnimationMetadata[]);
      return;
    }

    if (command == 'create') {
      const options = (args[0] || {}) as AnimationOptions;
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
        player.setPosition(parseFloat(args[0] as string));
        break;
      case 'destroy':
        this.destroy(id);
        break;
    }
  }
}
