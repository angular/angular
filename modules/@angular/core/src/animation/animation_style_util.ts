import {isPresent, isArray} from '../facade/lang';
import {ListWrapper, StringMapWrapper} from '../facade/collection';
import {AUTO_STYLE} from './metadata';
import {FILL_STYLE_FLAG} from './animation_constants';

export function balanceAnimationStyles(previousStyles: {[key: string]: string|number},
                     newStyles: {[key: string]: string|number},
                     nullValue = null): {[key: string]: string} {
  var finalStyles: {[key: string]: string} = {};

  StringMapWrapper.forEach(newStyles, (value, prop) => {
    finalStyles[prop] = value.toString();
  });

  StringMapWrapper.forEach(previousStyles, (value, prop) => {
    if (!isPresent(finalStyles[prop])) {
      finalStyles[prop] = nullValue;
    }
  });

  return finalStyles;
}

export function balanceAnimationKeyframes(collectedStyles: {[key: string]: string|number},
                        finalStateStyles: {[key: string]: string|number},
                        keyframes: any[]): any[] {
  var limit = keyframes.length - 1;
  var firstKeyframe = keyframes[0];

  // phase 1: copy all the styles from the first keyframe into the lookup map
  var flatenedFirstKeyframeStyles = flattenStyles(firstKeyframe.styles.styles);

  var extraFirstKeyframeStyles = {};
  var hasExtraFirstStyles = false;
  StringMapWrapper.forEach(collectedStyles, (value, prop) => {
    // if the style is already defined in the first keyframe then
    // we do not replace it.
    if (!flatenedFirstKeyframeStyles[prop]) {
      flatenedFirstKeyframeStyles[prop] = value;
      extraFirstKeyframeStyles[prop] = value;
      hasExtraFirstStyles = true;
    }
  });

  var keyframeCollectedStyles = StringMapWrapper.merge({}, flatenedFirstKeyframeStyles);

  // phase 2: normalize the final keyframe
  var finalKeyframe = keyframes[limit];
  ListWrapper.insert(finalKeyframe.styles.styles, 0, finalStateStyles);

  var flatenedFinalKeyframeStyles = flattenStyles(finalKeyframe.styles.styles);
  var extraFinalKeyframeStyles = {};
  var hasExtraFinalStyles = false;
  StringMapWrapper.forEach(keyframeCollectedStyles, (value, prop) => {
    if (!isPresent(flatenedFinalKeyframeStyles[prop])) {
      extraFinalKeyframeStyles[prop] = AUTO_STYLE;
      hasExtraFinalStyles = true;
    }
  });

  if (hasExtraFinalStyles) {
    finalKeyframe.styles.styles.push(extraFinalKeyframeStyles);
  }

  StringMapWrapper.forEach(flatenedFinalKeyframeStyles, (value, prop) => {
    if (!isPresent(flatenedFirstKeyframeStyles[prop])) {
      extraFirstKeyframeStyles[prop] = AUTO_STYLE;
      hasExtraFirstStyles = true;
    }
  });

  if (hasExtraFirstStyles) {
    firstKeyframe.styles.styles.push(extraFirstKeyframeStyles);
  }

  return keyframes;
}

export function clearStyles(styles: {[key: string]: string|number}): {[key: string]: string} {
  var finalStyles: {[key: string]: string} = {};
  StringMapWrapper.keys(styles).forEach(key => {
    finalStyles[key] = null;
  });
  return finalStyles;
}

export function collectAndResolveStyles(collection: {[key: string]: string|number}, styles: {[key: string]: string|number}[]) {
  return styles.map(entry => {
    var stylesObj = {};
    StringMapWrapper.forEach(entry, (value, prop) => {
      if (value == FILL_STYLE_FLAG) {
        value = collection[prop];
        if (!isPresent(value)) {
          value = AUTO_STYLE;
        }
      }
      collection[prop] = value;
      stylesObj[prop] = value;
    });
    return stylesObj;
  });
}

export function renderStyles(element: any, renderer: any, styles: {[key: string]: string|number}): void {
  StringMapWrapper.forEach(styles, (value, prop) => {
    renderer.setElementStyle(element, prop, value);
  });
}

export function flattenStyles(styles: {[key: string]: string|number}[]) {
  var finalStyles = {};
  styles.forEach(entry => {
    StringMapWrapper.forEach(entry, (value, prop) => {
      finalStyles[prop] = value;
    });
  });
  return finalStyles;
}
