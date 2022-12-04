/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ShadowCss} from '@angular/compiler/src/shadow_css';

describe('ShadowCss, container queries', () => {
  function s(css: string, contentAttr: string, hostAttr: string = '') {
    const shadowCss = new ShadowCss();
    return shadowCss.shimCssText(css, contentAttr, hostAttr);
  }

  it('should scope normal selectors inside an unnamed container rules', () => {
    const css = `@container max(max-width: 500px) {
             .item {
               color: red;
             }
           }`;
    const result = s(css, 'host-a');
    expect(noIndentation(result)).toEqual(noIndentation(`@container max(max-width: 500px) {
         .item[host-a] {
           color: red;
         }
       }`));
  });

  it('should scope normal selectors inside a named container rules', () => {
    const css = `@container container max(max-width: 500px) {
             .item {
               color: red;
             }
           }`;
    const result = s(css, 'host-a');
    // Note that for the time being we are not scoping the container name itself,
    // this is something that may or may not be done in the future depending
    // on how the css specs evolve. Currently as of Chrome 107 it looks like shadowDom
    // boundaries don't effect container queries (thus the scoping wouldn't be needed)
    // and this aspect of container queries seems to be still under active discussion:
    // https://github.com/w3c/csswg-drafts/issues/5984
    expect(noIndentation(result))
        .toEqual(noIndentation(`@container container max(max-width: 500px) {
       .item[host-a] {
         color: red;
       }
     }`));
  });
});

function noIndentation(str: string): string {
  return str.replace(/\n\s+/g, '\n');
}
