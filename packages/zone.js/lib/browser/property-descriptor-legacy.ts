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
  const {isNode, isMix} = api.getGlobalObjects()!;
  if (isNode && !isMix) {
    return;
  }

  if (!canPatchViaPropertyDescriptor(api, _global)) {
    const supportsWebSocket = typeof WebSocket !== 'undefined';
    // Safari, Android browsers (Jelly Bean)
    patchViaCapturingAllTheEvents(api);
    api.patchClass('XMLHttpRequest');
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
