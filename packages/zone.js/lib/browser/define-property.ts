/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * This is necessary for Chrome and Chrome mobile, to enable
 * things like redefining `createdCallback` on an element.
 */

let zoneSymbol: any;
let _defineProperty: any;
let _getOwnPropertyDescriptor: any;
let _create: any;
let unconfigurablesKey: any;

export function propertyPatch() {
  zoneSymbol = Zone.__symbol__;
  _defineProperty = (Object as any)[zoneSymbol('defineProperty')] = Object.defineProperty;
  _getOwnPropertyDescriptor = (Object as any)[zoneSymbol('getOwnPropertyDescriptor')] =
      Object.getOwnPropertyDescriptor;
  _create = Object.create;
  unconfigurablesKey = zoneSymbol('unconfigurables');
  Object.defineProperty = function(obj: any, prop: string, desc: any) {
    if (isUnconfigurable(obj, prop)) {
      throw new TypeError('Cannot assign to read only property \'' + prop + '\' of ' + obj);
    }
    const originalConfigurableFlag = desc.configurable;
    if (prop !== 'prototype') {
      desc = rewriteDescriptor(obj, prop, desc);
    }
    return _tryDefineProperty(obj, prop, desc, originalConfigurableFlag);
  };

  Object.defineProperties = function(obj, props) {
    Object.keys(props).forEach(function(prop) {
      Object.defineProperty(obj, prop, props[prop]);
    });
    return obj;
  };

  Object.create = <any>function(proto: any, propertiesObject: any) {
    if (typeof propertiesObject === 'object' && !Object.isFrozen(propertiesObject)) {
      Object.keys(propertiesObject).forEach(function(prop) {
        propertiesObject[prop] = rewriteDescriptor(proto, prop, propertiesObject[prop]);
      });
    }
    return _create(proto, propertiesObject);
  };

  Object.getOwnPropertyDescriptor = function(obj, prop) {
    const desc = _getOwnPropertyDescriptor(obj, prop);
    if (desc && isUnconfigurable(obj, prop)) {
      desc.configurable = false;
    }
    return desc;
  };
}

export function _redefineProperty(obj: any, prop: string, desc: any) {
  const originalConfigurableFlag = desc.configurable;
  desc = rewriteDescriptor(obj, prop, desc);
  return _tryDefineProperty(obj, prop, desc, originalConfigurableFlag);
}

function isUnconfigurable(obj: any, prop: any) {
  return obj && obj[unconfigurablesKey] && obj[unconfigurablesKey][prop];
}

function rewriteDescriptor(obj: any, prop: string, desc: any) {
  // issue-927, if the desc is frozen, don't try to change the desc
  if (!Object.isFrozen(desc)) {
    desc.configurable = true;
  }
  if (!desc.configurable) {
    // issue-927, if the obj is frozen, don't try to set the desc to obj
    if (!obj[unconfigurablesKey] && !Object.isFrozen(obj)) {
      _defineProperty(obj, unconfigurablesKey, {writable: true, value: {}});
    }
    if (obj[unconfigurablesKey]) {
      obj[unconfigurablesKey][prop] = true;
    }
  }
  return desc;
}

function _tryDefineProperty(obj: any, prop: string, desc: any, originalConfigurableFlag: any) {
  try {
    return _defineProperty(obj, prop, desc);
  } catch (error) {
    if (desc.configurable) {
      // In case of errors, when the configurable flag was likely set by rewriteDescriptor(), let's
      // retry with the original flag value
      if (typeof originalConfigurableFlag == 'undefined') {
        delete desc.configurable;
      } else {
        desc.configurable = originalConfigurableFlag;
      }
      try {
        return _defineProperty(obj, prop, desc);
      } catch (error) {
        let swallowError = false;
        if (prop === 'createdCallback' || prop === 'attachedCallback' ||
            prop === 'detachedCallback' || prop === 'attributeChangedCallback') {
          // We only swallow the error in registerElement patch
          // this is the work around since some applications
          // fail if we throw the error
          swallowError = true;
        }
        if (!swallowError) {
          throw error;
        }
        // TODO: @JiaLiPassion, Some application such as `registerElement` patch
        // still need to swallow the error, in the future after these applications
        // are updated, the following logic can be removed.
        let descJson: string|null = null;
        try {
          descJson = JSON.stringify(desc);
        } catch (error) {
          descJson = desc.toString();
        }
        console.log(`Attempting to configure '${prop}' with descriptor '${descJson}' on object '${
            obj}' and got error, giving up: ${error}`);
      }
    } else {
      throw error;
    }
  }
}
