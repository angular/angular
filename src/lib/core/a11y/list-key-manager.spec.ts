import {QueryList} from '@angular/core';
import {ListKeyManager, MdFocusable} from './list-key-manager';
import {DOWN_ARROW, UP_ARROW, TAB} from '../keyboard/keycodes';

class FakeFocusable {
  disabled = false;
  focus() {}
}

const DOWN_ARROW_EVENT = { keyCode: DOWN_ARROW } as KeyboardEvent;
const UP_ARROW_EVENT = { keyCode: UP_ARROW } as KeyboardEvent;
const TAB_EVENT = { keyCode: TAB } as KeyboardEvent;

describe('ListKeyManager', () => {
  let keyManager: ListKeyManager;
  let itemList: QueryList<MdFocusable>;
  let items: MdFocusable[];

  beforeEach(() => {
    itemList = new QueryList<MdFocusable>();
    items = [
      new FakeFocusable(),
      new FakeFocusable(),
      new FakeFocusable()
    ];

    itemList.toArray = () => items;

    keyManager = new ListKeyManager(itemList);

    // first item is already focused
    keyManager.focusedItemIndex = 0;

    spyOn(items[0], 'focus');
    spyOn(items[1], 'focus');
    spyOn(items[2], 'focus');
  });

  it('should focus subsequent items when down arrow is pressed', () => {
    keyManager.onKeydown(DOWN_ARROW_EVENT);

    expect(items[0].focus).not.toHaveBeenCalled();
    expect(items[1].focus).toHaveBeenCalledTimes(1);
    expect(items[2].focus).not.toHaveBeenCalled();

    keyManager.onKeydown(DOWN_ARROW_EVENT);
    expect(items[0].focus).not.toHaveBeenCalled();
    expect(items[1].focus).toHaveBeenCalledTimes(1);
    expect(items[2].focus).toHaveBeenCalledTimes(1);
  });

 it('should focus previous items when up arrow is pressed', () => {
    keyManager.onKeydown(DOWN_ARROW_EVENT);

    expect(items[0].focus).not.toHaveBeenCalled();
    expect(items[1].focus).toHaveBeenCalledTimes(1);

    keyManager.onKeydown(UP_ARROW_EVENT);

    expect(items[0].focus).toHaveBeenCalledTimes(1);
    expect(items[1].focus).toHaveBeenCalledTimes(1);
  });

  it('should skip disabled items using arrow keys', () => {
    items[1].disabled = true;

    // down arrow should skip past disabled item from 0 to 2
    keyManager.onKeydown(DOWN_ARROW_EVENT);
    expect(items[0].focus).not.toHaveBeenCalled();
    expect(items[1].focus).not.toHaveBeenCalled();
    expect(items[2].focus).toHaveBeenCalledTimes(1);

    // up arrow should skip past disabled item from 2 to 0
    keyManager.onKeydown(UP_ARROW_EVENT);
    expect(items[0].focus).toHaveBeenCalledTimes(1);
    expect(items[1].focus).not.toHaveBeenCalled();
    expect(items[2].focus).toHaveBeenCalledTimes(1);
  });

  it('should work normally when disabled property does not exist', () => {
    items[0].disabled = undefined;
    items[1].disabled = undefined;
    items[2].disabled = undefined;

    keyManager.onKeydown(DOWN_ARROW_EVENT);
    expect(items[0].focus).not.toHaveBeenCalled();
    expect(items[1].focus).toHaveBeenCalledTimes(1);
    expect(items[2].focus).not.toHaveBeenCalled();

    keyManager.onKeydown(DOWN_ARROW_EVENT);
    expect(items[0].focus).not.toHaveBeenCalled();
    expect(items[1].focus).toHaveBeenCalledTimes(1);
    expect(items[2].focus).toHaveBeenCalledTimes(1);
  });

  it('should wrap back to menu when arrow keying past items', () => {
    keyManager.onKeydown(DOWN_ARROW_EVENT);
    keyManager.onKeydown(DOWN_ARROW_EVENT);

    expect(items[0].focus).not.toHaveBeenCalled();
    expect(items[1].focus).toHaveBeenCalledTimes(1);
    expect(items[2].focus).toHaveBeenCalledTimes(1);

    // this down arrow moves down past the end of the list
    keyManager.onKeydown(DOWN_ARROW_EVENT);
    expect(items[0].focus).toHaveBeenCalledTimes(1);
    expect(items[1].focus).toHaveBeenCalledTimes(1);
    expect(items[2].focus).toHaveBeenCalledTimes(1);

    // this up arrow moves up past the beginning of the list
    keyManager.onKeydown(UP_ARROW_EVENT);
    expect(items[0].focus).toHaveBeenCalledTimes(1);
    expect(items[1].focus).toHaveBeenCalledTimes(1);
    expect(items[2].focus).toHaveBeenCalledTimes(2);
  });

  it('should emit tabOut when the tab key is pressed', () => {
    let tabOutEmitted = false;
    keyManager.tabOut.first().subscribe(() => tabOutEmitted = true);
    keyManager.onKeydown(TAB_EVENT);

    expect(tabOutEmitted).toBe(true);
  });

});
