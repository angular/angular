import {getOrSetDefaultValue} from '../render/shared';
import {interpolateParams} from '../util';
import {buildAnimationTimelines} from './animation_timeline_builder';
import {createTransitionInstruction} from './animation_transition_instruction';
const EMPTY_OBJECT = {};
export class AnimationTransitionFactory {
  _triggerName;
  ast;
  _stateStyles;
  constructor(_triggerName, ast, _stateStyles) {
    this._triggerName = _triggerName;
    this.ast = ast;
    this._stateStyles = _stateStyles;
  }
  match(currentState, nextState, element, params) {
    return oneOrMoreTransitionsMatch(this.ast.matchers, currentState, nextState, element, params);
  }
  buildStyles(stateName, params, errors) {
    let styler = this._stateStyles.get('*');
    if (stateName !== undefined) {
      styler = this._stateStyles.get(stateName?.toString()) || styler;
    }
    return styler ? styler.buildStyles(params, errors) : new Map();
  }
  build(
    driver,
    element,
    currentState,
    nextState,
    enterClassName,
    leaveClassName,
    currentOptions,
    nextOptions,
    subInstructions,
    skipAstBuild,
  ) {
    const errors = [];
    const transitionAnimationParams = (this.ast.options && this.ast.options.params) || EMPTY_OBJECT;
    const currentAnimationParams = (currentOptions && currentOptions.params) || EMPTY_OBJECT;
    const currentStateStyles = this.buildStyles(currentState, currentAnimationParams, errors);
    const nextAnimationParams = (nextOptions && nextOptions.params) || EMPTY_OBJECT;
    const nextStateStyles = this.buildStyles(nextState, nextAnimationParams, errors);
    const queriedElements = new Set();
    const preStyleMap = new Map();
    const postStyleMap = new Map();
    const isRemoval = nextState === 'void';
    const animationOptions = {
      params: applyParamDefaults(nextAnimationParams, transitionAnimationParams),
      delay: this.ast.options?.delay,
    };
    const timelines = skipAstBuild
      ? []
      : buildAnimationTimelines(
          driver,
          element,
          this.ast.animation,
          enterClassName,
          leaveClassName,
          currentStateStyles,
          nextStateStyles,
          animationOptions,
          subInstructions,
          errors,
        );
    let totalTime = 0;
    timelines.forEach((tl) => {
      totalTime = Math.max(tl.duration + tl.delay, totalTime);
    });
    if (errors.length) {
      return createTransitionInstruction(
        element,
        this._triggerName,
        currentState,
        nextState,
        isRemoval,
        currentStateStyles,
        nextStateStyles,
        [],
        [],
        preStyleMap,
        postStyleMap,
        totalTime,
        errors,
      );
    }
    timelines.forEach((tl) => {
      const elm = tl.element;
      const preProps = getOrSetDefaultValue(preStyleMap, elm, new Set());
      tl.preStyleProps.forEach((prop) => preProps.add(prop));
      const postProps = getOrSetDefaultValue(postStyleMap, elm, new Set());
      tl.postStyleProps.forEach((prop) => postProps.add(prop));
      if (elm !== element) {
        queriedElements.add(elm);
      }
    });
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      checkNonAnimatableInTimelines(timelines, this._triggerName, driver);
    }
    return createTransitionInstruction(
      element,
      this._triggerName,
      currentState,
      nextState,
      isRemoval,
      currentStateStyles,
      nextStateStyles,
      timelines,
      [...queriedElements.values()],
      preStyleMap,
      postStyleMap,
      totalTime,
    );
  }
}
/**
 * Checks inside a set of timelines if they try to animate a css property which is not considered
 * animatable, in that case it prints a warning on the console.
 * Besides that the function doesn't have any other effect.
 *
 * Note: this check is done here after the timelines are built instead of doing on a lower level so
 * that we can make sure that the warning appears only once per instruction (we can aggregate here
 * all the issues instead of finding them separately).
 *
 * @param timelines The built timelines for the current instruction.
 * @param triggerName The name of the trigger for the current instruction.
 * @param driver Animation driver used to perform the check.
 *
 */
function checkNonAnimatableInTimelines(timelines, triggerName, driver) {
  if (!driver.validateAnimatableStyleProperty) {
    return;
  }
  const allowedNonAnimatableProps = new Set([
    // 'easing' is a utility/synthetic prop we use to represent
    // easing functions, it represents a property of the animation
    // which is not animatable but different values can be used
    // in different steps
    'easing',
  ]);
  const invalidNonAnimatableProps = new Set();
  timelines.forEach(({keyframes}) => {
    const nonAnimatablePropsInitialValues = new Map();
    keyframes.forEach((keyframe) => {
      const entriesToCheck = Array.from(keyframe.entries()).filter(
        ([prop]) => !allowedNonAnimatableProps.has(prop),
      );
      for (const [prop, value] of entriesToCheck) {
        if (!driver.validateAnimatableStyleProperty(prop)) {
          if (nonAnimatablePropsInitialValues.has(prop) && !invalidNonAnimatableProps.has(prop)) {
            const propInitialValue = nonAnimatablePropsInitialValues.get(prop);
            if (propInitialValue !== value) {
              invalidNonAnimatableProps.add(prop);
            }
          } else {
            nonAnimatablePropsInitialValues.set(prop, value);
          }
        }
      }
    });
  });
  if (invalidNonAnimatableProps.size > 0) {
    console.warn(
      `Warning: The animation trigger "${triggerName}" is attempting to animate the following` +
        ' not animatable properties: ' +
        Array.from(invalidNonAnimatableProps).join(', ') +
        '\n' +
        '(to check the list of all animatable properties visit https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties)',
    );
  }
}
function oneOrMoreTransitionsMatch(matchFns, currentState, nextState, element, params) {
  return matchFns.some((fn) => fn(currentState, nextState, element, params));
}
function applyParamDefaults(userParams, defaults) {
  const result = {...defaults};
  Object.entries(userParams).forEach(([key, value]) => {
    if (value != null) {
      result[key] = value;
    }
  });
  return result;
}
export class AnimationStateStyles {
  styles;
  defaultParams;
  normalizer;
  constructor(styles, defaultParams, normalizer) {
    this.styles = styles;
    this.defaultParams = defaultParams;
    this.normalizer = normalizer;
  }
  buildStyles(params, errors) {
    const finalStyles = new Map();
    const combinedParams = applyParamDefaults(params, this.defaultParams);
    this.styles.styles.forEach((value) => {
      if (typeof value !== 'string') {
        value.forEach((val, prop) => {
          if (val) {
            val = interpolateParams(val, combinedParams, errors);
          }
          const normalizedProp = this.normalizer.normalizePropertyName(prop, errors);
          val = this.normalizer.normalizeStyleValue(prop, normalizedProp, val, errors);
          finalStyles.set(prop, val);
        });
      }
    });
    return finalStyles;
  }
}
//# sourceMappingURL=animation_transition_factory.js.map
