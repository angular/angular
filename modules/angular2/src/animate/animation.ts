import {
  DateWrapper,
  StringWrapper,
  RegExpWrapper,
  NumberWrapper,
  isPresent
} from 'angular2/src/facade/lang';
import {Math} from 'angular2/src/facade/math';
import {camelCaseToDashCase} from 'angular2/src/platform/dom/util';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';

import {BrowserDetails} from './browser_details';
import {CssAnimationOptions} from './css_animation_options';

export class Animation {
  /** functions to be called upon completion */
  callbacks: Function[] = [];

  /** the duration (ms) of the animation (whether from CSS or manually set) */
  computedDuration: number;

  /** the animation delay (ms) (whether from CSS or manually set) */
  computedDelay: number;

  /** timestamp of when the animation started */
  startTime: number;

  /** functions for removing event listeners */
  eventClearFunctions: Function[] = [];

  /** flag used to track whether or not the animation has finished */
  completed: boolean = false;

  private _stringPrefix: string = '';

  private _temporaryStyles: {[key: string]: string} = {};

  /** total amount of time that the animation should take including delay */
  get totalTime(): number {
    let delay = this.computedDelay != null ? this.computedDelay : 0;
    let duration = this.computedDuration != null ? this.computedDuration : 0;
    return delay + duration;
  }

  /**
   * Stores the start time and starts the animation
   * @param element
   * @param data
   * @param browserDetails
   */
  constructor(public element: HTMLElement, public data: CssAnimationOptions,
              public browserDetails: BrowserDetails) {
    this.startTime = DateWrapper.toMillis(DateWrapper.now());
    this._stringPrefix = DOM.getAnimationPrefix();
    this.setup();
    this.wait(timestamp => this.start());
  }

  wait(callback: Function) {
    // Firefox requires 2 frames for some reason
    this.browserDetails.raf(callback, 2);
  }

  /**
   * Sets up the initial styles before the animation is started
   */
  setup(): void {
    if (this.data.fromStyles != null) this.applyStyles(this.data.fromStyles);
    if (this.data.duration != null) {
      this._temporaryStyles['transitionDuration'] = this._readStyle('transitionDuration');
      this.applyStyles({'transitionDuration': this.data.duration.toString() + 'ms'});
    }
    if (this.data.delay != null) {
      this._temporaryStyles['transitionDelay'] = this._readStyle('transitionDelay');
      this.applyStyles({'transitionDelay': this.data.delay.toString() + 'ms'});
    }

    if (!StringMapWrapper.isEmpty(this.data.animationStyles)) {
      // it's important that we setup a list of the styles and their
      // initial inline style values prior to applying the animation
      // styles such that we can restore the values after the animation
      // has been completed.
      StringMapWrapper.keys(this.data.animationStyles)
          .forEach((prop) => { this._temporaryStyles[prop] = this._readStyle(prop); });

      this.applyStyles(this.data.animationStyles);
    }
  }

  /**
   * After the initial setup has occurred, this method adds the animation styles
   */
  start(): void {
    this.addClasses(this.data.classesToAdd);
    this.addClasses(this.data.animationClasses);
    this.removeClasses(this.data.classesToRemove);
    if (this.data.toStyles != null) this.applyStyles(this.data.toStyles);
    var computedStyles = DOM.getComputedStyle(this.element);
    this.computedDelay =
        Math.max(this.parseDurationString(
                     computedStyles.getPropertyValue(this._stringPrefix + 'transition-delay')),
                 this.parseDurationString(
                     this.element.style.getPropertyValue(this._stringPrefix + 'transition-delay')));
    this.computedDuration = Math.max(this.parseDurationString(computedStyles.getPropertyValue(
                                         this._stringPrefix + 'transition-duration')),
                                     this.parseDurationString(this.element.style.getPropertyValue(
                                         this._stringPrefix + 'transition-duration')));
    this.addEvents();
  }

  /**
   * Applies the provided styles to the element
   * @param styles
   */
  applyStyles(styles: {[key: string]: any}): void {
    StringMapWrapper.forEach(styles, (value, key) => {
      var prop = this._formatStyleProp(key);
      DOM.setStyle(this.element, prop, value.toString());
    });
  }

  /**
   * Adds the provided classes to the element
   * @param classes
   */
  addClasses(classes: string[]): void {
    for (let i = 0, len = classes.length; i < len; i++) DOM.addClass(this.element, classes[i]);
  }

  /**
   * Removes the provided classes from the element
   * @param classes
   */
  removeClasses(classes: string[]): void {
    for (let i = 0, len = classes.length; i < len; i++) DOM.removeClass(this.element, classes[i]);
  }

  private _readStyle(prop: string): string {
    return DOM.getStyle(this.element, this._formatStyleProp(prop));
  }

  private _formatStyleProp(prop: string): string {
    prop = camelCaseToDashCase(prop);
    return prop.indexOf('animation') >= 0 ? this._stringPrefix + prop : prop;
  }

  private _removeAndRestoreStyles(styles: {[key: string]: string}): void {
    StringMapWrapper.forEach(styles, (value, prop) => {
      prop = this._formatStyleProp(prop);
      if (value.length > 0) {
        DOM.setStyle(this.element, prop, value);
      } else {
        DOM.removeStyle(this.element, prop);
      }
    });
  }

  /**
   * Adds events to track when animations have finished
   */
  addEvents(): void {
    if (this.totalTime > 0) {
      this.eventClearFunctions.push(DOM.onAndCancel(
          this.element, DOM.getTransitionEnd(), (event: any) => this.handleAnimationEvent(event)));
    } else {
      this.handleAnimationCompleted();
    }
  }

  handleAnimationEvent(event: any): void {
    let elapsedTime = Math.round(event.elapsedTime * 1000);
    if (!this.browserDetails.elapsedTimeIncludesDelay) elapsedTime += this.computedDelay;
    event.stopPropagation();
    if (elapsedTime >= this.totalTime) this.handleAnimationCompleted();
  }

  /**
   * Runs all animation callbacks and removes temporary classes
   */
  handleAnimationCompleted(): void {
    this.removeClasses(this.data.animationClasses);
    this._removeAndRestoreStyles(this._temporaryStyles);
    this._temporaryStyles = {};

    this.callbacks.forEach(callback => callback());
    this.callbacks = [];
    this.eventClearFunctions.forEach(fn => fn());
    this.eventClearFunctions = [];
    this.completed = true;
  }

  /**
   * Adds animation callbacks to be called upon completion
   * @param callback
   * @returns {Animation}
   */
  onComplete(callback: Function): Animation {
    if (this.completed) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
    return this;
  }

  /**
   * Converts the duration string to the number of milliseconds
   * @param duration
   * @returns {number}
   */
  parseDurationString(duration: string): number {
    var maxValue = 0;
    // duration must have at least 2 characters to be valid. (number + type)
    if (duration == null || duration.length < 2) {
      return maxValue;
    } else if (duration.substring(duration.length - 2) == 'ms') {
      let value = NumberWrapper.parseInt(this.stripLetters(duration), 10);
      if (value > maxValue) maxValue = value;
    } else if (duration.substring(duration.length - 1) == 's') {
      let ms = NumberWrapper.parseFloat(this.stripLetters(duration)) * 1000;
      let value = Math.floor(ms);
      if (value > maxValue) maxValue = value;
    }
    return maxValue;
  }

  /**
   * Strips the letters from the duration string
   * @param str
   * @returns {string}
   */
  stripLetters(str: string): string {
    return StringWrapper.replaceAll(str, RegExpWrapper.create('[^0-9]+$', ''), '');
  }
}
