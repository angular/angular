/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Fake URLs and associated SVG documents used by tests.
 * @docs-private
 */
export const FAKE_SVGS = {
  cat: '<svg><path id="meow"></path></svg>',
  dog: '<svg><path id="woof"></path></svg>',
  farmSet1: `
    <svg>
      <defs>
        <g id="pig"><path id="oink"></path></g>
        <g id="cow"><path id="moo"></path></g>
      </defs>
    </svg>
  `,
  farmSet2: `
    <svg>
      <defs>
        <g id="cow"><path id="moo moo"></path></g>
        <g id="sheep"><path id="baa"></path></g>
      </defs>
    </svg>
  `,
  farmSet3: `
    <svg>
      <symbol id="duck">
        <path id="quack"></path>
      </symbol>
    </svg>
  `,
  arrows: `
    <svg>
      <defs>
        <svg id="left-arrow"><path id="left"></path></svg>
        <svg id="right-arrow"><path id="right"></path></svg>
      </defs>
    </svg>  `
};
