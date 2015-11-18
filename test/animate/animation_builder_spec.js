var testing_internal_1 = require('angular2/testing_internal');
var animation_builder_1 = require('angular2/src/animate/animation_builder');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
function main() {
    testing_internal_1.describe("AnimationBuilder", function () {
        testing_internal_1.it('should have data object', testing_internal_1.inject([animation_builder_1.AnimationBuilder], function (animate) {
            var animateCss = animate.css();
            testing_internal_1.expect(animateCss.data).toBeDefined();
        }));
        testing_internal_1.it('should allow you to add classes', testing_internal_1.inject([animation_builder_1.AnimationBuilder], function (animate) {
            var animateCss = animate.css();
            animateCss.addClass('some-class');
            testing_internal_1.expect(animateCss.data.classesToAdd).toEqual(['some-class']);
            animateCss.addClass('another-class');
            testing_internal_1.expect(animateCss.data.classesToAdd).toEqual(['some-class', 'another-class']);
        }));
        testing_internal_1.it('should allow you to add temporary classes', testing_internal_1.inject([animation_builder_1.AnimationBuilder], function (animate) {
            var animateCss = animate.css();
            animateCss.addAnimationClass('some-class');
            testing_internal_1.expect(animateCss.data.animationClasses).toEqual(['some-class']);
            animateCss.addAnimationClass('another-class');
            testing_internal_1.expect(animateCss.data.animationClasses).toEqual(['some-class', 'another-class']);
        }));
        testing_internal_1.it('should allow you to remove classes', testing_internal_1.inject([animation_builder_1.AnimationBuilder], function (animate) {
            var animateCss = animate.css();
            animateCss.removeClass('some-class');
            testing_internal_1.expect(animateCss.data.classesToRemove).toEqual(['some-class']);
            animateCss.removeClass('another-class');
            testing_internal_1.expect(animateCss.data.classesToRemove).toEqual(['some-class', 'another-class']);
        }));
        testing_internal_1.it('should support chaining', testing_internal_1.inject([animation_builder_1.AnimationBuilder], function (animate) {
            var animateCss = animate.css()
                .addClass('added-class')
                .removeClass('removed-class')
                .addAnimationClass('temp-class')
                .addClass('another-added-class');
            testing_internal_1.expect(animateCss.data.classesToAdd).toEqual(['added-class', 'another-added-class']);
            testing_internal_1.expect(animateCss.data.classesToRemove).toEqual(['removed-class']);
            testing_internal_1.expect(animateCss.data.animationClasses).toEqual(['temp-class']);
        }));
        testing_internal_1.it('should support duration and delay', testing_internal_1.inject([animation_builder_1.AnimationBuilder], function (animate) {
            var animateCss = animate.css();
            animateCss.setDelay(100).setDuration(200);
            testing_internal_1.expect(animateCss.data.duration).toBe(200);
            testing_internal_1.expect(animateCss.data.delay).toBe(100);
            var element = testing_internal_1.el('<div></div>');
            var runner = animateCss.start(element);
            runner.flush();
            if (dom_adapter_1.DOM.supportsAnimation()) {
                testing_internal_1.expect(runner.computedDelay).toBe(100);
                testing_internal_1.expect(runner.computedDuration).toBe(200);
            }
            else {
                testing_internal_1.expect(runner.computedDelay).toBe(0);
                testing_internal_1.expect(runner.computedDuration).toBe(0);
            }
        }));
        testing_internal_1.it('should support from styles', testing_internal_1.inject([animation_builder_1.AnimationBuilder], function (animate) {
            var animateCss = animate.css();
            animateCss.setFromStyles({ 'backgroundColor': 'blue' });
            testing_internal_1.expect(animateCss.data.fromStyles).toBeDefined();
            var element = testing_internal_1.el('<div></div>');
            animateCss.start(element);
            testing_internal_1.expect(element.style.getPropertyValue('background-color')).toEqual('blue');
        }));
        testing_internal_1.it('should support duration and delay defined in CSS', testing_internal_1.inject([animation_builder_1.AnimationBuilder], function (animate) {
            var animateCss = animate.css();
            var element = testing_internal_1.el("<div style=\"" + dom_adapter_1.DOM.getAnimationPrefix() + "transition: 0.5s ease 250ms;\"></div>");
            var runner = animateCss.start(element);
            runner.flush();
            if (dom_adapter_1.DOM.supportsAnimation()) {
                testing_internal_1.expect(runner.computedDelay).toBe(250);
                testing_internal_1.expect(runner.computedDuration).toBe(500);
            }
            else {
                testing_internal_1.expect(runner.computedDelay).toEqual(0);
                testing_internal_1.expect(runner.computedDuration).toEqual(0);
            }
        }));
        testing_internal_1.it('should add classes', testing_internal_1.inject([animation_builder_1.AnimationBuilder], function (animate) {
            var animateCss = animate.css().addClass('one').addClass('two');
            var element = testing_internal_1.el('<div></div>');
            var runner = animateCss.start(element);
            testing_internal_1.expect(element).not.toHaveCssClass('one');
            testing_internal_1.expect(element).not.toHaveCssClass('two');
            runner.flush();
            testing_internal_1.expect(element).toHaveCssClass('one');
            testing_internal_1.expect(element).toHaveCssClass('two');
        }));
        testing_internal_1.it('should call `onComplete` method after animations have finished', testing_internal_1.inject([animation_builder_1.AnimationBuilder], function (animate) {
            var spyObject = new testing_internal_1.SpyObject();
            var callback = spyObject.spy('animationFinished');
            var runner = animate.css()
                .addClass('one')
                .addClass('two')
                .setDuration(100)
                .start(testing_internal_1.el('<div></div>'))
                .onComplete(callback);
            testing_internal_1.expect(callback).not.toHaveBeenCalled();
            runner.flush();
            if (dom_adapter_1.DOM.supportsAnimation()) {
                testing_internal_1.expect(callback).not.toHaveBeenCalled();
                runner.handleAnimationCompleted();
                testing_internal_1.expect(callback).toHaveBeenCalled();
            }
            else {
                testing_internal_1.expect(callback).toHaveBeenCalled();
            }
        }));
    });
}
exports.main = main;
//# sourceMappingURL=animation_builder_spec.js.map