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

import {parseAnimationEntry} from 'angular2/src/compiler/animation/animation_parser';

import {CompileMetadataResolver} from 'angular2/src/compiler/metadata_resolver';
import {style, animate, group, sequence} from 'angular2/src/core/metadata/animations';

import {
  animation,
  transition,
  state,
  AnimationMetadata,
  AnimationWithStepsMetadata,
  AnimationStyleMetadata,
  AnimationAnimateMetadata,
  AnimationGroupMetadata,
  AnimationSequenceMetadata
} from 'angular2/src/core/metadata/animations';

import {
  AnimationAst,
  AnimationStateTransitionAst,
  AnimationEntryAst,
  AnimationKeyframeAst,
  AnimationStylesAst,
  AnimationSequenceAst,
  AnimationGroupAst,
  AnimationStepAst
} from 'angular2/src/compiler/animation/animation_ast';

import {StringMapWrapper} from 'angular2/src/facade/collection';

export function main() {
  describe('parseAnimationEntry', () => {
    var combineStyles = (styles: AnimationStylesAst): {[key: string]: string | number} => {
      var flatStyles: {[key: string]: string | number} = {};
      styles.styles.forEach(entry => StringMapWrapper.forEach(entry, (val, prop) => { flatStyles[prop] = val; }));
      return flatStyles;
    };

    var collectKeyframeStyles = (keyframe: AnimationKeyframeAst): {[key: string]: string | number} => {
      return combineStyles(keyframe.styles);
    };

    var collectStepStyles = (step: AnimationStepAst): Array<{[key: string]: string | number}> => {
      var keyframes = step.keyframes;
      var styles = [];
      if (step.startingStyles.styles.length > 0) {
        styles.push(combineStyles(step.startingStyles));
      }
      keyframes.forEach(keyframe => styles.push(collectKeyframeStyles(keyframe)));
      return styles;
    };

    var resolver;
    beforeEach(inject([CompileMetadataResolver], (res: CompileMetadataResolver) => {
      resolver = res;
    }));

    var parseAnimation = (data: AnimationMetadata[]) => {
      var entry = animation('myAnimation', [
        transition('state1 => state2', sequence(data))
      ]);
      var compiledAnimationEntry = resolver.getAnimationEntryMetadata(entry);
      return parseAnimationEntry(compiledAnimationEntry);
    };

    var getAnimationAstFromEntryAst = (ast: AnimationEntryAst) => {
      var transitionAst = <AnimationStateTransitionAst>ast.definitions[0];
      var animationAst = <AnimationSequenceAst>transitionAst.animation;
      return animationAst;
    }

    var parseAnimationAst = (data: AnimationMetadata[]) => {
      return getAnimationAstFromEntryAst(parseAnimation(data).ast);
    };

    var parseAnimationAndGetErrors = (data: AnimationMetadata[]) => parseAnimation(data).errors;

    it('should merge repeated style steps into a single style ast step entry', () => {
      var ast = parseAnimationAst([
        style({"color": 'black'}),
        style({"background": 'red'}),
        style({"opacity": 0}),
        animate(1000, style({"color": 'white', "background": 'black', "opacity": 1}))
      ]);

      expect(ast.steps.length).toEqual(1);

      var step = <AnimationStepAst>ast.steps[0];
      expect(step.startingStyles.styles[0])
          .toEqual({"color": 'black', "background": 'red', "opacity": 0});

      expect(step.keyframes[0].styles.styles[0])
          .toEqual({"color": 'black', "background": 'red', "opacity": 0});

      expect(step.keyframes[1].styles.styles[0])
          .toEqual({"color": 'white', "background": 'black', "opacity": 1});
    });

    it('should animate only the styles requested within an animation step', () => {
      var ast = parseAnimationAst([
        style({"color": 'black', "background": 'blue'}),
        animate(1000, style({"background": 'orange'}))
      ]);

      expect(ast.steps.length).toEqual(1);

      var animateStep = <AnimationStepAst>ast.steps[0];
      var fromKeyframe = animateStep.keyframes[0].styles.styles[0];
      var toKeyframe = animateStep.keyframes[1].styles.styles[0];
      expect(fromKeyframe).toEqual({"background": 'blue'});
      expect(toKeyframe).toEqual({"background": 'orange'});
    });

    it('should populate the starting and duration times propertly', () => {
      var ast = parseAnimationAst([
        style({"color": 'black', "opacity": 1}),
        animate(1000, style({"color": 'red'})),
        animate(4000, style({"color": 'yellow'})),
        sequence([animate(1000, style({"color": 'blue'})), animate(1000, style({"color": 'grey'}))]),
        group([animate(500, style({"color": 'pink'})), animate(1000, style({"opacity": '0.5'}))]),
        animate(300, style({"color": 'black'})),
      ]);

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
               animate(2000, style({"color": "black"})),
               animate(2000, style({"opacity": 0.5})),
             ]),
             sequence([animate(2000, style({"opacity": 0.8})), animate(2000, style({"color": "blue"}))])
           ])
         ]);

         var errors = details.errors;
         expect(errors.length).toEqual(0);

         var ast = getAnimationAstFromEntryAst(details.ast);
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
        group([animate(1000, style({"opacity": 1})), animate(2000, style({"opacity": 0.5}))])
      ]);

      var errors1 = animation1.errors;
      expect(errors1.length).toEqual(1);
      expect(errors1[0].msg)
          .toContainError(
              'The animated CSS property "opacity" unexpectedly changes between steps "0ms" and "2000ms" at "1000ms"');

      var animation2 = parseAnimation([
        style({"color": "red"}),
        group([
          animate(5000, style({"color": "blue"})),
          animate(2500, style({"color": "black"}))
        ])
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
             [style({"color": 'black'}), animate(1000, style({"color": 'white', "background": 'black'}))]);
         expect(errors[0].msg)
             .toContainError(
                 `The CSS style:value entry "background:black" cannot be animated because "background" has not been styled within a previous style step`);
       });

    it('should return an error if no styles were set to be animated within a sequence', () => {
      var errors = parseAnimationAndGetErrors([style({"opacity": 0}), style({"opacity": 1})]);
      expect(errors[0].msg).toContainError('There are no animate steps set for the animation sequence');
    });

    it('should return an error when an animation style contains an invalid timing value', () => {
      var errors = parseAnimationAndGetErrors(
          [style({"opacity": 0}), animate('one second', style({"opacity": 1}))]);
      expect(errors[0].msg).toContainError(`The provided timing value "one second" is invalid.`);
    });

    it('should collect and return any errors collected when parsing the metadata', () => {
      var errors = parseAnimationAndGetErrors([
        style({"opacity": 0}),
        animate('one second', style({"opacity": 1})),
        style({"opacity": 0}),
        animate('one second', null),
        style({"background": 'red'})
      ]);
      expect(errors.length).toBeGreaterThan(1);
    });

    it('should create a new entry at the start of the animation which contains the origin state\'s styles', () => {
      var metadata = animation('myAnimation', [
        state('start', style({ 'height': 0 })),
        state('end', style({ 'height': 100 })),
        transition('start => end', sequence([
          animate(1000)
        ]))
      ]);

      var compiledAnimationEntry = resolver.getAnimationEntryMetadata(metadata);
      var ast = <AnimationEntryAst>parseAnimationEntry(compiledAnimationEntry).ast;

      var transAst = <AnimationStateTransitionAst>ast.definitions[2];
      var sequenceAst = <AnimationSequenceAst>transAst.animation;

      var firstStep = <AnimationStepAst>sequenceAst.steps[0];
      expect(firstStep.startingStyles.styles[0]).toEqual({ 'height': 0 });
    });

    it('should merge the starting state\'s styles into the existing starting styles for an animation', () => {
      var metadata = animation('myAnimation', [
        state('start', style({ 'height': 50 })),
        state('end', style({ 'height': 555 })),
        transition('start => end', sequence([
          style({ 'opacity': 0 }),
          animate(1000, [
            style({ 'opacity': 1 })
          ])
        ]))
      ]);

      var compiledAnimationEntry = resolver.getAnimationEntryMetadata(metadata);
      var ast = <AnimationEntryAst>parseAnimationEntry(compiledAnimationEntry).ast;

      var transAst = <AnimationStateTransitionAst>ast.definitions[2];
      var sequenceAst = <AnimationSequenceAst>transAst.animation;

      var firstStep = <AnimationStepAst>sequenceAst.steps[0];
      expect(firstStep.startingStyles.styles[0]).toEqual({ 'height': 50, 'opacity': 0 });
    });

    it('should create a new entry at the end of the animation which contains the destination state\'s styles', () => {
      var metadata = animation('myAnimation', [
        state('start', style({ 'height': 0 })),
        state('end', style({ 'height': 100 })),
        transition('start => end', sequence([
          style({ 'opacity': 0 }),
          animate(1000, style({ 'opacity': 1 }))
        ]))
      ]);

      var compiledAnimationEntry = resolver.getAnimationEntryMetadata(metadata);
      var ast = <AnimationEntryAst>parseAnimationEntry(compiledAnimationEntry).ast;

      var transAst = <AnimationStateTransitionAst>ast.definitions[2];
      var seqAst = <AnimationSequenceAst>transAst.animation;

      expect(seqAst.steps.length).toEqual(2);
      var finalStep = <AnimationStepAst>seqAst.steps[seqAst.steps.length - 1];

      expect(finalStep.startingStyles.styles[0]).toEqual({ 'height': 100 });
    });

    it('should reuse an existing blank animate step and place the ending state\'s styles there is necessary', () => {
      var metadata = animation('myAnimation', [
        state('start', style({ 'height': 100 })),
        state('end', style({ 'height': 999 })),
        transition('start => end', sequence([
          animate(2000)
        ]))
      ]);

      var compiledAnimationEntry = resolver.getAnimationEntryMetadata(metadata);
      var ast = <AnimationEntryAst>parseAnimationEntry(compiledAnimationEntry).ast;

      var transAst = <AnimationStateTransitionAst>ast.definitions[2];
      var seqAst = <AnimationSequenceAst>transAst.animation;

      expect(seqAst.steps.length).toEqual(1);
      var finalStep = <AnimationStepAst>seqAst.steps[seqAst.steps.length - 1];

      expect(finalStep.playTime).toEqual(2000)
      expect(finalStep.keyframes[0].styles.styles[0]).toEqual({ 'height': 100 });
      expect(finalStep.keyframes[1].styles.styles[0]).toEqual({ 'height': 999 });
    });
  });
}
