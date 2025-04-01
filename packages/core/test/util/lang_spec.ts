/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {isSubscribable} from '../../src/util/lang';
import {of} from 'rxjs';

describe('isSubscribable', () => {
  it('should be true for an Observable', () => expect(isSubscribable(of(true))).toEqual(true));

  it('should be true if the argument is the object with subscribe function', () =>
    expect(isSubscribable({subscribe: () => {}})).toEqual(true));

  it('should be false if the argument is undefined', () =>
    expect(isSubscribable(undefined)).toEqual(false));

  it('should be false if the argument is null', () => expect(isSubscribable(null)).toEqual(false));

  it('should be false if the argument is an object', () =>
    expect(isSubscribable({})).toEqual(false));

  it('should be false if the argument is a function', () =>
    expect(isSubscribable(() => {})).toEqual(false));
});
