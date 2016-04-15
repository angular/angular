import {isPresent} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';

export class AnimationStyleUtil {
  static balanceStyles(previousStyles: {[key: string]: string|number},
                       newStyles: {[key: string]: string|number}): {[key: string]: string|number} {
    var finalStyles: {[key: string]: string|number} = {};
    StringMapWrapper.forEach(newStyles, (value, prop) => {
      finalStyles[prop] = value;
    });

    StringMapWrapper.forEach(previousStyles, (value, prop) => {
      if (!isPresent(finalStyles[prop])) {
        finalStyles[prop] = null;
      }
    });

    return finalStyles;
  }

  static clearStyles(styles: {[key: string]: string|number}): {[key: string]: string|number} {
    var finalStyles: {[key: string]: string|number} = {};
    StringMapWrapper.keys(styles).forEach(key => {
      finalStyles[key] = null;
    });
    return finalStyles;
  }
}
