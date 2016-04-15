import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  dispatchEvent,
  expect,
  it,
  inject,
  beforeEachProviders,
  iit,
  xit,
  containsRegexp,
  stringifyElement,
  TestComponentBuilder,
  fakeAsync,
  clearPendingTimers,
  ComponentFixture,
  tick,
  flushMicrotasks,
} from 'angular2/testing_internal';

import {
  parseAnimationMetadata,
  parseAnimationEvent
} from 'angular2/src/compiler/animation/animation_parser';

import {RuntimeMetadataResolver} from 'angular2/src/compiler/runtime_metadata';
import {style, animate, group, sequence} from 'angular2/src/core/metadata/animations';

import {
  AnimationMetadata,
  AnimationWithStepsMetadata,
  AnimationStyleMetadata,
  AnimationAnimateMetadata,
  AnimationGroupMetadata,
  AnimationSequenceMetadata
} from 'angular2/src/core/metadata/animations';

import {
  AnimationAst,
  AnimationKeyframeAst,
  AnimationStylesAst,
  AnimationSequenceAst,
  AnimationGroupAst,
  AnimationStepAst
} from 'angular2/src/compiler/animation/animation_ast';

import {StringMapWrapper} from 'angular2/src/facade/collection';

export function main() {
  describe('parseAnimationEvent', () => {
  });

  describe('parseAnimationMetadata', () => {
    var combineStyles = (styles: AnimationStylesAst[]): {[key: string]: string | number} => {
      var flatStyles: {[key: string]: string | number} = {};
      styles.forEach((entry) => StringMapWrapper.forEach(entry.styles, (val, prop) => { flatStyles[prop] = val; }));
      return flatStyles;
    };

    var collectKeyframeStyles = (keyframe: AnimationKeyframeAst): {[key: string]: string | number} => {
      return combineStyles(keyframe.styles);
    };

    var collectStepStyles = (step: AnimationStepAst): Array<{[key: string]: string | number}> => {
      var keyframes = step.keyframes;
      var styles = [];
      if (step.startingStyles.length > 0) {
        styles.push(combineStyles(step.startingStyles));
      }
      keyframes.forEach(keyframe => styles.push(collectKeyframeStyles(keyframe)));
      return styles;
    };

    var resolver;
    beforeEach(inject([RuntimeMetadataResolver], (res: RuntimeMetadataResolver) => {
      resolver = res;
    }));

    var parseAnimation = (data: AnimationMetadata[]) => {
      var compiledAnimationMetadata = resolver.getAnimationMetadata(sequence(data));
      return parseAnimationMetadata(compiledAnimationMetadata);
    };

    var parseAnimationAndGetErrors = (data: AnimationMetadata[]) => parseAnimation(data).errors;

    it('should merge repeated style steps into a single style ast step entry', () => {
      var details = parseAnimation([
        style({"color": 'black'}),
        style({"background": 'red'}),
        style({"opacity": 0}),
        animate({"color": 'white', "background": 'black', "opacity": 1}, 1000)
      ]);

      var ast = <AnimationSequenceAst>details.ast;
      expect(ast.steps.length).toEqual(1);

      var step = <AnimationStepAst>ast.steps[0];
      expect(step.startingStyles[0].styles)
          .toEqual({"color": 'black', "background": 'red', "opacity": 0});

      expect(step.keyframes[0].styles[0].styles)
          .toEqual({"color": 'black', "background": 'red', "opacity": 0});

      expect(step.keyframes[1].styles[0].styles)
          .toEqual({"color": 'white', "background": 'black', "opacity": 1});
    });

    it('should animate only the styles requested within an animation step', () => {
      var details = parseAnimation([
        style({"color": 'black', "background": 'blue'}),
        animate({"background": 'orange'}, 1000)
      ]);

      var ast = <AnimationSequenceAst>details.ast;
      expect(ast.steps.length).toEqual(1);

      var animateStep = <AnimationStepAst>ast.steps[0];
      var fromKeyframe = animateStep.keyframes[0].styles[0].styles;
      var toKeyframe = animateStep.keyframes[1].styles[0].styles;
      expect(fromKeyframe).toEqual({"background": 'blue'});
      expect(toKeyframe).toEqual({"background": 'orange'});
    });

    it('should populate the starting and duration times propertly', () => {
      var details = parseAnimation([
        style({"color": 'black', "opacity": 1}),
        animate({"color": 'red'}, 1000),
        animate({"color": 'yellow'}, 4000),
        sequence([animate({"color": 'blue'}, 1000), animate({"color": 'grey'}, 1000)]),
        group([animate({"color": 'pink'}, 500), animate({"opacity": '0.5'}, 1000)]),
        animate({"color": 'black'}, 300),
      ]);

      var ast = <AnimationSequenceAst>details.ast;
      expect(ast.steps.length).toEqual(5);

      var step1 = <AnimationStepAst>ast.steps[0];
      expect(step1.playTime).toEqual(1000);
      expect(step1.startTime).toEqual(0);

      var step2 = <AnimationStepAst>ast.steps[1];
      expect(step2.playTime).toEqual(4000);
      expect(step2.startTime).toEqual(1000);

      var seq = <AnimationSequenceAst>ast.steps[2];
      expect(seq.playTime).toEqual(2000);
      expect(seq.startTime).toEqual(5000);

      var step4 = <AnimationStepAst>seq.steps[0];
      expect(step4.playTime).toEqual(1000);
      expect(step4.startTime).toEqual(5000);

      var step5 = <AnimationStepAst>seq.steps[1];
      expect(step5.playTime).toEqual(1000);
      expect(step5.startTime).toEqual(6000);

      var grp = <AnimationGroupAst>ast.steps[3];
      expect(grp.playTime).toEqual(1000);
      expect(grp.startTime).toEqual(7000);

      var step6 = <AnimationStepAst>grp.steps[0];
      expect(step6.playTime).toEqual(500);
      expect(step6.startTime).toEqual(7000);

      var step7 = <AnimationStepAst>grp.steps[1];
      expect(step7.playTime).toEqual(1000);
      expect(step7.startTime).toEqual(7000);

      var step8 = <AnimationStepAst>ast.steps[4];
      expect(step8.playTime).toEqual(300);
      expect(step8.startTime).toEqual(8000);
    });

    it('should apply the correct animate() styles when parallel animations are active and use the same properties',
       () => {
         var details = parseAnimation([
           style({"opacity": 0, "color": 'red'}),
           group([
             sequence([
               animate({"color": "black"}, 2000),
               animate({"opacity": 0.5}, 2000),
             ]),
             sequence([animate({"opacity": 0.8}, 2000), animate({"color": "blue"}, 2000)])
           ])
         ]);

         var errors = details.errors;
         expect(errors.length).toEqual(0);

         var ast = <AnimationSequenceAst>details.ast;
         var g1 = <AnimationGroupAst>ast.steps[1];

         var sq1 = <AnimationSequenceAst>g1.steps[0];
         var sq2 = <AnimationSequenceAst>g1.steps[1];

         var sq1a1 = <AnimationStepAst>sq1.steps[0];
         expect(collectStepStyles(sq1a1)).toEqual([{"color": 'red'}, {"color": 'black'}]);

         var sq1a2 = <AnimationStepAst>sq1.steps[1];
         expect(collectStepStyles(sq1a2)).toEqual([{"opacity": 0.8}, {"opacity": 0.5}]);

         var sq2a1 = <AnimationStepAst>sq2.steps[0];
         expect(collectStepStyles(sq2a1)).toEqual([{"opacity": 0}, {"opacity": 0.8}]);

         var sq2a2 = <AnimationStepAst>sq2.steps[1];
         expect(collectStepStyles(sq2a2)).toEqual([{"color": "black"}, {"color": "blue"}]);
       });

    it('should throw errors when animations animate a CSS property at the same time', () => {
      var animation1 = parseAnimation([
        style({"opacity": 0}),
        group([animate({"opacity": 1}, 1000), animate({"opacity": 0.5}, 2000)])
      ]);

      var errors1 = animation1.errors;
      expect(errors1.length).toEqual(1);
      expect(errors1[0].msg)
          .toContainError(
              'The animated CSS property "opacity" unexpectedly changes between steps "0ms" and "2000ms" at "1000ms"');

      var animation2 = parseAnimation([
        style({"color": "red"}),
        group([animate({"color": "blue"}, 5000), animate({"color": "black"}, 2500)])
      ]);

      var errors2 = animation2.errors;
      expect(errors2.length).toEqual(1);
      expect(errors2[0].msg)
          .toContainError(
              'The animated CSS property "color" unexpectedly changes between steps "0ms" and "5000ms" at "2500ms"');
    });

    it('should throw an error if style is being animated that was not set within an earlier style step',
       () => {
         var errors = parseAnimationAndGetErrors(
             [style({"color": 'black'}), animate({"color": 'white', "background": 'black'}, 1000)]);
         expect(errors[0].msg)
             .toContainError(
                 `The CSS style:value entry "background:black" cannot be animated because "background" has not been styled within a previous style step`);
       });

    it('should return an error if a non-stringmap value is being animated', () => {
      var errors = parseAnimationAndGetErrors([style({"opacity": 0}), animate(null, 1000)]);
      expect(errors[0].msg).toContainError('"null" is not a valid key/value style object');
    });

    it('should return an error if no styles were set to be animated within a sequence', () => {
      var errors = parseAnimationAndGetErrors([style({"opacity": 0}), style({"opacity": 1})]);
      expect(errors[0].msg).toContainError('One or more pending style(...) animations remain');
    });

    it('should return an error when an animation style contains an invalid timing value', () => {
      var errors = parseAnimationAndGetErrors(
          [style({"opacity": 0}), animate({"opacity": 1}, 'one second')]);
      expect(errors[0].msg).toContainError(`The provided timing value "one second" is invalid.`);
    });

    it('should collect and return any errors collected when parsing the metadata', () => {
      var errors = parseAnimationAndGetErrors([
        style({"opacity": 0}),
        animate({"opacity": 1}, 'one second'),
        style({"opacity": 0}),
        animate(null, 'one second'),
        style({"background": 'red'})
      ]);
      expect(errors.length).toBeGreaterThan(1);
    });
  });
}
