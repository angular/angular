import {DOWN_ARROW, TAB, UP_ARROW} from '@angular/cdk/keycodes';
import {first} from '@angular/cdk/rxjs';
import {QueryList} from '@angular/core';
import {fakeAsync, tick} from '@angular/core/testing';
import {createKeyboardEvent} from '../testing/event-objects';
import {ActiveDescendantKeyManager} from './activedescendant-key-manager';
import {FocusKeyManager} from './focus-key-manager';
import {ListKeyManager} from './list-key-manager';


class FakeFocusable {
  constructor(private _label = '') { }
  disabled = false;
  focus() {}
  getLabel() { return this._label; }
}

class FakeHighlightable {
  disabled = false;
  setActiveStyles() {}
  setInactiveStyles() {}
}

class FakeQueryList<T> extends QueryList<T> {
  items: T[];
  get length() { return this.items.length; }
  get first() { return this.items[0]; }
  toArray() { return this.items; }
  some() { return this.items.some.apply(this.items, arguments); }
}


describe('Key managers', () => {
  let itemList: FakeQueryList<any>;
  let fakeKeyEvents: {
    downArrow: KeyboardEvent,
    upArrow: KeyboardEvent,
    tab: KeyboardEvent,
    unsupported: KeyboardEvent
  };

  beforeEach(() => {
    itemList = new FakeQueryList<any>();
    fakeKeyEvents = {
      downArrow: createKeyboardEvent('keydown', DOWN_ARROW),
      upArrow: createKeyboardEvent('keydown', UP_ARROW),
      tab: createKeyboardEvent('keydown', TAB),
      unsupported: createKeyboardEvent('keydown', 192) // corresponds to the tilde character (~)
    };
  });


  describe('ListKeyManager', () => {
    let keyManager: ListKeyManager<FakeFocusable>;

    beforeEach(() => {
      itemList.items = [
        new FakeFocusable('one'),
        new FakeFocusable('two'),
        new FakeFocusable('three')
      ];
      keyManager = new ListKeyManager<FakeFocusable>(itemList);

      // first item is already focused
      keyManager.setFirstItemActive();

      spyOn(keyManager, 'setActiveItem').and.callThrough();
    });

    describe('Key events', () => {

      it('should set subsequent items as active when down arrow is pressed', () => {
        keyManager.onKeydown(fakeKeyEvents.downArrow);

        expect(keyManager.activeItemIndex)
            .toBe(1, 'Expected active item to be 1 after 1 down arrow event.');
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(0);
        expect(keyManager.setActiveItem).toHaveBeenCalledWith(1);
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(2);

        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex)
            .toBe(2, 'Expected active item to be 2 after 2 down arrow events.');
        expect(keyManager.setActiveItem).toHaveBeenCalledWith(2);
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(0);
      });

      it('should set first item active when down arrow pressed if no active item', () => {
        keyManager.setActiveItem(-1);
        keyManager.onKeydown(fakeKeyEvents.downArrow);

        expect(keyManager.activeItemIndex)
            .toBe(0, 'Expected active item to be 0 after down key if active item was null.');
        expect(keyManager.setActiveItem).toHaveBeenCalledWith(0);
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(1);
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(2);
      });

      it('should set previous items as active when up arrow is pressed', () => {
        keyManager.onKeydown(fakeKeyEvents.downArrow);

        expect(keyManager.activeItemIndex)
            .toBe(1, 'Expected active item to be 1 after 1 down arrow event.');
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(0);
        expect(keyManager.setActiveItem).toHaveBeenCalledWith(1);

        keyManager.onKeydown(fakeKeyEvents.upArrow);
        expect(keyManager.activeItemIndex)
            .toBe(0, 'Expected active item to be 0 after 1 down and 1 up arrow event.');
        expect(keyManager.setActiveItem).toHaveBeenCalledWith(0);
      });

      it('should do nothing when up arrow is pressed if no active item and not wrap', () => {
        keyManager.setActiveItem(-1);
        keyManager.onKeydown(fakeKeyEvents.upArrow);

        expect(keyManager.activeItemIndex)
            .toBe(-1, 'Expected nothing to happen if up arrow occurs and no active item.');
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(0);
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(1);
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(2);
      });

      it('should skip disabled items using arrow keys', () => {
        itemList.items[1].disabled = true;

        // down arrow should skip past disabled item from 0 to 2
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex)
            .toBe(2, 'Expected active item to skip past disabled item on down arrow.');
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(0);
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(1);
        expect(keyManager.setActiveItem).toHaveBeenCalledWith(2);

        // up arrow should skip past disabled item from 2 to 0
        keyManager.onKeydown(fakeKeyEvents.upArrow);
        expect(keyManager.activeItemIndex)
            .toBe(0, 'Expected active item to skip past disabled item on up arrow.');
        expect(keyManager.setActiveItem).toHaveBeenCalledWith(0);
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(1);
      });

      it('should work normally when disabled property does not exist', () => {
        itemList.items[0].disabled = undefined;
        itemList.items[1].disabled = undefined;
        itemList.items[2].disabled = undefined;

        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex)
            .toBe(1, 'Expected active item to be 1 after 1 down arrow when disabled not set.');
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(0);
        expect(keyManager.setActiveItem).toHaveBeenCalledWith(1);
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(2);

        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex)
            .toBe(2, 'Expected active item to be 2 after 2 down arrows when disabled not set.');
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(0);
        expect(keyManager.setActiveItem).toHaveBeenCalledWith(2);
      });

      it('should not move active item past either end of the list', () => {
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex)
            .toBe(2, `Expected last item of the list to be active.`);

        // this down arrow would move active item past the end of the list
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex)
            .toBe(2, `Expected active item to remain at the end of the list.`);

        keyManager.onKeydown(fakeKeyEvents.upArrow);
        keyManager.onKeydown(fakeKeyEvents.upArrow);
        expect(keyManager.activeItemIndex)
            .toBe(0, `Expected first item of the list to be active.`);

        // this up arrow would move active item past the beginning of the list
        keyManager.onKeydown(fakeKeyEvents.upArrow);
        expect(keyManager.activeItemIndex)
            .toBe(0, `Expected active item to remain at the beginning of the list.`);
      });

      it('should not move active item to end when the last item is disabled', () => {
        itemList.items[2].disabled = true;
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex)
            .toBe(1, `Expected second item of the list to be active.`);

        // this down arrow would set active item to the last item, which is disabled
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex)
            .toBe(1, `Expected the second item to remain active.`);
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(2);
      });

      it('should emit tabOut when the tab key is pressed', () => {
        let spy = jasmine.createSpy('tabOut spy');
        first.call(keyManager.tabOut).subscribe(spy);
        keyManager.onKeydown(fakeKeyEvents.tab);

        expect(spy).toHaveBeenCalled();
      });

      it('should prevent the default keyboard action when pressing the arrow keys', () => {
        expect(fakeKeyEvents.downArrow.defaultPrevented).toBe(false);
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(fakeKeyEvents.downArrow.defaultPrevented).toBe(true);

        expect(fakeKeyEvents.upArrow.defaultPrevented).toBe(false);
        keyManager.onKeydown(fakeKeyEvents.upArrow);
        expect(fakeKeyEvents.upArrow.defaultPrevented).toBe(true);
      });

      it('should not prevent the default keyboard action when pressing tab', () => {
        expect(fakeKeyEvents.tab.defaultPrevented).toBe(false);

        keyManager.onKeydown(fakeKeyEvents.tab);

        expect(fakeKeyEvents.tab.defaultPrevented).toBe(false);
      });

      it('should not do anything for unsupported key presses', () => {
        keyManager.setActiveItem(1);

        expect(keyManager.activeItemIndex).toBe(1);
        expect(fakeKeyEvents.unsupported.defaultPrevented).toBe(false);

        keyManager.onKeydown(fakeKeyEvents.unsupported);

        expect(keyManager.activeItemIndex).toBe(1);
        expect(fakeKeyEvents.unsupported.defaultPrevented).toBe(false);
      });

      it('should activate the first item when pressing down on a clean key manager', () => {
        keyManager = new ListKeyManager<FakeFocusable>(itemList);

        expect(keyManager.activeItemIndex).toBe(-1, 'Expected active index to default to -1.');

        keyManager.onKeydown(fakeKeyEvents.downArrow);

        expect(keyManager.activeItemIndex).toBe(0, 'Expected first item to become active.');
      });

    });

    describe('programmatic focus', () => {

      it('should setActiveItem()', () => {
        expect(keyManager.activeItemIndex)
            .toBe(0, `Expected first item of the list to be active.`);

        keyManager.setActiveItem(1);
        expect(keyManager.activeItemIndex)
            .toBe(1, `Expected activeItemIndex to be updated when setActiveItem() was called.`);
      });

      it('should expose the active item correctly', () => {
        keyManager.onKeydown(fakeKeyEvents.downArrow);

        expect(keyManager.activeItemIndex).toBe(1, 'Expected active item to be the second option.');
        expect(keyManager.activeItem)
            .toBe(itemList.items[1], 'Expected the active item to match the second option.');


        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex).toBe(2, 'Expected active item to be the third option.');
        expect(keyManager.activeItem)
            .toBe(itemList.items[2], 'Expected the active item ID to match the third option.');
      });

      it('should setFirstItemActive()', () => {
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex)
            .toBe(2, `Expected last item of the list to be active.`);

        keyManager.setFirstItemActive();
        expect(keyManager.activeItemIndex)
            .toBe(0, `Expected setFirstItemActive() to set the active item to the first item.`);
      });

      it('should set the active item to the second item if the first one is disabled', () => {
        itemList.items[0].disabled = true;

        keyManager.setFirstItemActive();
        expect(keyManager.activeItemIndex)
            .toBe(1, `Expected the second item to be active if the first was disabled.`);
      });

      it('should setLastItemActive()', () => {
        expect(keyManager.activeItemIndex)
            .toBe(0, `Expected first item of the list to be active.`);

        keyManager.setLastItemActive();
        expect(keyManager.activeItemIndex)
            .toBe(2, `Expected setLastItemActive() to set the active item to the last item.`);
      });

      it('should set the active item to the second to last item if the last is disabled', () => {
        itemList.items[2].disabled = true;

        keyManager.setLastItemActive();
        expect(keyManager.activeItemIndex)
            .toBe(1, `Expected the second to last item to be active if the last was disabled.`);
      });

      it('should setNextItemActive()', () => {
        expect(keyManager.activeItemIndex)
            .toBe(0, `Expected first item of the list to be active.`);

        keyManager.setNextItemActive();
        expect(keyManager.activeItemIndex)
            .toBe(1, `Expected setNextItemActive() to set the active item to the next item.`);
      });

      it('should set the active item to the next enabled item if next is disabled', () => {
        itemList.items[1].disabled = true;
        expect(keyManager.activeItemIndex)
            .toBe(0, `Expected first item of the list to be active.`);

        keyManager.setNextItemActive();
        expect(keyManager.activeItemIndex)
            .toBe(2, `Expected setNextItemActive() to only set enabled items as active.`);
      });

      it('should setPreviousItemActive()', () => {
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex)
            .toBe(1, `Expected second item of the list to be active.`);

        keyManager.setPreviousItemActive();
        expect(keyManager.activeItemIndex)
            .toBe(0, `Expected setPreviousItemActive() to set the active item to the previous.`);
      });

      it('should skip disabled items when setPreviousItemActive() is called', () => {
        itemList.items[1].disabled = true;
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex)
            .toBe(2, `Expected third item of the list to be active.`);

        keyManager.setPreviousItemActive();
        expect(keyManager.activeItemIndex)
            .toBe(0, `Expected setPreviousItemActive() to skip the disabled item.`);
      });

    });

    describe('wrap mode', () => {

      it('should return itself to allow chaining', () => {
        expect(keyManager.withWrap())
            .toEqual(keyManager, `Expected withWrap() to return an instance of ListKeyManager.`);
      });

      it('should wrap focus when arrow keying past items while in wrap mode', () => {
        keyManager.withWrap();
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        keyManager.onKeydown(fakeKeyEvents.downArrow);

        expect(keyManager.activeItemIndex).toBe(2, 'Expected last item to be active.');

        // this down arrow moves down past the end of the list
        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex).toBe(0, 'Expected active item to wrap to beginning.');

        // this up arrow moves up past the beginning of the list
        keyManager.onKeydown(fakeKeyEvents.upArrow);
        expect(keyManager.activeItemIndex).toBe(2, 'Expected active item to wrap to end.');
      });

      it('should set last item active when up arrow is pressed if no active item', () => {
        keyManager.withWrap();
        keyManager.setActiveItem(-1);
        keyManager.onKeydown(fakeKeyEvents.upArrow);

        expect(keyManager.activeItemIndex)
            .toBe(2, 'Expected last item to be active on up arrow if no active item.');
        expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(0);
        expect(keyManager.setActiveItem).toHaveBeenCalledWith(2);

        keyManager.onKeydown(fakeKeyEvents.downArrow);
        expect(keyManager.activeItemIndex)
            .toBe(0, 'Expected active item to be 0 after wrapping back to beginning.');
        expect(keyManager.setActiveItem).toHaveBeenCalledWith(0);
      });

    });

    describe('typeahead mode', () => {
      const debounceInterval = 300;

      beforeEach(() => {
        keyManager.withTypeAhead(debounceInterval);
        keyManager.setActiveItem(-1);
      });

      it('should throw if the items do not implement the getLabel method', () => {
        const invalidQueryList = new FakeQueryList();

        invalidQueryList.items = [{ disabled: false }];

        const invalidManager = new ListKeyManager(invalidQueryList);

        expect(() => invalidManager.withTypeAhead()).toThrowError(/must implement/);
      });

      it('should debounce the input key presses', fakeAsync(() => {
        keyManager.onKeydown(createKeyboardEvent('keydown', 79, undefined, 'o')); // types "o"
        keyManager.onKeydown(createKeyboardEvent('keydown', 78, undefined, 'n')); // types "n"
        keyManager.onKeydown(createKeyboardEvent('keydown', 69, undefined, 'e')); // types "e"

        expect(keyManager.activeItem).not.toBe(itemList.items[0]);

        tick(debounceInterval);

        expect(keyManager.activeItem).toBe(itemList.items[0]);
      }));

      it('should focus the first item that starts with a letter', fakeAsync(() => {
        keyManager.onKeydown(createKeyboardEvent('keydown', 84, undefined, 't')); // types "t"

        tick(debounceInterval);

        expect(keyManager.activeItem).toBe(itemList.items[1]);
      }));

      it('should focus the first item that starts with sequence of letters', fakeAsync(() => {
        keyManager.onKeydown(createKeyboardEvent('keydown', 84, undefined, 't')); // types "t"
        keyManager.onKeydown(createKeyboardEvent('keydown', 72, undefined, 'h')); // types "h"

        tick(debounceInterval);

        expect(keyManager.activeItem).toBe(itemList.items[2]);
      }));

      it('should cancel any pending timers if a navigation key is pressed', fakeAsync(() => {
        keyManager.onKeydown(createKeyboardEvent('keydown', 84, undefined, 't')); // types "t"
        keyManager.onKeydown(createKeyboardEvent('keydown', 72, undefined, 'h')); // types "h"
        keyManager.onKeydown(fakeKeyEvents.downArrow);

        tick(debounceInterval);

        expect(keyManager.activeItem).toBe(itemList.items[0]);
      }));

      it('should handle non-English input', fakeAsync(() => {
        itemList.items = [
          new FakeFocusable('едно'),
          new FakeFocusable('две'),
          new FakeFocusable('три')
        ];

        const keyboardEvent = createKeyboardEvent('keydown', 68, undefined, 'д');

        keyManager.onKeydown(keyboardEvent); // types "д"
        tick(debounceInterval);

        expect(keyManager.activeItem).toBe(itemList.items[1]);
      }));

      it('should handle non-letter characters', fakeAsync(() => {
        itemList.items = [
          new FakeFocusable('[]'),
          new FakeFocusable('321'),
          new FakeFocusable('`!?')
        ];

        keyManager.onKeydown(createKeyboardEvent('keydown', 192, undefined, '`')); // types "`"
        tick(debounceInterval);
        expect(keyManager.activeItem).toBe(itemList.items[2]);

        keyManager.onKeydown(createKeyboardEvent('keydown', 51, undefined, '3')); // types "3"
        tick(debounceInterval);
        expect(keyManager.activeItem).toBe(itemList.items[1]);

        keyManager.onKeydown(createKeyboardEvent('keydown', 219, undefined, '[')); // types "["
        tick(debounceInterval);
        expect(keyManager.activeItem).toBe(itemList.items[0]);
      }));

      it('should not focus disabled items', fakeAsync(() => {
        expect(keyManager.activeItem).toBeFalsy();

        itemList.items[0].disabled = true;
        keyManager.onKeydown(createKeyboardEvent('keydown', 79, undefined, 'o')); // types "o"
        tick(debounceInterval);

        expect(keyManager.activeItem).toBeFalsy();
      }));

    });

  });

  describe('FocusKeyManager', () => {
    let keyManager: FocusKeyManager<FakeFocusable>;

    beforeEach(() => {
      itemList.items = [new FakeFocusable(), new FakeFocusable(), new FakeFocusable()];
      keyManager = new FocusKeyManager<FakeFocusable>(itemList);

      // first item is already focused
      keyManager.setFirstItemActive();

      spyOn(itemList.items[0], 'focus');
      spyOn(itemList.items[1], 'focus');
      spyOn(itemList.items[2], 'focus');
    });

    it('should focus subsequent items when down arrow is pressed', () => {
      keyManager.onKeydown(fakeKeyEvents.downArrow);

      expect(itemList.items[0].focus).not.toHaveBeenCalled();
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[2].focus).not.toHaveBeenCalled();

      keyManager.onKeydown(fakeKeyEvents.downArrow);
      expect(itemList.items[0].focus).not.toHaveBeenCalled();
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[2].focus).toHaveBeenCalledTimes(1);
    });

    it('should focus previous items when up arrow is pressed', () => {
      keyManager.onKeydown(fakeKeyEvents.downArrow);

      expect(itemList.items[0].focus).not.toHaveBeenCalled();
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);

      keyManager.onKeydown(fakeKeyEvents.upArrow);

      expect(itemList.items[0].focus).toHaveBeenCalledTimes(1);
      expect(itemList.items[1].focus).toHaveBeenCalledTimes(1);
    });

    it('should allow setting the focused item without calling focus', () => {
      expect(keyManager.activeItemIndex)
          .toBe(0, `Expected first item of the list to be active.`);

      keyManager.updateActiveItemIndex(1);
      expect(keyManager.activeItemIndex)
          .toBe(1, `Expected activeItemIndex to update after calling updateActiveItemIndex().`);
      expect(itemList.items[1].focus).not.toHaveBeenCalledTimes(1);
    });

  });

  describe('ActiveDescendantKeyManager', () => {
    let keyManager: ActiveDescendantKeyManager<FakeHighlightable>;

    beforeEach(fakeAsync(() => {
      itemList.items = [new FakeHighlightable(), new FakeHighlightable(), new FakeHighlightable()];
      keyManager = new ActiveDescendantKeyManager<FakeHighlightable>(itemList);

      // first item is already focused
      keyManager.setFirstItemActive();
      tick();

      spyOn(itemList.items[0], 'setActiveStyles');
      spyOn(itemList.items[1], 'setActiveStyles');
      spyOn(itemList.items[2], 'setActiveStyles');

      spyOn(itemList.items[0], 'setInactiveStyles');
      spyOn(itemList.items[1], 'setInactiveStyles');
      spyOn(itemList.items[2], 'setInactiveStyles');
    }));

    it('should set subsequent items as active with the DOWN arrow', fakeAsync(() => {
      keyManager.onKeydown(fakeKeyEvents.downArrow);
      tick();

      expect(itemList.items[1].setActiveStyles).toHaveBeenCalled();
      expect(itemList.items[2].setActiveStyles).not.toHaveBeenCalled();

      keyManager.onKeydown(fakeKeyEvents.downArrow);
      tick();

      expect(itemList.items[2].setActiveStyles).toHaveBeenCalled();
    }));

    it('should set previous items as active with the UP arrow', fakeAsync(() => {
      keyManager.setLastItemActive();
      tick();

      keyManager.onKeydown(fakeKeyEvents.upArrow);
      tick();
      expect(itemList.items[1].setActiveStyles).toHaveBeenCalled();
      expect(itemList.items[0].setActiveStyles).not.toHaveBeenCalled();

      keyManager.onKeydown(fakeKeyEvents.upArrow);
      tick();
      expect(itemList.items[0].setActiveStyles).toHaveBeenCalled();
    }));

    it('should set inactive styles on previously active items', fakeAsync(() => {
      keyManager.onKeydown(fakeKeyEvents.downArrow);
      tick();
      expect(itemList.items[0].setInactiveStyles).toHaveBeenCalled();

      keyManager.onKeydown(fakeKeyEvents.upArrow);
      tick();
      expect(itemList.items[1].setInactiveStyles).toHaveBeenCalled();
    }));

  });


});
