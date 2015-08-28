import {el, describe, it, expect, inject, SpyObject} from 'angular2/test_lib';
import {AnimationBuilder} from 'angular2/src/animate/animation_builder';

export function main() {
  describe("AnimationBuilder", () => {

    it('should have data object', inject([AnimationBuilder], animate => {
         var animateCss = animate.css();
         expect(animateCss.data).toBeDefined();
       }));

    it('should allow you to add classes', inject([AnimationBuilder], animate => {
         var animateCss = animate.css();
         animateCss.addClass('some-class');
         expect(animateCss.data.classesToAdd).toEqual(['some-class']);
         animateCss.addClass('another-class');
         expect(animateCss.data.classesToAdd).toEqual(['some-class', 'another-class']);
       }));

    it('should allow you to add temporary classes', inject([AnimationBuilder], animate => {
         var animateCss = animate.css();
         animateCss.addAnimationClass('some-class');
         expect(animateCss.data.animationClasses).toEqual(['some-class']);
         animateCss.addAnimationClass('another-class');
         expect(animateCss.data.animationClasses).toEqual(['some-class', 'another-class']);
       }));

    it('should allow you to remove classes', inject([AnimationBuilder], animate => {
         var animateCss = animate.css();
         animateCss.removeClass('some-class');
         expect(animateCss.data.classesToRemove).toEqual(['some-class']);
         animateCss.removeClass('another-class');
         expect(animateCss.data.classesToRemove).toEqual(['some-class', 'another-class']);
       }));

    it('should support chaining', inject([AnimationBuilder], animate => {
         var animateCss = animate.css()
                              .addClass('added-class')
                              .removeClass('removed-class')
                              .addAnimationClass('temp-class')
                              .addClass('another-added-class');
         expect(animateCss.data.classesToAdd).toEqual(['added-class', 'another-added-class']);
         expect(animateCss.data.classesToRemove).toEqual(['removed-class']);
         expect(animateCss.data.animationClasses).toEqual(['temp-class']);
       }));

    it('should support duration and delay', inject([AnimationBuilder], (animate) => {
         var animateCss = animate.css();
         animateCss.setDelay(100).setDuration(200);
         expect(animateCss.data.duration).toBe(200);
         expect(animateCss.data.delay).toBe(100);

         var element = el('<div></div>');
         var runner = animateCss.start(element);
         runner.flush();

         expect(runner.computedDelay).toBe(100);
         expect(runner.computedDuration).toBe(200);
       }));

    it('should support from styles', inject([AnimationBuilder], animate => {
         var animateCss = animate.css();
         animateCss.setFromStyles({'backgroundColor': 'blue'});
         expect(animateCss.data.fromStyles).toBeDefined();

         var element = el('<div></div>');
         animateCss.start(element);

         expect(element.style.getPropertyValue('background-color')).toEqual('blue');
       }));

    it('should support duration and delay defined in CSS', inject([AnimationBuilder], (animate) => {
         var animateCss = animate.css();
         var element = el('<div style="transition: 0.5s ease 250ms;"></div>');
         var runner = animateCss.start(element);
         runner.flush();

         expect(runner.computedDuration).toEqual(500);
         expect(runner.computedDelay).toEqual(250);
       }));

    it('should add classes', inject([AnimationBuilder], (animate) => {
         var animateCss = animate.css().addClass('one').addClass('two');
         var element = el('<div></div>');
         var runner = animateCss.start(element);

         expect(element).not.toHaveCssClass('one');
         expect(element).not.toHaveCssClass('two');

         runner.flush();

         expect(element).toHaveCssClass('one');
         expect(element).toHaveCssClass('two');
       }));

    it('should call `onComplete` method after animations have finished',
       inject([AnimationBuilder], (animate) => {
         var spyObject = new SpyObject();
         var callback = spyObject.spy('animationFinished');
         var runner = animate.css()
                          .addClass('one')
                          .addClass('two')
                          .setDuration(100)
                          .start(el('<div></div>'))
                          .onComplete(callback);

         expect(callback).not.toHaveBeenCalled();

         runner.flush();

         expect(callback).not.toHaveBeenCalled();

         runner.handleAnimationCompleted();

         expect(callback).toHaveBeenCalled();
       }));

  });
}
