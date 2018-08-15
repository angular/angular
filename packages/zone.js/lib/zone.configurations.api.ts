/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Interface of `zone.js` configurations.
 *
 * You can define the following configurations on the `window/global` object before
 * importing `zone.js` to change `zone.js` default behaviors.
 */
interface ZoneGlobalConfigurations {
  /**
   * Disable the monkey patch of the `Node.js` `EventEmitter` API.
   *
   * By default, `zone.js` monkey patches the `Node.js` `EventEmitter` APIs to make asynchronous
   * callbacks of those APIs in the same zone when scheduled.
   *
   * Consider the following example:
   *
   * ```
   * const EventEmitter = require('events');
   * class MyEmitter extends EventEmitter {}
   * const myEmitter = new MyEmitter();
   *
   * const zone = Zone.current.fork({name: 'myZone'});
   * zone.run(() => {
   *   myEmitter.on('event', () => {
   *     console.log('an event occurs in the zone', Zone.current.name);
   *     // the callback runs in the zone when it is scheduled,
   *     // so the output is 'an event occurs in the zone myZone'.
   *   });
   * });
   * myEmitter.emit('event');
   * ```
   *
   * If you set `__Zone_disable_EventEmitter = true` before importing `zone.js`,
   * `zone.js` does not monkey patch the `EventEmitter` APIs and the above code
   * outputs 'an event occurred <root>'.
   */
  __Zone_disable_EventEmitter?: boolean;

  /**
   * Disable the monkey patch of the `Node.js` `fs` API.
   *
   * By default, `zone.js` monkey patches `Node.js` `fs` APIs to make asynchronous callbacks of
   * those APIs in the same zone when scheduled.
   *
   * Consider the following example:
   *
   * ```
   * const fs = require('fs');
   *
   * const zone = Zone.current.fork({name: 'myZone'});
   * zone.run(() => {
   *   fs.stat('/tmp/world', (err, stats) => {
   *     console.log('fs.stats() callback is invoked in the zone', Zone.current.name);
   *     // since the callback of the `fs.stat()` runs in the same zone
   *     // when it is called, so the output is 'fs.stats() callback is invoked in the zone myZone'.
   *   });
   * });
   * ```
   *
   * If you set `__Zone_disable_fs = true` before importing `zone.js`,
   * `zone.js` does not monkey patch the `fs` API and the above code
   * outputs 'get stats occurred <root>'.
   */
  __Zone_disable_fs?: boolean;

  /**
   * Disable the monkey patch of the `Node.js` `timer` API.
   *
   * By default, `zone.js` monkey patches the `Node.js` `timer` APIs to make asynchronous
   * callbacks of those APIs in the same zone when scheduled.
   *
   * Consider the following example:
   *
   * ```
   * const zone = Zone.current.fork({name: 'myZone'});
   * zone.run(() => {
   *   setTimeout(() => {
   *     console.log('setTimeout() callback is invoked in the zone', Zone.current.name);
   *     // since the callback of `setTimeout()` runs in the same zone
   *     // when it is scheduled, so the output is 'setTimeout() callback is invoked in the zone
   *     // myZone'.
   *   });
   * });
   * ```
   *
   * If you set `__Zone_disable_timers = true` before importing `zone.js`,
   * `zone.js` does not monkey patch the `timer` APIs and the above code
   * outputs 'timeout <root>'.
   */
  __Zone_disable_node_timers?: boolean;

  /**
   * Disable the monkey patch of the `Node.js` `process.nextTick()` API.
   *
   * By default, `zone.js` monkey patches the `Node.js` `process.nextTick()` API to make the
   * callback in the same zone when calling `process.nextTick()`.
   *
   * Consider the following example:
   *
   * ```
   * const zone = Zone.current.fork({name: 'myZone'});
   * zone.run(() => {
   *   process.nextTick(() => {
   *     console.log('process.nextTick() callback is invoked in the zone', Zone.current.name);
   *     // since the callback of `process.nextTick()` runs in the same zone
   *     // when it is scheduled, so the output is 'process.nextTick() callback is invoked in the
   *     // zone myZone'.
   *   });
   * });
   * ```
   *
   * If you set `__Zone_disable_nextTick = true` before importing `zone.js`,
   * `zone.js` does not monkey patch the `process.nextTick()` API and the above code
   * outputs 'nextTick <root>'.
   */
  __Zone_disable_nextTick?: boolean;

  /**
   * Disable the monkey patch of the `Node.js` `crypto` API.
   *
   * By default, `zone.js` monkey patches the `Node.js` `crypto` APIs to make asynchronous callbacks
   * of those APIs in the same zone when called.
   *
   * Consider the following example:
   *
   * ```
   * const crypto = require('crypto');
   *
   * const zone = Zone.current.fork({name: 'myZone'});
   * zone.run(() => {
   *   crypto.randomBytes(() => {
   *     console.log('crypto.randomBytes() callback is invoked in the zone', Zone.current.name);
   *     // since the callback of `crypto.randomBytes()` runs in the same zone
   *     // when it is called, so the output is 'crypto.randomBytes() callback is invoked in the
   *     // zone myZone'.
   *   });
   * });
   * ```
   *
   * If you set `__Zone_disable_crypto = true` before importing `zone.js`,
   * `zone.js` does not monkey patch the `crypto` API and the above code
   * outputs 'crypto <root>'.
   */
  __Zone_disable_crypto?: boolean;

  /**
   * Disable the monkey patch of the `Object.defineProperty()` API.
   *
   * Note: This configuration is available only in the legacy bundle (dist/zone.js). This module is
   * not available in the evergreen bundle (zone-evergreen.js).
   *
   * In the legacy browser, the default behavior of `zone.js` is to monkey patch
   * `Object.defineProperty()` and `Object.create()` to try to ensure PropertyDescriptor parameter's
   * configurable property to be true. This patch is only needed in some old mobile browsers.
   *
   * If you set `__Zone_disable_defineProperty = true` before importing `zone.js`,
   * `zone.js` does not monkey patch the `Object.defineProperty()` API and does not
   * modify desc.configurable to true.
   *
   */
  __Zone_disable_defineProperty?: boolean;

  /**
   * Disable the monkey patch of the browser `registerElement()` API.
   *
   * NOTE: This configuration is only available in the legacy bundle (dist/zone.js), this
   * module is not available in the evergreen bundle (zone-evergreen.js).
   *
   * In the legacy browser, the default behavior of `zone.js` is to monkey patch the
   * `registerElement()` API to make asynchronous callbacks of the API in the same zone when
   * `registerElement()` is called.
   *
   * Consider the following example:
   *
   * ```
   * const proto = Object.create(HTMLElement.prototype);
   * proto.createdCallback = function() {
   *   console.log('createdCallback is invoked in the zone', Zone.current.name);
   * };
   * proto.attachedCallback = function() {
   *   console.log('attachedCallback is invoked in the zone', Zone.current.name);
   * };
   * proto.detachedCallback = function() {
   *   console.log('detachedCallback is invoked in the zone', Zone.current.name);
   * };
   * proto.attributeChangedCallback = function() {
   *   console.log('attributeChangedCallback is invoked in the zone', Zone.current.name);
   * };
   *
   * const zone = Zone.current.fork({name: 'myZone'});
   * zone.run(() => {
   *   document.registerElement('x-elem', {prototype: proto});
   * });
   * ```
   *
   * When these callbacks are invoked, those callbacks will be in the zone when
   * `registerElement()` is called.
   *
   * If you set `__Zone_disable_registerElement = true` before importing `zone.js`,
   * `zone.js` does not monkey patch `registerElement()` API and the above code
   * outputs '<root>'.
   */
  __Zone_disable_registerElement?: boolean;

  /**
   * Disable the monkey patch of the browser legacy `EventTarget` API.
   *
   * NOTE: This configuration is only available in the legacy bundle (dist/zone.js), this module
   * is not available in the evergreen bundle (zone-evergreen.js).
   *
   * In some old browsers, the `EventTarget` is not available, so `zone.js` cannot directly monkey
   * patch the `EventTarget`. Instead, `zone.js` patches all known HTML elements' prototypes (such
   * as `HtmlDivElement`). The callback of the `addEventListener()` will be in the same zone when
   * the `addEventListener()` is called.
   *
   * Consider the following example:
   *
   * ```
   * const zone = Zone.current.fork({name: 'myZone'});
   * zone.run(() => {
   *   div.addEventListener('click', () => {
   *     console.log('div click event listener is invoked in the zone', Zone.current.name);
   *     // the output is 'div click event listener is invoked in the zone myZone'.
   *   });
   * });
   * ```
   *
   * If you set `__Zone_disable_EventTargetLegacy = true` before importing `zone.js`
   * In some old browsers, where `EventTarget` is not available, if you set
   * `__Zone_disable_EventTargetLegacy = true` before importing `zone.js`, `zone.js` does not monkey
   * patch all HTML element APIs and the above code outputs 'clicked <root>'.
   */
  __Zone_disable_EventTargetLegacy?: boolean;

  /**
   * Disable the monkey patch of the browser `timer` APIs.
   *
   * By default, `zone.js` monkey patches browser timer
   * APIs (`setTimeout()`/`setInterval()`/`setImmediate()`) to make asynchronous callbacks of those
   * APIs in the same zone when scheduled.
   *
   * Consider the following example:
   *
   * ```
   * const zone = Zone.current.fork({name: 'myZone'});
   * zone.run(() => {
   *   setTimeout(() => {
   *     console.log('setTimeout() callback is invoked in the zone', Zone.current.name);
   *     // since the callback of `setTimeout()` runs in the same zone
   *     // when it is scheduled, so the output is 'setTimeout() callback is invoked in the zone
   *     // myZone'.
   *   });
   * });
   * ```
   *
   * If you set `__Zone_disable_timers = true` before importing `zone.js`,
   * `zone.js` does not monkey patch `timer` API and the above code
   * outputs 'timeout <root>'.
   *
   */
  __Zone_disable_timers?: boolean;

  /**
   * Disable the monkey patch of the browser `requestAnimationFrame()` API.
   *
   * By default, `zone.js` monkey patches the browser `requestAnimationFrame()` API
   * to make the asynchronous callback of the `requestAnimationFrame()` in the same zone when
   * scheduled.
   *
   * Consider the following example:
   *
   * ```
   * const zone = Zone.current.fork({name: 'myZone'});
   * zone.run(() => {
   *   requestAnimationFrame(() => {
   *     console.log('requestAnimationFrame() callback is invoked in the zone', Zone.current.name);
   *     // since the callback of `requestAnimationFrame()` will be in the same zone
   *     // when it is scheduled, so the output will be 'requestAnimationFrame() callback is invoked
   *     // in the zone myZone'
   *   });
   * });
   * ```
   *
   * If you set `__Zone_disable_requestAnimationFrame = true` before importing `zone.js`,
   * `zone.js` does not monkey patch the `requestAnimationFrame()` API and the above code
   * outputs 'raf <root>'.
   */
  __Zone_disable_requestAnimationFrame?: boolean;

  /**
   *
   * Disable the monkey patch of the browser blocking APIs(`alert()`/`prompt()`/`confirm()`).
   */
  __Zone_disable_blocking?: boolean;

  /**
   * Disable the monkey patch of the browser `EventTarget` APIs.
   *
   * By default, `zone.js` monkey patches EventTarget APIs. The callbacks of the
   * `addEventListener()` run in the same zone when the `addEventListener()` is called.
   *
   * Consider the following example:
   *
   * ```
   * const zone = Zone.current.fork({name: 'myZone'});
   * zone.run(() => {
   *   div.addEventListener('click', () => {
   *     console.log('div event listener is invoked in the zone', Zone.current.name);
   *     // the output is 'div event listener is invoked in the zone myZone'.
   *   });
   * });
   * ```
   *
   * If you set `__Zone_disable_EventTarget = true` before importing `zone.js`,
   * `zone.js` does not monkey patch EventTarget API and the above code
   * outputs 'clicked <root>'.
   *
   */
  __Zone_disable_EventTarget?: boolean;

  /**
   * Disable the monkey patch of the browser `FileReader` APIs.
   */
  __Zone_disable_FileReader?: boolean;

  /**
   * Disable the monkey patch of the browser `MutationObserver` APIs.
   */
  __Zone_disable_MutationObserver?: boolean;

  /**
   * Disable the monkey patch of the browser `IntersectionObserver` APIs.
   */
  __Zone_disable_IntersectionObserver?: boolean;

  /**
   * Disable the monkey patch of the browser onProperty APIs(such as onclick).
   *
   * By default, `zone.js` monkey patches onXXX properties (such as onclick). The callbacks of onXXX
   * properties run in the same zone when the onXXX properties is set.
   *
   * Consider the following example:
   *
   * ```
   * const zone = Zone.current.fork({name: 'myZone'});
   * zone.run(() => {
   *   div.onclick = () => {
   *     console.log('div click event listener is invoked in the zone', Zone.current.name);
   *     // the output will be 'div click event listener is invoked in the zone myZone'
   *   }
   * });
   * ```
   *
   * If you set `__Zone_disable_on_property = true` before importing `zone.js`,
   * `zone.js` does not monkey patch onXXX properties and the above code
   * outputs 'clicked <root>'.
   *
   */
  __Zone_disable_on_property?: boolean;

  /**
   * Disable the monkey patch of the browser `customElements` APIs.
   *
   * By default, `zone.js` monkey patches `customElements` APIs to make callbacks run in the
   * same zone when the `customElements.define()` is called.
   *
   * Consider the following example:
   *
   * ```
   * class TestCustomElement extends HTMLElement {
   *   constructor() { super(); }
   *   connectedCallback() {}
   *   disconnectedCallback() {}
   *   attributeChangedCallback(attrName, oldVal, newVal) {}
   *   adoptedCallback() {}
   * }
   *
   * const zone = Zone.fork({name: 'myZone'});
   * zone.run(() => {
   *   customElements.define('x-elem', TestCustomElement);
   * });
   * ```
   *
   * All those callbacks defined in TestCustomElement runs in the zone when
   * the `customElements.define()` is called.
   *
   * If you set `__Zone_disable_customElements = true` before importing `zone.js`,
   * `zone.js` does not monkey patch `customElements` APIs and the above code
   * runs inside <root> zone.
   */
  __Zone_disable_customElements?: boolean;

  /**
   * Disable the monkey patch of the browser `XMLHttpRequest` APIs.
   *
   * By default, `zone.js` monkey patches `XMLHttpRequest` APIs to make XMLHttpRequest act
   * as macroTask.
   *
   * Consider the following example:
   *
   * ```
   * const zone = Zone.current.fork({
   *   name: 'myZone',
   *   onScheduleTask: (delegate, curr, target, task) => {
   *     console.log('task is scheduled', task.type, task.source, task.zone.name);
   *     return delegate.scheduleTask(target, task);
   *   }
   * })
   * const xhr = new XMLHttpRequest();
   * zone.run(() => {
   *   xhr.onload = function() {};
   *   xhr.open('get', '/', true);
   *   xhr.send();
   * });
   * ```
   *
   * In this example, the instance of XMLHttpRequest runs in the zone and acts as a macroTask. The
   * output is 'task is scheduled macroTask, XMLHttpRequest.send, zone'.
   *
   * If you set `__Zone_disable_XHR = true` before importing `zone.js`,
   * `zone.js` does not monkey patch `XMLHttpRequest` APIs and the above onScheduleTask callback
   * will not be called.
   *
   */
  __Zone_disable_XHR?: boolean;

  /**
   * Disable the monkey patch of the browser geolocation APIs.
   *
   * By default, `zone.js` monkey patches geolocation APIs to make callbacks run in the same zone
   * when those APIs are called.
   *
   * Consider the following examples:
   *
   * ```
   * const zone = Zone.current.fork({
   *   name: 'myZone'
   * });
   *
   * zone.run(() => {
   *   navigator.geolocation.getCurrentPosition(pos => {
   *     console.log('navigator.getCurrentPosition() callback is invoked in the zone',
   *     Zone.current.name);
   *     // output is 'navigator.getCurrentPosition() callback is invoked in the zone myZone'.
   *   }
   * });
   * ```
   *
   * If set you `__Zone_disable_geolocation = true` before importing `zone.js`,
   * `zone.js` does not monkey patch geolocation APIs and the above code
   * outputs 'getCurrentPosition <root>'.
   *
   */
  __Zone_disable_geolocation?: boolean;

  /**
   * Disable the monkey patch of the browser `canvas` APIs.
   *
   * By default, `zone.js` monkey patches `canvas` APIs to make callbacks run in the same zone when
   * those APIs are called.
   *
   * Consider the following example:
   *
   * ```
   * const zone = Zone.current.fork({
   *   name: 'myZone'
   * });
   *
   * zone.run(() => {
   *   canvas.toBlob(blog => {
   *     console.log('canvas.toBlob() callback is invoked in the zone', Zone.current.name);
   *     // output is 'canvas.toBlob() callback is invoked in the zone myZone'.
   *   }
   * });
   * ```
   *
   * If you set `__Zone_disable_canvas = true` before importing `zone.js`,
   * `zone.js` does not monkey patch `canvas` APIs and the above code
   * outputs 'canvas.toBlob <root>'.
   */
  __Zone_disable_canvas?: boolean;

  /**
   * Disable the `Promise` monkey patch.
   *
   * By default, `zone.js` monkey patches `Promise` APIs to make the `then()/catch()` callbacks in
   * the same zone when those callbacks are called.
   *
   * Consider the following examples:
   *
   * ```
   * const zone = Zone.current.fork({name: 'myZone'});
   *
   * const p = Promise.resolve(1);
   *
   * zone.run(() => {
   *   p.then(() => {
   *     console.log('then() callback is invoked in the zone', Zone.current.name);
   *     // output is 'then() callback is invoked in the zone myZone'.
   *   });
   * });
   * ```
   *
   * If you set `__Zone_disable_ZoneAwarePromise = true` before importing `zone.js`,
   * `zone.js` does not monkey patch `Promise` APIs and the above code
   * outputs 'promise then callback <root>'.
   */
  __Zone_disable_ZoneAwarePromise?: boolean;

  /**
   * Define event names that users don't want monkey patched by the `zone.js`.
   *
   * By default, `zone.js` monkey patches EventTarget.addEventListener(). The event listener
   * callback runs in the same zone when the addEventListener() is called.
   *
   * Sometimes, you don't want all of the event names used in this patched version because it
   * impacts performance. For example, you might want `scroll` or `mousemove` event listeners to run
   * the native `addEventListener()` for better performance.
   *
   * Users can achieve this goal by defining `__zone_symbol__UNPATCHED_EVENTS = ['scroll',
   * 'mousemove'];` before importing `zone.js`.
   */
  __zone_symbol__UNPATCHED_EVENTS?: string[];

  /**
   * Define the event names of the passive listeners.
   *
   * To add passive event listeners, you can use `elem.addEventListener('scroll', listener,
   * {passive: true});` or implement your own `EventManagerPlugin`.
   *
   * You can also define a global variable as follows:
   *
   * ```
   * __zone_symbol__PASSIVE_EVENTS = ['scroll'];
   * ```
   *
   * The preceding code makes all scroll event listeners passive.
   */
  __zone_symbol__PASSIVE_EVENTS?: string[];

  /**
   * Disable wrapping uncaught promise rejection.
   *
   * By default, `zone.js` wraps the uncaught promise rejection in a new `Error` object
   * which contains additional information such as a value of the rejection and a stack trace.
   *
   * If you set `__zone_symbol__DISABLE_WRAPPING_UNCAUGHT_PROMISE_REJECTION = true;` before
   * importing `zone.js`, `zone.js` will not wrap the uncaught promise rejection.
   */
  __zone_symbol__DISABLE_WRAPPING_UNCAUGHT_PROMISE_REJECTION?: boolean;
}

/**
 * Interface of `zone-testing.js` test configurations.
 *
 * You can define the following configurations on the `window` or `global` object before
 * importing `zone-testing.js` to change `zone-testing.js` default behaviors in the test runner.
 */
interface ZoneTestConfigurations {
  /**
   * Disable the Jasmine integration.
   *
   * In the `zone-testing.js` bundle, by default, `zone-testing.js` monkey patches Jasmine APIs
   * to make Jasmine APIs run in specified zone.
   *
   * 1. Make the `describe()`/`xdescribe()`/`fdescribe()` methods run in the syncTestZone.
   * 2. Make the `it()`/`xit()`/`fit()`/`beforeEach()`/`afterEach()`/`beforeAll()`/`afterAll()`
   * methods run in the ProxyZone.
   *
   * With this patch, `async()`/`fakeAsync()` can work with the Jasmine runner.
   *
   * If you set `__Zone_disable_jasmine = true` before importing `zone-testing.js`,
   * `zone-testing.js` does not monkey patch the jasmine APIs and the `async()`/`fakeAsync()` cannot
   * work with the Jasmine runner any longer.
   */
  __Zone_disable_jasmine?: boolean;

  /**
   * Disable the Mocha integration.
   *
   * In the `zone-testing.js` bundle, by default, `zone-testing.js` monkey patches the Mocha APIs
   * to make Mocha APIs run in the specified zone.
   *
   * 1. Make the `describe()`/`xdescribe()`/`fdescribe()` methods run in the syncTestZone.
   * 2. Make the `it()`/`xit()`/`fit()`/`beforeEach()`/`afterEach()`/`beforeAll()`/`afterAll()`
   * methods run in the ProxyZone.
   *
   * With this patch, `async()`/`fakeAsync()` can work with the Mocha runner.
   *
   * If you set `__Zone_disable_mocha = true` before importing `zone-testing.js`,
   * `zone-testing.js` does not monkey patch the Mocha APIs and the `async()/`fakeAsync()` can not
   * work with the Mocha runner any longer.
   */
  __Zone_disable_mocha?: boolean;

  /**
   * Disable the Jest integration.
   *
   * In the `zone-testing.js` bundle, by default, `zone-testing.js` monkey patches Jest APIs
   * to make Jest APIs run in the specified zone.
   *
   * 1. Make the `describe()`/`xdescribe()`/`fdescribe()` methods run in the syncTestZone.
   * 2. Make the `it()`/`xit()`/`fit()`/`beforeEach()`/`afterEach()`/`before()`/`after()` methods
   * run in the ProxyZone.
   *
   * With this patch, `async()`/`fakeAsync()` can work with the Jest runner.
   *
   * If you set `__Zone_disable_jest = true` before importing `zone-testing.js`,
   * `zone-testing.js` does not monkey patch the jest APIs and `async()`/`fakeAsync()` cannot
   * work with the Jest runner any longer.
   */
  __Zone_disable_jest?: boolean;

  /**
   * Disable monkey patch the jasmine clock APIs.
   *
   * By default, `zone-testing.js` monkey patches the `jasmine.clock()` API,
   * so the `jasmine.clock()` can work with the `fakeAsync()/tick()` API.
   *
   * Consider the following example:
   *
   * ```
   * describe('jasmine.clock integration', () => {
   *   beforeEach(() => {
   *     jasmine.clock().install();
   *   });
   *   afterEach(() => {
   *     jasmine.clock().uninstall();
   *   });
   *   it('fakeAsync test', fakeAsync(() => {
   *     setTimeout(spy, 100);
   *     expect(spy).not.toHaveBeenCalled();
   *     jasmine.clock().tick(100);
   *     expect(spy).toHaveBeenCalled();
   *   }));
   * });
   * ```
   *
   * In the `fakeAsync()` method, `jasmine.clock().tick()` works just like `tick()`.
   *
   * If you set `__zone_symbol__fakeAsyncDisablePatchingClock = true` before importing
   * `zone-testing.js`,`zone-testing.js` does not monkey patch the `jasmine.clock()` APIs and the
   * `jasmine.clock()` cannot work with `fakeAsync()` any longer.
   */
  __zone_symbol__fakeAsyncDisablePatchingClock?: boolean;

  /**
   * Enable auto running into `fakeAsync()` when installing the `jasmine.clock()`.
   *
   * By default, `zone-testing.js` does not automatically run into `fakeAsync()`
   * if the `jasmine.clock().install()` is called.
   *
   * Consider the following example:
   *
   * ```
   * describe('jasmine.clock integration', () => {
   *   beforeEach(() => {
   *     jasmine.clock().install();
   *   });
   *   afterEach(() => {
   *     jasmine.clock().uninstall();
   *   });
   *   it('fakeAsync test', fakeAsync(() => {
   *     setTimeout(spy, 100);
   *     expect(spy).not.toHaveBeenCalled();
   *     jasmine.clock().tick(100);
   *     expect(spy).toHaveBeenCalled();
   *   }));
   * });
   * ```
   *
   * You must run `fakeAsync()` to make test cases in the `FakeAsyncTestZone`.
   *
   * If you set `__zone_symbol__fakeAsyncAutoFakeAsyncWhenClockPatched = true` before importing
   * `zone-testing.js`, `zone-testing.js` can run test case automatically in the
   * `FakeAsyncTestZone` without calling the `fakeAsync()`.
   *
   * Consider the following example:
   *
   * ```
   * describe('jasmine.clock integration', () => {
   *   beforeEach(() => {
   *     jasmine.clock().install();
   *   });
   *   afterEach(() => {
   *     jasmine.clock().uninstall();
   *   });
   *   it('fakeAsync test', () => { // here we don't need to call fakeAsync
   *     setTimeout(spy, 100);
   *     expect(spy).not.toHaveBeenCalled();
   *     jasmine.clock().tick(100);
   *     expect(spy).toHaveBeenCalled();
   *   });
   * });
   * ```
   *
   */
  __zone_symbol__fakeAsyncAutoFakeAsyncWhenClockPatched?: boolean;

  /**
   * Enable waiting for the unresolved promise in the `async()` test.
   *
   * In the `async()` test, `AsyncTestZone` waits for all the asynchronous tasks to finish. By
   * default, if some promises remain unresolved, `AsyncTestZone` does not wait and reports that it
   * received an unexpected result.
   *
   * Consider the following example:
   *
   * ```
   * describe('wait never resolved promise', () => {
   *   it('async with never resolved promise test', async(() => {
   *     const p = new Promise(() => {});
   *     p.then(() => {
   *       // do some expectation.
   *     });
   *   }))
   * });
   * ```
   *
   * By default, this case passes, because the callback of `p.then()` is never called. Because `p`
   * is an unresolved promise, there is no pending asynchronous task, which means the `async()`
   * method does not wait.
   *
   * If you set `__zone_symbol__supportWaitUnResolvedChainedPromise = true`, the above case
   * times out, because `async()` will wait for the unresolved promise.
   */
  __zone_symbol__supportWaitUnResolvedChainedPromise?: boolean;
}

/**
 * The interface of the `zone.js` runtime configurations.
 *
 * These configurations can be defined on the `Zone` object after
 * importing zone.js to change behaviors. The differences between
 * the `ZoneRuntimeConfigurations` and the `ZoneGlobalConfigurations` are,
 *
 * 1. `ZoneGlobalConfigurations` must be defined on the `global/window` object before importing
 * `zone.js`. The value of the configuration cannot be changed at runtime.
 *
 * 2. `ZoneRuntimeConfigurations` must be defined on the `Zone` object after importing `zone.js`.
 * You can change the value of this configuration at runtime.
 *
 */
interface ZoneRuntimeConfigurations {
  /**
   * Ignore outputting errors to the console when uncaught Promise errors occur.
   *
   * By default, if an uncaught Promise error occurs, `zone.js` outputs the
   * error to the console by calling `console.error()`.
   *
   * If you set `__zone_symbol__ignoreConsoleErrorUncaughtError = true`, `zone.js` does not output
   * the uncaught error to `console.error()`.
   */
  __zone_symbol__ignoreConsoleErrorUncaughtError?: boolean;
}
