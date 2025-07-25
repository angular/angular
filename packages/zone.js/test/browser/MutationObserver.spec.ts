/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ifEnvSupports, ifEnvSupportsWithDone} from '../test-util';
declare const global: any;

describe(
  'MutationObserver',
  ifEnvSupports('MutationObserver', function () {
    let elt: HTMLDivElement;

    beforeEach(function () {
      elt = document.createElement('div');
      document.body.appendChild(elt);
    });

    afterEach(function () {
      document.body.removeChild(elt);
    });

    it('should run observers within the zone', function (done) {
      const testZone = Zone.current.fork({name: 'test'});
      let ob;
      elt = document.createElement('div');
      document.body.appendChild(elt);

      testZone.run(function () {
        ob = new MutationObserver(function () {
          expect(Zone.current).toBe(testZone);
          done();
        });

        ob.observe(elt, {childList: true});
      });

      elt.innerHTML = '<p>hey</p>';
    });

    it('should only dequeue upon disconnect if something is observed', function () {
      let ob: MutationObserver;
      let flag = false;
      const elt = document.createElement('div');
      const childZone = Zone.current.fork({
        name: 'test',
        onInvokeTask: function () {
          flag = true;
        },
      });

      childZone.run(function () {
        ob = new MutationObserver(function () {});
      });

      ob!.disconnect();
      expect(flag).toBe(false);
    });
  }),
);

describe('WebKitMutationObserver', () => {
  it(
    'should run observers within the zone',
    ifEnvSupportsWithDone('WebKitMutationObserver', function (done: DoneFn) {
      const testZone = Zone.current.fork({name: 'test'});
      let elt: HTMLDivElement;

      testZone.run(function () {
        elt = document.createElement('div');

        const ob = new global['WebKitMutationObserver'](function () {
          expect(Zone.current).toBe(testZone);
          done();
        });

        ob.observe(elt, {childList: true});
      });

      elt!.innerHTML = '<p>hey</p>';
    }),
  );
});
