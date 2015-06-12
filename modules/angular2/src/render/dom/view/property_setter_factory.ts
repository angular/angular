import {
  StringWrapper,
  RegExpWrapper,
  BaseException,
  isPresent,
  isBlank,
  isString,
  stringify
} from 'angular2/src/facade/lang';
import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {camelCaseToDashCase, dashCaseToCamelCase} from '../util';
import {reflector} from 'angular2/src/reflection/reflection';

const STYLE_SEPARATOR = '.';
const ATTRIBUTE_PREFIX = 'attr.';
const CLASS_PREFIX = 'class.';
const STYLE_PREFIX = 'style.';

export class PropertySetterFactory {
  private static _noopSetter(el, value) {}

  private _lazyPropertySettersCache: StringMap<string, Function> = StringMapWrapper.create();
  private _eagerPropertySettersCache: StringMap<string, Function> = StringMapWrapper.create();
  private _innerHTMLSetterCache: Function = (el, value) => DOM.setInnerHTML(el, value);
  private _attributeSettersCache: StringMap<string, Function> = StringMapWrapper.create();
  private _classSettersCache: StringMap<string, Function> = StringMapWrapper.create();
  private _styleSettersCache: StringMap<string, Function> = StringMapWrapper.create();

  createSetter(protoElement: /*element*/ any, isNgComponent: boolean, property: string): Function {
    var setterFn, styleParts, styleSuffix;
    if (StringWrapper.startsWith(property, ATTRIBUTE_PREFIX)) {
      setterFn =
          this._attributeSetterFactory(StringWrapper.substring(property, ATTRIBUTE_PREFIX.length));
    } else if (StringWrapper.startsWith(property, CLASS_PREFIX)) {
      setterFn = this._classSetterFactory(StringWrapper.substring(property, CLASS_PREFIX.length));
    } else if (StringWrapper.startsWith(property, STYLE_PREFIX)) {
      styleParts = property.split(STYLE_SEPARATOR);
      styleSuffix = styleParts.length > 2 ? ListWrapper.get(styleParts, 2) : '';
      setterFn = this._styleSetterFactory(ListWrapper.get(styleParts, 1), styleSuffix);
    } else if (StringWrapper.equals(property, 'innerHtml')) {
      setterFn = this._innerHTMLSetterCache;
    } else {
      property = this._resolvePropertyName(property);
      setterFn = this._propertySetterFactory(protoElement, isNgComponent, property);
    }
    return setterFn;
  }

  private _propertySetterFactory(protoElement, isNgComponent: boolean, property: string): Function {
    var setterFn;
    var tagName = DOM.tagName(protoElement);
    var possibleCustomElement = tagName.indexOf('-') !== -1;
    if (possibleCustomElement && !isNgComponent) {
      // need to use late check to be able to set properties on custom elements
      setterFn = StringMapWrapper.get(this._lazyPropertySettersCache, property);
      if (isBlank(setterFn)) {
        var propertySetterFn = reflector.setter(property);
        setterFn = (receiver, value) => {
          if (DOM.hasProperty(receiver, property)) {
            return propertySetterFn(receiver, value);
          }
        };
        StringMapWrapper.set(this._lazyPropertySettersCache, property, setterFn);
      }
    } else {
      setterFn = StringMapWrapper.get(this._eagerPropertySettersCache, property);
      if (isBlank(setterFn)) {
        if (DOM.hasProperty(protoElement, property)) {
          setterFn = reflector.setter(property);
        } else {
          setterFn = PropertySetterFactory._noopSetter;
        }
        StringMapWrapper.set(this._eagerPropertySettersCache, property, setterFn);
      }
    }
    return setterFn;
  }

  private _isValidAttributeValue(attrName: string, value: any): boolean {
    if (attrName == "role") {
      return isString(value);
    } else {
      return isPresent(value);
    }
  }

  private _attributeSetterFactory(attrName: string): Function {
    var setterFn = StringMapWrapper.get(this._attributeSettersCache, attrName);
    var dashCasedAttributeName;

    if (isBlank(setterFn)) {
      dashCasedAttributeName = camelCaseToDashCase(attrName);
      setterFn = (element, value) => {
        if (this._isValidAttributeValue(dashCasedAttributeName, value)) {
          DOM.setAttribute(element, dashCasedAttributeName, stringify(value));
        } else {
          if (isPresent(value)) {
            throw new BaseException("Invalid " + dashCasedAttributeName +
                                    " attribute, only string values are allowed, got '" +
                                    stringify(value) + "'");
          }
          DOM.removeAttribute(element, dashCasedAttributeName);
        }
      };
      StringMapWrapper.set(this._attributeSettersCache, attrName, setterFn);
    }

    return setterFn;
  }

  private _classSetterFactory(className: string): Function {
    var setterFn = StringMapWrapper.get(this._classSettersCache, className);
    var dashCasedClassName;
    if (isBlank(setterFn)) {
      dashCasedClassName = camelCaseToDashCase(className);
      setterFn = (element, isAdd) => {
        if (isAdd) {
          DOM.addClass(element, dashCasedClassName);
        } else {
          DOM.removeClass(element, dashCasedClassName);
        }
      };
      StringMapWrapper.set(this._classSettersCache, className, setterFn);
    }

    return setterFn;
  }

  private _styleSetterFactory(styleName: string, styleSuffix: string): Function {
    var cacheKey = styleName + styleSuffix;
    var setterFn = StringMapWrapper.get(this._styleSettersCache, cacheKey);
    var dashCasedStyleName;

    if (isBlank(setterFn)) {
      dashCasedStyleName = camelCaseToDashCase(styleName);
      setterFn = (element, value) => {
        var valAsStr;
        if (isPresent(value)) {
          valAsStr = stringify(value);
          DOM.setStyle(element, dashCasedStyleName, valAsStr + styleSuffix);
        } else {
          DOM.removeStyle(element, dashCasedStyleName);
        }
      };
      StringMapWrapper.set(this._styleSettersCache, cacheKey, setterFn);
    }

    return setterFn;
  }

  private _resolvePropertyName(attrName: string): string {
    var mappedPropName = StringMapWrapper.get(DOM.attrToPropMap, attrName);
    return isPresent(mappedPropName) ? mappedPropName : attrName;
  }
}
