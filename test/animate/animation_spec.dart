library angular2.test.animate.animation_spec;

import "package:angular2/testing_internal.dart"
    show
        el,
        describe,
        ddescribe,
        beforeEach,
        it,
        iit,
        expect,
        inject,
        SpyObject;
import "package:angular2/src/animate/css_animation_options.dart"
    show CssAnimationOptions;
import "package:angular2/src/animate/animation.dart" show Animation;
import "package:angular2/src/animate/browser_details.dart" show BrowserDetails;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;

main() {
  describe("Animation", () {
    var element;
    beforeEach(() {
      element = el("<div></div>");
    });
    describe("transition-duration", () {
      it("should only be applied for the duration of the animation", () {
        var data = new CssAnimationOptions();
        data.duration = 1000;
        expect(element).not.toHaveCssStyle("transition-duration");
        new Animation(element, data, new BrowserDetails());
        expect(element).toHaveCssStyle({"transition-duration": "1000ms"});
      });
      it("should be removed once the animation is over", () {
        var data = new CssAnimationOptions();
        data.duration = 1000;
        var animation = new Animation(element, data, new BrowserDetails());
        expect(element).toHaveCssStyle({"transition-duration": "1000ms"});
        animation.handleAnimationCompleted();
        expect(element).not.toHaveCssStyle("transition-duration");
      });
      it("should be restore the pre-existing transition-duration once the animation is over if present",
          () {
        DOM.setStyle(element, "transition-duration", "5s");
        expect(element).toHaveCssStyle({"transition-duration": "5s"});
        var data = new CssAnimationOptions();
        data.duration = 1000;
        var animation = new Animation(element, data, new BrowserDetails());
        expect(element).toHaveCssStyle({"transition-duration": "1000ms"});
        animation.handleAnimationCompleted();
        expect(element).toHaveCssStyle({"transition-duration": "5s"});
      });
    });
    describe("transition-delay", () {
      it("should only be applied for the delay of the animation", () {
        var data = new CssAnimationOptions();
        data.delay = 1000;
        expect(element).not.toHaveCssStyle("transition-delay");
        var animation = new Animation(element, data, new BrowserDetails());
        expect(element).toHaveCssStyle({"transition-delay": "1000ms"});
      });
      it("should be removed once the animation is over", () {
        var data = new CssAnimationOptions();
        data.delay = 1000;
        var animation = new Animation(element, data, new BrowserDetails());
        expect(element).toHaveCssStyle({"transition-delay": "1000ms"});
        animation.handleAnimationCompleted();
        expect(element).not.toHaveCssStyle("transition-delay");
      });
      it("should be restore the pre-existing transition-delay once the animation is over if present",
          () {
        DOM.setStyle(element, "transition-delay", "5s");
        expect(element).toHaveCssStyle({"transition-delay": "5s"});
        var data = new CssAnimationOptions();
        data.delay = 1000;
        var animation = new Animation(element, data, new BrowserDetails());
        expect(element).toHaveCssStyle({"transition-delay": "1000ms"});
        animation.handleAnimationCompleted();
        expect(element).toHaveCssStyle({"transition-delay": "5s"});
      });
    });
    describe("temporary animation styles", () {
      it("should be applied temporarily for the duration of the animation", () {
        var data = new CssAnimationOptions();
        data.duration = 1000;
        data.animationStyles = {"width": "100px", "opacity": "0.5"};
        var animation = new Animation(element, data, new BrowserDetails());
        expect(element).toHaveCssStyle({
          "opacity": "0.5",
          "width": "100px",
          "transition-duration": "1000ms"
        });
        animation.handleAnimationCompleted();
        expect(element).not.toHaveCssStyle("width");
        expect(element).not.toHaveCssStyle("opacity");
        expect(element).not.toHaveCssStyle("transition-duration");
      });
      it("should be restored back to the original styles on the element", () {
        DOM.setStyle(element, "height", "555px");
        var data = new CssAnimationOptions();
        data.duration = 1000;
        data.animationStyles = {"width": "100px", "height": "999px"};
        var animation = new Animation(element, data, new BrowserDetails());
        expect(element).toHaveCssStyle({"width": "100px", "height": "999px"});
        animation.handleAnimationCompleted();
        expect(element).not.toHaveCssStyle("width");
        expect(element).toHaveCssStyle({"height": "555px"});
      });
    });
  });
}
