/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {withBody} from '@angular/private/testing';

describe('testing', () => {
  describe('withBody', () => {
    let passed: boolean;

    beforeEach(() => passed = false);
    afterEach(() => expect(passed).toEqual(true));

    it('should set up body', withBody('<span>works!</span>', () => {
         expect(document.body.innerHTML).toEqual('<span>works!</span>');
         passed = true;
       }));

    it('should support promises', withBody('<span>works!</span>', () => {
         return Promise.resolve(true).then(() => passed = true);
       }));

    it('should support async and await', withBody('<span>works!</span>', async () => {
         await Promise.resolve(true);
         passed = true;
       }));
  });


  describe('domino', () => {
    it('should have document present', () => {
      // In Browser this tests passes, bun we also want to make sure we pass in node.js
      // We expect that node.js will load domino for us.
      expect(document).toBeTruthy();
    });
  });

  describe('requestAnimationFrame', () => {
    it('should have requestAnimationFrame', (done) => {
      // In Browser we have requestAnimationFrame, but verify that we also have it node.js
      requestAnimationFrame(done);
    });
  });
});
