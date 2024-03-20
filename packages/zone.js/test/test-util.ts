/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * Usage:
 *
 *  function supportsOnClick() {
 *    const div = document.createElement('div');
 *    const clickPropDesc = Object.getOwnPropertyDescriptor(div, 'onclick');
 *    return !(EventTarget &&
 *             div instanceof EventTarget &&
 *             clickPropDesc && clickPropDesc.value === null);
 *  }
 *  (<any>supportsOnClick).message = 'Supports Element#onclick patching';
 *
 *
 *  ifEnvSupports(supportsOnClick, function() { ... });
 */
import {isNode, zoneSymbol} from '../lib/common/utils';

// Re-export for convenience.
export {zoneSymbol};

declare const global: any;
export function ifEnvSupports(test: any, block: Function, otherwise?: Function): () => void {
  return _ifEnvSupports(test, block, otherwise);
}

export function ifEnvSupportsWithDone(
    test: any, block: Function, otherwise?: Function): (done: Function) => void {
  return _ifEnvSupports(test, block, otherwise, true);
}

function _ifEnvSupports(test: any, block: Function, otherwise?: Function, withDone = false) {
  if (withDone) {
    return function(done?: Function) {
      _runTest(test, block, otherwise, done);
    };
  } else {
    return function() {
      _runTest(test, block, otherwise, undefined);
    };
  }
}

function _runTest(test: any, block: Function, otherwise?: Function, done?: Function) {
  const message = (test.message || test.name || test);
  if (typeof test === 'string' ? !!global[test] : test()) {
    if (done) {
      block(done);
    } else {
      block();
    }
  } else {
    console.log('WARNING: skipping ' + message + ' tests (missing this API)');
    otherwise?.();
    done?.();
  }
}

export function supportPatchXHROnProperty() {
  let desc = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'onload');
  if (!desc && (window as any)['XMLHttpRequestEventTarget']) {
    desc = Object.getOwnPropertyDescriptor(global['XMLHttpRequestEventTarget'].prototype, 'onload');
  }
  if (!desc || !desc.configurable) {
    return false;
  }
  return true;
}

let supportSetErrorStack = true;

export function isSupportSetErrorStack() {
  try {
    throw new Error('test');
  } catch (err: any) {
    try {
      err.stack = 'new stack';
      supportSetErrorStack = err.stack === 'new stack';
    } catch (error) {
      supportSetErrorStack = false;
    }
  }
  return supportSetErrorStack;
}

(isSupportSetErrorStack as any).message = 'supportSetErrorStack';

export function asyncTest(this: unknown, testFn: Function, zone: Zone = Zone.current) {
  const AsyncTestZoneSpec = (Zone as any)['AsyncTestZoneSpec'];
  return (done: Function) => {
    let asyncTestZone: Zone = zone.fork(new AsyncTestZoneSpec(() => {}, (error: Error) => {
      fail(error);
    }, 'asyncTest'));
    asyncTestZone.run(testFn, this, [done]);
  };
}

export function getIEVersion() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('msie') != -1) {
    return parseInt(userAgent.split('msie')[1]);
  }
  return null;
}

export function isFirefox() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('firefox') != -1) {
    return true;
  }
  return false;
}

export function isSafari() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('safari') != -1) {
    return true;
  }
  return false;
}

export function isEdge() {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf('edge') !== -1;
}

export function getEdgeVersion() {
  const ua = navigator.userAgent.toLowerCase();
  const edge = ua.indexOf('edge/');
  if (edge === -1) {
    return -1;
  }
  return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
}

export function isPhantomJS() {
  if (isNode) {
    return false;
  }
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('phantomjs') !== -1;
}
