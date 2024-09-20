/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
  if (
    (isBrowser || isMix) &&
    !api.ObjectGetOwnPropertyDescriptor(HTMLElement.prototype, 'onclick') &&
    typeof Element !== 'undefined'
  ) {
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
        get: function () {
          return true;
        },
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

  const xhrDesc = api.ObjectGetOwnPropertyDescriptor(
    XMLHttpRequestPrototype,
    ON_READY_STATE_CHANGE,
  );

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
      get: function () {
        return true;
      },
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
      get: function () {
        return this[SYMBOL_FAKE_ONREADYSTATECHANGE];
      },
      set: function (value) {
        this[SYMBOL_FAKE_ONREADYSTATECHANGE] = value;
      },
    });
    const req = new XMLHttpRequest();
    const detectFunc = () => {};
    req.onreadystatechange = detectFunc;
    const result = (req as any)[SYMBOL_FAKE_ONREADYSTATECHANGE] === detectFunc;
    req.onreadystatechange = null as any;
    return result;
  }
}

const globalEventHandlersEventNames = [
  'abort',
  'animationcancel',
  'animationend',
  'animationiteration',
  'auxclick',
  'beforeinput',
  'blur',
  'cancel',
  'canplay',
  'canplaythrough',
  'change',
  'compositionstart',
  'compositionupdate',
  'compositionend',
  'cuechange',
  'click',
  'close',
  'contextmenu',
  'curechange',
  'dblclick',
  'drag',
  'dragend',
  'dragenter',
  'dragexit',
  'dragleave',
  'dragover',
  'drop',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'focus',
  'focusin',
  'focusout',
  'gotpointercapture',
  'input',
  'invalid',
  'keydown',
  'keypress',
  'keyup',
  'load',
  'loadstart',
  'loadeddata',
  'loadedmetadata',
  'lostpointercapture',
  'mousedown',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'mousewheel',
  'orientationchange',
  'pause',
  'play',
  'playing',
  'pointercancel',
  'pointerdown',
  'pointerenter',
  'pointerleave',
  'pointerlockchange',
  'mozpointerlockchange',
  'webkitpointerlockerchange',
  'pointerlockerror',
  'mozpointerlockerror',
  'webkitpointerlockerror',
  'pointermove',
  'pointout',
  'pointerover',
  'pointerup',
  'progress',
  'ratechange',
  'reset',
  'resize',
  'scroll',
  'seeked',
  'seeking',
  'select',
  'selectionchange',
  'selectstart',
  'show',
  'sort',
  'stalled',
  'submit',
  'suspend',
  'timeupdate',
  'volumechange',
  'touchcancel',
  'touchmove',
  'touchstart',
  'touchend',
  'transitioncancel',
  'transitionend',
  'waiting',
  'wheel',
];
const documentEventNames = [
  'afterscriptexecute',
  'beforescriptexecute',
  'DOMContentLoaded',
  'freeze',
  'fullscreenchange',
  'mozfullscreenchange',
  'webkitfullscreenchange',
  'msfullscreenchange',
  'fullscreenerror',
  'mozfullscreenerror',
  'webkitfullscreenerror',
  'msfullscreenerror',
  'readystatechange',
  'visibilitychange',
  'resume',
];
const windowEventNames = [
  'absolutedeviceorientation',
  'afterinput',
  'afterprint',
  'appinstalled',
  'beforeinstallprompt',
  'beforeprint',
  'beforeunload',
  'devicelight',
  'devicemotion',
  'deviceorientation',
  'deviceorientationabsolute',
  'deviceproximity',
  'hashchange',
  'languagechange',
  'message',
  'mozbeforepaint',
  'offline',
  'online',
  'paint',
  'pageshow',
  'pagehide',
  'popstate',
  'rejectionhandled',
  'storage',
  'unhandledrejection',
  'unload',
  'userproximity',
  'vrdisplayconnected',
  'vrdisplaydisconnected',
  'vrdisplaypresentchange',
];
const htmlElementEventNames = [
  'beforecopy',
  'beforecut',
  'beforepaste',
  'copy',
  'cut',
  'paste',
  'dragstart',
  'loadend',
  'animationstart',
  'search',
  'transitionrun',
  'transitionstart',
  'webkitanimationend',
  'webkitanimationiteration',
  'webkitanimationstart',
  'webkittransitionend',
];
const mediaElementEventNames = [
  'encrypted',
  'waitingforkey',
  'msneedkey',
  'mozinterruptbegin',
  'mozinterruptend',
];
const ieElementEventNames = [
  'activate',
  'afterupdate',
  'ariarequest',
  'beforeactivate',
  'beforedeactivate',
  'beforeeditfocus',
  'beforeupdate',
  'cellchange',
  'controlselect',
  'dataavailable',
  'datasetchanged',
  'datasetcomplete',
  'errorupdate',
  'filterchange',
  'layoutcomplete',
  'losecapture',
  'move',
  'moveend',
  'movestart',
  'propertychange',
  'resizeend',
  'resizestart',
  'rowenter',
  'rowexit',
  'rowsdelete',
  'rowsinserted',
  'command',
  'compassneedscalibration',
  'deactivate',
  'help',
  'mscontentzoom',
  'msmanipulationstatechanged',
  'msgesturechange',
  'msgesturedoubletap',
  'msgestureend',
  'msgesturehold',
  'msgesturestart',
  'msgesturetap',
  'msgotpointercapture',
  'msinertiastart',
  'mslostpointercapture',
  'mspointercancel',
  'mspointerdown',
  'mspointerenter',
  'mspointerhover',
  'mspointerleave',
  'mspointermove',
  'mspointerout',
  'mspointerover',
  'mspointerup',
  'pointerout',
  'mssitemodejumplistitemremoved',
  'msthumbnailclick',
  'stop',
  'storagecommit',
];
const webglEventNames = ['webglcontextrestored', 'webglcontextlost', 'webglcontextcreationerror'];
const formEventNames = ['autocomplete', 'autocompleteerror'];
const detailEventNames = ['toggle'];

const eventNames = [
  ...globalEventHandlersEventNames,
  ...webglEventNames,
  ...formEventNames,
  ...detailEventNames,
  ...documentEventNames,
  ...windowEventNames,
  ...htmlElementEventNames,
  ...ieElementEventNames,
];

// Whenever any eventListener fires, we check the eventListener target and all parents
// for `onwhatever` properties and replace them with zone-bound functions
// - Chrome (for now)
function patchViaCapturingAllTheEvents(api: _ZonePrivate) {
  const unboundKey = api.symbol('unbound');
  for (let i = 0; i < eventNames.length; i++) {
    const property = eventNames[i];
    const onproperty = 'on' + property;
    self.addEventListener(
      property,
      function (event) {
        let elt: any = <Node>event.target,
          bound,
          source;
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
      },
      true,
    );
  }
}
