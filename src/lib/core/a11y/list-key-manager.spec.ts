import {QueryList} from '@angular/core';
import {ListKeyManager} from './list-key-manager';
import {DOWN_ARROW, UP_ARROW, TAB, HOME, END} from '../keyboard/keycodes';

class FakeFocusable {
  disabled = false;
  focus() {}
}

class FakeQueryList<T> extends QueryList<T> {
  get length() { return this.items.length; }
  items: T[];
  toArray() {
    return this.items;
  }
}

const DOWN_ARROW_EVENT = { keyCode: DOWN_ARROW } as KeyboardEvent;
const UP_ARROW_EVENT = { keyCode: UP_ARROW } as KeyboardEvent;
const TAB_EVENT = { keyCode: TAB } as KeyboardEvent;
const HOME_EVENT = { keyCode: HOME } as KeyboardEvent;
const END_EVENT = { keyCode: END } as KeyboardEvent;

describe('ListKeyManager', () => {
  let keyManager: ListKeyManager;
  let itemList: FakeQueryList<FakeFocusable>;

  beforeEach(() => {
    itemList = new FakeQueryList<FakeFocusable>();
    itemList.items = [
      new FakeFocusable(),
      new FakeFocusable(),
      new FakeFocusable()
    ];

    keyManager = new ListKeyManager(itemList);

    // first item is already focused
    keyManager.focusFirstItem();

    spyOn(itemList.items[0], 'focus');
    spyOn(itemList.items[1], 'focus');
    spyOn(itemList.items[2], 'focus');
  });

  describe('key events', () => {
    it('should focus subsequent items when down arrow is pressed', () => {
      keyManager.onKeydown(DOWN_ARROW_EVENT);

      expect(itemList.items[0].focus).not.toHaveBeenCalled();
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[2].focus).not.toHaveBeenCalled();

      keyManager.onKeydown(DOWN_ARROW_EVENT);
      expect(itemList.items[0].focus).not.toHaveBeenCalled();
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[2].focus).toHaveBeenCalledTimes(1);
    });

    it('should focus previous items when up arrow is pressed', () => {
      keyManager.onKeydown(DOWN_ARROW_EVENT);

      expect(itemList.items[0].focus).not.toHaveBeenCalled();
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);

      keyManager.onKeydown(UP_ARROW_EVENT);

      expect(itemList.items[0].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);
    });

    it('should skip disabled items using arrow keys', () => {
      itemList.items[1].disabled = true;

      // down arrow should skip past disabled item from 0 to 2
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      expect(itemList.items[0].focus).not.toHaveBeenCalled();
      expect(itemList.items[1].focus).not.toHaveBeenCalled();
      expect(itemList.items[2].focus).toHaveBeenCalledTimes(1);

      // up arrow should skip past disabled item from 2 to 0
      keyManager.onKeydown(UP_ARROW_EVENT);
      expect(itemList.items[0].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[1].focus).not.toHaveBeenCalled();
      expect(itemList.items[2].focus).toHaveBeenCalledTimes(1);
    });

    it('should work normally when disabled property does not exist', () => {
      itemList.items[0].disabled = undefined;
      itemList.items[1].disabled = undefined;
      itemList.items[2].disabled = undefined;

      keyManager.onKeydown(DOWN_ARROW_EVENT);
      expect(itemList.items[0].focus).not.toHaveBeenCalled();
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[2].focus).not.toHaveBeenCalled();

      keyManager.onKeydown(DOWN_ARROW_EVENT);
      expect(itemList.items[0].focus).not.toHaveBeenCalled();
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[2].focus).toHaveBeenCalledTimes(1);
    });

    it('should not move focus past either end of the list', () => {
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      expect(keyManager.focusedItemIndex)
          .toBe(2, `Expected focus to be on the last item of the list.`);

      // this down arrow would move focus past the end of the list
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      expect(keyManager.focusedItemIndex)
          .toBe(2, `Expected focus to remain at the end of the list.`);
      expect(itemList.items[2].focus).toHaveBeenCalledTimes(1);

      keyManager.onKeydown(UP_ARROW_EVENT);
      keyManager.onKeydown(UP_ARROW_EVENT);
      expect(keyManager.focusedItemIndex)
          .toBe(0, `Expected focus to be on the first item of the list.`);

      // this up arrow would move focus past the beginning of the list
      keyManager.onKeydown(UP_ARROW_EVENT);
      expect(keyManager.focusedItemIndex)
          .toBe(0, `Expected focus to remain at the beginning of the list.`);
      expect(itemList.items[0].focus).toHaveBeenCalledTimes(1);
    });

    it('should not move focus when the last item is disabled', () => {
      itemList.items[2].disabled = true;
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      expect(keyManager.focusedItemIndex)
          .toBe(1, `Expected focus to be on the second item of the list.`);

      // this down arrow would move focus the last item, which is disabled
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      expect(keyManager.focusedItemIndex)
          .toBe(1, `Expected focus to remain on the second item.`);
      expect(itemList.items[2].focus).not.toHaveBeenCalled();
    });

    it('should focus the first item when HOME is pressed', () => {
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      expect(keyManager.focusedItemIndex)
          .toBe(2, `Expected focus to be on the last item of the list.`);

      keyManager.onKeydown(HOME_EVENT);
      expect(keyManager.focusedItemIndex)
          .toBe(0, `Expected the HOME key to move the focus back to the first item.`);
    });

    it('should focus the last item when END is pressed', () => {
      expect(keyManager.focusedItemIndex)
          .toBe(0, `Expected focus to be on the first item of the list.`);

      keyManager.onKeydown(END_EVENT);
      expect(keyManager.focusedItemIndex)
          .toBe(2, `Expected the END key to move the focus to the last item in the list.`);
    });

    it('should emit tabOut when the tab key is pressed', () => {
      let tabOutEmitted = false;
      keyManager.tabOut.first().subscribe(() => tabOutEmitted = true);
      keyManager.onKeydown(TAB_EVENT);

      expect(tabOutEmitted).toBe(true);
    });

  });

  describe('programmatic focus', () => {

    it('should setFocus()', () => {
      expect(keyManager.focusedItemIndex)
          .toBe(0, `Expected focus to be on the first item of the list.`);

      keyManager.setFocus(1);
      expect(keyManager.focusedItemIndex)
          .toBe(1, `Expected focusedItemIndex to be updated when setFocus() was called.`);
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);
    });

    it('should focus the first item when focusFirstItem() is called', () => {
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      expect(keyManager.focusedItemIndex)
          .toBe(2, `Expected focus to be on the last item of the list.`);

      keyManager.focusFirstItem();
      expect(keyManager.focusedItemIndex)
          .toBe(0, `Expected focusFirstItem() to move the focus back to the first item.`);
    });

    it('should focus the second item if the first one is disabled', () => {
      itemList.items[0].disabled = true;

      keyManager.focusFirstItem();
      expect(keyManager.focusedItemIndex)
          .toBe(1, `Expected the second item to be focused if the first was disabled.`);
    });

    it('should focus the last item when focusLastItem() is called', () => {
      expect(keyManager.focusedItemIndex)
          .toBe(0, `Expected focus to be on the first item of the list.`);

      keyManager.focusLastItem();
      expect(keyManager.focusedItemIndex)
          .toBe(2, `Expected focusLastItem() to move the focus to the last item in the list.`);
    });

    it('should focus the second to last item if the last one is disabled', () => {
      itemList.items[2].disabled = true;

      keyManager.focusLastItem();
      expect(keyManager.focusedItemIndex)
          .toBe(1, `Expected the second to last item to be focused if the last was disabled.`);
    });

    it('should focus the next item when focusNextItem() is called', () => {
      expect(keyManager.focusedItemIndex)
          .toBe(0, `Expected focus to be on the first item of the list.`);

      keyManager.focusNextItem();
      expect(keyManager.focusedItemIndex)
          .toBe(1, `Expected focusNextItem() to move the focus to the next item.`);
    });

    it('should focus the next enabled item if next is disabled', () => {
      itemList.items[1].disabled = true;
      expect(keyManager.focusedItemIndex)
          .toBe(0, `Expected focus to be on the first item of the list.`);

      keyManager.focusNextItem();
      expect(keyManager.focusedItemIndex)
          .toBe(2, `Expected focusNextItem() to focus only enabled items.`);
    });

    it('should focus the previous item when focusPreviousItem() is called', () => {
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      expect(keyManager.focusedItemIndex)
          .toBe(1, `Expected focus to be on the second item of the list.`);

      keyManager.focusPreviousItem();
      expect(keyManager.focusedItemIndex)
          .toBe(0, `Expected focusPreviousItem() to move the focus to the last item.`);
    });

    it('should skip disabled items when focusPreviousItem() is called', () => {
      itemList.items[1].disabled = true;
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      expect(keyManager.focusedItemIndex)
          .toBe(2, `Expected focus to be on the third item of the list.`);

      keyManager.focusPreviousItem();
      expect(keyManager.focusedItemIndex)
          .toBe(0, `Expected focusPreviousItem() to skip the disabled item.`);
    });

  });

  describe('wrap mode', () => {

    it('should return itself to allow chaining', () => {
      expect(keyManager.withFocusWrap())
          .toEqual(keyManager, `Expected withFocusWrap() to return an instance of ListKeyManager`);
    });

    it('should wrap focus when arrow keying past items while in wrap mode', () => {
      keyManager.withFocusWrap();
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      keyManager.onKeydown(DOWN_ARROW_EVENT);

      expect(itemList.items[0].focus).not.toHaveBeenCalled();
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[2].focus).toHaveBeenCalledTimes(1);

      // this down arrow moves down past the end of the list
      keyManager.onKeydown(DOWN_ARROW_EVENT);
      expect(itemList.items[0].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[2].focus).toHaveBeenCalledTimes(1);

      // this up arrow moves up past the beginning of the list
      keyManager.onKeydown(UP_ARROW_EVENT);
      expect(itemList.items[0].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[2].focus).toHaveBeenCalledTimes(2);
    });

  });

});
