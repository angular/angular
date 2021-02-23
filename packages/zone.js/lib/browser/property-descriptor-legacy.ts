/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview
 * @suppress {globalThis}
 */

import * as webSocketPatch from './websocket';

export function propertyDescriptorLegacyPatch(api: _ZonePrivate, _global: any) {
  // wrap some native API on `window`
  function patchClass(className: string) {
    const originalInstanceKey = api.symbol('originalInstance');
    const OriginalClass = _global[className];
    if (!OriginalClass) return;
    // keep original class in global
    _global[api.symbol(className)] = OriginalClass;

    _global[className] = function() {
      const a = api.bindArguments(<any>arguments, className);
      switch (a.length) {
        case 0:
          this[originalInstanceKey] = new OriginalClass();
          break;
        case 1:
          this[originalInstanceKey] = new OriginalClass(a[0]);
          break;
        case 2:
          this[originalInstanceKey] = new OriginalClass(a[0], a[1]);
          break;
        case 3:
          this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2]);
          break;
        case 4:
          this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2], a[3]);
          break;
        default:
          throw new Error('Arg list too long.');
      }
    };

    // attach original delegate to patched function
    api.attachOriginToPatched(_global[className], OriginalClass);

    const instance = new OriginalClass(function() {});

    let prop;
    for (prop in instance) {
      // https://bugs.webkit.org/show_bug.cgi?id=44721
      if (className === 'XMLHttpRequest' && prop === 'responseBlob') continue;
      (function(prop) {
        if (typeof instance[prop] === 'function') {
          _global[className].prototype[prop] = function() {
            return this[originalInstanceKey][prop].apply(this[originalInstanceKey], arguments);
          };
        } else {
          api.ObjectDefineProperty(_global[className].prototype, prop, {
            set: function(fn) {
              if (typeof fn === 'function') {
                this[originalInstanceKey][prop] =
                    api.wrapWithCurrentZone(fn, className + '.' + prop);
                // keep callback in wrapped function so we can
                // use it in Function.prototype.toString to return
                // the native one.
                api.attachOriginToPatched(this[originalInstanceKey][prop], fn);
              } else {
                this[originalInstanceKey][prop] = fn;
              }
            },
            get: function() {
              return this[originalInstanceKey][prop];
            }
          });
        }
      }(prop));
    }

    for (prop in OriginalClass) {
      if (prop !== 'prototype' && OriginalClass.hasOwnProperty(prop)) {
        _global[className][prop] = OriginalClass[prop];
      }
    }
  }

  const {isNode, isMix} = api.getGlobalObjects()!;
  if (isNode && !isMix) {
    return;
  }

  if (!canPatchViaPropertyDescriptor(api, _global)) {
    const supportsWebSocket = typeof WebSocket !== 'undefined';
    // Safari, Android browsers (Jelly Bean)
    patchViaCapturingAllTheEvents(api);
    patchClass('XMLHttpRequest');
    if (supportsWebSocket) {
      webSocketPatch.apply(api, _global);
    }
    (Zone as any)[api.symbol('patchEvents')] = true;
  }
}

function canPatchViaPropertyDescriptor(api: _ZonePrivate, _global: any) {
  const {isBrowser, isMix} = api.getGlobalObjects()!;
  if ((isBrowser || isMix) &&
      !api.ObjectGetOwnPropertyDescriptor(HTMLElement.prototype, 'onclick') &&
      typeof Element !== 'undefined') {
    // WebKit https://bugs.webkit.org/show_bug.cgi?id=134364
    // IDL interface attributes are not configurable
    const desc = api.ObjectGetOwnPropertyDescriptor(Element.prototype, 'onclick');
    if (desc && !desc.configurable) return false;
    // try to use onclick to detect whether we can patch via propertyDescriptor
    // because XMLHttpRequest is not available in service worker
    if (desc) {
      api.ObjectDefineProperty(Element.prototype, 'onclick', {
        enumerable: true,
        configurable: true,
        get: function() {
          return true;
        }
      });
      const div = document.createElement('div');
      const result = !!div.onclick;
      api.ObjectDefineProperty(Element.prototype, 'onclick', desc);
      return result;
    }
  }

  const XMLHttpRequest = _global['XMLHttpRequest'];
  if (!XMLHttpRequest) {
    // XMLHttpRequest is not available in service worker
    return false;
  }
  const ON_READY_STATE_CHANGE = 'onreadystatechange';
  const XMLHttpRequestPrototype = XMLHttpRequest.prototype;

  const xhrDesc =
      api.ObjectGetOwnPropertyDescriptor(XMLHttpRequestPrototype, ON_READY_STATE_CHANGE);

  // add enumerable and configurable here because in opera
  // by default XMLHttpRequest.prototype.onreadystatechange is undefined
  // without adding enumerable and configurable will cause onreadystatechange
  // non-configurable
  // and if XMLHttpRequest.prototype.onreadystatechange is undefined,
  // we should set a real desc instead a fake one
  if (xhrDesc) {
    api.ObjectDefineProperty(XMLHttpRequestPrototype, ON_READY_STATE_CHANGE, {
      enumerable: true,
      configurable: true,
      get: function() {
        return true;
      }
    });
    const req = new XMLHttpRequest();
    const result = !!req.onreadystatechange;
    // restore original desc
    api.ObjectDefineProperty(XMLHttpRequestPrototype, ON_READY_STATE_CHANGE, xhrDesc || {});
    return result;
  } else {
    const SYMBOL_FAKE_ONREADYSTATECHANGE = api.symbol('fake');
    api.ObjectDefineProperty(XMLHttpRequestPrototype, ON_READY_STATE_CHANGE, {
      enumerable: true,
      configurable: true,
      get: function() {
        return this[SYMBOL_FAKE_ONREADYSTATECHANGE];
      },
      set: function(value) {
        this[SYMBOL_FAKE_ONREADYSTATECHANGE] = value;
      }
    });
    const req = new XMLHttpRequest();
    const detectFunc = () => {};
    req.onreadystatechange = detectFunc;
    const result = (req as any)[SYMBOL_FAKE_ONREADYSTATECHANGE] === detectFunc;
    req.onreadystatechange = null as any;
    return result;
  }
}

// Whenever any eventListener fires, we check the eventListener target and all parents
// for `onwhatever` properties and replace them with zone-bound functions
// - Chrome (for now)
function patchViaCapturingAllTheEvents(api: _ZonePrivate) {
  const {eventNames} = api.getGlobalObjects()!;
  const unboundKey = api.symbol('unbound');
  for (let i = 0; i < eventNames.length; i++) {
    const property = eventNames[i];
    const onproperty = 'on' + property;
    self.addEventListener(property, function(event) {
      let elt: any = <Node>event.target, bound, source;
      if (elt) {
        source = elt.constructor['name'] + '.' + onproperty;
      } else {
        source = 'unknown.' + onproperty;
      }
      while (elt) {
        if (elt[onproperty] && !elt[onproperty][unboundKey]) {
          bound = api.wrapWithCurrentZone(elt[onproperty], source);
          bound[unboundKey] = elt[onproperty];
          elt[onproperty] = bound;
        }
        elt = elt.parentElement;
      }
    }, true);
  }
}
