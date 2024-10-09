/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NavigationItem} from '../interfaces';
import {IsActiveNavigationItem} from './is-active-navigation-item.pipe';

describe('IsActiveNavigationItem', () => {
  let pipe: IsActiveNavigationItem;

  beforeEach(() => {
    pipe = new IsActiveNavigationItem();
  });

  it('should return true when itemToCheck is parent of the activeItem', () => {
    const result = pipe.transform(parent, activeItem);
    expect(result).toBe(true);
  });

  it('should return true when itemToCheck is any kind of the ancestor of the activeItem', () => {
    const result = pipe.transform(grandparent, activeItem);
    expect(result).toBe(true);
  });

  it('should return false when itemToCheck is not ancestor of the activeItem', () => {
    const result = pipe.transform(notRelatedItem, activeItem);
    expect(result).toBe(false);
  });

  it('should return false when activeItem is null', () => {
    const result = pipe.transform(notRelatedItem, null);
    expect(result).toBe(false);
  });

  it('should return false when activeItem is parent of the itemToCheck', () => {
    const result = pipe.transform(child, activeItem);
    expect(result).toBe(false);
  });
});

const notRelatedItem: NavigationItem = {
  label: 'Example',
};

const grandparent: NavigationItem = {
  label: 'Grandparent',
};

const parent: NavigationItem = {
  label: 'Parent',
  parent: grandparent,
};

const activeItem: NavigationItem = {
  label: 'Active Item',
  parent: parent,
};

const child: NavigationItem = {
  label: 'Child',
  parent: activeItem,
};
