/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Fake URLs and associated SVG documents used by tests.
 * The ID attribute is used to load the icons, the name attribute is only used for testing.
 * @docs-private
 */
export const FAKE_SVGS = {
  cat: '<svg><path id="meow" name="meow"></path></svg>',
  dog: '<svg><path id="woof" name="woof"></path></svg>',
  farmSet1: `
    <svg>
      <defs>
        <g id="pig" name="pig"><path name="oink"></path></g>
        <g id="cow" name="cow"><path name="moo"></path></g>
      </defs>
    </svg>
  `,
  farmSet2: `
    <svg>
      <defs>
        <g id="cow" name="cow"><path name="moo moo"></path></g>
        <g id="sheep" name="sheep"><path name="baa"></path></g>
      </defs>
    </svg>
  `,
  farmSet3: `
    <svg>
      <symbol id="duck" name="duck">
        <path id="quack" name="quack"></path>
      </symbol>
    </svg>
  `,
  arrows: `
    <svg>
      <defs>
        <svg id="left-arrow" name="left-arrow"><path name="left"></path></svg>
        <svg id="right-arrow" name="right-arrow"><path name="right"></path></svg>
      </defs>
    </svg>  `
};
