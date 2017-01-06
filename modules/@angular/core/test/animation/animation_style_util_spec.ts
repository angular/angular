/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FILL_STYLE_FLAG} from '../../src/animation/animation_constants';
import {AnimationKeyframe} from '../../src/animation/animation_keyframe';
import * as animationUtils from '../../src/animation/animation_style_util';
import {AnimationStyles} from '../../src/animation/animation_styles';
import {AUTO_STYLE} from '../../src/animation/metadata';
import {describe, expect, it} from '../../testing/testing_internal';

export function main() {
  describe('Animation Style Utils', function() {

    describe('prepareFinalAnimationStyles', () => {
      it('should set all non-shared styles to the provided null value between the two sets of styles',
         () => {
           const styles = {opacity: 0, color: 'red'};
           const newStyles = {background: 'red'};
           const flag = '*';
           const result = animationUtils.prepareFinalAnimationStyles(styles, newStyles, flag);
           expect(result).toEqual({opacity: flag, color: flag, background: 'red'});
         });

      it('should handle an empty set of styles', () => {
        const value = '*';

        expect(animationUtils.prepareFinalAnimationStyles({}, {opacity: '0'}, value)).toEqual({
          opacity: '0'
        });

        expect(animationUtils.prepareFinalAnimationStyles({opacity: '0'}, {}, value)).toEqual({
          opacity: value
        });
      });

      it('should set all AUTO styles to the null value', () => {
        const styles = {opacity: 0};
        const newStyles = {color: '*', border: '*'};
        const flag = '*';
        const result = animationUtils.prepareFinalAnimationStyles(styles, newStyles, null);
        expect(result).toEqual({opacity: null, color: null, border: null});
      });

    });

    describe('balanceAnimationKeyframes', () => {
      it('should balance both the starting and final keyframes with thep provided styles', () => {
        const collectedStyles = {width: 100, height: 200};

        const finalStyles = {background: 'red', border: '1px solid black'};

        const keyframes = [
          new AnimationKeyframe(0, new AnimationStyles([{height: 100, opacity: 1}])),
          new AnimationKeyframe(
              1, new AnimationStyles([{background: 'blue', left: '100px', top: '100px'}]))
        ];

        const result =
            animationUtils.balanceAnimationKeyframes(collectedStyles, finalStyles, keyframes);

        expect(animationUtils.flattenStyles(result[0].styles.styles)).toEqual({
          'width': 100,
          'height': 100,
          'opacity': 1,
          'background': '*',
          'border': '*',
          'left': '*',
          'top': '*'
        });

        expect(animationUtils.flattenStyles(result[1].styles.styles)).toEqual({
          'width': '*',
          'height': '*',
          'opacity': '*',
          'background': 'blue',
          'border': '1px solid black',
          'left': '100px',
          'top': '100px'
        });
      });

      it('should perform balancing when no collected and final styles are provided', () => {
        const keyframes = [
          new AnimationKeyframe(0, new AnimationStyles([{height: 100, opacity: 1}])),
          new AnimationKeyframe(1, new AnimationStyles([{width: 100}]))
        ];

        const result = animationUtils.balanceAnimationKeyframes({}, {}, keyframes);

        expect(animationUtils.flattenStyles(result[0].styles.styles))
            .toEqual({'height': 100, 'opacity': 1, 'width': '*'});

        expect(animationUtils.flattenStyles(result[1].styles.styles))
            .toEqual({'width': 100, 'height': '*', 'opacity': '*'});
      });
    });

    describe('clearStyles', () => {
      it('should set all the style values to "null"', () => {
        const styles: {[key: string]:
                           string | number} = {'opacity': 0, 'width': 100, 'color': 'red'};
        const expectedResult: {[key: string]: string |
                                   number} = {'opacity': null, 'width': null, 'color': null};
        expect(animationUtils.clearStyles(styles)).toEqual(expectedResult);
      });

      it('should handle an empty set of styles',
         () => { expect(animationUtils.clearStyles({})).toEqual({}); });
    });

    describe('collectAndResolveStyles', () => {
      it('should keep a record of the styles as they are called', () => {
        const styles1 = [{'opacity': 0, 'width': 100}];

        const styles2 = [{'height': 999, 'opacity': 1}];

        const collection: {[key: string]: string | number} = {};

        expect(animationUtils.collectAndResolveStyles(collection, styles1)).toEqual(styles1);
        expect(collection).toEqual({'opacity': 0, 'width': 100});

        expect(animationUtils.collectAndResolveStyles(collection, styles2)).toEqual(styles2);
        expect(collection).toEqual({'opacity': 1, 'width': 100, 'height': 999});
      });

      it('should resolve styles if they contain a FILL_STYLE_FLAG value', () => {
        const styles1 = [{'opacity': 0, 'width': FILL_STYLE_FLAG}];

        const styles2 = [{'height': 999, 'opacity': FILL_STYLE_FLAG}];

        const collection = {};

        expect(animationUtils.collectAndResolveStyles(collection, styles1)).toEqual([
          {'opacity': 0, 'width': AUTO_STYLE}
        ]);

        expect(animationUtils.collectAndResolveStyles(collection, styles2)).toEqual([
          {'opacity': 0, 'height': 999}
        ]);
      });
    });
  });
}
