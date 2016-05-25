import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit
} from '../../testing/testing_internal';

import {
  fakeAsync,
  flushMicrotasks
} from '../../testing';

import {el} from '@angular/platform-browser/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {isPresent} from '../../src/facade/lang';
import {MockAnimationPlayer} from '../../testing/animation/mock_animation_player';
import {AnimationStyleUtil} from '../../src/animation/animation_style_util';
import {AnimationKeyframe} from '../../src/animation/animation_keyframe';
import {AnimationStyles} from '../../src/animation/animation_styles';

import {FILL_STYLE_FLAG} from '../../src/animation/animation_constants';
import {AUTO_STYLE} from '../../src/animation/metadata';

export function main() {
  describe('AnimationStyleUtil', function() {

    describe('balanceStyles', () => {
      it('should set all non-shared styles to the provided null value between the two sets of styles', () => {
        var styles = { opacity: 0, color: 'red' };
        var newStyles = { background: 'red' };
        var flag = '*';
        var result = AnimationStyleUtil.balanceStyles(styles, newStyles, flag);
        expect(result).toEqual({
          opacity:flag,
          color:flag,
          background:'red'
        })
      });

      it('should handle an empty set of styles', () => {
        var value = '*';

        expect(AnimationStyleUtil.balanceStyles({}, { opacity: 0 }, value)).toEqual({
          opacity: 0
        });

        expect(AnimationStyleUtil.balanceStyles({ opacity: 0 }, {}, value)).toEqual({
          opacity: value
        });
      });
    });

    describe('balanceKeyframes', () => {
      it('should balance both the starting and final keyframes with thep provided styles', () => {
        var collectedStyles = {
          width: 100,
          height: 200
        };

        var finalStyles = {
          background: 'red',
          border: '1px solid black'
        };

        var keyframes = [
          new AnimationKeyframe(0, new AnimationStyles([{ height: 100, opacity: 1 }])),
          new AnimationKeyframe(1, new AnimationStyles([{ background: 'blue', left: '100px', top: '100px' }]))
        ];

        var result = AnimationStyleUtil.balanceKeyframes(collectedStyles, finalStyles, keyframes);

        expect(AnimationStyleUtil.flattenStyles(result[0].styles.styles)).toEqual({
          "width": 100,
          "height": 100,
          "opacity": 1,
          "background": '*',
          "border": '*',
          "left": '*',
          "top": '*'
        });

        expect(AnimationStyleUtil.flattenStyles(result[1].styles.styles)).toEqual({
          "width": '*',
          "height": '*',
          "opacity": '*',
          "background": 'blue',
          "border": '1px solid black',
          "left": '100px',
          "top": '100px'
        });
      });

      it('should perform balancing when no collected and final styles are provided', () => {
        var keyframes = [
          new AnimationKeyframe(0, new AnimationStyles([{ height: 100, opacity: 1 }])),
          new AnimationKeyframe(1, new AnimationStyles([{ width: 100 }]))
        ];

        var result = AnimationStyleUtil.balanceKeyframes({}, {}, keyframes);

        expect(AnimationStyleUtil.flattenStyles(result[0].styles.styles)).toEqual({
          "height": 100,
          "opacity": 1,
          "width": "*"
        });

        expect(AnimationStyleUtil.flattenStyles(result[1].styles.styles)).toEqual({
          "width": 100,
          "height": "*",
          "opacity": "*"
        });
      });
    });

    describe('clearStyles', () => {
      it('should set all the style values to "null"', () => {
        var styles = {
          "opacity": 0,
          "width": 100,
          "color": "red"
        };
        var expectedResult = {
          "opacity": null,
          "width": null,
          "color": null
        };
        expect(AnimationStyleUtil.clearStyles(styles)).toEqual(expectedResult);
      });

      it('should handle an empty set of styles', () => {
        expect(AnimationStyleUtil.clearStyles({})).toEqual({});
      });
    });

    describe('collectAndResolveStyles', () => {
      it('should keep a record of the styles as they are called', () => {
        var styles1 = [{
          "opacity": 0,
          "width": 100
        }];

        var styles2 = [{
          "height": 999,
          "opacity": 1
        }];

        var collection: {[key: string]: string|number} = {};

        expect(AnimationStyleUtil.collectAndResolveStyles(collection, styles1)).toEqual(styles1);
        expect(collection).toEqual({
          "opacity": 0,
          "width": 100
        });

        expect(AnimationStyleUtil.collectAndResolveStyles(collection, styles2)).toEqual(styles2);
        expect(collection).toEqual({
          "opacity": 1,
          "width": 100,
          "height": 999
        });
      });

      it('should resolve styles if they contain a FILL_STYLE_FLAG value', () => {
        var styles1 = [{
          "opacity": 0,
          "width": FILL_STYLE_FLAG
        }];

        var styles2 = [{
          "height": 999,
          "opacity": FILL_STYLE_FLAG
        }];

        var collection = {};

        expect(AnimationStyleUtil.collectAndResolveStyles(collection, styles1)).toEqual([{
          "opacity": 0,
          "width": AUTO_STYLE
        }]);

        expect(AnimationStyleUtil.collectAndResolveStyles(collection, styles2)).toEqual([{
          "opacity": 0,
          "height": 999
        }]);
      });
    });
  });
}
