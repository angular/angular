import {FocusMonitor} from '@angular/cdk/a11y';
import {A, D, DOWN_ARROW, END, ENTER, HOME, SPACE, TAB, UP_ARROW} from '@angular/cdk/keycodes';
import {
  createKeyboardEvent,
  dispatchEvent,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
} from '../../cdk/testing/private';
import {
  ChangeDetectionStrategy,
  Component,
  DebugElement,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  inject,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import {FormControl, FormsModule, NgModel, ReactiveFormsModule} from '@angular/forms';
import {MatRipple, ThemePalette} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {
  MatLegacyListModule,
  MatLegacyListOption,
  MatLegacySelectionList,
  MatLegacySelectionListChange,
} from './index';

describe('MatSelectionList without forms', () => {
  describe('with list option', () => {
    let fixture: ComponentFixture<SelectionListWithListOptions>;
    let listOptions: DebugElement[];
    let selectionList: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatLegacyListModule],
        declarations: [
          SelectionListWithListOptions,
          SelectionListWithCheckboxPositionAfter,
          SelectionListWithListDisabled,
          SelectionListWithOnlyOneOption,
          SelectionListWithIndirectChildOptions,
          SelectionListWithSelectedOptionAndValue,
        ],
      });

      TestBed.compileComponents();
    }));

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(SelectionListWithListOptions);
      fixture.detectChanges();

      listOptions = fixture.debugElement.queryAll(By.directive(MatLegacyListOption));
      selectionList = fixture.debugElement.query(By.directive(MatLegacySelectionList))!;
    }));

    it('should be able to set a value on a list option', () => {
      const optionValues = ['inbox', 'starred', 'sent-mail', 'archive', 'drafts'];

      optionValues.forEach((optionValue, index) => {
        expect(listOptions[index].componentInstance.value).toBe(optionValue);
      });
    });

    it('should not emit a selectionChange event if an option changed programmatically', () => {
      spyOn(fixture.componentInstance, 'onSelectionChange');

      expect(fixture.componentInstance.onSelectionChange).toHaveBeenCalledTimes(0);

      listOptions[2].componentInstance.toggle();
      fixture.detectChanges();

      expect(fixture.componentInstance.onSelectionChange).toHaveBeenCalledTimes(0);
    });

    it('should emit a selectionChange event if an option got clicked', () => {
      spyOn(fixture.componentInstance, 'onSelectionChange');

      expect(fixture.componentInstance.onSelectionChange).toHaveBeenCalledTimes(0);

      dispatchFakeEvent(listOptions[2].nativeElement, 'click');
      fixture.detectChanges();

      expect(fixture.componentInstance.onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it('should be able to dispatch one selected item', () => {
      let testListItem = listOptions[2].injector.get<MatLegacyListOption>(MatLegacyListOption);
      let selectList =
        selectionList.injector.get<MatLegacySelectionList>(MatLegacySelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);
      expect(listOptions[2].nativeElement.getAttribute('aria-selected')).toBe('false');

      testListItem.toggle();
      fixture.detectChanges();

      expect(listOptions[2].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(listOptions[2].nativeElement.getAttribute('aria-disabled')).toBe('false');
      expect(selectList.selected.length).toBe(1);
    });

    it('should be able to dispatch multiple selected items', () => {
      let testListItem = listOptions[2].injector.get<MatLegacyListOption>(MatLegacyListOption);
      let testListItem2 = listOptions[1].injector.get<MatLegacyListOption>(MatLegacyListOption);
      let selectList =
        selectionList.injector.get<MatLegacySelectionList>(MatLegacySelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);
      expect(listOptions[2].nativeElement.getAttribute('aria-selected')).toBe('false');
      expect(listOptions[1].nativeElement.getAttribute('aria-selected')).toBe('false');

      testListItem.toggle();
      fixture.detectChanges();

      testListItem2.toggle();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(2);
      expect(listOptions[2].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(listOptions[1].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(listOptions[1].nativeElement.getAttribute('aria-disabled')).toBe('false');
      expect(listOptions[2].nativeElement.getAttribute('aria-disabled')).toBe('false');
    });

    it('should be able to specify a color for list options', () => {
      const optionNativeElements = listOptions.map(option => option.nativeElement);

      expect(optionNativeElements.every(option => !option.classList.contains('mat-primary'))).toBe(
        true,
      );
      expect(optionNativeElements.every(option => !option.classList.contains('mat-warn'))).toBe(
        true,
      );

      // All options will be set to the "warn" color.
      fixture.componentInstance.selectionListColor = 'warn';
      fixture.detectChanges();

      expect(optionNativeElements.every(option => !option.classList.contains('mat-primary'))).toBe(
        true,
      );
      expect(optionNativeElements.every(option => option.classList.contains('mat-warn'))).toBe(
        true,
      );

      // Color will be set explicitly for an option and should take precedence.
      fixture.componentInstance.firstOptionColor = 'primary';
      fixture.detectChanges();

      expect(optionNativeElements[0].classList).toContain('mat-primary');
      expect(optionNativeElements[0].classList).not.toContain('mat-warn');
      expect(
        optionNativeElements.slice(1).every(option => option.classList.contains('mat-warn')),
      ).toBe(true);
    });

    it('should explicitly set the `accent` color', () => {
      const classList = listOptions[0].nativeElement.classList;

      fixture.componentInstance.firstOptionColor = 'primary';
      fixture.detectChanges();

      expect(classList).toContain('mat-primary');
      expect(classList).not.toContain('mat-accent');
      expect(classList).not.toContain('mat-warn');

      fixture.componentInstance.firstOptionColor = 'accent';
      fixture.detectChanges();

      expect(classList).not.toContain('mat-primary');
      expect(classList).toContain('mat-accent');
      expect(classList).not.toContain('mat-warn');
    });

    it('should be able to deselect an option', () => {
      let testListItem = listOptions[2].injector.get<MatLegacyListOption>(MatLegacyListOption);
      let selectList =
        selectionList.injector.get<MatLegacySelectionList>(MatLegacySelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);

      testListItem.toggle();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(1);

      testListItem.toggle();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(0);
    });

    it('should not add the mat-list-single-selected-option class (in multiple mode)', () => {
      let testListItem = listOptions[2].injector.get<MatLegacyListOption>(MatLegacyListOption);

      testListItem._handleClick();
      fixture.detectChanges();

      expect(
        listOptions[2].nativeElement.classList.contains('mat-list-single-selected-option'),
      ).toBe(false);
    });

    it('should not allow selection of disabled items', () => {
      let testListItem = listOptions[0].injector.get<MatLegacyListOption>(MatLegacyListOption);
      let selectList =
        selectionList.injector.get<MatLegacySelectionList>(MatLegacySelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);
      expect(listOptions[0].nativeElement.getAttribute('aria-disabled')).toBe('true');

      testListItem._handleClick();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(0);
    });

    it('should be able to un-disable disabled items', () => {
      let testListItem = listOptions[0].injector.get<MatLegacyListOption>(MatLegacyListOption);

      expect(listOptions[0].nativeElement.getAttribute('aria-disabled')).toBe('true');

      testListItem.disabled = false;
      fixture.detectChanges();

      expect(listOptions[0].nativeElement.getAttribute('aria-disabled')).toBe('false');
    });

    it('should be able to use keyboard select with SPACE', () => {
      const testListItem = listOptions[1].nativeElement as HTMLElement;
      const SPACE_EVENT = createKeyboardEvent('keydown', SPACE);
      const selectList =
        selectionList.injector.get<MatLegacySelectionList>(MatLegacySelectionList).selectedOptions;
      expect(selectList.selected.length).toBe(0);

      dispatchFakeEvent(testListItem, 'focus');
      selectionList.componentInstance._keydown(SPACE_EVENT);

      fixture.detectChanges();

      expect(selectList.selected.length).toBe(1);
      expect(SPACE_EVENT.defaultPrevented).toBe(true);
    });

    it('should be able to select an item using ENTER', () => {
      const testListItem = listOptions[1].nativeElement as HTMLElement;
      const ENTER_EVENT = createKeyboardEvent('keydown', ENTER);
      const selectList =
        selectionList.injector.get<MatLegacySelectionList>(MatLegacySelectionList).selectedOptions;
      expect(selectList.selected.length).toBe(0);

      dispatchFakeEvent(testListItem, 'focus');
      selectionList.componentInstance._keydown(ENTER_EVENT);

      fixture.detectChanges();

      expect(selectList.selected.length).toBe(1);
      expect(ENTER_EVENT.defaultPrevented).toBe(true);
    });

    it('should not be able to toggle an item when pressing a modifier key', () => {
      const testListItem = listOptions[1].nativeElement as HTMLElement;
      const selectList =
        selectionList.injector.get<MatLegacySelectionList>(MatLegacySelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);

      [ENTER, SPACE].forEach(key => {
        const event = createKeyboardEvent('keydown', key, undefined, {control: true});

        dispatchFakeEvent(testListItem, 'focus');
        selectionList.componentInstance._keydown(event);
        fixture.detectChanges();
        expect(event.defaultPrevented).toBe(false);
      });

      expect(selectList.selected.length).toBe(0);
    });

    it('should not be able to toggle a disabled option using SPACE', () => {
      const testListItem = listOptions[1].nativeElement as HTMLElement;
      const selectionModel = selectionList.componentInstance.selectedOptions;

      expect(selectionModel.selected.length).toBe(0);

      listOptions[1].componentInstance.disabled = true;

      dispatchFakeEvent(testListItem, 'focus');
      selectionList.componentInstance._keydown(createKeyboardEvent('keydown', SPACE));
      fixture.detectChanges();

      expect(selectionModel.selected.length).toBe(0);
    });

    it('should focus the first option when the list takes focus for the first time', () => {
      spyOn(listOptions[0].componentInstance, 'focus').and.callThrough();

      const manager = selectionList.componentInstance._keyManager;
      expect(manager.activeItemIndex).toBe(-1);

      dispatchFakeEvent(selectionList.nativeElement, 'focus');
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(0);
      expect(listOptions[0].componentInstance.focus).toHaveBeenCalled();
    });

    it('should not move focus to the first item if focus originated from a mouse interaction', fakeAsync(
      inject([FocusMonitor], (focusMonitor: FocusMonitor) => {
        spyOn(listOptions[0].componentInstance, 'focus').and.callThrough();

        const manager = selectionList.componentInstance._keyManager;
        expect(manager.activeItemIndex).toBe(-1);

        focusMonitor.focusVia(selectionList.nativeElement, 'mouse');
        fixture.detectChanges();
        flush();

        expect(manager.activeItemIndex).toBe(-1);
        expect(listOptions[0].componentInstance.focus).not.toHaveBeenCalled();
      }),
    ));

    it('should focus the first selected option when list receives focus', () => {
      spyOn(listOptions[2].componentInstance, 'focus').and.callThrough();

      const manager = selectionList.componentInstance._keyManager;
      expect(manager.activeItemIndex).toBe(-1);

      dispatchMouseEvent(listOptions[2].nativeElement, 'click');
      fixture.detectChanges();

      dispatchMouseEvent(listOptions[3].nativeElement, 'click');
      fixture.detectChanges();

      dispatchFakeEvent(selectionList.nativeElement, 'focus');
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(2);
      expect(listOptions[2].componentInstance.focus).toHaveBeenCalled();
    });

    it('should allow focus to escape when tabbing away', fakeAsync(() => {
      selectionList.componentInstance._keyManager.onKeydown(createKeyboardEvent('keydown', TAB));

      expect(selectionList.componentInstance._tabIndex)
        .withContext('Expected tabIndex to be set to -1 temporarily.')
        .toBe(-1);

      tick();

      expect(selectionList.componentInstance._tabIndex)
        .withContext('Expected tabIndex to be reset back to 0')
        .toBe(0);
    }));

    it('should restore focus if active option is destroyed', () => {
      const manager = selectionList.componentInstance._keyManager;

      spyOn(listOptions[3].componentInstance, 'focus').and.callThrough();
      listOptions[4].componentInstance._handleFocus();

      expect(manager.activeItemIndex).toBe(4);

      fixture.componentInstance.showLastOption = false;
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(3);
      expect(listOptions[3].componentInstance.focus).toHaveBeenCalled();
    });

    it('should not attempt to focus the next option when the destroyed option was not focused', () => {
      const manager = selectionList.componentInstance._keyManager;

      // Focus and blur the option to move the active item index.
      listOptions[4].componentInstance._handleFocus();
      listOptions[4].componentInstance._handleBlur();

      spyOn(listOptions[3].componentInstance, 'focus').and.callThrough();

      expect(manager.activeItemIndex).toBe(4);

      fixture.componentInstance.showLastOption = false;
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(3);
      expect(listOptions[3].componentInstance.focus).not.toHaveBeenCalled();
    });

    it('should focus previous item when press UP ARROW', () => {
      let UP_EVENT = createKeyboardEvent('keydown', UP_ARROW);
      let manager = selectionList.componentInstance._keyManager;

      dispatchFakeEvent(listOptions[2].nativeElement, 'focus');
      expect(manager.activeItemIndex).toEqual(2);

      selectionList.componentInstance._keydown(UP_EVENT);

      fixture.detectChanges();

      expect(manager.activeItemIndex).toEqual(1);
    });

    it('should focus and toggle the next item when pressing SHIFT + UP_ARROW', () => {
      const manager = selectionList.componentInstance._keyManager;
      const upKeyEvent = createKeyboardEvent('keydown', UP_ARROW, undefined, {shift: true});

      dispatchFakeEvent(listOptions[3].nativeElement, 'focus');
      expect(manager.activeItemIndex).toBe(3);

      expect(listOptions[1].componentInstance.selected).toBe(false);
      expect(listOptions[2].componentInstance.selected).toBe(false);

      selectionList.componentInstance._keydown(upKeyEvent);
      fixture.detectChanges();

      expect(listOptions[1].componentInstance.selected).toBe(false);
      expect(listOptions[2].componentInstance.selected).toBe(true);

      selectionList.componentInstance._keydown(upKeyEvent);
      fixture.detectChanges();

      expect(listOptions[1].componentInstance.selected).toBe(true);
      expect(listOptions[2].componentInstance.selected).toBe(true);
    });

    it('should focus next item when press DOWN ARROW', () => {
      const manager = selectionList.componentInstance._keyManager;

      dispatchFakeEvent(listOptions[2].nativeElement, 'focus');
      expect(manager.activeItemIndex).toEqual(2);

      selectionList.componentInstance._keydown(createKeyboardEvent('keydown', DOWN_ARROW));
      fixture.detectChanges();

      expect(manager.activeItemIndex).toEqual(3);
    });

    it('should focus and toggle the next item when pressing SHIFT + DOWN_ARROW', () => {
      const manager = selectionList.componentInstance._keyManager;
      const downKeyEvent = createKeyboardEvent('keydown', DOWN_ARROW, undefined, {shift: true});

      dispatchFakeEvent(listOptions[0].nativeElement, 'focus');
      expect(manager.activeItemIndex).toBe(0);

      expect(listOptions[1].componentInstance.selected).toBe(false);
      expect(listOptions[2].componentInstance.selected).toBe(false);

      selectionList.componentInstance._keydown(downKeyEvent);
      fixture.detectChanges();

      expect(listOptions[1].componentInstance.selected).toBe(true);
      expect(listOptions[2].componentInstance.selected).toBe(false);

      selectionList.componentInstance._keydown(downKeyEvent);
      fixture.detectChanges();

      expect(listOptions[1].componentInstance.selected).toBe(true);
      expect(listOptions[2].componentInstance.selected).toBe(true);
    });

    it('should be able to focus the first item when pressing HOME', () => {
      const manager = selectionList.componentInstance._keyManager;
      expect(manager.activeItemIndex).toBe(-1);

      const event = dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', HOME);
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(0);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should not change focus when pressing HOME with a modifier key', () => {
      const manager = selectionList.componentInstance._keyManager;
      expect(manager.activeItemIndex).toBe(-1);

      const event = createKeyboardEvent('keydown', HOME, undefined, {alt: true});

      dispatchEvent(selectionList.nativeElement, event);
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(-1);
      expect(event.defaultPrevented).toBe(false);
    });

    it('should focus the last item when pressing END', () => {
      const manager = selectionList.componentInstance._keyManager;
      expect(manager.activeItemIndex).toBe(-1);

      const event = dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', END);
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(4);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should not change focus when pressing END with a modifier key', () => {
      const manager = selectionList.componentInstance._keyManager;
      expect(manager.activeItemIndex).toBe(-1);

      const event = createKeyboardEvent('keydown', END, undefined, {alt: true});

      dispatchEvent(selectionList.nativeElement, event);
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(-1);
      expect(event.defaultPrevented).toBe(false);
    });

    it('should select all items using ctrl + a', () => {
      listOptions.forEach(option => (option.componentInstance.disabled = false));
      const event = createKeyboardEvent('keydown', A, undefined, {control: true});

      expect(listOptions.some(option => option.componentInstance.selected)).toBe(false);

      dispatchEvent(selectionList.nativeElement, event);
      fixture.detectChanges();

      expect(listOptions.every(option => option.componentInstance.selected)).toBe(true);
    });

    it('should not select disabled items when pressing ctrl + a', () => {
      const event = createKeyboardEvent('keydown', A, undefined, {control: true});

      listOptions.slice(0, 2).forEach(option => (option.componentInstance.disabled = true));
      fixture.detectChanges();

      expect(listOptions.map(option => option.componentInstance.selected)).toEqual([
        false,
        false,
        false,
        false,
        false,
      ]);

      dispatchEvent(selectionList.nativeElement, event);
      fixture.detectChanges();

      expect(listOptions.map(option => option.componentInstance.selected)).toEqual([
        false,
        false,
        true,
        true,
        true,
      ]);
    });

    it('should select all items using ctrl + a if some items are selected', () => {
      const event = createKeyboardEvent('keydown', A, undefined, {control: true});

      listOptions.slice(0, 2).forEach(option => (option.componentInstance.selected = true));
      fixture.detectChanges();

      expect(listOptions.some(option => option.componentInstance.selected)).toBe(true);

      dispatchEvent(selectionList.nativeElement, event);
      fixture.detectChanges();

      expect(listOptions.every(option => option.componentInstance.selected)).toBe(true);
    });

    it('should deselect all with ctrl + a if all options are selected', () => {
      const event = createKeyboardEvent('keydown', A, undefined, {control: true});

      listOptions.forEach(option => (option.componentInstance.selected = true));
      fixture.detectChanges();

      expect(listOptions.every(option => option.componentInstance.selected)).toBe(true);

      dispatchEvent(selectionList.nativeElement, event);
      fixture.detectChanges();

      expect(listOptions.every(option => option.componentInstance.selected)).toBe(false);
    });

    it('should dispatch the selectionChange event when selecting via ctrl + a', () => {
      const spy = spyOn(fixture.componentInstance, 'onSelectionChange');
      listOptions.forEach(option => (option.componentInstance.disabled = false));
      const event = createKeyboardEvent('keydown', A, undefined, {control: true});

      dispatchEvent(selectionList.nativeElement, event);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          options: listOptions.map(option => option.componentInstance),
        }),
      );
    });

    it('should be able to jump focus down to an item by typing', fakeAsync(() => {
      const listEl = selectionList.nativeElement;
      const manager = selectionList.componentInstance._keyManager;

      expect(manager.activeItemIndex).toBe(-1);

      dispatchEvent(listEl, createKeyboardEvent('keydown', 83, 's'));
      fixture.detectChanges();
      tick(200);

      expect(manager.activeItemIndex).toBe(1);

      dispatchEvent(listEl, createKeyboardEvent('keydown', 68, 'd'));
      fixture.detectChanges();
      tick(200);

      expect(manager.activeItemIndex).toBe(4);
    }));

    it('should be able to skip to an item by typing', fakeAsync(() => {
      const manager = selectionList.componentInstance._keyManager;

      expect(manager.activeItemIndex).not.toBe(4);

      const event = createKeyboardEvent('keydown', D, 'd');
      selectionList.componentInstance._keydown(event);
      fixture.detectChanges();
      tick(200);

      expect(manager.activeItemIndex).toBe(4);
    }));

    // Test for "A" specifically, because it's a special case that can be used to select all values.
    it('should be able to skip to an item by typing the letter "A"', fakeAsync(() => {
      const manager = selectionList.componentInstance._keyManager;

      expect(manager.activeItemIndex).not.toBe(3);

      const event = createKeyboardEvent('keydown', A, 'a');
      selectionList.componentInstance._keydown(event);
      fixture.detectChanges();
      tick(200);

      expect(manager.activeItemIndex).toBe(3);
    }));

    it('should not select items while using the typeahead', fakeAsync(() => {
      const manager = selectionList.componentInstance._keyManager;
      const testListItem = listOptions[1].nativeElement as HTMLElement;
      const model =
        selectionList.injector.get<MatLegacySelectionList>(MatLegacySelectionList).selectedOptions;

      dispatchFakeEvent(testListItem, 'focus');
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(1);
      expect(model.isEmpty()).toBe(true);

      selectionList.componentInstance._keydown(createKeyboardEvent('keydown', D, 'd'));
      fixture.detectChanges();
      tick(100); // Tick only half the typeahead timeout.

      selectionList.componentInstance._keydown(createKeyboardEvent('keydown', SPACE));
      fixture.detectChanges();
      tick(100); // Tick the rest of the timeout.

      expect(manager.activeItemIndex).toBe(4);
      expect(model.isEmpty()).toBe(true);
    }));

    it('should be able to select all options', () => {
      const list: MatLegacySelectionList = selectionList.componentInstance;

      expect(list.options.toArray().every(option => option.selected)).toBe(false);

      const result = list.selectAll();
      fixture.detectChanges();

      expect(list.options.toArray().every(option => option.selected)).toBe(true);
      expect(result).toEqual(list.options.toArray());
    });

    it('should be able to select all options, even if they are disabled', () => {
      const list: MatLegacySelectionList = selectionList.componentInstance;

      list.options.forEach(option => (option.disabled = true));
      fixture.detectChanges();

      expect(list.options.toArray().every(option => option.selected)).toBe(false);

      list.selectAll();
      fixture.detectChanges();

      expect(list.options.toArray().every(option => option.selected)).toBe(true);
    });

    it('should be able to deselect all options', () => {
      const list: MatLegacySelectionList = selectionList.componentInstance;

      list.options.forEach(option => option.toggle());
      expect(list.options.toArray().every(option => option.selected)).toBe(true);

      const result = list.deselectAll();
      fixture.detectChanges();

      expect(list.options.toArray().every(option => option.selected)).toBe(false);
      expect(result).toEqual(list.options.toArray());
    });

    it('should be able to deselect all options, even if they are disabled', () => {
      const list: MatLegacySelectionList = selectionList.componentInstance;

      list.options.forEach(option => option.toggle());
      expect(list.options.toArray().every(option => option.selected)).toBe(true);

      list.options.forEach(option => (option.disabled = true));
      fixture.detectChanges();

      list.deselectAll();
      fixture.detectChanges();

      expect(list.options.toArray().every(option => option.selected)).toBe(false);
    });

    it('should update the list value when an item is selected programmatically', () => {
      const list: MatLegacySelectionList = selectionList.componentInstance;

      expect(list.selectedOptions.isEmpty()).toBe(true);

      listOptions[0].componentInstance.selected = true;
      listOptions[2].componentInstance.selected = true;
      fixture.detectChanges();

      expect(list.selectedOptions.isEmpty()).toBe(false);
      expect(list.selectedOptions.isSelected(listOptions[0].componentInstance)).toBe(true);
      expect(list.selectedOptions.isSelected(listOptions[2].componentInstance)).toBe(true);
    });

    it('should update the item selected state when it is selected via the model', () => {
      const list: MatLegacySelectionList = selectionList.componentInstance;
      const item: MatLegacyListOption = listOptions[0].componentInstance;

      expect(item.selected).toBe(false);

      list.selectedOptions.select(item);
      fixture.detectChanges();

      expect(item.selected).toBe(true);
    });

    it('should set aria-multiselectable to true on the selection list element', () => {
      expect(selectionList.nativeElement.getAttribute('aria-multiselectable')).toBe('true');
    });

    it('should be able to reach list options that are indirect descendants', () => {
      const descendatsFixture = TestBed.createComponent(SelectionListWithIndirectChildOptions);
      descendatsFixture.detectChanges();
      listOptions = descendatsFixture.debugElement.queryAll(By.directive(MatLegacyListOption));
      selectionList = descendatsFixture.debugElement.query(By.directive(MatLegacySelectionList))!;
      const list: MatLegacySelectionList = selectionList.componentInstance;

      expect(list.options.toArray().every(option => option.selected)).toBe(false);

      list.selectAll();
      descendatsFixture.detectChanges();

      expect(list.options.toArray().every(option => option.selected)).toBe(true);
    });

    it('should disable list item ripples when the ripples on the list have been disabled', fakeAsync(() => {
      const rippleTarget = fixture.nativeElement.querySelector(
        '.mat-list-option:not(.mat-list-item-disabled) .mat-list-item-content',
      );

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      // Flush the ripple enter animation.
      dispatchFakeEvent(rippleTarget.querySelector('.mat-ripple-element')!, 'transitionend');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected ripples to be enabled by default.')
        .toBe(1);

      // Flush the ripple exit animation.
      dispatchFakeEvent(rippleTarget.querySelector('.mat-ripple-element')!, 'transitionend');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected ripples to go away.')
        .toBe(0);

      fixture.componentInstance.listRippleDisabled = true;
      fixture.detectChanges();

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');
      flush();

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
        .withContext('Expected no ripples after list ripples are disabled.')
        .toBe(0);
    }));

    it('can bind both selected and value at the same time', () => {
      const componentFixture = TestBed.createComponent(SelectionListWithSelectedOptionAndValue);
      componentFixture.detectChanges();
      const listItemEl = componentFixture.debugElement.query(By.directive(MatLegacyListOption))!;
      expect(listItemEl.componentInstance.selected).toBe(true);
      expect(listItemEl.componentInstance.value).toBe(componentFixture.componentInstance.itemValue);
    });

    it('should have a focus indicator', () => {
      const optionNativeElements = listOptions.map(option => option.nativeElement);

      expect(
        optionNativeElements.every(element => element.classList.contains('mat-focus-indicator')),
      ).toBe(true);
    });
  });

  describe('with list option selected', () => {
    let fixture: ComponentFixture<SelectionListWithSelectedOption>;
    let listItemEl: DebugElement;
    let selectionList: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatLegacyListModule],
        declarations: [SelectionListWithSelectedOption],
      });

      TestBed.compileComponents();
    }));

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(SelectionListWithSelectedOption);
      listItemEl = fixture.debugElement.query(By.directive(MatLegacyListOption))!;
      selectionList = fixture.debugElement.query(By.directive(MatLegacySelectionList))!;
      fixture.detectChanges();
    }));

    it('should set its initial selected state in the selectedOptions', () => {
      let optionEl = listItemEl.injector.get<MatLegacyListOption>(MatLegacyListOption);
      let selectedOptions = selectionList.componentInstance.selectedOptions;
      expect(selectedOptions.isSelected(optionEl)).toBeTruthy();
    });
  });

  describe('with changing option value', () => {
    let fixture: ComponentFixture<SelectionListWithChangingOptionValue>;
    let selectionList: MatLegacySelectionList;
    let listOption: MatLegacyListOption;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatLegacyListModule],
        declarations: [SelectionListWithChangingOptionValue],
      });

      TestBed.compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(SelectionListWithChangingOptionValue);
      fixture.detectChanges();

      selectionList = fixture.debugElement.query(
        By.directive(MatLegacySelectionList),
      )!.componentInstance;
      listOption = fixture.debugElement.query(By.directive(MatLegacyListOption))!.componentInstance;
    });

    it('should use `compareWith` function when updating option selection state', () => {
      expect(selectionList.selectedOptions.isSelected(listOption)).toBeTrue();
      fixture.componentInstance.value = {id: 1};
      fixture.detectChanges();
      expect(selectionList.selectedOptions.isSelected(listOption)).toBeTrue();
      fixture.componentInstance.value = {id: 2};
      fixture.detectChanges();
      expect(selectionList.selectedOptions.isSelected(listOption)).toBeFalse();
    });
  });

  describe('with option disabled', () => {
    let fixture: ComponentFixture<SelectionListWithDisabledOption>;
    let listOptionEl: HTMLElement;
    let listOption: MatLegacyListOption;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatLegacyListModule],
        declarations: [SelectionListWithDisabledOption],
      });

      TestBed.compileComponents();
    }));

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(SelectionListWithDisabledOption);

      const listOptionDebug = fixture.debugElement.query(By.directive(MatLegacyListOption))!;

      listOption = listOptionDebug.componentInstance;
      listOptionEl = listOptionDebug.nativeElement;

      fixture.detectChanges();
    }));

    it('should disable ripples for disabled option', () => {
      expect(listOption._isRippleDisabled())
        .withContext('Expected ripples to be enabled by default')
        .toBe(false);

      fixture.componentInstance.disableItem = true;
      fixture.detectChanges();

      expect(listOption._isRippleDisabled())
        .withContext('Expected ripples to be disabled if option is disabled')
        .toBe(true);
    });

    it('should apply the "mat-list-item-disabled" class properly', () => {
      expect(listOptionEl.classList).not.toContain('mat-list-item-disabled');

      fixture.componentInstance.disableItem = true;
      fixture.detectChanges();

      expect(listOptionEl.classList).toContain('mat-list-item-disabled');
    });
  });

  describe('with list disabled', () => {
    let fixture: ComponentFixture<SelectionListWithListDisabled>;
    let listOption: DebugElement[];
    let selectionList: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatLegacyListModule],
        declarations: [
          SelectionListWithListOptions,
          SelectionListWithCheckboxPositionAfter,
          SelectionListWithListDisabled,
          SelectionListWithOnlyOneOption,
        ],
      });

      TestBed.compileComponents();
    }));

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(SelectionListWithListDisabled);
      listOption = fixture.debugElement.queryAll(By.directive(MatLegacyListOption));
      selectionList = fixture.debugElement.query(By.directive(MatLegacySelectionList))!;
      fixture.detectChanges();
    }));

    it('should not allow selection on disabled selection-list', () => {
      let testListItem = listOption[2].injector.get<MatLegacyListOption>(MatLegacyListOption);
      let selectList =
        selectionList.injector.get<MatLegacySelectionList>(MatLegacySelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);

      testListItem._handleClick();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(0);
    });

    it('should update state of options if list state has changed', () => {
      // To verify that the template of the list options has been re-rendered after the disabled
      // property of the selection list has been updated, the ripple directive can be used.
      // Inspecting the host classes of the options doesn't work because those update as part
      // of the parent template (of the selection-list).
      const listOptionRipple = listOption[2]
        .query(By.directive(MatRipple))!
        .injector.get<MatRipple>(MatRipple);

      expect(listOptionRipple.disabled)
        .withContext('Expected ripples of list option to be disabled')
        .toBe(true);

      fixture.componentInstance.disabled = false;
      fixture.detectChanges();

      expect(listOptionRipple.disabled)
        .withContext('Expected ripples of list option to be enabled')
        .toBe(false);
    });
  });

  describe('with checkbox position after', () => {
    let fixture: ComponentFixture<SelectionListWithCheckboxPositionAfter>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatLegacyListModule],
        declarations: [
          SelectionListWithListOptions,
          SelectionListWithCheckboxPositionAfter,
          SelectionListWithListDisabled,
          SelectionListWithOnlyOneOption,
        ],
      });

      TestBed.compileComponents();
    }));

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(SelectionListWithCheckboxPositionAfter);
      fixture.detectChanges();
    }));

    it('should be able to customize checkbox position', () => {
      let listItemContent = fixture.debugElement.query(By.css('.mat-list-item-content'))!;
      expect(listItemContent.nativeElement.classList).toContain('mat-list-item-content-reverse');
    });
  });

  describe('with list item elements', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatLegacyListModule],
        declarations: [SelectionListWithAvatar, SelectionListWithIcon],
      }).compileComponents();
    }));

    it('should add a class to reflect that it has an avatar', () => {
      const fixture = TestBed.createComponent(SelectionListWithIcon);
      fixture.detectChanges();

      const listOption = fixture.nativeElement.querySelector('.mat-list-option');
      expect(listOption.classList).toContain('mat-list-item-with-avatar');
    });

    it('should add a class to reflect that it has an icon', () => {
      const fixture = TestBed.createComponent(SelectionListWithIcon);
      fixture.detectChanges();

      const listOption = fixture.nativeElement.querySelector('.mat-list-option');
      expect(listOption.classList).toContain('mat-list-item-with-avatar');
    });
  });

  describe('with single selection', () => {
    let fixture: ComponentFixture<SelectionListWithListOptions>;
    let listOptions: DebugElement[];
    let selectionList: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatLegacyListModule],
        declarations: [SelectionListWithListOptions],
      }).compileComponents();

      fixture = TestBed.createComponent(SelectionListWithListOptions);
      fixture.componentInstance.multiple = false;
      listOptions = fixture.debugElement.queryAll(By.directive(MatLegacyListOption));
      selectionList = fixture.debugElement.query(By.directive(MatLegacySelectionList))!;
      fixture.detectChanges();
    }));

    it('should select one option at a time', () => {
      const testListItem1 = listOptions[1].injector.get<MatLegacyListOption>(MatLegacyListOption);
      const testListItem2 = listOptions[2].injector.get<MatLegacyListOption>(MatLegacyListOption);
      const selectList =
        selectionList.injector.get<MatLegacySelectionList>(MatLegacySelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);

      dispatchFakeEvent(testListItem1._getHostElement(), 'click');
      fixture.detectChanges();

      expect(selectList.selected).toEqual([testListItem1]);
      expect(
        listOptions[1].nativeElement.classList.contains('mat-list-single-selected-option'),
      ).toBe(true);

      dispatchFakeEvent(testListItem2._getHostElement(), 'click');
      fixture.detectChanges();

      expect(selectList.selected).toEqual([testListItem2]);
      expect(
        listOptions[1].nativeElement.classList.contains('mat-list-single-selected-option'),
      ).toBe(false);
      expect(
        listOptions[2].nativeElement.classList.contains('mat-list-single-selected-option'),
      ).toBe(true);
    });

    it('should not show check boxes', () => {
      expect(fixture.nativeElement.querySelector('mat-pseudo-checkbox')).toBeFalsy();
    });

    it('should not deselect the target option on click', () => {
      const testListItem1 = listOptions[1].injector.get<MatLegacyListOption>(MatLegacyListOption);
      const selectList =
        selectionList.injector.get<MatLegacySelectionList>(MatLegacySelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);

      dispatchFakeEvent(testListItem1._getHostElement(), 'click');
      fixture.detectChanges();

      expect(selectList.selected).toEqual([testListItem1]);

      dispatchFakeEvent(testListItem1._getHostElement(), 'click');
      fixture.detectChanges();

      expect(selectList.selected).toEqual([testListItem1]);
    });

    it('throws an exception when toggling single/multiple mode after bootstrap', () => {
      fixture.componentInstance.multiple = true;
      expect(() => fixture.detectChanges()).toThrow(
        new Error('Cannot change `multiple` mode of mat-selection-list after initialization.'),
      );
    });

    it('should do nothing when pressing ctrl + a', () => {
      const event = createKeyboardEvent('keydown', A, undefined, {control: true});

      expect(listOptions.every(option => !option.componentInstance.selected)).toBe(true);

      dispatchEvent(selectionList.nativeElement, event);
      fixture.detectChanges();

      expect(listOptions.every(option => !option.componentInstance.selected)).toBe(true);
    });

    it(
      'should focus, but not toggle, the next item when pressing SHIFT + UP_ARROW in single ' +
        'selection mode',
      () => {
        const manager = selectionList.componentInstance._keyManager;
        const upKeyEvent = createKeyboardEvent('keydown', UP_ARROW, undefined, {shift: true});

        dispatchFakeEvent(listOptions[3].nativeElement, 'focus');
        expect(manager.activeItemIndex).toBe(3);

        expect(listOptions[1].componentInstance.selected).toBe(false);
        expect(listOptions[2].componentInstance.selected).toBe(false);

        selectionList.componentInstance._keydown(upKeyEvent);
        fixture.detectChanges();

        expect(listOptions[1].componentInstance.selected).toBe(false);
        expect(listOptions[2].componentInstance.selected).toBe(false);
      },
    );

    it(
      'should focus, but not toggle, the next item when pressing SHIFT + DOWN_ARROW ' +
        'in single selection mode',
      () => {
        const manager = selectionList.componentInstance._keyManager;
        const downKeyEvent = createKeyboardEvent('keydown', DOWN_ARROW, undefined, {shift: true});

        dispatchFakeEvent(listOptions[0].nativeElement, 'focus');
        expect(manager.activeItemIndex).toBe(0);

        expect(listOptions[1].componentInstance.selected).toBe(false);
        expect(listOptions[2].componentInstance.selected).toBe(false);

        selectionList.componentInstance._keydown(downKeyEvent);
        fixture.detectChanges();

        expect(listOptions[1].componentInstance.selected).toBe(false);
        expect(listOptions[2].componentInstance.selected).toBe(false);
      },
    );
  });

  describe('with single selection', () => {
    let fixture: ComponentFixture<ListOptionWithTwoWayBinding>;
    let optionElement: HTMLElement;
    let option: MatLegacyListOption;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatLegacyListModule],
        declarations: [ListOptionWithTwoWayBinding],
      }).compileComponents();

      fixture = TestBed.createComponent(ListOptionWithTwoWayBinding);
      fixture.detectChanges();
      const optionDebug = fixture.debugElement.query(By.directive(MatLegacyListOption));
      option = optionDebug.componentInstance;
      optionElement = optionDebug.nativeElement;
    }));

    it('should sync the value from the view to the option', () => {
      expect(option.selected).toBe(false);

      fixture.componentInstance.selected = true;
      fixture.detectChanges();

      expect(option.selected).toBe(true);
    });

    it('should sync the value from the option to the view', () => {
      expect(fixture.componentInstance.selected).toBe(false);

      optionElement.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.selected).toBe(true);
    });
  });
});

describe('MatSelectionList with forms', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatLegacyListModule, FormsModule, ReactiveFormsModule],
      declarations: [
        SelectionListWithModel,
        SelectionListWithFormControl,
        SelectionListWithPreselectedOption,
        SelectionListWithPreselectedOptionAndModel,
        SelectionListWithPreselectedFormControlOnPush,
        SelectionListWithCustomComparator,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('and ngModel', () => {
    let fixture: ComponentFixture<SelectionListWithModel>;
    let selectionListDebug: DebugElement;
    let listOptions: MatLegacyListOption[];
    let ngModel: NgModel;

    beforeEach(() => {
      fixture = TestBed.createComponent(SelectionListWithModel);
      fixture.detectChanges();

      selectionListDebug = fixture.debugElement.query(By.directive(MatLegacySelectionList))!;
      ngModel = selectionListDebug.injector.get<NgModel>(NgModel);
      listOptions = fixture.debugElement
        .queryAll(By.directive(MatLegacyListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);
    });

    it('should update the model if an option got selected programmatically', fakeAsync(() => {
      expect(fixture.componentInstance.selectedOptions.length)
        .withContext('Expected no options to be selected by default')
        .toBe(0);

      listOptions[0].toggle();
      fixture.detectChanges();

      tick();

      expect(fixture.componentInstance.selectedOptions.length)
        .withContext('Expected first list option to be selected')
        .toBe(1);
    }));

    it('should update the model if an option got clicked', fakeAsync(() => {
      expect(fixture.componentInstance.selectedOptions.length)
        .withContext('Expected no options to be selected by default')
        .toBe(0);

      dispatchFakeEvent(listOptions[0]._getHostElement(), 'click');
      fixture.detectChanges();

      tick();

      expect(fixture.componentInstance.selectedOptions.length)
        .withContext('Expected first list option to be selected')
        .toBe(1);
    }));

    it('should update the options if a model value is set', fakeAsync(() => {
      expect(fixture.componentInstance.selectedOptions.length)
        .withContext('Expected no options to be selected by default')
        .toBe(0);

      fixture.componentInstance.selectedOptions = ['opt3'];
      fixture.detectChanges();

      tick();

      expect(fixture.componentInstance.selectedOptions.length)
        .withContext('Expected first list option to be selected')
        .toBe(1);
    }));

    it('should not mark the model as touched when the list is blurred', fakeAsync(() => {
      expect(ngModel.touched)
        .withContext('Expected the selection-list to be untouched by default.')
        .toBe(false);

      dispatchFakeEvent(selectionListDebug.nativeElement, 'blur');
      fixture.detectChanges();
      tick();

      expect(ngModel.touched)
        .withContext('Expected the selection-list to remain untouched.')
        .toBe(false);
    }));

    it('should mark the model as touched when a list item is blurred', fakeAsync(() => {
      expect(ngModel.touched)
        .withContext('Expected the selection-list to be untouched by default.')
        .toBe(false);

      dispatchFakeEvent(fixture.nativeElement.querySelector('.mat-list-option'), 'blur');
      fixture.detectChanges();
      tick();

      expect(ngModel.touched)
        .withContext('Expected the selection-list to be touched after an item is blurred.')
        .toBe(true);
    }));

    it('should be pristine by default', fakeAsync(() => {
      fixture = TestBed.createComponent(SelectionListWithModel);
      fixture.componentInstance.selectedOptions = ['opt2'];
      fixture.detectChanges();

      ngModel = fixture.debugElement
        .query(By.directive(MatLegacySelectionList))!
        .injector.get<NgModel>(NgModel);
      listOptions = fixture.debugElement
        .queryAll(By.directive(MatLegacyListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);

      // Flush the initial tick to ensure that every action from the ControlValueAccessor
      // happened before the actual test starts.
      tick();

      expect(ngModel.pristine)
        .withContext('Expected the selection-list to be pristine by default.')
        .toBe(true);

      listOptions[1].toggle();
      fixture.detectChanges();

      tick();

      expect(ngModel.pristine)
        .withContext('Expected the selection-list to be dirty after state change.')
        .toBe(false);
    }));

    it('should remove a selected option from the value on destroy', fakeAsync(() => {
      listOptions[1].selected = true;
      listOptions[2].selected = true;

      fixture.detectChanges();

      expect(fixture.componentInstance.selectedOptions).toEqual(['opt2', 'opt3']);

      fixture.componentInstance.options.pop();
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.selectedOptions).toEqual(['opt2']);
    }));

    it('should update the model if an option got selected via the model', fakeAsync(() => {
      expect(fixture.componentInstance.selectedOptions).toEqual([]);

      selectionListDebug.componentInstance.selectedOptions.select(listOptions[0]);
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.selectedOptions).toEqual(['opt1']);
    }));

    it('should not dispatch the model change event if nothing changed using selectAll', () => {
      expect(fixture.componentInstance.modelChangeSpy).not.toHaveBeenCalled();

      selectionListDebug.componentInstance.selectAll();
      fixture.detectChanges();

      expect(fixture.componentInstance.modelChangeSpy).toHaveBeenCalledTimes(1);

      selectionListDebug.componentInstance.selectAll();
      fixture.detectChanges();

      expect(fixture.componentInstance.modelChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('should not dispatch the model change event if nothing changed using selectAll', () => {
      expect(fixture.componentInstance.modelChangeSpy).not.toHaveBeenCalled();

      selectionListDebug.componentInstance.deselectAll();
      fixture.detectChanges();

      expect(fixture.componentInstance.modelChangeSpy).not.toHaveBeenCalled();
    });

    it('should be able to programmatically set an array with duplicate values', fakeAsync(() => {
      fixture.componentInstance.options = ['one', 'two', 'two', 'two', 'three'];
      fixture.detectChanges();
      tick();

      listOptions = fixture.debugElement
        .queryAll(By.directive(MatLegacyListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);

      fixture.componentInstance.selectedOptions = ['one', 'two', 'two'];
      fixture.detectChanges();
      tick();

      expect(listOptions.map(option => option.selected)).toEqual([true, true, true, false, false]);
    }));

    it('should only be in the tab order if it has options', () => {
      expect(selectionListDebug.componentInstance.options.length > 0).toBe(true);
      expect(selectionListDebug.nativeElement.tabIndex).toBe(0);

      fixture.componentInstance.options = [];
      fixture.detectChanges();

      expect(selectionListDebug.nativeElement.tabIndex).toBe(-1);
    });

    it('should dispatch one change event per change when updating a single-selection list', fakeAsync(() => {
      fixture.destroy();
      fixture = TestBed.createComponent(SelectionListWithModel);
      fixture.componentInstance.multiple = false;
      fixture.componentInstance.selectedOptions = ['opt3'];
      fixture.detectChanges();
      const options = fixture.debugElement
        .queryAll(By.directive(MatLegacyListOption))
        .map(optionDebugEl => optionDebugEl.nativeElement);

      expect(fixture.componentInstance.modelChangeSpy).not.toHaveBeenCalled();

      options[0].click();
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.modelChangeSpy).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.selectedOptions).toEqual(['opt1']);

      options[1].click();
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.modelChangeSpy).toHaveBeenCalledTimes(2);
      expect(fixture.componentInstance.selectedOptions).toEqual(['opt2']);
    }));
  });

  describe('and formControl', () => {
    let fixture: ComponentFixture<SelectionListWithFormControl>;
    let listOptions: MatLegacyListOption[];
    let selectionList: MatLegacySelectionList;

    beforeEach(() => {
      fixture = TestBed.createComponent(SelectionListWithFormControl);
      fixture.detectChanges();

      selectionList = fixture.debugElement.query(
        By.directive(MatLegacySelectionList),
      )!.componentInstance;
      listOptions = fixture.debugElement
        .queryAll(By.directive(MatLegacyListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);
    });

    it('should be able to disable options from the control', () => {
      expect(selectionList.disabled)
        .withContext('Expected the selection list to be enabled.')
        .toBe(false);
      expect(listOptions.every(option => !option.disabled))
        .withContext('Expected every list option to be enabled.')
        .toBe(true);

      fixture.componentInstance.formControl.disable();
      fixture.detectChanges();

      expect(selectionList.disabled)
        .withContext('Expected the selection list to be disabled.')
        .toBe(true);
      expect(listOptions.every(option => option.disabled))
        .withContext('Expected every list option to be disabled.')
        .toBe(true);
    });

    it('should be able to update the disabled property after form control disabling', () => {
      expect(listOptions.every(option => !option.disabled))
        .withContext('Expected every list option to be enabled.')
        .toBe(true);

      fixture.componentInstance.formControl.disable();
      fixture.detectChanges();

      expect(listOptions.every(option => option.disabled))
        .withContext('Expected every list option to be disabled.')
        .toBe(true);

      // Previously the selection list has been disabled through FormControl#disable. Now we
      // want to verify that we can still change the disabled state through updating the disabled
      // property. Calling FormControl#disable should not lock the disabled property.
      // See: https://github.com/angular/material2/issues/12107
      selectionList.disabled = false;
      fixture.detectChanges();

      expect(listOptions.every(option => !option.disabled))
        .withContext('Expected every list option to be enabled.')
        .toBe(true);
    });

    it('should be able to set the value through the form control', () => {
      expect(listOptions.every(option => !option.selected))
        .withContext('Expected every list option to be unselected.')
        .toBe(true);

      fixture.componentInstance.formControl.setValue(['opt2', 'opt3']);
      fixture.detectChanges();

      expect(listOptions[1].selected)
        .withContext('Expected second option to be selected.')
        .toBe(true);
      expect(listOptions[2].selected)
        .withContext('Expected third option to be selected.')
        .toBe(true);

      fixture.componentInstance.formControl.setValue(null);
      fixture.detectChanges();

      expect(listOptions.every(option => !option.selected))
        .withContext('Expected every list option to be unselected.')
        .toBe(true);
    });

    it('should deselect option whose value no longer matches', () => {
      const option = listOptions[1];

      fixture.componentInstance.formControl.setValue(['opt2']);
      fixture.detectChanges();

      expect(option.selected).withContext('Expected option to be selected.').toBe(true);

      option.value = 'something-different';
      fixture.detectChanges();

      expect(option.selected).withContext('Expected option not to be selected.').toBe(false);
      expect(fixture.componentInstance.formControl.value).toEqual([]);
    });

    it('should mark options as selected when the value is set before they are initialized', () => {
      fixture.destroy();
      fixture = TestBed.createComponent(SelectionListWithFormControl);

      fixture.componentInstance.formControl.setValue(['opt2', 'opt3']);
      fixture.detectChanges();

      listOptions = fixture.debugElement
        .queryAll(By.directive(MatLegacyListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);

      expect(listOptions[1].selected)
        .withContext('Expected second option to be selected.')
        .toBe(true);
      expect(listOptions[2].selected)
        .withContext('Expected third option to be selected.')
        .toBe(true);
    });

    it('should not clear the form control when the list is destroyed', fakeAsync(() => {
      const option = listOptions[1];

      option.selected = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.formControl.value).toEqual(['opt2']);

      fixture.componentInstance.renderList = false;
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(fixture.componentInstance.formControl.value).toEqual(['opt2']);
    }));

    it('should mark options added at a later point as selected', () => {
      fixture.componentInstance.formControl.setValue(['opt4']);
      fixture.detectChanges();

      fixture.componentInstance.renderExtraOption = true;
      fixture.detectChanges();

      listOptions = fixture.debugElement
        .queryAll(By.directive(MatLegacyListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);

      expect(listOptions.length).toBe(4);
      expect(listOptions[3].selected).toBe(true);
    });
  });

  describe('preselected values', () => {
    it('should add preselected options to the model value', fakeAsync(() => {
      const fixture = TestBed.createComponent(SelectionListWithPreselectedOption);
      const listOptions = fixture.debugElement
        .queryAll(By.directive(MatLegacyListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);

      fixture.detectChanges();
      tick();

      expect(listOptions[1].selected).toBe(true);
      expect(fixture.componentInstance.selectedOptions).toEqual(['opt2']);
    }));

    it('should handle preselected option both through the model and the view', fakeAsync(() => {
      const fixture = TestBed.createComponent(SelectionListWithPreselectedOptionAndModel);
      const listOptions = fixture.debugElement
        .queryAll(By.directive(MatLegacyListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);

      fixture.detectChanges();
      tick();

      expect(listOptions[0].selected).toBe(true);
      expect(listOptions[1].selected).toBe(true);
      expect(fixture.componentInstance.selectedOptions).toEqual(['opt1', 'opt2']);
    }));

    it('should show the item as selected when preselected inside OnPush parent', fakeAsync(() => {
      const fixture = TestBed.createComponent(SelectionListWithPreselectedFormControlOnPush);
      fixture.detectChanges();

      const option = fixture.debugElement.queryAll(By.directive(MatLegacyListOption))[1];

      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(option.componentInstance.selected).toBe(true);
      expect(option.nativeElement.querySelector('.mat-pseudo-checkbox-checked')).toBeTruthy();
    }));
  });

  describe('with custom compare function', () => {
    it('should use a custom comparator to determine which options are selected', fakeAsync(() => {
      const fixture = TestBed.createComponent(SelectionListWithCustomComparator);
      const testComponent = fixture.componentInstance;

      testComponent.compareWith = jasmine
        .createSpy('comparator', (o1: any, o2: any) => {
          return o1 && o2 && o1.id === o2.id;
        })
        .and.callThrough();

      testComponent.selectedOptions = [{id: 2, label: 'Two'}];
      fixture.detectChanges();
      tick();

      expect(testComponent.compareWith).toHaveBeenCalled();
      expect(testComponent.optionInstances.toArray()[1].selected).toBe(true);
    }));
  });
});

@Component({
  template: `
  <mat-selection-list
    id="selection-list-1"
    (selectionChange)="onSelectionChange($event)"
    [disableRipple]="listRippleDisabled"
    [color]="selectionListColor"
    [multiple]="multiple">
    <mat-list-option checkboxPosition="before" disabled="true" value="inbox"
                     [color]="firstOptionColor">
      Inbox (disabled selection-option)
    </mat-list-option>
    <mat-list-option id="testSelect" checkboxPosition="before" class="test-native-focus"
                    value="starred">
      Starred
    </mat-list-option>
    <mat-list-option checkboxPosition="before" value="sent-mail">
      Sent Mail
    </mat-list-option>
    <mat-list-option checkboxPosition="before" value="archive">
      Archive
    </mat-list-option>
    <mat-list-option checkboxPosition="before" value="drafts" *ngIf="showLastOption">
      Drafts
    </mat-list-option>
  </mat-selection-list>`,
})
class SelectionListWithListOptions {
  showLastOption = true;
  listRippleDisabled = false;
  multiple = true;
  selectionListColor: ThemePalette;
  firstOptionColor: ThemePalette;

  onSelectionChange(_change: MatLegacySelectionListChange) {}
}

@Component({
  template: `
  <mat-selection-list id="selection-list-2">
    <mat-list-option checkboxPosition="after">
      Inbox (disabled selection-option)
    </mat-list-option>
    <mat-list-option id="testSelect" checkboxPosition="after">
      Starred
    </mat-list-option>
    <mat-list-option checkboxPosition="after">
      Sent Mail
    </mat-list-option>
    <mat-list-option checkboxPosition="after">
      Drafts
    </mat-list-option>
  </mat-selection-list>`,
})
class SelectionListWithCheckboxPositionAfter {}

@Component({
  template: `
  <mat-selection-list id="selection-list-3" [disabled]="disabled">
    <mat-list-option checkboxPosition="after">
      Inbox (disabled selection-option)
    </mat-list-option>
    <mat-list-option id="testSelect" checkboxPosition="after">
      Starred
    </mat-list-option>
    <mat-list-option checkboxPosition="after">
      Sent Mail
    </mat-list-option>
    <mat-list-option checkboxPosition="after">
      Drafts
    </mat-list-option>
  </mat-selection-list>`,
})
class SelectionListWithListDisabled {
  disabled: boolean = true;
}

@Component({
  template: `
  <mat-selection-list>
    <mat-list-option [disabled]="disableItem">Item</mat-list-option>
  </mat-selection-list>
  `,
})
class SelectionListWithDisabledOption {
  disableItem: boolean = false;
}

@Component({
  template: `
  <mat-selection-list>
    <mat-list-option [selected]="true">Item</mat-list-option>
  </mat-selection-list>`,
})
class SelectionListWithSelectedOption {}

@Component({
  template: `
  <mat-selection-list>
    <mat-list-option [selected]="true" [value]="itemValue">Item</mat-list-option>
  </mat-selection-list>`,
})
class SelectionListWithSelectedOptionAndValue {
  itemValue = 'item1';
}

@Component({
  template: `
  <mat-selection-list id="selection-list-4">
    <mat-list-option checkboxPosition="after" class="test-focus" id="123">
      Inbox
    </mat-list-option>
  </mat-selection-list>`,
})
class SelectionListWithOnlyOneOption {}

@Component({
  template: `
    <mat-selection-list
      [(ngModel)]="selectedOptions"
      (ngModelChange)="modelChangeSpy()"
      [multiple]="multiple">
      <mat-list-option *ngFor="let option of options" [value]="option">{{option}}</mat-list-option>
    </mat-selection-list>`,
})
class SelectionListWithModel {
  modelChangeSpy = jasmine.createSpy('model change spy');
  selectedOptions: string[] = [];
  multiple = true;
  options = ['opt1', 'opt2', 'opt3'];
}

@Component({
  template: `
    <mat-selection-list [formControl]="formControl" *ngIf="renderList">
      <mat-list-option value="opt1">Option 1</mat-list-option>
      <mat-list-option value="opt2">Option 2</mat-list-option>
      <mat-list-option value="opt3">Option 3</mat-list-option>
      <mat-list-option value="opt4" *ngIf="renderExtraOption">Option 4</mat-list-option>
    </mat-selection-list>
  `,
})
class SelectionListWithFormControl {
  formControl = new FormControl([] as string[]);
  renderList = true;
  renderExtraOption = false;
}

@Component({
  template: `
    <mat-selection-list [(ngModel)]="selectedOptions">
      <mat-list-option value="opt1">Option 1</mat-list-option>
      <mat-list-option value="opt2" selected>Option 2</mat-list-option>
    </mat-selection-list>`,
})
class SelectionListWithPreselectedOption {
  selectedOptions: string[];
}

@Component({
  template: `
    <mat-selection-list [(ngModel)]="selectedOptions">
      <mat-list-option value="opt1">Option 1</mat-list-option>
      <mat-list-option value="opt2" selected>Option 2</mat-list-option>
    </mat-selection-list>`,
})
class SelectionListWithPreselectedOptionAndModel {
  selectedOptions = ['opt1'];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-selection-list [formControl]="formControl">
      <mat-list-option *ngFor="let opt of opts" [value]="opt">{{opt}}</mat-list-option>
    </mat-selection-list>
  `,
})
class SelectionListWithPreselectedFormControlOnPush {
  opts = ['opt1', 'opt2', 'opt3'];
  formControl = new FormControl(['opt2']);
}

@Component({
  template: `
    <mat-selection-list [(ngModel)]="selectedOptions" [compareWith]="compareWith">
      <mat-list-option *ngFor="let option of options" [value]="option">
        {{option.label}}
      </mat-list-option>
    </mat-selection-list>`,
})
class SelectionListWithCustomComparator {
  @ViewChildren(MatLegacyListOption) optionInstances: QueryList<MatLegacyListOption>;
  selectedOptions: {id: number; label: string}[] = [];
  compareWith?: (o1: any, o2: any) => boolean;
  options = [
    {id: 1, label: 'One'},
    {id: 2, label: 'Two'},
    {id: 3, label: 'Three'},
  ];
}

@Component({
  template: `
    <mat-selection-list [compareWith]="compareWith">
      <mat-list-option [value]="value" [selected]="value.id === 1">
        One
      </mat-list-option>
    </mat-selection-list>`,
})
class SelectionListWithChangingOptionValue {
  compareWith = (o1: any, o2: any) => o1 && o2 && o1.id === o2.id;
  value = {id: 1};
}

@Component({
  template: `
    <mat-selection-list>
      <mat-list-option>
        <div mat-list-avatar>I</div>
        Inbox
      </mat-list-option>
    </mat-selection-list>
  `,
})
class SelectionListWithAvatar {}

@Component({
  template: `
    <mat-selection-list>
      <mat-list-option>
        <div mat-list-icon>I</div>
        Inbox
      </mat-list-option>
    </mat-selection-list>
  `,
})
class SelectionListWithIcon {}

@Component({
  // Note the blank `ngSwitch` which we need in order to hit the bug that we're testing.
  template: `
    <mat-selection-list>
      <ng-container [ngSwitch]="true">
        <mat-list-option [value]="1">One</mat-list-option>
        <mat-list-option [value]="2">Two</mat-list-option>
      </ng-container>
    </mat-selection-list>`,
})
class SelectionListWithIndirectChildOptions {
  @ViewChildren(MatLegacyListOption) optionInstances: QueryList<MatLegacyListOption>;
}

@Component({
  template: `
  <mat-selection-list>
    <mat-list-option [(selected)]="selected">Item</mat-list-option>
  </mat-selection-list>
`,
})
class ListOptionWithTwoWayBinding {
  selected = false;
}
