/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationMetadata, AnimationMetadataType} from '@angular/animations';

import {buildAnimationAst} from '../../src/dsl/animation_ast_builder';
import {MockAnimationDriver} from '../../testing';

{
  describe('buildAnimationAst', () => {
    it('should build the AST without any errors and warnings', () => {
      const driver = new MockAnimationDriver();
      const errors: Error[] = [];
      const warnings: string[] = [];
      const animationAst = buildAnimationAst(
          driver, <AnimationMetadata>{
            animation: [{
              styles: {
                offset: null,
                styles: {backgroundColor: '#000'},
                type: AnimationMetadataType.Style
              },
              timings: {delay: 0, duration: 1000, easing: 'ease-in-out'},
              type: AnimationMetadataType.Animate
            }],
            options: null,
            selector: 'body',
            type: AnimationMetadataType.Query
          },
          errors, warnings);

      expect(errors).toEqual([]);
      expect(warnings).toEqual([]);
      expect(animationAst).toEqual(<ReturnType<typeof buildAnimationAst>>{
        type: 11,
        selector: 'body',
        limit: 0,
        optional: false,
        includeSelf: false,
        animation: {
          type: 4,
          timings: {delay: 0, duration: 1000, easing: 'ease-in-out'},
          style: {
            type: 6,
            styles: [new Map([['backgroundColor', '#000']])],
            easing: null,
            offset: null,
            containsDynamicStyles: false,
            options: null,
            isEmptyStep: false
          },
          options: null
        },
        originalSelector: 'body',
        options: {}
      });
    });
  });
}
