import {DOWN_ARROW, SPACE, ENTER, UP_ARROW, HOME, END, A} from '@angular/cdk/keycodes';
import {
  createKeyboardEvent,
  dispatchFakeEvent,
  dispatchEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
} from '@angular/cdk/testing';
import {
  Component,
  DebugElement,
  ChangeDetectionStrategy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick, flush} from '@angular/core/testing';
import {MatRipple, defaultRippleAnimationConfig, ThemePalette} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {
  MatListModule,
  MatListOption,
  MatSelectionList,
  MatSelectionListChange
} from './index';
import {FormControl, FormsModule, NgModel, ReactiveFormsModule} from '@angular/forms';

describe('MatSelectionList without forms', () => {
  describe('with list option', () => {
    let fixture: ComponentFixture<SelectionListWithListOptions>;
    let listOptions: DebugElement[];
    let selectionList: DebugElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [
          SelectionListWithListOptions,
          SelectionListWithCheckboxPositionAfter,
          SelectionListWithListDisabled,
          SelectionListWithOnlyOneOption,
          SelectionListWithIndirectChildOptions,
        ],
      });

      TestBed.compileComponents();
    }));


    beforeEach(async(() => {
      fixture = TestBed.createComponent(SelectionListWithListOptions);
      fixture.detectChanges();

      listOptions = fixture.debugElement.queryAll(By.directive(MatListOption));
      selectionList = fixture.debugElement.query(By.directive(MatSelectionList));
    }));

    it('should be able to set a value on a list option', () => {
      const optionValues = ['inbox', 'starred', 'sent-mail', 'drafts'];

      optionValues.forEach((optionValue, index) => {
        expect(listOptions[index].componentInstance.value).toBe(optionValue);
      });
    });

    it('should not emit a selectionChange event if an option changed programmatically', () => {
      spyOn(fixture.componentInstance, 'onValueChange');

      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(0);

      listOptions[2].componentInstance.toggle();
      fixture.detectChanges();

      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(0);
    });

    it('should emit a selectionChange event if an option got clicked', () => {
      spyOn(fixture.componentInstance, 'onValueChange');

      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(0);

      dispatchFakeEvent(listOptions[2].nativeElement, 'click');
      fixture.detectChanges();

      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(1);
    });

    it('should be able to dispatch one selected item', () => {
      let testListItem = listOptions[2].injector.get<MatListOption>(MatListOption);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);
      expect(listOptions[2].nativeElement.getAttribute('aria-selected')).toBe('false');

      testListItem.toggle();
      fixture.detectChanges();

      expect(listOptions[2].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(listOptions[2].nativeElement.getAttribute('aria-disabled')).toBe('false');
      expect(selectList.selected.length).toBe(1);
    });

    it('should be able to dispatch multiple selected items', () => {
      let testListItem = listOptions[2].injector.get<MatListOption>(MatListOption);
      let testListItem2 = listOptions[1].injector.get<MatListOption>(MatListOption);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

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

      expect(optionNativeElements.every(option => !option.classList.contains('mat-primary')))
        .toBe(true);
      expect(optionNativeElements.every(option => !option.classList.contains('mat-warn')))
        .toBe(true);

      // All options will be set to the "warn" color.
      fixture.componentInstance.selectionListColor = 'warn';
      fixture.detectChanges();

      expect(optionNativeElements.every(option => !option.classList.contains('mat-primary')))
        .toBe(true);
      expect(optionNativeElements.every(option => option.classList.contains('mat-warn')))
        .toBe(true);

      // Color will be set explicitly for an option and should take precedence.
      fixture.componentInstance.firstOptionColor = 'primary';
      fixture.detectChanges();

      expect(optionNativeElements[0].classList).toContain('mat-primary');
      expect(optionNativeElements[0].classList).not.toContain('mat-warn');
      expect(optionNativeElements.slice(1).every(option => option.classList.contains('mat-warn')))
        .toBe(true);
    });

    it('should be able to deselect an option', () => {
      let testListItem = listOptions[2].injector.get<MatListOption>(MatListOption);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);

      testListItem.toggle();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(1);

      testListItem.toggle();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(0);
    });

    it('should not allow selection of disabled items', () => {
      let testListItem = listOptions[0].injector.get<MatListOption>(MatListOption);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);
      expect(listOptions[0].nativeElement.getAttribute('aria-disabled')).toBe('true');

      testListItem._handleClick();
      fixture.detectChanges();

      expect(selectList.selected.length).toBe(0);
    });

    it('should be able to un-disable disabled items', () => {
      let testListItem = listOptions[0].injector.get<MatListOption>(MatListOption);

      expect(listOptions[0].nativeElement.getAttribute('aria-disabled')).toBe('true');

      testListItem.disabled = false;
      fixture.detectChanges();

      expect(listOptions[0].nativeElement.getAttribute('aria-disabled')).toBe('false');
    });

    it('should be able to use keyboard select with SPACE', () => {
      const testListItem = listOptions[1].nativeElement as HTMLElement;
      const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE, testListItem);
      const selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;
      expect(selectList.selected.length).toBe(0);

      dispatchFakeEvent(testListItem, 'focus');
      selectionList.componentInstance._keydown(SPACE_EVENT);

      fixture.detectChanges();

      expect(selectList.selected.length).toBe(1);
      expect(SPACE_EVENT.defaultPrevented).toBe(true);
    });

    it('should be able to select an item using ENTER', () => {
      const testListItem = listOptions[1].nativeElement as HTMLElement;
      const ENTER_EVENT: KeyboardEvent = createKeyboardEvent('keydown', ENTER, testListItem);
      const selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;
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
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

      expect(selectList.selected.length).toBe(0);

      [ENTER, SPACE].forEach(key => {
        const event = createKeyboardEvent('keydown', key, testListItem);
        Object.defineProperty(event, 'ctrlKey', { get: () => true });

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
      selectionList.componentInstance._keydown(createKeyboardEvent('keydown', SPACE, testListItem));
      fixture.detectChanges();

      expect(selectionModel.selected.length).toBe(0);
    });

    it('should restore focus if active option is destroyed', () => {
      const manager = selectionList.componentInstance._keyManager;

      spyOn(listOptions[2].componentInstance, 'focus').and.callThrough();
      listOptions[3].componentInstance._handleFocus();

      expect(manager.activeItemIndex).toBe(3);

      fixture.componentInstance.showLastOption = false;
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(2);
      expect(listOptions[2].componentInstance.focus).toHaveBeenCalled();
    });

    it('should not attempt to focus the next option when the destroyed option was not focused',
      () => {
        const manager = selectionList.componentInstance._keyManager;

        // Focus and blur the option to move the active item index.
        listOptions[3].componentInstance._handleFocus();
        listOptions[3].componentInstance._handleBlur();

        spyOn(listOptions[2].componentInstance, 'focus').and.callThrough();

        expect(manager.activeItemIndex).toBe(3);

        fixture.componentInstance.showLastOption = false;
        fixture.detectChanges();

        expect(manager.activeItemIndex).toBe(2);
        expect(listOptions[2].componentInstance.focus).not.toHaveBeenCalled();
      });

    it('should focus previous item when press UP ARROW', () => {
      let testListItem = listOptions[2].nativeElement as HTMLElement;
      let UP_EVENT: KeyboardEvent =
        createKeyboardEvent('keydown', UP_ARROW, testListItem);
      let manager = selectionList.componentInstance._keyManager;

      dispatchFakeEvent(listOptions[2].nativeElement, 'focus');
      expect(manager.activeItemIndex).toEqual(2);

      selectionList.componentInstance._keydown(UP_EVENT);

      fixture.detectChanges();

      expect(manager.activeItemIndex).toEqual(1);
    });

    it('should focus and toggle the next item when pressing SHIFT + UP_ARROW', () => {
      const manager = selectionList.componentInstance._keyManager;
      const upKeyEvent = createKeyboardEvent('keydown', UP_ARROW);
      Object.defineProperty(upKeyEvent, 'shiftKey', {get: () => true});

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
      const downKeyEvent = createKeyboardEvent('keydown', DOWN_ARROW);
      Object.defineProperty(downKeyEvent, 'shiftKey', {get: () => true});

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

      const event = createKeyboardEvent('keydown', HOME);
      Object.defineProperty(event, 'shiftKey', { get: () => true });

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

      expect(manager.activeItemIndex).toBe(3);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should not change focus when pressing END with a modifier key', () => {
      const manager = selectionList.componentInstance._keyManager;
      expect(manager.activeItemIndex).toBe(-1);

      const event = createKeyboardEvent('keydown', END);
      Object.defineProperty(event, 'shiftKey', { get: () => true });

      dispatchEvent(selectionList.nativeElement, event);
      fixture.detectChanges();

      expect(manager.activeItemIndex).toBe(-1);
      expect(event.defaultPrevented).toBe(false);
    });

    it('should select all items using ctrl + a', () => {
      const event = createKeyboardEvent('keydown', A, selectionList.nativeElement);
      Object.defineProperty(event, 'ctrlKey', {get: () => true});

      expect(listOptions.some(option => option.componentInstance.selected)).toBe(false);

      dispatchEvent(selectionList.nativeElement, event);
      fixture.detectChanges();

      expect(listOptions.every(option => option.componentInstance.selected)).toBe(true);
    });

    it('should select all items using ctrl + a if some items are selected', () => {
      const event = createKeyboardEvent('keydown', A, selectionList.nativeElement);
      Object.defineProperty(event, 'ctrlKey', {get: () => true});

      listOptions.slice(0, 2).forEach(option => option.componentInstance.selected = true);
      fixture.detectChanges();

      expect(listOptions.some(option => option.componentInstance.selected)).toBe(true);

      dispatchEvent(selectionList.nativeElement, event);
      fixture.detectChanges();

      expect(listOptions.every(option => option.componentInstance.selected)).toBe(true);
    });

    it('should deselect all with ctrl + a if all options are selected', () => {
      const event = createKeyboardEvent('keydown', A, selectionList.nativeElement);
      Object.defineProperty(event, 'ctrlKey', {get: () => true});

      listOptions.forEach(option => option.componentInstance.selected = true);
      fixture.detectChanges();

      expect(listOptions.every(option => option.componentInstance.selected)).toBe(true);

      dispatchEvent(selectionList.nativeElement, event);
      fixture.detectChanges();

      expect(listOptions.every(option => option.componentInstance.selected)).toBe(false);
    });

    it('should be able to jump focus down to an item by typing', fakeAsync(() => {
      const listEl = selectionList.nativeElement;
      const manager = selectionList.componentInstance._keyManager;

      expect(manager.activeItemIndex).toBe(-1);

      dispatchEvent(listEl, createKeyboardEvent('keydown', 83, undefined, 's'));
      fixture.detectChanges();
      tick(200);

      expect(manager.activeItemIndex).toBe(1);

      dispatchEvent(listEl, createKeyboardEvent('keydown', 68, undefined, 'd'));
      fixture.detectChanges();
      tick(200);

      expect(manager.activeItemIndex).toBe(3);
    }));

    it('should be able to select all options', () => {
      const list: MatSelectionList = selectionList.componentInstance;

      expect(list.options.toArray().every(option => option.selected)).toBe(false);

      list.selectAll();
      fixture.detectChanges();

      expect(list.options.toArray().every(option => option.selected)).toBe(true);
    });

    it('should be able to deselect all options', () => {
      const list: MatSelectionList = selectionList.componentInstance;

      list.options.forEach(option => option.toggle());
      expect(list.options.toArray().every(option => option.selected)).toBe(true);

      list.deselectAll();
      fixture.detectChanges();

      expect(list.options.toArray().every(option => option.selected)).toBe(false);
    });

    it('should update the list value when an item is selected programmatically', () => {
      const list: MatSelectionList = selectionList.componentInstance;

      expect(list.selectedOptions.isEmpty()).toBe(true);

      listOptions[0].componentInstance.selected = true;
      listOptions[2].componentInstance.selected = true;
      fixture.detectChanges();

      expect(list.selectedOptions.isEmpty()).toBe(false);
      expect(list.selectedOptions.isSelected(listOptions[0].componentInstance)).toBe(true);
      expect(list.selectedOptions.isSelected(listOptions[2].componentInstance)).toBe(true);
    });

    it('should update the item selected state when it is selected via the model', () => {
      const list: MatSelectionList = selectionList.componentInstance;
      const item: MatListOption = listOptions[0].componentInstance;

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
      listOptions = descendatsFixture.debugElement.queryAll(By.directive(MatListOption));
      selectionList = descendatsFixture.debugElement.query(By.directive(MatSelectionList));
      const list: MatSelectionList = selectionList.componentInstance;

      expect(list.options.toArray().every(option => option.selected)).toBe(false);

      list.selectAll();
      descendatsFixture.detectChanges();

      expect(list.options.toArray().every(option => option.selected)).toBe(true);
    });

    it('should disable list item ripples when the ripples on the list have been disabled',
      fakeAsync(() => {
        const rippleTarget = fixture.nativeElement
            .querySelector('.mat-list-option:not(.mat-list-item-disabled) .mat-list-item-content');
        const {enterDuration, exitDuration} = defaultRippleAnimationConfig;

        dispatchMouseEvent(rippleTarget, 'mousedown');
        dispatchMouseEvent(rippleTarget, 'mouseup');

        expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
            .toBe(1, 'Expected ripples to be enabled by default.');

        // Wait for the ripples to go away.
        tick(enterDuration + exitDuration);
        expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
            .toBe(0, 'Expected ripples to go away.');

        fixture.componentInstance.listRippleDisabled = true;
        fixture.detectChanges();

        dispatchMouseEvent(rippleTarget, 'mousedown');
        dispatchMouseEvent(rippleTarget, 'mouseup');

        expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
            .toBe(0, 'Expected no ripples after list ripples are disabled.');
      }));

  });

  describe('with list option selected', () => {
    let fixture: ComponentFixture<SelectionListWithSelectedOption>;
    let listItemEl: DebugElement;
    let selectionList: DebugElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [SelectionListWithSelectedOption],
      });

      TestBed.compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(SelectionListWithSelectedOption);
      listItemEl = fixture.debugElement.query(By.directive(MatListOption));
      selectionList = fixture.debugElement.query(By.directive(MatSelectionList));
      fixture.detectChanges();
    }));

    it('should set its initial selected state in the selectedOptions', () => {
      let optionEl = listItemEl.injector.get<MatListOption>(MatListOption);
      let selectedOptions = selectionList.componentInstance.selectedOptions;
      expect(selectedOptions.isSelected(optionEl)).toBeTruthy();
    });
  });

  describe('with tabindex', () => {

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [
          SelectionListWithTabindexAttr,
          SelectionListWithTabindexBinding,
        ]
      });

      TestBed.compileComponents();
    }));

    it('should properly handle native tabindex attribute', () => {
      const fixture = TestBed.createComponent(SelectionListWithTabindexAttr);
      const selectionList = fixture.debugElement.query(By.directive(MatSelectionList));

      expect(selectionList.componentInstance.tabIndex)
        .toBe(5, 'Expected the selection-list tabindex to be set to the attribute value.');
    });

    it('should support changing the tabIndex through binding', () => {
      const fixture = TestBed.createComponent(SelectionListWithTabindexBinding);
      const selectionList = fixture.debugElement.query(By.directive(MatSelectionList));

      expect(selectionList.componentInstance.tabIndex)
        .toBe(0, 'Expected the tabIndex to be set to "0" by default.');

      fixture.componentInstance.tabIndex = 3;
      fixture.detectChanges();

      expect(selectionList.componentInstance.tabIndex)
        .toBe(3, 'Expected the tabIndex to updated through binding.');

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      expect(selectionList.componentInstance.tabIndex)
        .toBe(3, 'Expected the tabIndex to be still set to "3".');
    });
  });

  describe('with option disabled', () => {
    let fixture: ComponentFixture<SelectionListWithDisabledOption>;
    let listOptionEl: HTMLElement;
    let listOption: MatListOption;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [SelectionListWithDisabledOption]
      });

      TestBed.compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(SelectionListWithDisabledOption);

      const listOptionDebug = fixture.debugElement.query(By.directive(MatListOption));

      listOption = listOptionDebug.componentInstance;
      listOptionEl = listOptionDebug.nativeElement;

      fixture.detectChanges();
    }));

    it('should disable ripples for disabled option', () => {
      expect(listOption._isRippleDisabled())
        .toBe(false, 'Expected ripples to be enabled by default');

      fixture.componentInstance.disableItem = true;
      fixture.detectChanges();

      expect(listOption._isRippleDisabled())
        .toBe(true, 'Expected ripples to be disabled if option is disabled');
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

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [
          SelectionListWithListOptions,
          SelectionListWithCheckboxPositionAfter,
          SelectionListWithListDisabled,
          SelectionListWithOnlyOneOption
        ],
      });

      TestBed.compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(SelectionListWithListDisabled);
      listOption = fixture.debugElement.queryAll(By.directive(MatListOption));
      selectionList = fixture.debugElement.query(By.directive(MatSelectionList));
      fixture.detectChanges();
    }));

    it('should not allow selection on disabled selection-list', () => {
      let testListItem = listOption[2].injector.get<MatListOption>(MatListOption);
      let selectList =
          selectionList.injector.get<MatSelectionList>(MatSelectionList).selectedOptions;

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
      const listOptionRipple = listOption[2].query(By.directive(MatRipple))
          .injector.get<MatRipple>(MatRipple);

      expect(listOptionRipple.disabled)
        .toBe(true, 'Expected ripples of list option to be disabled');

      fixture.componentInstance.disabled = false;
      fixture.detectChanges();

      expect(listOptionRipple.disabled)
        .toBe(false, 'Expected ripples of list option to be enabled');
    });
  });

  describe('with checkbox position after', () => {
    let fixture: ComponentFixture<SelectionListWithCheckboxPositionAfter>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [
          SelectionListWithListOptions,
          SelectionListWithCheckboxPositionAfter,
          SelectionListWithListDisabled,
          SelectionListWithOnlyOneOption
        ],
      });

      TestBed.compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(SelectionListWithCheckboxPositionAfter);
      fixture.detectChanges();
    }));

    it('should be able to customize checkbox position', () => {
      let listItemContent = fixture.debugElement.query(By.css('.mat-list-item-content'));
      expect(listItemContent.nativeElement.classList).toContain('mat-list-item-content-reverse');
    });
  });

  describe('with list item elements', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [
          SelectionListWithAvatar,
          SelectionListWithIcon,
        ],
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
});

describe('MatSelectionList with forms', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatListModule, FormsModule, ReactiveFormsModule],
      declarations: [
        SelectionListWithModel,
        SelectionListWithFormControl,
        SelectionListWithPreselectedOption,
        SelectionListWithPreselectedOptionAndModel,
        SelectionListWithPreselectedFormControlOnPush,
        SelectionListWithCustomComparator,
      ]
    });

    TestBed.compileComponents();
  }));

  describe('and ngModel', () => {
    let fixture: ComponentFixture<SelectionListWithModel>;
    let selectionListDebug: DebugElement;
    let listOptions: MatListOption[];
    let ngModel: NgModel;

    beforeEach(() => {
      fixture = TestBed.createComponent(SelectionListWithModel);
      fixture.detectChanges();

      selectionListDebug = fixture.debugElement.query(By.directive(MatSelectionList));
      ngModel = selectionListDebug.injector.get<NgModel>(NgModel);
      listOptions = fixture.debugElement.queryAll(By.directive(MatListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);
    });

    it('should update the model if an option got selected programmatically', fakeAsync(() => {
      expect(fixture.componentInstance.selectedOptions.length)
        .toBe(0, 'Expected no options to be selected by default');

      listOptions[0].toggle();
      fixture.detectChanges();

      tick();

      expect(fixture.componentInstance.selectedOptions.length)
        .toBe(1, 'Expected first list option to be selected');
    }));

    it('should update the model if an option got clicked', fakeAsync(() => {
      expect(fixture.componentInstance.selectedOptions.length)
        .toBe(0, 'Expected no options to be selected by default');

      dispatchFakeEvent(listOptions[0]._getHostElement(), 'click');
      fixture.detectChanges();

      tick();

      expect(fixture.componentInstance.selectedOptions.length)
        .toBe(1, 'Expected first list option to be selected');
    }));

    it('should update the options if a model value is set', fakeAsync(() => {
      expect(fixture.componentInstance.selectedOptions.length)
        .toBe(0, 'Expected no options to be selected by default');

      fixture.componentInstance.selectedOptions = ['opt3'];
      fixture.detectChanges();

      tick();

      expect(fixture.componentInstance.selectedOptions.length)
        .toBe(1, 'Expected first list option to be selected');
    }));

    it('should set the selection-list to touched on blur', fakeAsync(() => {
      expect(ngModel.touched)
        .toBe(false, 'Expected the selection-list to be untouched by default.');

      dispatchFakeEvent(selectionListDebug.nativeElement, 'blur');
      fixture.detectChanges();

      tick();

      expect(ngModel.touched).toBe(true, 'Expected the selection-list to be touched after blur');
    }));

    it('should be pristine by default', fakeAsync(() => {
      fixture = TestBed.createComponent(SelectionListWithModel);
      fixture.componentInstance.selectedOptions = ['opt2'];
      fixture.detectChanges();

      ngModel =
        fixture.debugElement.query(By.directive(MatSelectionList)).injector.get<NgModel>(NgModel);
      listOptions = fixture.debugElement.queryAll(By.directive(MatListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);

      // Flush the initial tick to ensure that every action from the ControlValueAccessor
      // happened before the actual test starts.
      tick();

      expect(ngModel.pristine)
        .toBe(true, 'Expected the selection-list to be pristine by default.');

      listOptions[1].toggle();
      fixture.detectChanges();

      tick();

      expect(ngModel.pristine)
        .toBe(false, 'Expected the selection-list to be dirty after state change.');
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

      listOptions = fixture.debugElement.queryAll(By.directive(MatListOption))
          .map(optionDebugEl => optionDebugEl.componentInstance);

      fixture.componentInstance.selectedOptions = ['one', 'two', 'two'];
      fixture.detectChanges();
      tick();

      expect(listOptions.map(option => option.selected)).toEqual([true, true, true, false, false]);
    }));

  });

  describe('and formControl', () => {
    let fixture: ComponentFixture<SelectionListWithFormControl>;
    let listOptions: MatListOption[];
    let selectionList: MatSelectionList;

    beforeEach(() => {
      fixture = TestBed.createComponent(SelectionListWithFormControl);
      fixture.detectChanges();

      selectionList = fixture.debugElement.query(By.directive(MatSelectionList)).componentInstance;
      listOptions = fixture.debugElement.queryAll(By.directive(MatListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);
    });

    it('should be able to disable options from the control', () => {
      expect(selectionList.disabled)
        .toBe(false, 'Expected the selection list to be enabled.');
      expect(listOptions.every(option => !option.disabled))
        .toBe(true, 'Expected every list option to be enabled.');

      fixture.componentInstance.formControl.disable();
      fixture.detectChanges();

      expect(selectionList.disabled)
        .toBe(true, 'Expected the selection list to be disabled.');
      expect(listOptions.every(option => option.disabled))
        .toBe(true, 'Expected every list option to be disabled.');
    });

    it('should be able to update the disabled property after form control disabling', () => {
      expect(listOptions.every(option => !option.disabled))
        .toBe(true, 'Expected every list option to be enabled.');

      fixture.componentInstance.formControl.disable();
      fixture.detectChanges();

      expect(listOptions.every(option => option.disabled))
        .toBe(true, 'Expected every list option to be disabled.');

      // Previously the selection list has been disabled through FormControl#disable. Now we
      // want to verify that we can still change the disabled state through updating the disabled
      // property. Calling FormControl#disable should not lock the disabled property.
      // See: https://github.com/angular/material2/issues/12107
      selectionList.disabled = false;
      fixture.detectChanges();

      expect(listOptions.every(option => !option.disabled))
        .toBe(true, 'Expected every list option to be enabled.');
    });

    it('should be able to set the value through the form control', () => {
      expect(listOptions.every(option => !option.selected))
        .toBe(true, 'Expected every list option to be unselected.');

      fixture.componentInstance.formControl.setValue(['opt2', 'opt3']);
      fixture.detectChanges();

      expect(listOptions[1].selected).toBe(true, 'Expected second option to be selected.');
      expect(listOptions[2].selected).toBe(true, 'Expected third option to be selected.');

      fixture.componentInstance.formControl.setValue(null);
      fixture.detectChanges();

      expect(listOptions.every(option => !option.selected))
        .toBe(true, 'Expected every list option to be unselected.');
    });

    it('should deselect option whose value no longer matches', () => {
      const option = listOptions[1];

      fixture.componentInstance.formControl.setValue(['opt2']);
      fixture.detectChanges();

      expect(option.selected).toBe(true, 'Expected option to be selected.');

      option.value = 'something-different';
      fixture.detectChanges();

      expect(option.selected).toBe(false, 'Expected option not to be selected.');
      expect(fixture.componentInstance.formControl.value).toEqual([]);
    });

    it('should mark options as selected when the value is set before they are initialized', () => {
      fixture.destroy();
      fixture = TestBed.createComponent(SelectionListWithFormControl);

      fixture.componentInstance.formControl.setValue(['opt2', 'opt3']);
      fixture.detectChanges();

      listOptions = fixture.debugElement.queryAll(By.directive(MatListOption))
        .map(optionDebugEl => optionDebugEl.componentInstance);

      expect(listOptions[1].selected).toBe(true, 'Expected second option to be selected.');
      expect(listOptions[2].selected).toBe(true, 'Expected third option to be selected.');
    });
  });

  describe('preselected values', () => {
    it('should add preselected options to the model value', fakeAsync(() => {
      const fixture = TestBed.createComponent(SelectionListWithPreselectedOption);
      const listOptions = fixture.debugElement.queryAll(By.directive(MatListOption))
          .map(optionDebugEl => optionDebugEl.componentInstance);

      fixture.detectChanges();
      tick();

      expect(listOptions[1].selected).toBe(true);
      expect(fixture.componentInstance.selectedOptions).toEqual(['opt2']);
    }));

    it('should handle preselected option both through the model and the view', fakeAsync(() => {
      const fixture = TestBed.createComponent(SelectionListWithPreselectedOptionAndModel);
      const listOptions = fixture.debugElement.queryAll(By.directive(MatListOption))
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

      const option = fixture.debugElement.queryAll(By.directive(MatListOption))[1];

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

      testComponent.compareWith = jasmine.createSpy('comparator', (o1: any, o2: any) => {
        return o1 && o2 && o1.id === o2.id;
      }).and.callThrough();

      testComponent.selectedOptions = [{id: 2, label: 'Two'}];
      fixture.detectChanges();
      tick();

      expect(testComponent.compareWith).toHaveBeenCalled();
      expect(testComponent.optionInstances.toArray()[1].selected).toBe(true);
    }));
  });
});


@Component({template: `
  <mat-selection-list
    id="selection-list-1"
    (selectionChange)="onValueChange($event)"
    [disableRipple]="listRippleDisabled"
    [color]="selectionListColor">
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
    <mat-list-option checkboxPosition="before" value="drafts" *ngIf="showLastOption">
      Drafts
    </mat-list-option>
  </mat-selection-list>`})
class SelectionListWithListOptions {
  showLastOption: boolean = true;
  listRippleDisabled = false;
  selectionListColor: ThemePalette;
  firstOptionColor: ThemePalette;

  onValueChange(_change: MatSelectionListChange) {}
}

@Component({template: `
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
  </mat-selection-list>`})
class SelectionListWithCheckboxPositionAfter {
}

@Component({template: `
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
  </mat-selection-list>`})
class SelectionListWithListDisabled {
  disabled: boolean = true;
}

@Component({template: `
  <mat-selection-list>
    <mat-list-option [disabled]="disableItem">Item</mat-list-option>
  </mat-selection-list>
  `})
class SelectionListWithDisabledOption {
  disableItem: boolean = false;
}

@Component({template: `
  <mat-selection-list>
    <mat-list-option [selected]="true">Item</mat-list-option>
  </mat-selection-list>`})
class SelectionListWithSelectedOption {
}

@Component({template: `
  <mat-selection-list id="selection-list-4">
    <mat-list-option checkboxPosition="after" class="test-focus" id="123">
      Inbox
    </mat-list-option>
  </mat-selection-list>`})
class SelectionListWithOnlyOneOption {
}

@Component({
  template: `<mat-selection-list tabindex="5"></mat-selection-list>`
})
class SelectionListWithTabindexAttr {}

@Component({
  template: `<mat-selection-list [tabIndex]="tabIndex" [disabled]="disabled"></mat-selection-list>`
})
class SelectionListWithTabindexBinding {
  tabIndex: number;
  disabled: boolean;
}

@Component({
  template: `
    <mat-selection-list [(ngModel)]="selectedOptions" (ngModelChange)="modelChangeSpy()">
      <mat-list-option *ngFor="let option of options" [value]="option">{{option}}</mat-list-option>
    </mat-selection-list>`
})
class SelectionListWithModel {
  modelChangeSpy = jasmine.createSpy('model change spy');
  selectedOptions: string[] = [];
  options = ['opt1', 'opt2', 'opt3'];
}

@Component({
  template: `
    <mat-selection-list [formControl]="formControl">
      <mat-list-option value="opt1">Option 1</mat-list-option>
      <mat-list-option value="opt2">Option 2</mat-list-option>
      <mat-list-option value="opt3">Option 3</mat-list-option>
    </mat-selection-list>
  `
})
class SelectionListWithFormControl {
  formControl = new FormControl();
}


@Component({
  template: `
    <mat-selection-list [(ngModel)]="selectedOptions">
      <mat-list-option value="opt1">Option 1</mat-list-option>
      <mat-list-option value="opt2" selected>Option 2</mat-list-option>
    </mat-selection-list>`
})
class SelectionListWithPreselectedOption {
  selectedOptions: string[];
}


@Component({
  template: `
    <mat-selection-list [(ngModel)]="selectedOptions">
      <mat-list-option value="opt1">Option 1</mat-list-option>
      <mat-list-option value="opt2" selected>Option 2</mat-list-option>
    </mat-selection-list>`
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
  `
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
    </mat-selection-list>`
})
class SelectionListWithCustomComparator {
  @ViewChildren(MatListOption) optionInstances: QueryList<MatListOption>;
  selectedOptions: {id: number, label: string}[] = [];
  compareWith?: (o1: any, o2: any) => boolean;
  options = [
    {id: 1, label: 'One'},
    {id: 2, label: 'Two'},
    {id: 3, label: 'Three'}
  ];
}


@Component({
  template: `
    <mat-selection-list>
      <mat-list-option>
        <div mat-list-avatar>I</div>
        Inbox
      </mat-list-option>
    </mat-selection-list>
  `
})
class SelectionListWithAvatar {
}

@Component({
  template: `
    <mat-selection-list>
      <mat-list-option>
        <div mat-list-icon>I</div>
        Inbox
      </mat-list-option>
    </mat-selection-list>
  `
})
class SelectionListWithIcon {
}


@Component({
  // Note the blank `ngSwitch` which we need in order to hit the bug that we're testing.
  template: `
    <mat-selection-list>
      <ng-container [ngSwitch]="true">
        <mat-list-option [value]="1">One</mat-list-option>
        <mat-list-option [value]="2">Two</mat-list-option>
      </ng-container>
    </mat-selection-list>`
})
class SelectionListWithIndirectChildOptions {
  @ViewChildren(MatListOption) optionInstances: QueryList<MatListOption>;
}
