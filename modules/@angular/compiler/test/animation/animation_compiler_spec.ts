/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationMetadata, animate, group, sequence, style, transition, trigger} from '@angular/core';
import {AsyncTestCompleter, beforeEach, beforeEachProviders, ddescribe, describe, expect, iit, inject, it, xdescribe, xit} from '@angular/core/testing/testing_internal';

import {AnimationCompiler, CompiledAnimation} from '../../src/animation/animation_compiler';
import {CompileDirectiveMetadata, CompileTemplateMetadata, CompileTypeMetadata} from '../../src/compile_metadata';
import {CompileMetadataResolver} from '../../src/metadata_resolver';

export function main() {
  describe('RuntimeAnimationCompiler', () => {
    var resolver: any /** TODO #9100 */;
    beforeEach(
        inject([CompileMetadataResolver], (res: CompileMetadataResolver) => { resolver = res; }));

    var compiler = new AnimationCompiler();

    var compileAnimations = (component: CompileDirectiveMetadata): CompiledAnimation => {
      return compiler.compileComponent(component)[0];
    };

    var compile = (seq: AnimationMetadata) => {
      var entry = trigger('myAnimation', [transition('state1 => state2', seq)]);

      var compiledAnimationEntry = resolver.getAnimationEntryMetadata(entry);
      var component = CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({name: 'something'}),
        template: new CompileTemplateMetadata({animations: [compiledAnimationEntry]})
      });

      return compileAnimations(component);
    };

    it('should throw an exception containing all the inner animation parser errors', () => {
      var animation = sequence([
        style({'color': 'red'}), animate(1000, style({'font-size': '100px'})),
        style({'color': 'blue'}), animate(1000, style(':missing_state')), style({'color': 'gold'}),
        animate(1000, style('broken_state'))
      ]);

      var capturedErrorMessage: string;
      try {
        compile(animation);
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
