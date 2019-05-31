/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview
 * @suppress {globalThis}
 */

import {isBrowser, isIE, isMix, isNode, ObjectGetPrototypeOf, patchOnProperties} from '../common/utils';

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
  'wheel'
];
const documentEventNames = [
  'afterscriptexecute', 'beforescriptexecute', 'DOMContentLoaded', 'freeze', 'fullscreenchange',
  'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange', 'fullscreenerror',
  'mozfullscreenerror', 'webkitfullscreenerror', 'msfullscreenerror', 'readystatechange',
  'visibilitychange', 'resume'
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
  'vrdisplyconnected',
  'vrdisplaydisconnected',
  'vrdisplaypresentchange'
];
const htmlElementEventNames = [
  'beforecopy', 'beforecut', 'beforepaste', 'copy', 'cut', 'paste', 'dragstart', 'loadend',
  'animationstart', 'search', 'transitionrun', 'transitionstart', 'webkitanimationend',
  'webkitanimationiteration', 'webkitanimationstart', 'webkittransitionend'
];
const mediaElementEventNames =
    ['encrypted', 'waitingforkey', 'msneedkey', 'mozinterruptbegin', 'mozinterruptend'];
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
  'storagecommit'
];
const webglEventNames = ['webglcontextrestored', 'webglcontextlost', 'webglcontextcreationerror'];
const formEventNames = ['autocomplete', 'autocompleteerror'];
const detailEventNames = ['toggle'];
const frameEventNames = ['load'];
const frameSetEventNames = ['blur', 'error', 'focus', 'load', 'resize', 'scroll', 'messageerror'];
const marqueeEventNames = ['bounce', 'finish', 'start'];

const XMLHttpRequestEventNames = [
  'loadstart', 'progress', 'abort', 'error', 'load', 'progress', 'timeout', 'loadend',
  'readystatechange'
];
const IDBIndexEventNames =
    ['upgradeneeded', 'complete', 'abort', 'success', 'error', 'blocked', 'versionchange', 'close'];
const websocketEventNames = ['close', 'error', 'open', 'message'];
const workerEventNames = ['error', 'message'];

export const eventNames = globalEventHandlersEventNames.concat(
    webglEventNames, formEventNames, detailEventNames, documentEventNames, windowEventNames,
    htmlElementEventNames, ieElementEventNames);

export interface IgnoreProperty {
  target: any;
  ignoreProperties: string[];
}

export function filterProperties(
    target: any, onProperties: string[], ignoreProperties: IgnoreProperty[]): string[] {
  if (!ignoreProperties || ignoreProperties.length === 0) {
    return onProperties;
  }

  const tip: IgnoreProperty[] = ignoreProperties.filter(ip => ip.target === target);
  if (!tip || tip.length === 0) {
    return onProperties;
  }

  const targetIgnoreProperties: string[] = tip[0].ignoreProperties;
  return onProperties.filter(op => targetIgnoreProperties.indexOf(op) === -1);
}

export function patchFilteredProperties(
    target: any, onProperties: string[], ignoreProperties: IgnoreProperty[], prototype?: any) {
  // check whether target is available, sometimes target will be undefined
  // because different browser or some 3rd party plugin.
  if (!target) {
    return;
  }
  const filteredProperties: string[] = filterProperties(target, onProperties, ignoreProperties);
  patchOnProperties(target, filteredProperties, prototype);
}

export function propertyDescriptorPatch(api: _ZonePrivate, _global: any) {
  if (isNode && !isMix) {
    return;
  }
  if ((Zone as any)[api.symbol('patchEvents')]) {
    // events are already been patched by legacy patch.
    return;
  }
  const supportsWebSocket = typeof WebSocket !== 'undefined';
  const ignoreProperties: IgnoreProperty[] = _global['__Zone_ignore_on_properties'];
  // for browsers that we can patch the descriptor:  Chrome & Firefox
  if (isBrowser) {
    const internalWindow: any = window;
    const ignoreErrorProperties =
        isIE ? [{target: internalWindow, ignoreProperties: ['error']}] : [];
    // in IE/Edge, onProp not exist in window object, but in WindowPrototype
    // so we need to pass WindowPrototype to check onProp exist or not
    patchFilteredProperties(
        internalWindow, eventNames.concat(['messageerror']),
        ignoreProperties ? ignoreProperties.concat(ignoreErrorProperties) : ignoreProperties,
        ObjectGetPrototypeOf(internalWindow));
    patchFilteredProperties(Document.prototype, eventNames, ignoreProperties);

    if (typeof internalWindow['SVGElement'] !== 'undefined') {
      patchFilteredProperties(internalWindow['SVGElement'].prototype, eventNames, ignoreProperties);
    }
    patchFilteredProperties(Element.prototype, eventNames, ignoreProperties);
    patchFilteredProperties(HTMLElement.prototype, eventNames, ignoreProperties);
    patchFilteredProperties(HTMLMediaElement.prototype, mediaElementEventNames, ignoreProperties);
    patchFilteredProperties(
        HTMLFrameSetElement.prototype, windowEventNames.concat(frameSetEventNames),
        ignoreProperties);
    patchFilteredProperties(
        HTMLBodyElement.prototype, windowEventNames.concat(frameSetEventNames), ignoreProperties);
    patchFilteredProperties(HTMLFrameElement.prototype, frameEventNames, ignoreProperties);
    patchFilteredProperties(HTMLIFrameElement.prototype, frameEventNames, ignoreProperties);

    const HTMLMarqueeElement = internalWindow['HTMLMarqueeElement'];
    if (HTMLMarqueeElement) {
      patchFilteredProperties(HTMLMarqueeElement.prototype, marqueeEventNames, ignoreProperties);
    }
    const Worker = internalWindow['Worker'];
    if (Worker) {
      patchFilteredProperties(Worker.prototype, workerEventNames, ignoreProperties);
    }
  }
  const XMLHttpRequest = _global['XMLHttpRequest'];
  if (XMLHttpRequest) {
    // XMLHttpRequest is not available in ServiceWorker, so we need to check here
    patchFilteredProperties(XMLHttpRequest.prototype, XMLHttpRequestEventNames, ignoreProperties);
  }
  const XMLHttpRequestEventTarget = _global['XMLHttpRequestEventTarget'];
  if (XMLHttpRequestEventTarget) {
    patchFilteredProperties(
        XMLHttpRequestEventTarget && XMLHttpRequestEventTarget.prototype, XMLHttpRequestEventNames,
        ignoreProperties);
  }
  if (typeof IDBIndex !== 'undefined') {
    patchFilteredProperties(IDBIndex.prototype, IDBIndexEventNames, ignoreProperties);
    patchFilteredProperties(IDBRequest.prototype, IDBIndexEventNames, ignoreProperties);
    patchFilteredProperties(IDBOpenDBRequest.prototype, IDBIndexEventNames, ignoreProperties);
    patchFilteredProperties(IDBDatabase.prototype, IDBIndexEventNames, ignoreProperties);
    patchFilteredProperties(IDBTransaction.prototype, IDBIndexEventNames, ignoreProperties);
    patchFilteredProperties(IDBCursor.prototype, IDBIndexEventNames, ignoreProperties);
  }
  if (supportsWebSocket) {
    patchFilteredProperties(WebSocket.prototype, websocketEventNames, ignoreProperties);
  }
}
