/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationMetadata, animate, sequence, style, transition, trigger} from '@angular/core';
import {beforeEach, describe, expect, inject, it} from '@angular/core/testing/testing_internal';
import {AnimationCompiler, AnimationEntryCompileResult} from '../../src/animation/animation_compiler';
import {AnimationParser} from '../../src/animation/animation_parser';
import {CompileAnimationEntryMetadata, CompileDirectiveMetadata, CompileTemplateMetadata, CompileTypeMetadata} from '../../src/compile_metadata';
import {CompileMetadataResolver} from '../../src/metadata_resolver';

export function main() {
  describe('RuntimeAnimationCompiler', () => {
    var resolver: any /** TODO #9100 */;
    beforeEach(
        inject([CompileMetadataResolver], (res: CompileMetadataResolver) => { resolver = res; }));

    const parser = new AnimationParser();
    const compiler = new AnimationCompiler();

    var compileAnimations =
        (component: CompileDirectiveMetadata): AnimationEntryCompileResult[] => {
          const parsedAnimations = parser.parseComponent(component);
          return compiler.compile(component.type.name, parsedAnimations);
        };

    var compileTriggers = (input: any[]) => {
      var entries: CompileAnimationEntryMetadata[] = input.map(entry => {
        var animationTriggerData = trigger(entry[0], entry[1]);
        return resolver.getAnimationEntryMetadata(animationTriggerData);
      });

      var component = CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({name: 'myCmp'}),
        template: new CompileTemplateMetadata({animations: entries})
      });

      return compileAnimations(component);
    };

    var compileSequence = (seq: AnimationMetadata) => {
      return compileTriggers([['myAnimation', [transition('state1 => state2', seq)]]]);
    };

    it('should throw an exception containing all the inner animation parser errors', () => {
      var animation = sequence([
        style({'color': 'red'}), animate(1000, style({'font-size': '100px'})),
        style({'color': 'blue'}), animate(1000, style(':missing_state')), style({'color': 'gold'}),
        animate(1000, style('broken_state'))
      ]);

      var capturedErrorMessage: string;
      try {
        compileSequence(animation);
      } catch (e) {
        capturedErrorMessage = e.message;
      }

      expect(capturedErrorMessage)
          .toMatch(/Unable to apply styles due to missing a state: "missing_state"/g);

      expect(capturedErrorMessage)
          .toMatch(/Animation states via styles must be prefixed with a ":"/);
    });
  });
}
