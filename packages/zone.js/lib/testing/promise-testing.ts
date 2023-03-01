/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Promise for async/fakeAsync zoneSpec test
 * can support async operation which not supported by zone.js
 * such as
 * it ('test jsonp in AsyncZone', async() => {
 *   new Promise(res => {
 *     jsonp(url, (data) => {
 *       // success callback
 *       res(data);
 *     });
 *   }).then((jsonpResult) => {
 *     // get jsonp result.
 *
 *     // user will expect AsyncZoneSpec wait for
 *     // then, but because jsonp is not zone aware
 *     // AsyncZone will finish before then is called.
 *   });
 * });
 */
Zone.__load_patch('promisefortest', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  const symbolState: string = api.symbol('state');
  const UNRESOLVED: null = null;
  const symbolParentUnresolved = api.symbol('parentUnresolved');

  // patch Promise.prototype.then to keep an internal
  // number for tracking unresolved chained promise
  // we will decrease this number when the parent promise
  // being resolved/rejected and chained promise was
  // scheduled as a microTask.
  // so we can know such kind of chained promise still
  // not resolved in AsyncTestZone
  (Promise as any)[api.symbol('patchPromiseForTest')] = function patchPromiseForTest() {
    let oriThen = (Promise as any)[Zone.__symbol__('ZonePromiseThen')];
    if (oriThen) {
      return;
    }
    oriThen = (Promise as any)[Zone.__symbol__('ZonePromiseThen')] = Promise.prototype.then;
    Promise.prototype.then = function() {
      const chained = oriThen.apply(this, arguments);
      if ((this as any)[symbolState] === UNRESOLVED) {
        // parent promise is unresolved.
        const asyncTestZoneSpec = Zone.current.get('AsyncTestZoneSpec');
        if (asyncTestZoneSpec) {
          asyncTestZoneSpec.unresolvedChainedPromiseCount++;
          chained[symbolParentUnresolved] = true;
        }
      }
      return chained;
    };
  };

  (Promise as any)[api.symbol('unPatchPromiseForTest')] = function unpatchPromiseForTest() {
    // restore origin then
    const oriThen = (Promise as any)[Zone.__symbol__('ZonePromiseThen')];
    if (oriThen) {
      Promise.prototype.then = oriThen;
      (Promise as any)[Zone.__symbol__('ZonePromiseThen')] = undefined;
    }
  };
});
