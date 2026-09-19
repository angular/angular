/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ANGIE_POSES} from '../constants/angie';
import {angieSrcFromParams, angieSrcFromSearch} from './angie.utils';

describe('angie utils', () => {
  it('should stay away without the query param', () => {
    expect(angieSrcFromSearch('')).toBeNull();
    expect(angieSrcFromSearch('?uwu')).toBeNull();
  });

  it('should show up for the bare query param', () => {
    expect(angieSrcFromSearch('?angie')).toMatch(/^assets\/images\/angie\/[a-z0-9-]+\.svg$/);
  });

  it('should show up alongside other query params', () => {
    expect(angieSrcFromSearch('?foo=1&angie')).not.toBeNull();
  });

  it('should read the param out of a params object too', () => {
    expect(angieSrcFromParams({})).toBeNull();
    expect(angieSrcFromParams({uwu: ''})).toBeNull();
    expect(angieSrcFromParams({angie: ''})).not.toBeNull();
  });

  it('should only ever pick a pose that ships', () => {
    const assets = ANGIE_POSES.map((pose) => `assets/images/angie/${pose}.svg`);

    expect(assets).toContain(angieSrcFromSearch('?angie')!);
  });

  it('should show the same pose everywhere on the page', () => {
    expect(angieSrcFromSearch('?angie')).toBe(angieSrcFromParams({angie: ''}));
    expect(angieSrcFromSearch('?angie')).toBe(angieSrcFromSearch('?foo=1&angie'));
  });
});
