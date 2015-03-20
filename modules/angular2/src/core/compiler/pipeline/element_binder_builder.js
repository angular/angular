import {int, isPresent, isBlank, Type, BaseException, StringWrapper, RegExpWrapper, isString, stringify} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {ListWrapper, List, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {reflector} from 'angular2/src/reflection/reflection';

import {Parser, ProtoChangeDetector} from 'angular2/change_detection';

import {DirectiveMetadata} from '../directive_metadata';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {dashCaseToCamelCase, camelCaseToDashCase} from './util';

var DOT_REGEXP = RegExpWrapper.create('\\.');

const ATTRIBUTE_PREFIX = 'attr.';
var attributeSettersCache = StringMapWrapper.create();

function _isValidAttributeValue(attrName:string, value: any) {
  if (attrName == "role") {
    return isString(value);
  } else {
    return isPresent(value);
  }
}

function attributeSetterFactory(attrName:string) {
  var setterFn = StringMapWrapper.get(attributeSettersCache, attrName);
  var dashCasedAttributeName;

  if (isBlank(setterFn)) {
    dashCasedAttributeName = camelCaseToDashCase(attrName);
    setterFn = function(element, value) {
      if (_isValidAttributeValue(dashCasedAttributeName, value)) {
        DOM.setAttribute(element, dashCasedAttributeName, stringify(value));
      } else {
        DOM.removeAttribute(element, dashCasedAttributeName);
        if (isPresent(value)) {
          throw new BaseException("Invalid " + dashCasedAttributeName + " attribute, only string values are allowed, got '" + stringify(value) + "'");
        }
      }
    };
    StringMapWrapper.set(attributeSettersCache, attrName, setterFn);
  }

  return setterFn;
}

const CLASS_PREFIX = 'class.';
var classSettersCache = StringMapWrapper.create();

function classSetterFactory(className:string) {
  var setterFn = StringMapWrapper.get(classSettersCache, className);

  if (isBlank(setterFn)) {
    setterFn = function(element, value) {
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
  var dashCasedStyleName;

  if (isBlank(setterFn)) {
    dashCasedStyleName = camelCaseToDashCase(styleName);
    setterFn = function(element, value) {
      var valAsStr;
      if (isPresent(value)) {
        valAsStr = stringify(value);
        DOM.setStyle(element, dashCasedStyleName, valAsStr + stylesuffix);
      } else {
        DOM.removeStyle(element, dashCasedStyleName);
      }
    };
    StringMapWrapper.set(classSettersCache, cacheKey, setterFn);
  }

  return setterFn;
}

// tells if an attribute is handled by the ElementBinderBuilder step
export function isSpecialProperty(propName:string) {
  return StringWrapper.startsWith(propName, ATTRIBUTE_PREFIX)
        || StringWrapper.startsWith(propName, CLASS_PREFIX)
        || StringWrapper.startsWith(propName, STYLE_PREFIX)
        || StringMapWrapper.contains(DOM.attrToPropMap, propName);
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
  constructor(parser:Parser) {
    super();
    this._parser = parser;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var elementBinder = null;
    var parentElementBinder = null;
    var distanceToParentBinder = this._getDistanceToParentBinder(parent, current);
    if (isPresent(parent)) {
      parentElementBinder = parent.inheritedElementBinder;
    }
    if (current.hasBindings) {
      var protoView = current.inheritedProtoView;
      var protoInjectorWasBuilt = isBlank(parent) ? true :
          current.inheritedProtoElementInjector !== parent.inheritedProtoElementInjector;

      var currentProtoElementInjector = protoInjectorWasBuilt ?
          current.inheritedProtoElementInjector : null;

      elementBinder = protoView.bindElement(parentElementBinder, distanceToParentBinder,
          currentProtoElementInjector, current.componentDirective, current.viewportDirective);
      current.distanceToParentBinder = 0;

      if (isPresent(current.textNodeBindings)) {
        this._bindTextNodes(protoView, current);
      }
      if (isPresent(current.propertyBindings)) {
        this._bindElementProperties(protoView, current);
      }
      if (isPresent(current.eventBindings)) {
        this._bindEvents(protoView, current);
      }
      if (isPresent(current.contentTagSelector)) {
        elementBinder.contentTagSelector = current.contentTagSelector;
      }
      var directives = current.getAllDirectives();
      this._bindDirectiveProperties(directives, current);
      this._bindDirectiveEvents(directives, current);
    } else if (isPresent(parent)) {
      elementBinder = parentElementBinder;
      current.distanceToParentBinder = distanceToParentBinder;
    }
    current.inheritedElementBinder = elementBinder;
  }

  _getDistanceToParentBinder(parent, current) {
    return isPresent(parent) ? parent.distanceToParentBinder + 1 : 0;
  }

  _bindTextNodes(protoView, compileElement) {
    MapWrapper.forEach(compileElement.textNodeBindings, (expression, indexInParent) => {
      protoView.bindTextNode(indexInParent, expression);
    });
  }

  _bindElementProperties(protoView, compileElement) {
    MapWrapper.forEach(compileElement.propertyBindings, (expression, property) => {
      var setterFn, styleParts, styleSuffix;

      if (StringWrapper.startsWith(property, ATTRIBUTE_PREFIX)) {
        setterFn = attributeSetterFactory(StringWrapper.substring(property, ATTRIBUTE_PREFIX.length));
      } else if (StringWrapper.startsWith(property, CLASS_PREFIX)) {
        setterFn = classSetterFactory(StringWrapper.substring(property, CLASS_PREFIX.length));
      } else if (StringWrapper.startsWith(property, STYLE_PREFIX)) {
        styleParts = StringWrapper.split(property, DOT_REGEXP);
        styleSuffix = styleParts.length > 2 ? ListWrapper.get(styleParts, 2) : '';
        setterFn = styleSetterFactory(ListWrapper.get(styleParts, 1), styleSuffix);
      } else {
        property = this._resolvePropertyName(property);
        //TODO(pk): special casing innerHtml, see: https://github.com/angular/angular/issues/789
        if (StringWrapper.equals(property, 'innerHTML')) {
          setterFn = (element, value) => DOM.setInnerHTML(element, value);
        } else if (DOM.hasProperty(compileElement.element, property) || StringWrapper.equals(property, 'innerHtml')) {
          setterFn = reflector.setter(property);
        }
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

  _bindDirectiveEvents(directives: List<DirectiveMetadata>, compileElement: CompileElement) {
    for (var directiveIndex = 0; directiveIndex < directives.length; directiveIndex++) {
      var directive = directives[directiveIndex];
      var annotation = directive.annotation;
      if (isBlank(annotation.events)) continue;
      var protoView = compileElement.inheritedProtoView;
      StringMapWrapper.forEach(annotation.events, (action, eventName) => {
        var expression = this._parser.parseAction(action, compileElement.elementDescription);
        protoView.bindEvent(eventName, expression, directiveIndex);
      });
    }
  }

  _bindDirectiveProperties(directives: List<DirectiveMetadata>,
                           compileElement: CompileElement) {
    var protoView = compileElement.inheritedProtoView;

    for (var directiveIndex = 0; directiveIndex < directives.length; directiveIndex++) {
      var directive = ListWrapper.get(directives, directiveIndex);
      var annotation = directive.annotation;
      if (isBlank(annotation.bind)) continue;
      StringMapWrapper.forEach(annotation.bind, (bindConfig, dirProp) => {
        var pipes = this._splitBindConfig(bindConfig);
        var elProp = ListWrapper.removeAt(pipes, 0);

        var bindingAst = isPresent(compileElement.propertyBindings) ?
          MapWrapper.get(compileElement.propertyBindings, dashCaseToCamelCase(elProp)) :
            null;

        if (isBlank(bindingAst)) {
          var attributeValue = MapWrapper.get(compileElement.attrs(), elProp);
          if (isPresent(attributeValue)) {
            bindingAst = this._parser.wrapLiteralPrimitive(attributeValue, compileElement.elementDescription);
          }
        }

        // Bindings are optional, so this binding only needs to be set up if an expression is given.
        if (isPresent(bindingAst)) {
          var fullExpAstWithBindPipes = this._parser.addPipes(bindingAst, pipes);
          protoView.bindDirectiveProperty(
            directiveIndex,
            fullExpAstWithBindPipes,
            dirProp,
            reflector.setter(dashCaseToCamelCase(dirProp))
          );
        }
      });
    }
  }

  _splitBindConfig(bindConfig:string) {
    return ListWrapper.map(bindConfig.split('|'), (s) => s.trim());
  }

  _resolvePropertyName(attrName:string) {
    var mappedPropName = StringMapWrapper.get(DOM.attrToPropMap, attrName);
    return isPresent(mappedPropName) ? mappedPropName : attrName;
  }
}
