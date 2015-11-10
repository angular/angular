library angular2.src.animate.css_animation_builder;

import "css_animation_options.dart" show CssAnimationOptions;
import "animation.dart" show Animation;
import "browser_details.dart" show BrowserDetails;

class CssAnimationBuilder {
  BrowserDetails browserDetails;
  /** @type {CssAnimationOptions} */
  CssAnimationOptions data = new CssAnimationOptions();
  /**
   * Accepts public properties for CssAnimationBuilder
   */
  CssAnimationBuilder(this.browserDetails) {}
  /**
   * Adds a temporary class that will be removed at the end of the animation
   * @param className
   */
  CssAnimationBuilder addAnimationClass(String className) {
    this.data.animationClasses.add(className);
    return this;
  }

  /**
   * Adds a class that will remain on the element after the animation has finished
   * @param className
   */
  CssAnimationBuilder addClass(String className) {
    this.data.classesToAdd.add(className);
    return this;
  }

  /**
   * Removes a class from the element
   * @param className
   */
  CssAnimationBuilder removeClass(String className) {
    this.data.classesToRemove.add(className);
    return this;
  }

  /**
   * Sets the animation duration (and overrides any defined through CSS)
   * @param duration
   */
  CssAnimationBuilder setDuration(num duration) {
    this.data.duration = duration;
    return this;
  }

  /**
   * Sets the animation delay (and overrides any defined through CSS)
   * @param delay
   */
  CssAnimationBuilder setDelay(num delay) {
    this.data.delay = delay;
    return this;
  }

  /**
   * Sets styles for both the initial state and the destination state
   * @param from
   * @param to
   */
  CssAnimationBuilder setStyles(
      Map<String, dynamic> from, Map<String, dynamic> to) {
    return this.setFromStyles(from).setToStyles(to);
  }

  /**
   * Sets the initial styles for the animation
   * @param from
   */
  CssAnimationBuilder setFromStyles(Map<String, dynamic> from) {
    this.data.fromStyles = from;
    return this;
  }

  /**
   * Sets the destination styles for the animation
   * @param to
   */
  CssAnimationBuilder setToStyles(Map<String, dynamic> to) {
    this.data.toStyles = to;
    return this;
  }

  /**
   * Starts the animation and returns a promise
   * @param element
   */
  Animation start(dynamic element) {
    return new Animation(element, this.data, this.browserDetails);
  }
}
