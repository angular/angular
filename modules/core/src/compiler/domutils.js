import {DOM, Element} from 'facade/src/dom';
import {List, ListWrapper} from 'facade/src/collection';
import {isBlank, isString, RegExpWrapper, StringWrapper} from 'facade/src/lang';

var SPACE_REGEXP = RegExpWrapper.create(' ');

//todo(pk): in reality we should allow types of string or array instead of any
function _classNamesToCollection(names:any) {
  var trimmedName, validNames = ListWrapper.create();

  if (isString(names)) {
    names = StringWrapper.split(names, SPACE_REGEXP);
    for (var i = 0; i < names.length; i++) {
      trimmedName = ListWrapper.get(names, i).trim();
      if (trimmedName.length > 0) {
        ListWrapper.push(validNames, trimmedName);
      }
    }
  }

  return validNames;
}

/**
 * Various CSS utils to be used in the compiler. Those utils are meant to be fast
 * and have minimal functionality needed by the compiler.
 */
export class CSSUtil {

  static addClasses(element:Element, classNames:any) {
    var names =  _classNamesToCollection(classNames);
    for (var i = 0; i < names.length; i++) {
      DOM.addClass(element, ListWrapper.get(names, i));
    }
  }

  static removeClasses(element:Element, classNames:any) {
    var names =  _classNamesToCollection(classNames);
    for (var i = 0; i < names.length; i++) {
      DOM.removeClass(element, ListWrapper.get(names, i));
    }
  }
}
