import {
  allowPreviousPlayerStylesMerge,
  balancePreviousStylesIntoKeyframes,
  camelCaseToDashCase,
  computeStyle,
  normalizeKeyframes,
} from '../../util';
import {
  containsElement,
  getParentElement,
  invokeQuery,
  validateStyleProperty,
  validateWebAnimatableStyleProperty,
} from '../shared';
import {packageNonAnimatableStyles} from '../special_cased_styles';
import {WebAnimationsPlayer} from './web_animations_player';
export class WebAnimationsDriver {
  validateStyleProperty(prop) {
    // Perform actual validation in dev mode only, in prod mode this check is a noop.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      return validateStyleProperty(prop);
    }
    return true;
  }
  validateAnimatableStyleProperty(prop) {
    // Perform actual validation in dev mode only, in prod mode this check is a noop.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      const cssProp = camelCaseToDashCase(prop);
      return validateWebAnimatableStyleProperty(cssProp);
    }
    return true;
  }
  containsElement(elm1, elm2) {
    return containsElement(elm1, elm2);
  }
  getParentElement(element) {
    return getParentElement(element);
  }
  query(element, selector, multi) {
    return invokeQuery(element, selector, multi);
  }
  computeStyle(element, prop, defaultValue) {
    return computeStyle(element, prop);
  }
  animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
    const fill = delay == 0 ? 'both' : 'forwards';
    const playerOptions = {duration, delay, fill};
    // we check for this to avoid having a null|undefined value be present
    // for the easing (which results in an error for certain browsers #9752)
    if (easing) {
      playerOptions['easing'] = easing;
    }
    const previousStyles = new Map();
    const previousWebAnimationPlayers = previousPlayers.filter(
      (player) => player instanceof WebAnimationsPlayer,
    );
    if (allowPreviousPlayerStylesMerge(duration, delay)) {
      previousWebAnimationPlayers.forEach((player) => {
        player.currentSnapshot.forEach((val, prop) => previousStyles.set(prop, val));
      });
    }
    let _keyframes = normalizeKeyframes(keyframes).map((styles) => new Map(styles));
    _keyframes = balancePreviousStylesIntoKeyframes(element, _keyframes, previousStyles);
    const specialStyles = packageNonAnimatableStyles(element, _keyframes);
    return new WebAnimationsPlayer(element, _keyframes, playerOptions, specialStyles);
  }
}
//# sourceMappingURL=web_animations_driver.js.map
