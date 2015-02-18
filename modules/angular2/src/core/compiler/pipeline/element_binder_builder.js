import {int, isPresent, isBlank, Type, BaseException, StringWrapper, RegExpWrapper, isString, stringify} from 'angular2/src/facade/lang';
import {Element, DOM} from 'angular2/src/facade/dom';
import {ListWrapper, List, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {reflector} from 'angular2/src/reflection/reflection';

import {Parser, ProtoChangeDetector} from 'angular2/change_detection';

import {DirectiveMetadata} from '../directive_metadata';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

var DOT_REGEXP = RegExpWrapper.create('\\.');

const ARIA_PREFIX = 'aria-';
var ariaSettersCache = StringMapWrapper.create();

function ariaSetterFactory(attrName:string) {
  var setterFn = StringMapWrapper.get(ariaSettersCache, attrName);

  if (isBlank(setterFn)) {
    setterFn = function(element:Element, value) {
      if (isPresent(value)) {
        DOM.setAttribute(element, attrName, stringify(value));
      } else {
        DOM.removeAttribute(element, attrName);
      }
    };
    StringMapWrapper.set(ariaSettersCache, attrName, setterFn);
  }

  return setterFn;
}

const CLASS_PREFIX = 'class.';
var classSettersCache = StringMapWrapper.create();

function classSetterFactory(className:string) {
  var setterFn = StringMapWrapper.get(classSettersCache, className);

  if (isBlank(setterFn)) {
    setterFn = function(element:Element, value) {
      if (value) {
        DOM.addClass(element, className);
      } else {
        DOM.removeClass(element, className);
      }
    };
    StringMapWrapper.set(classSettersCache, className, setterFn);
  }

  return setterFn;
}

const STYLE_PREFIX = 'style.';
var styleSettersCache = StringMapWrapper.create();

function styleSetterFactory(styleName:string, stylesuffix:string) {
  var cacheKey = styleName + stylesuffix;
  var setterFn = StringMapWrapper.get(styleSettersCache, cacheKey);

  if (isBlank(setterFn)) {
    setterFn = function(element:Element, value) {
      var valAsStr;
      if (isPresent(value)) {
        valAsStr = stringify(value);
        DOM.setStyle(element, styleName, valAsStr + stylesuffix);
      } else {
        DOM.removeStyle(element, styleName);
      }
    };
    StringMapWrapper.set(classSettersCache, cacheKey, setterFn);
  }

  return setterFn;
}

const ROLE_ATTR = 'role';
function roleSetter(element:Element, value) {
  if (isString(value)) {
    DOM.setAttribute(element, ROLE_ATTR, value);
  } else {
    DOM.removeAttribute(element, ROLE_ATTR);
    if (isPresent(value)) {
      throw new BaseException("Invalid role attribute, only string values are allowed, got '" + stringify(value) + "'");
    }
  }
}

/**
 * Creates the ElementBinders and adds watches to the
 * ProtoChangeDetector.
 *
 * Fills:
 * - CompileElement#inheritedElementBinder
 *
 * Reads:
 * - (in parent) CompileElement#inheritedElementBinder
 * - CompileElement#hasBindings
 * - CompileElement#inheritedProtoView
 * - CompileElement#inheritedProtoElementInjector
 * - CompileElement#textNodeBindings
 * - CompileElement#propertyBindings
 * - CompileElement#eventBindings
 * - CompileElement#decoratorDirectives
 * - CompileElement#componentDirective
 * - CompileElement#viewportDirective
 *
 * Note: This actually only needs the CompileElements with the flags
 * `hasBindings` and `isViewRoot`,
 * and only needs the actual HTMLElement for the ones
 * with the flag `isViewRoot`.
 */
export class ElementBinderBuilder extends CompileStep {
  _parser:Parser;
  _compilationUnit:any;
  constructor(parser:Parser, compilationUnit:any) {
    super();
    this._parser = parser;
    this._compilationUnit = compilationUnit;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var elementBinder = null;
    if (current.hasBindings) {
      var protoView = current.inheritedProtoView;
      var protoInjectorWasBuilt = isBlank(parent) ? true :
          current.inheritedProtoElementInjector !== parent.inheritedProtoElementInjector;

      var currentProtoElementInjector = protoInjectorWasBuilt ?
          current.inheritedProtoElementInjector : null;

      elementBinder = protoView.bindElement(currentProtoElementInjector,
        current.componentDirective, current.viewportDirective);

      if (isPresent(current.textNodeBindings)) {
        this._bindTextNodes(protoView, current);
      }
      if (isPresent(current.propertyBindings)) {
        this._bindElementProperties(protoView, current);
      }
      if (isPresent(current.eventBindings)) {
        this._bindEvents(protoView, current);
      }
      this._bindDirectiveProperties(current.getAllDirectives(), current);
    } else if (isPresent(parent)) {
      elementBinder = parent.inheritedElementBinder;
    }
    current.inheritedElementBinder = elementBinder;
  }

  _bindTextNodes(protoView, compileElement) {
    MapWrapper.forEach(compileElement.textNodeBindings, (expression, indexInParent) => {
      protoView.bindTextNode(indexInParent, expression);
    });
  }

  _bindElementProperties(protoView, compileElement) {
    MapWrapper.forEach(compileElement.propertyBindings, (expression, property) => {
      var setterFn, styleParts, styleSuffix;

      if (StringWrapper.startsWith(property, ARIA_PREFIX)) {
        setterFn = ariaSetterFactory(property);
      } else if (StringWrapper.equals(property, ROLE_ATTR)) {
        setterFn = roleSetter;
      } else if (StringWrapper.startsWith(property, CLASS_PREFIX)) {
        setterFn = classSetterFactory(StringWrapper.substring(property, CLASS_PREFIX.length));
      } else if (StringWrapper.startsWith(property, STYLE_PREFIX)) {
        styleParts = StringWrapper.split(property, DOT_REGEXP);
        styleSuffix = styleParts.length > 2 ?  ListWrapper.get(styleParts, 2) : '';
        setterFn = styleSetterFactory(ListWrapper.get(styleParts, 1), styleSuffix);
      } else if (DOM.hasProperty(compileElement.element, property)) {
        setterFn = reflector.setter(property);
      }

      if (isPresent(setterFn)) {
        protoView.bindElementProperty(expression.ast, property, setterFn);
      }
    });
  }

  _bindEvents(protoView, compileElement) {
    MapWrapper.forEach(compileElement.eventBindings, (expression, eventName) => {
      protoView.bindEvent(eventName,  expression);
    });
  }

  _bindDirectiveProperties(directives: List<DirectiveMetadata>,
                           compileElement: CompileElement) {
    var protoView = compileElement.inheritedProtoView;

    for (var directiveIndex = 0; directiveIndex < directives.length; directiveIndex++) {
      var directive = ListWrapper.get(directives, directiveIndex);
      var annotation = directive.annotation;
      if (isBlank(annotation.bind)) continue;
      var _this = this;
      StringMapWrapper.forEach(annotation.bind, function (elProp, dirProp) {
        var expression = isPresent(compileElement.propertyBindings) ?
          MapWrapper.get(compileElement.propertyBindings, elProp) :
            null;
        if (isBlank(expression)) {
          var attributeValue = MapWrapper.get(compileElement.attrs(), elProp);
          if (isPresent(attributeValue)) {
            expression = _this._parser.wrapLiteralPrimitive(attributeValue, _this._compilationUnit);
          }
        }

        // Bindings are optional, so this binding only needs to be set up if an expression is given.
        if (isPresent(expression)) {
          var len = dirProp.length;
          var dirBindingName = dirProp;
          var isContentWatch = dirProp[len - 2] === '[' && dirProp[len - 1] === ']';
          if (isContentWatch) dirBindingName = dirProp.substring(0, len - 2);

          protoView.bindDirectiveProperty(
            directiveIndex,
            expression,
            dirBindingName,
            reflector.setter(dirBindingName),
            isContentWatch
          );
        }
      });
    }
  }
}
